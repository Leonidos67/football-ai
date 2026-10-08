import { TRADING_POLICY, isWhitelisted, normalizeSymbol } from "@/lib/trading/policy";
import {
  getTicker,
  getKlines,
  getDerivativesBundle,
  scanWhitelist,
} from "@/lib/trading/bybit";
import { getMarketNews } from "@/lib/trading/news";
import { closePaperPosition, getPaperAccount, openPaperPosition } from "@/lib/trading/paper-broker";
import { loadSkill } from "@/lib/trading/agent-prompt";
import type { ToolDefinition } from "@/lib/llm/routerai";

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "get_skill",
      description: "Load a full agent skill or config document from agent/v2.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description:
              "market-scanner | market-analysis | setup-detector | risk-manager | trade-validator | position-monitor | post-trade-analysis | watchlist-monitor | soul | trading-config | risk-config | symbols | execution-rules | trading-memory | mistakes | market-regimes",
          },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "scan_markets",
      description: "Scan the whitelist (BTCUSDT, ETHUSDT, SOLUSDT) on Bybit linear perpetuals.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_ticker",
      description: "Live Bybit ticker: last/mark, 24h change, funding, OI, spread.",
      parameters: {
        type: "object",
        properties: { symbol: { type: "string", description: "e.g. BTCUSDT" } },
        required: ["symbol"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_klines",
      description: "Bybit OHLCV candles. Intervals: 5m, 15m, 1h, 4h, 1d.",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string" },
          interval: { type: "string" },
          limit: { type: "integer" },
        },
        required: ["symbol", "interval"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_derivatives",
      description: "Funding history, open interest, long/short ratio, liquidations, orderbook.",
      parameters: {
        type: "object",
        properties: { symbol: { type: "string" } },
        required: ["symbol"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_news",
      description: "Crypto headlines plus Bybit announcements. Optional query like BTC or funding.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "paper_account",
      description: "PAPER account equity, cash, open simulated positions. Not a live Bybit wallet.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "paper_open",
      description:
        "Simulate a PAPER fill at mark price. Never live. Requires whitelist symbol and LONG|SHORT.",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string" },
          side: { type: "string", enum: ["LONG", "SHORT"] },
          qty: { type: "number" },
          stop: { type: "number" },
          tp1: { type: "number" },
          leverage: { type: "number" },
          riskPct: { type: "number" },
          thesis: { type: "string" },
        },
        required: ["symbol", "side"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "paper_close",
      description: "Close a PAPER position by id at current mark.",
      parameters: {
        type: "object",
        properties: { positionId: { type: "string" } },
        required: ["positionId"],
      },
    },
  },
];

function compactKlines(payload: Awaited<ReturnType<typeof getKlines>>) {
  const bars = payload.bars;
  const last = bars.slice(-40);
  return {
    symbol: payload.symbol,
    interval: payload.interval,
    fetchedAt: payload.fetchedAt,
    count: last.length,
    bars: last,
  };
}

export async function executeAgentTool(
  name: string,
  argsJson: string
): Promise<unknown> {
  let args: Record<string, unknown> = {};
  try {
    args = argsJson ? JSON.parse(argsJson) : {};
  } catch {
    throw new Error(`Invalid JSON arguments for ${name}`);
  }

  switch (name) {
    case "get_skill":
      return loadSkill(String(args.name || ""));
    case "scan_markets":
      return scanWhitelist();
    case "get_ticker": {
      const symbol = normalizeSymbol(String(args.symbol || ""));
      if (!isWhitelisted(symbol)) {
        return { error: `Symbol ${symbol} is not in whitelist`, whitelist: TRADING_POLICY.whitelist };
      }
      return getTicker(symbol);
    }
    case "get_klines": {
      const symbol = normalizeSymbol(String(args.symbol || ""));
      if (!isWhitelisted(symbol)) {
        return { error: `Symbol ${symbol} is not in whitelist` };
      }
      return compactKlines(
        await getKlines(symbol, String(args.interval || "15m"), Number(args.limit) || 80)
      );
    }
    case "get_derivatives": {
      const symbol = normalizeSymbol(String(args.symbol || ""));
      if (!isWhitelisted(symbol)) {
        return { error: `Symbol ${symbol} is not in whitelist` };
      }
      return getDerivativesBundle(symbol);
    }
    case "get_news":
      return getMarketNews(args.query ? String(args.query) : undefined);
    case "paper_account":
      return getPaperAccount();
    case "paper_open":
      return openPaperPosition({
        symbol: String(args.symbol),
        side: args.side === "SHORT" ? "SHORT" : "LONG",
        qty: args.qty == null ? undefined : Number(args.qty),
        stop: args.stop == null ? undefined : Number(args.stop),
        tp1: args.tp1 == null ? undefined : Number(args.tp1),
        leverage: args.leverage == null ? undefined : Number(args.leverage),
        riskPct: args.riskPct == null ? undefined : Number(args.riskPct),
        thesis: args.thesis ? String(args.thesis) : undefined,
      });
    case "paper_close":
      return closePaperPosition(String(args.positionId || ""));
    case "live_open":
    case "place_order":
    case "bybit_private":
      return {
        error: "LIVE execution is disabled. Paper/demo only until explicitly authorized.",
        liveExecution: false,
        mode: "PAPER",
      };
    default:
      return { error: `Unknown tool ${name}` };
  }
}
