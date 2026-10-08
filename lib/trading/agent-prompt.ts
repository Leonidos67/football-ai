import { readFile } from "fs/promises";
import path from "path";

const ROOT = path.join(process.cwd(), "agent", "v2");

async function readDoc(rel: string): Promise<string> {
  return readFile(path.join(ROOT, rel), "utf8");
}

export async function loadSkill(name: string): Promise<{ name: string; content: string }> {
  const allowed: Record<string, string> = {
    "market-scanner": "skills/market-scanner/SKILL.md",
    "market-analysis": "skills/market-analysis/SKILL.md",
    "setup-detector": "skills/setup-detector/SKILL.md",
    "risk-manager": "skills/risk-manager/SKILL.md",
    "trade-validator": "skills/trade-validator/SKILL.md",
    "position-monitor": "skills/position-monitor/SKILL.md",
    "post-trade-analysis": "skills/post-trade-analysis/SKILL.md",
    "watchlist-monitor": "skills/watchlist-monitor/SKILL.md",
    soul: "SOUL.md",
    "trading-config": "config/trading-config.md",
    "risk-config": "config/risk-config.md",
    symbols: "config/symbols.md",
    "execution-rules": "config/execution-rules.md",
    "trading-memory": "memory/trading-memory.md",
    mistakes: "memory/mistakes.md",
    "market-regimes": "memory/market-regimes.md",
  };
  const rel = allowed[name];
  if (!rel) {
    throw new Error(`Unknown skill/doc "${name}". Allowed: ${Object.keys(allowed).join(", ")}`);
  }
  return { name, content: await readDoc(rel) };
}

export async function buildSystemPrompt(): Promise<string> {
  const [soul, trading, risk, symbols, execution] = await Promise.all([
    readDoc("SOUL.md"),
    readDoc("config/trading-config.md"),
    readDoc("config/risk-config.md"),
    readDoc("config/symbols.md"),
    readDoc("config/execution-rules.md"),
  ]);

  return `${soul}

---

# Runtime overrides (authoritative)

- mode: PAPER
- live_execution: false
- exchange: bybit
- market_type: USDT perpetual (linear)
- Live order placement is NOT implemented and MUST NOT be attempted.
- Paper fills are simulated at Bybit mark price with a taker fee model.
- Never invent prices, OI, funding, news or fills. Call tools.
- If data is missing/stale, return WAIT or NO TRADE.
- NO TRADE is a valid successful outcome.

${trading}

${risk}

${symbols}

${execution}

# Skill pipeline

MARKET DATA → MARKET SCANNER → CANDIDATE → MARKET ANALYSIS → SETUP DETECTOR → RISK MANAGER → TRADE VALIDATOR → (PAPER EXECUTION only) → POSITION MONITOR → POST-TRADE ANALYSIS → MEMORY

Load a full skill with the get_skill tool when you need its exact output contract.

When reporting a trade candidate, use the structured fields from SOUL.md.
Map UI badges as: LONG→BUY, SHORT→SELL, WAIT/NO TRADE→HOLD.
End material decisions with a single line: DECISION: LONG|SHORT|WAIT|NO TRADE
`;
}
