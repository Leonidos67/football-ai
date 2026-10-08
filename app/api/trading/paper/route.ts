import { NextRequest, NextResponse } from "next/server";
import { closePaperPosition, getPaperAccount, openPaperPosition } from "@/lib/trading/paper-broker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getPaperAccount());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Paper account failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === "close") {
      return NextResponse.json(await closePaperPosition(String(body.positionId)));
    }
    if (body.action === "open") {
      return NextResponse.json(
        await openPaperPosition({
          symbol: body.symbol,
          side: body.side,
          qty: body.qty,
          stop: body.stop,
          tp1: body.tp1,
          leverage: body.leverage,
          riskPct: body.riskPct,
          thesis: body.thesis,
        })
      );
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Paper order failed" },
      { status: 400 }
    );
  }
}
