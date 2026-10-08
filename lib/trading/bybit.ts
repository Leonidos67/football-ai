import { TRADING_POLICY, normalizeSymbol } from "@/lib/trading/policy";

const BYBIT_BASE =
  process.env.BYBIT_BASE_URL?.replace(/\/$/, "") || "https://api.bybit.com";

type CacheEntry<T> = { expiresAt: number; value: T };

const cache = new Map<string, CacheEntry<unknown>>();

async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }
  const value = await loader();
  cache.set(key, { expiresAt: Date.now() + ttlMs, value });
  return value;
}

export class BybitPublicError extends Error {
  constructor(
    message: string,
    public readonly retCode?: number,
    public readonly status?: number
  ) {
    super(message);
    this.name = "BybitPublicError";
  }
}

interface BybitEnvelope<T> {
  retCode: number;
  retMsg: string;
  result: T;
  time: number;
}

async function bybitGet<T>(path: string, params: Record<string, string | number | undefined>): Promise<{
  data: T;
  serverTime: number;
  fetchedAt: string;
}> {
  const url = new URL(`${BYBIT_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new BybitPublicError(`Bybit HTTP ${res.status} for ${path}`, undefined, res.status);
  }

  const body = (await res.json()) as BybitEnvelope<T>;
  if (body.retCode !== 0) {
    throw new BybitPublicError(body.retMsg || "Bybit error", body.retCode, res.status);
  }

  return {
    data: body.result,
    serverTime: body.time,
    fetchedAt: new Date().toISOString(),
  };
}

export interface TickerSnapshot {
  symbol: string;
  lastPrice: number;
  markPrice: number;
  indexPrice: number;
  bid1: number;
  ask1: number;
  spreadBps: number;
  price24hPcnt: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  turnover24h: number;
  openInterest: number;
  openInterestValue: number;
  fundingRate: number;
  nextFundingTime: string | null;
  fetchedAt: string;
  serverTime: number;
  stale: boolean;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export async function getTicker(symbol: string): Promise<TickerSnapshot> {
  const s = normalizeSymbol(symbol);
  return cached(`ticker:${s}`, 3000, async () => {
    const { data, serverTime, fetchedAt } = await bybitGet<{
      list: Array<Record<string, string>>;
    }>("/v5/market/tickers", {
      category: TRADING_POLICY.category,
      symbol: s,
    });

    const row = data.list?.[0];
    if (!row) throw new BybitPublicError(`No ticker for ${s}`);

    const bid1 = num(row.bid1Price);
    const ask1 = num(row.ask1Price);
    const mid = (bid1 + ask1) / 2;
    const spreadBps = mid > 0 ? ((ask1 - bid1) / mid) * 10_000 : NaN;
    const ageSec = (Date.now() - serverTime) / 1000;

    return {
      symbol: row.symbol,
      lastPrice: num(row.lastPrice),
      markPrice: num(row.markPrice),
      indexPrice: num(row.indexPrice),
      bid1,
      ask1,
      spreadBps,
      price24hPcnt: num(row.price24hPcnt) * 100,
      high24h: num(row.highPrice24h),
      low24h: num(row.lowPrice24h),
      volume24h: num(row.volume24h),
      turnover24h: num(row.turnover24h),
      openInterest: num(row.openInterest),
      openInterestValue: num(row.openInterestValue),
      fundingRate: num(row.fundingRate),
      nextFundingTime: row.nextFundingTime
        ? new Date(Number(row.nextFundingTime)).toISOString()
        : null,
      fetchedAt,
      serverTime,
      stale: ageSec > TRADING_POLICY.maxMarketDataAgeSeconds,
    };
  });
}

export interface KlineBar {
  start: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
}

const INTERVAL_MAP: Record<string, string> = {
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "1h": "60",
  "4h": "240",
  "1d": "D",
  "5": "5",
  "15": "15",
  "60": "60",
  "240": "240",
};

export function mapInterval(interval: string): string {
  return INTERVAL_MAP[interval] || interval;
}

export async function getKlines(
  symbol: string,
  interval: string,
  limit = 80
): Promise<{ symbol: string; interval: string; bars: KlineBar[]; fetchedAt: string }> {
  const s = normalizeSymbol(symbol);
  const iv = mapInterval(interval);
  const capped = Math.min(Math.max(limit, 10), 200);

  return cached(`klines:${s}:${iv}:${capped}`, 5000, async () => {
    const { data, fetchedAt } = await bybitGet<{
      list: string[][];
    }>("/v5/market/kline", {
      category: TRADING_POLICY.category,
      symbol: s,
      interval: iv,
      limit: capped,
    });

    const bars = (data.list || [])
      .map((row) => ({
        start: new Date(Number(row[0])).toISOString(),
        open: num(row[1]),
        high: num(row[2]),
        low: num(row[3]),
        close: num(row[4]),
        volume: num(row[5]),
        turnover: num(row[6]),
      }))
      .sort((a, b) => a.start.localeCompare(b.start));

    return { symbol: s, interval: iv, bars, fetchedAt };
  });
}

export async function getFundingHistory(symbol: string, limit = 8) {
  const s = normalizeSymbol(symbol);
  return cached(`funding:${s}`, 15_000, async () => {
    const { data, fetchedAt } = await bybitGet<{
      list: Array<{ fundingRate: string; fundingRateTimestamp: string }>;
    }>("/v5/market/funding/history", {
      category: TRADING_POLICY.category,
      symbol: s,
      limit,
    });
    return {
      symbol: s,
      fetchedAt,
      history: (data.list || []).map((row) => ({
        fundingRate: num(row.fundingRate),
        time: new Date(Number(row.fundingRateTimestamp)).toISOString(),
      })),
    };
  });
}

export async function getOpenInterest(symbol: string) {
  const s = normalizeSymbol(symbol);
  return cached(`oi:${s}`, 10_000, async () => {
    const { data, fetchedAt } = await bybitGet<{
      list: Array<{ openInterest: string; timestamp: string }>;
    }>("/v5/market/open-interest", {
      category: TRADING_POLICY.category,
      symbol: s,
      intervalTime: "1h",
      limit: 24,
    });
    return {
      symbol: s,
      fetchedAt,
      series: (data.list || [])
        .map((row) => ({
          openInterest: num(row.openInterest),
          time: new Date(Number(row.timestamp)).toISOString(),
        }))
        .sort((a, b) => a.time.localeCompare(b.time)),
    };
  });
}

export async function getAccountRatio(symbol: string) {
  const s = normalizeSymbol(symbol);
  return cached(`ratio:${s}`, 15_000, async () => {
    const { data, fetchedAt } = await bybitGet<{
      list: Array<{ buyRatio: string; sellRatio: string; timestamp: string }>;
    }>("/v5/market/account-ratio", {
      category: TRADING_POLICY.category,
      symbol: s,
      period: "1h",
      limit: 12,
    });
    return {
      symbol: s,
      fetchedAt,
      series: (data.list || []).map((row) => ({
        buyRatio: num(row.buyRatio),
        sellRatio: num(row.sellRatio),
        time: new Date(Number(row.timestamp)).toISOString(),
      })),
    };
  });
}

export async function getLiquidations(symbol: string) {
  const s = normalizeSymbol(symbol);
  return cached(`liq:${s}`, 8_000, async () => {
    try {
      const { data, fetchedAt } = await bybitGet<{
        list: Array<{
          updatedTime?: string;
          time?: string;
          side: string;
          size: string;
          price: string;
        }>;
      }>("/v5/market/recent-liquidation", {
        category: TRADING_POLICY.category,
        symbol: s,
        limit: 20,
      });
      return {
        symbol: s,
        fetchedAt,
        events: (data.list || []).map((row) => ({
          time: new Date(Number(row.updatedTime || row.time)).toISOString(),
          side: row.side,
          size: num(row.size),
          price: num(row.price),
        })),
      };
    } catch {
      return { symbol: s, fetchedAt: new Date().toISOString(), events: [], unavailable: true };
    }
  });
}

export async function getOrderbook(symbol: string) {
  const s = normalizeSymbol(symbol);
  return cached(`ob:${s}`, 2000, async () => {
    const { data, fetchedAt, serverTime } = await bybitGet<{
      s: string;
      b: string[][];
      a: string[][];
      ts: number;
    }>("/v5/market/orderbook", {
      category: TRADING_POLICY.category,
      symbol: s,
      limit: 25,
    });
    const bids = (data.b || []).map(([p, q]) => ({ price: num(p), size: num(q) }));
    const asks = (data.a || []).map(([p, q]) => ({ price: num(p), size: num(q) }));
    const bestBid = bids[0]?.price;
    const bestAsk = asks[0]?.price;
    const mid = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : NaN;
    return {
      symbol: s,
      fetchedAt,
      serverTime,
      bestBid,
      bestAsk,
      spreadBps: mid > 0 ? ((bestAsk - bestBid) / mid) * 10_000 : NaN,
      bidDepth: bids.reduce((sum, x) => sum + x.size, 0),
      askDepth: asks.reduce((sum, x) => sum + x.size, 0),
    };
  });
}

export async function getInstrument(symbol: string) {
  const s = normalizeSymbol(symbol);
  return cached(`inst:${s}`, 60_000, async () => {
    const { data, fetchedAt } = await bybitGet<{
      list: Array<Record<string, string>>;
    }>("/v5/market/instruments-info", {
      category: TRADING_POLICY.category,
      symbol: s,
    });
    const row = data.list?.[0];
    if (!row) throw new BybitPublicError(`Unknown contract ${s}`);
    return {
      symbol: row.symbol,
      status: row.status,
      lotSize: num(row.lotSizeFilter ? undefined : row.lotSize),
      qtyStep: num((row as { lotSizeFilter?: { qtyStep?: string } }).lotSizeFilter?.qtyStep),
      minOrderQty: num((row as { lotSizeFilter?: { minOrderQty?: string } }).lotSizeFilter?.minOrderQty),
      tickSize: num((row as { priceFilter?: { tickSize?: string } }).priceFilter?.tickSize),
      fetchedAt,
      rawLot: (row as { lotSizeFilter?: Record<string, string> }).lotSizeFilter,
      rawPrice: (row as { priceFilter?: Record<string, string> }).priceFilter,
    };
  });
}

export async function getDerivativesBundle(symbol: string) {
  const s = normalizeSymbol(symbol);
  const [ticker, funding, oi, ratio, liq, book] = await Promise.all([
    getTicker(s),
    getFundingHistory(s),
    getOpenInterest(s),
    getAccountRatio(s),
    getLiquidations(s),
    getOrderbook(s),
  ]);

  const oiSeries = oi.series;
  const oiChangePct =
    oiSeries.length >= 2
      ? ((oiSeries[oiSeries.length - 1].openInterest - oiSeries[0].openInterest) /
          oiSeries[0].openInterest) *
        100
      : null;

  return {
    exchange: "bybit",
    category: TRADING_POLICY.category,
    symbol: s,
    ticker,
    orderbook: book,
    funding,
    openInterest: { ...oi, changePct24hApprox: oiChangePct },
    accountRatio: ratio,
    liquidations: liq,
  };
}

export async function scanWhitelist() {
  const rows = await Promise.all(
    TRADING_POLICY.whitelist.map(async (symbol) => {
      const ticker = await getTicker(symbol);
      return {
        symbol,
        lastPrice: ticker.lastPrice,
        markPrice: ticker.markPrice,
        change24hPct: ticker.price24hPcnt,
        fundingRate: ticker.fundingRate,
        openInterestValue: ticker.openInterestValue,
        spreadBps: ticker.spreadBps,
        stale: ticker.stale,
        fetchedAt: ticker.fetchedAt,
      };
    })
  );
  return {
    mode: TRADING_POLICY.mode,
    liveExecution: false,
    universe: TRADING_POLICY.whitelist,
    scannedAt: new Date().toISOString(),
    markets: rows,
  };
}
