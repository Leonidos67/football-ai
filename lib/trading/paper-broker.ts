import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { TRADING_POLICY, assertPaperOnly, isWhitelisted, normalizeSymbol } from "@/lib/trading/policy";
import { getTicker } from "@/lib/trading/bybit";

export type PaperSide = "LONG" | "SHORT";

export interface PaperPosition {
  id: string;
  symbol: string;
  side: PaperSide;
  qty: number;
  entry: number;
  stop?: number;
  tp1?: number;
  leverage: number;
  riskPct: number;
  notional: number;
  margin: number;
  openFee: number;
  closeFee: number;
  openedAt: string;
  closedAt?: string;
  status: "OPEN" | "CLOSED";
  closePrice?: number;
  realizedPnl?: number;
  thesis?: string;
}

export interface PaperFill {
  id: string;
  positionId: string;
  symbol: string;
  action: "OPEN" | "CLOSE";
  side: PaperSide;
  qty: number;
  price: number;
  fee: number;
  at: string;
  mode: "PAPER";
}

interface PaperState {
  mode: "PAPER";
  liveExecution: false;
  startingEquity: number;
  dailyRealizedPnl: number;
  dailyPnlDate: string;
  positions: PaperPosition[];
  fills: PaperFill[];
  updatedAt: string;
}

const DATA_PATH = path.join(process.cwd(), "data", "paper-trading.json");

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyState(): PaperState {
  return {
    mode: "PAPER",
    liveExecution: false,
    startingEquity: TRADING_POLICY.paper.startingEquity,
    dailyRealizedPnl: 0,
    dailyPnlDate: todayUtc(),
    positions: [],
    fills: [],
    updatedAt: new Date().toISOString(),
  };
}

async function loadState(): Promise<PaperState> {
  try {
    const parsed = JSON.parse(await readFile(DATA_PATH, "utf8")) as PaperState;
    if (parsed.dailyPnlDate !== todayUtc()) {
      parsed.dailyRealizedPnl = 0;
      parsed.dailyPnlDate = todayUtc();
    }
    parsed.mode = "PAPER";
    parsed.liveExecution = false;
    return parsed;
  } catch {
    return emptyState();
  }
}

async function saveState(state: PaperState): Promise<void> {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  state.updatedAt = new Date().toISOString();
  await writeFile(DATA_PATH, JSON.stringify(state, null, 2), "utf8");
}

function feeOn(notional: number): number {
  return (Math.abs(notional) * TRADING_POLICY.risk.takerFeePct) / 100;
}

function roundQty(qty: number): number {
  return Math.floor(qty * 1000) / 1000;
}

function realizedOf(p: PaperPosition): number {
  if (p.status !== "CLOSED" || p.closePrice == null) return 0;
  const dir = p.side === "LONG" ? 1 : -1;
  return (p.closePrice - p.entry) * p.qty * dir - p.openFee - p.closeFee;
}

function cashFrom(state: PaperState): number {
  let cash = state.startingEquity;
  for (const p of state.positions) {
    if (p.status === "OPEN") {
      cash -= p.margin + p.openFee;
    } else {
      cash += realizedOf(p);
    }
  }
  return cash;
}

export async function getPaperAccount() {
  assertPaperOnly();
  const state = await loadState();
  const open = state.positions.filter((p) => p.status === "OPEN");
  const marked = await Promise.all(
    open.map(async (p) => {
      const ticker = await getTicker(p.symbol);
      const mark = ticker.markPrice;
      const dir = p.side === "LONG" ? 1 : -1;
      return {
        ...p,
        mark,
        unrealizedPnl: (mark - p.entry) * p.qty * dir,
      };
    })
  );
  const unrealized = marked.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const cash = cashFrom(state);
  const usedMargin = marked.reduce((sum, p) => sum + p.margin, 0);
  const realizedPnl = state.positions
    .filter((p) => p.status === "CLOSED")
    .reduce((sum, p) => sum + realizedOf(p), 0);

  return {
    mode: "PAPER" as const,
    liveExecution: false,
    exchange: "bybit-paper-simulator",
    equity: cash + usedMargin + unrealized,
    cash,
    usedMargin,
    unrealizedPnl: unrealized,
    realizedPnl,
    dailyRealizedPnl: state.dailyRealizedPnl,
    openPositions: marked,
    openCount: marked.length,
    fills: state.fills.slice(-20),
    startingEquity: state.startingEquity,
    updatedAt: new Date().toISOString(),
  };
}

export interface OpenPaperInput {
  symbol: string;
  side: PaperSide;
  qty?: number;
  riskPct?: number;
  stop?: number;
  tp1?: number;
  leverage?: number;
  thesis?: string;
}

export async function openPaperPosition(input: OpenPaperInput) {
  assertPaperOnly();
  const symbol = normalizeSymbol(input.symbol);
  if (!isWhitelisted(symbol)) {
    throw new Error(`Symbol ${symbol} is outside the whitelist`);
  }

  const state = await loadState();
  const open = state.positions.filter((p) => p.status === "OPEN");
  if (open.length >= TRADING_POLICY.risk.maxOpenPositions) {
    throw new Error(`Max open positions (${TRADING_POLICY.risk.maxOpenPositions}) reached`);
  }
  if (
    state.dailyRealizedPnl < 0 &&
    (Math.abs(state.dailyRealizedPnl) / state.startingEquity) * 100 >=
      TRADING_POLICY.risk.maxDailyLossPct
  ) {
    throw new Error("Daily loss circuit breaker is active");
  }

  const ticker = await getTicker(symbol);
  const price = ticker.markPrice;
  if (!price || ticker.stale) {
    throw new Error("Market data is missing or stale; paper fill refused");
  }

  const leverage = Math.min(
    Math.max(input.leverage || TRADING_POLICY.risk.defaultLeverage, 1),
    TRADING_POLICY.risk.maxLeverage
  );
  const riskPct = Math.min(
    input.riskPct || TRADING_POLICY.risk.maxRiskPerTradePct,
    TRADING_POLICY.risk.maxRiskPerTradePct
  );

  const cash = cashFrom(state);
  const equity = cash + open.reduce((s, p) => s + p.margin, 0);

  let qty = input.qty;
  if (qty == null) {
    if (input.stop == null) {
      throw new Error("Provide qty or stop so risk-based size can be calculated");
    }
    const stopDist = Math.abs(price - input.stop);
    if (stopDist <= 0) throw new Error("Stop distance must be > 0");
    qty = roundQty((equity * riskPct) / 100 / stopDist);
  }
  qty = roundQty(qty);
  if (qty <= 0) throw new Error("Quantity rounds to zero under risk limits");

  const notional = qty * price;
  const margin = notional / leverage;
  const openFee = feeOn(notional);
  if (margin + openFee > cash) {
    throw new Error("Insufficient paper cash/margin");
  }

  const id = `PAPER-${Date.now()}`;
  const openedAt = new Date().toISOString();
  const position: PaperPosition = {
    id,
    symbol,
    side: input.side,
    qty,
    entry: price,
    stop: input.stop,
    tp1: input.tp1,
    leverage,
    riskPct,
    notional,
    margin,
    openFee,
    closeFee: 0,
    openedAt,
    status: "OPEN",
    thesis: input.thesis,
  };

  state.positions.push(position);
  state.fills.push({
    id: `${id}-OPEN`,
    positionId: id,
    symbol,
    action: "OPEN",
    side: input.side,
    qty,
    price,
    fee: openFee,
    at: openedAt,
    mode: "PAPER",
  });
  await saveState(state);

  return {
    fillMode: "PAPER" as const,
    liveExecution: false,
    position,
    mark: price,
  };
}

export async function closePaperPosition(positionId: string) {
  assertPaperOnly();
  const state = await loadState();
  const position = state.positions.find((p) => p.id === positionId && p.status === "OPEN");
  if (!position) throw new Error("Open paper position not found");

  const ticker = await getTicker(position.symbol);
  const price = ticker.markPrice;
  const closeFee = feeOn(position.qty * price);
  const dir = position.side === "LONG" ? 1 : -1;
  const pnl = (price - position.entry) * position.qty * dir - position.openFee - closeFee;
  const closedAt = new Date().toISOString();

  position.status = "CLOSED";
  position.closedAt = closedAt;
  position.closePrice = price;
  position.closeFee = closeFee;
  position.realizedPnl = pnl;

  state.fills.push({
    id: `${position.id}-CLOSE`,
    positionId: position.id,
    symbol: position.symbol,
    action: "CLOSE",
    side: position.side,
    qty: position.qty,
    price,
    fee: closeFee,
    at: closedAt,
    mode: "PAPER",
  });

  state.dailyRealizedPnl += pnl;
  await saveState(state);

  return {
    fillMode: "PAPER" as const,
    liveExecution: false,
    closed: position,
    account: await getPaperAccount(),
  };
}
