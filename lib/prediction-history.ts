"use client"

export interface PredictionHistoryItem {
  id: string
  match: string
  league: string
  date: string
  market: string
  odds: number
  confidence: number
  reasoning: string
  createdAt: number
}

const STORAGE_KEY = "mnoonx:settings:prediction-history"
const MAX_ITEMS = 30

export function loadHistory(): PredictionHistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHistory(items: PredictionHistoryItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    // уведомляем всех подписчиков (NavProjects, chat, ...)
    window.dispatchEvent(new CustomEvent("prediction-history:update"))
  } catch {}
}

export function addPrediction(
  prediction: Omit<PredictionHistoryItem, "id" | "createdAt">
) {
  const current = loadHistory()

  // дедупликация по match+market — если такой прогноз уже есть сегодня,
  // просто обновляем его
  const existingIdx = current.findIndex(
    (p) => p.match === prediction.match && p.market === prediction.market
  )

  const item: PredictionHistoryItem = {
    ...prediction,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  }

  let next: PredictionHistoryItem[]
  if (existingIdx >= 0) {
    next = [...current]
    next[existingIdx] = { ...next[existingIdx], ...prediction, createdAt: Date.now() }
  } else {
    next = [item, ...current]
  }

  // обрезаем до MAX_ITEMS
  next = next.slice(0, MAX_ITEMS)
  saveHistory(next)
}

export function removePrediction(id: string) {
  const next = loadHistory().filter((p) => p.id !== id)
  saveHistory(next)
}

export function clearHistory() {
  saveHistory([])
}