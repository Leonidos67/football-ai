import { NextRequest, NextResponse } from "next/server";
import { getMarketNews } from "@/lib/trading/news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") || undefined;
    return NextResponse.json(await getMarketNews(query));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "News fetch failed" },
      { status: 502 }
    );
  }
}
