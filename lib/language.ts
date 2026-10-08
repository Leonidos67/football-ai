"use client"

export type Language = "pt-BR" | "en" | "ru"

export const LANGUAGES: { code: Language; label: string; flag: string; name: string }[] = [
  { code: "pt-BR", label: "PT", flag: "🇧🇷", name: "Português (Brasil)" },
  { code: "en",    label: "EN", flag: "🇺🇸", name: "English" },
  { code: "ru",    label: "RU", flag: "🇷🇺", name: "Русский" },
]

const STORAGE_KEY = "mnoonx:language"
const EVENT = "mnoonx:language:update"

export function getLanguage(): Language {
  if (typeof window === "undefined") return "en"
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null
    if (stored && LANGUAGES.some((l) => l.code === stored)) return stored
  } catch {}
  return "en"
}

export function setLanguage(lang: Language) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, lang)
    window.dispatchEvent(new CustomEvent(EVENT))
  } catch {}
}

export function onLanguageChange(cb: (lang: Language) => void) {
  if (typeof window === "undefined") return () => {}
  const handler = () => cb(getLanguage())
  window.addEventListener(EVENT, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}