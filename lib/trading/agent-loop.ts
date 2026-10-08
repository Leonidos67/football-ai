import { buildSystemPrompt } from "@/lib/trading/agent-prompt";
import { AGENT_TOOLS, executeAgentTool } from "@/lib/trading/tools";
import { routerChat, type ChatMessage } from "@/lib/llm/routerai";
import { TRADING_POLICY } from "@/lib/trading/policy";

export interface AgentEvent {
  type: "status" | "token" | "done" | "error";
  data: unknown;
}

export function parseDecision(text: string): "BUY" | "SELL" | "HOLD" | null {
  const upper = text.toUpperCase();
  const match = upper.match(/DECISION:\s*(LONG|SHORT|WAIT|NO TRADE)/);
  const token = match?.[1];
  if (token === "LONG") return "BUY";
  if (token === "SHORT") return "SELL";
  if (token === "WAIT" || token === "NO TRADE") return "HOLD";
  if (/\bLONG\b/.test(upper) && !/\bSHORT\b/.test(upper) && /SETUP/.test(upper)) return "BUY";
  if (/\bSHORT\b/.test(upper) && /SETUP/.test(upper)) return "SELL";
  return null;
}

export async function runTradingAgent(params: {
  history: { role: "user" | "ai"; content: string }[];
  userText: string;
  emit: (event: AgentEvent) => void;
}): Promise<{ content: string; signal: "BUY" | "SELL" | "HOLD" | null; model: string }> {
  const system = await buildSystemPrompt();
  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...params.history.slice(-12).map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    })),
    {
      role: "user",
      content: params.userText,
    },
  ];

  params.emit({
    type: "status",
    data: {
      mode: TRADING_POLICY.mode,
      liveExecution: false,
      stage: "thinking",
    },
  });

  let model = "";
  for (let step = 0; step < 8; step++) {
    const completion = await routerChat({
      messages,
      tools: AGENT_TOOLS,
    });
    model = completion.model;

    if (completion.tool_calls.length) {
      messages.push({
        role: "assistant",
        content: completion.content || null,
        tool_calls: completion.tool_calls,
      });

      for (const call of completion.tool_calls) {
        params.emit({
          type: "status",
          data: { stage: "tool", tool: call.function.name },
        });
        let result: unknown;
        try {
          result = await executeAgentTool(call.function.name, call.function.arguments);
        } catch (err) {
          result = { error: err instanceof Error ? err.message : String(err) };
        }
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
      continue;
    }

    if (completion.content) {
      params.emit({ type: "status", data: { stage: "answer" } });
      const content = completion.content;
      const chunkSize = 24;
      for (let i = 0; i < content.length; i += chunkSize) {
        params.emit({ type: "token", data: content.slice(i, i + chunkSize) });
      }
      return { content, signal: parseDecision(content), model };
    }
  }

  const fallback =
    "NO TRADE. Tool loop exhausted without a final answer. Data may be incomplete.";
  params.emit({ type: "token", data: fallback });
  return { content: fallback, signal: "HOLD", model };
}
