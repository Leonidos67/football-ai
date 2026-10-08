import { NextRequest, NextResponse } from "next/server";
import { getKlines, getTicker, scanWhitelist } from "@/lib/trading/bybit";
import { isWhitelisted, normalizeSymbol } from "@/lib/trading/policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get("symbol");
    const interval = request.nextUrl.searchParams.get("interval");

    if (!symbol) {
      return NextResponse.json(await scanWhitelist());
    }

    const s = normalizeSymbol(symbol);
    if (!isWhitelisted(s)) {
      return NextResponse.json({ error: "Symbol not in whitelist" }, { status: 400 });
    }

    const ticker = await getTicker(s);
    const klines = interval
      ? await getKlines(s, interval, 80)
      : undefined;

    return NextResponse.json({
      exchange: "bybit",
      mode: "PAPER",
      ticker,
      klines,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Market fetch failed" },
      { status: 502 }
    );
  }
}
