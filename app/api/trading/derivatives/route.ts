import { NextRequest, NextResponse } from "next/server";
import { getDerivativesBundle } from "@/lib/trading/bybit";
import { isWhitelisted, normalizeSymbol } from "@/lib/trading/policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get("symbol") || "BTCUSDT";
    const s = normalizeSymbol(symbol);
    if (!isWhitelisted(s)) {
      return NextResponse.json({ error: "Symbol not in whitelist" }, { status: 400 });
    }
    return NextResponse.json(await getDerivativesBundle(s));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Derivatives fetch failed" },
      { status: 502 }
    );
  }
}
