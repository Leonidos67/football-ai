import { NextRequest } from "next/server";
import { runTradingAgent } from "@/lib/trading/agent-loop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  let body: { messages?: { role: "user" | "ai"; content: string }[]; text?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const history = Array.isArray(body.messages) ? body.messages : [];
  const userText = (body.text || history.filter((m) => m.role === "user").at(-1)?.content || "").trim();
  if (!userText) {
    return Response.json({ error: "Empty message" }, { status: 400 });
  }

  const prior = history.filter((m) => m.content && m.content !== userText);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      try {
        const result = await runTradingAgent({
          history: prior,
          userText,
          emit: (evt) => send(evt.type, evt.data),
        });
        send("done", {
          content: result.content,
          signal: result.signal,
          model: result.model,
          mode: "PAPER",
          liveExecution: false,
        });
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : "Agent failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
