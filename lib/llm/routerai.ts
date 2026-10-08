export const ROUTERAI_BASE_URL =
  process.env.ROUTERAI_BASE_URL?.replace(/\/$/, "") || "https://routerai.ru/api/v1";

export const ROUTERAI_MODEL =
  process.env.ROUTERAI_MODEL || "openai/gpt-4o-mini";

export function getRouterAiKey(): string {
  const key = process.env.ROUTERAI_API_KEY || "";
  if (!key) {
    throw new Error("ROUTERAI_API_KEY is not configured");
  }
  return key;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface RouterCompletion {
  content: string;
  tool_calls: ToolCall[];
  model: string;
}

export async function routerChat(params: {
  messages: ChatMessage[];
  tools?: ToolDefinition[];
  temperature?: number;
  maxTokens?: number;
}): Promise<RouterCompletion> {
  const body: Record<string, unknown> = {
    model: ROUTERAI_MODEL,
    messages: params.messages,
    temperature: params.temperature ?? 0.2,
    max_tokens: params.maxTokens ?? 2200,
  };
  if (params.tools?.length) {
    body.tools = params.tools;
    body.tool_choice = "auto";
  }

  const res = await fetch(`${ROUTERAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRouterAiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = json?.error?.message || json?.message || json?.error || res.statusText;
    throw new Error(`RouterAI error ${res.status}: ${detail}`);
  }

  const choice = json.choices?.[0];
  const message = choice?.message || {};
  const toolCalls = Array.isArray(message.tool_calls)
    ? message.tool_calls.map((call: Record<string, unknown>, i: number) => {
        const fn = (call.function || call) as Record<string, unknown>;
        const args = fn.arguments;
        return {
          id: String(call.id || `call_${i}`),
          type: "function" as const,
          function: {
            name: String(fn.name || ""),
            arguments: typeof args === "string" ? args : JSON.stringify(args || {}),
          },
        };
      })
    : [];
  return {
    content: message.content || "",
    tool_calls: toolCalls,
    model: json.model || ROUTERAI_MODEL,
  };
}

export async function routerChatStream(params: {
  messages: ChatMessage[];
  onToken: (token: string) => void;
}): Promise<string> {
  const res = await fetch(`${ROUTERAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRouterAiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ROUTERAI_MODEL,
      messages: params.messages,
      temperature: 0.2,
      max_tokens: 2200,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text();
    throw new Error(`RouterAI stream error ${res.status}: ${text.slice(0, 400)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() || "";
    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const token = json.choices?.[0]?.delta?.content;
        if (token) {
          full += token;
          params.onToken(token);
        }
      } catch {
        /* ignore keepalives / split JSON */
      }
    }
  }

  return full;
}
