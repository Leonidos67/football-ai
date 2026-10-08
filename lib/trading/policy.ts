/**
 * Runtime trading policy. Mirrors agent/v2/config without mutating those files.
 * LIVE execution is intentionally unimplemented until separately authorized.
 */

export const TRADING_POLICY = {
  mode: "PAPER" as const,
  liveExecution: false,
  marketType: "perpetual_futures" as const,
  settlement: "USDT",
  exchange: "bybit" as const,
  category: "linear" as const,
  timeframes: {
    higher: "240",
    middle: "60",
    entry: "15",
    execution: "5",
  },
  maxMarketDataAgeSeconds: 10,
  maxSignalAgeSeconds: 60,
  whitelist: ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const,
  risk: {
    maxRiskPerTradePct: 0.5,
    maxDailyLossPct: 2,
    maxWeeklyLossPct: 5,
    maxOpenPositions: 3,
    minimumRr: 1.8,
    preferredRr: 2.0,
    maxTotalOpenRiskPct: 1.5,
    maxCorrelatedRiskPct: 1.0,
    defaultLeverage: 3,
    maxLeverage: 5,
    takerFeePct: 0.055,
  },
  paper: {
    startingEquity: 10_000,
  },
} as const;

export type TradingMode = typeof TRADING_POLICY.mode;
export type WhitelistSymbol = (typeof TRADING_POLICY.whitelist)[number];

export function assertPaperOnly(): void {
  if (TRADING_POLICY.mode !== "PAPER" || TRADING_POLICY.liveExecution) {
    throw new Error("Live execution is disabled. Agent is locked to PAPER mode.");
  }
}

export function isWhitelisted(symbol: string): boolean {
  return (TRADING_POLICY.whitelist as readonly string[]).includes(
    symbol.toUpperCase()
  );
}

export function normalizeSymbol(symbol: string): string {
  return symbol.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}
