"use client"

export interface Prediction {
  match: string;
  league: string;
  date: string;
  market: string;
  odds: number;
  confidence: number;
  reasoning: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
  prediction?: Prediction;
  predictions?: Prediction[];
  streaming?: boolean;
  rating?: "up" | "down";
  timestamp: string;
}

const MESSAGES_KEY = "mnoonx:chat:messages"
const PROMPT_KEY = "mnoonx:chat:last-prompt"
const MAX_MESSAGES = 100

// ─────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────
export function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(MESSAGES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // сбрасываем streaming-флаг на всякий случай
    return parsed.map((m) => ({ ...m, streaming: false }))
  } catch {
    return []
  }
}

export function saveMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return
  try {
    // обрезаем, оставляем последние MAX_MESSAGES
    const trimmed = messages.slice(-MAX_MESSAGES)
    // убираем streaming-флаг перед сохранением
    const clean = trimmed.map((m) => ({ ...m, streaming: false }))
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(clean))
  } catch {}
}

export function clearMessages() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(MESSAGES_KEY)
    localStorage.removeItem(PROMPT_KEY)
  } catch {}
}

// ─────────────────────────────────────────────
// Last prompt (для защиты от повторного запуска)
// ─────────────────────────────────────────────
export function saveLastPrompt(prompt: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PROMPT_KEY, prompt)
  } catch {}
}

export function getLastPrompt(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(PROMPT_KEY)
  } catch {
    return null
  }
}

export function clearLastPrompt() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(PROMPT_KEY)
  } catch {}
}