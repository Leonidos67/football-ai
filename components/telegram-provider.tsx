"use client"

import { useEffect, useState } from "react"

// Типы Telegram WebApp — минимальные
interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  colorScheme: "light" | "dark"
  themeParams: Record<string, string>
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      photo_url?: string
    }
    start_param?: string
  }
  viewportHeight: number
  viewportStableHeight: number
  isExpanded: boolean
  onEvent: (event: string, cb: () => void) => void
  offEvent: (event: string, cb: () => void) => void
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  BackButton?: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (cb: () => void) => void
    offClick: (cb: () => void) => void
  }
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void
    notificationOccurred: (type: "error" | "success" | "warning") => void
    selectionChanged: () => void
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const tg = window.Telegram?.WebApp

    // Не в Telegram — просто ничего не делаем
    if (!tg) {
      console.log("[Telegram] Not running inside Telegram")
      setReady(true)
      return
    }

    try {
      // Инициализация
      tg.ready()
      tg.expand()

      // Синхронизация темы
      const applyTheme = (scheme: "light" | "dark") => {
        const root = document.documentElement
        if (scheme === "dark") root.classList.add("dark")
        else root.classList.remove("dark")
      }

      applyTheme(tg.colorScheme)

      // Слушаем смену темы Telegram
      const handleThemeChange = () => {
        applyTheme(tg.colorScheme)
      }
      tg.onEvent("themeChanged", handleThemeChange)

      // Применяем цвета шапки Telegram под наш фон
      const bgColor = tg.themeParams.bg_color || (tg.colorScheme === "dark" ? "#0a0a0a" : "#ffffff")
      tg.setHeaderColor?.(bgColor)
      tg.setBackgroundColor?.(bgColor)

      // Фиксируем viewport высоту — для iOS клавиатуры
      const handleViewport = () => {
        const h = tg.viewportStableHeight || tg.viewportHeight
        document.documentElement.style.setProperty("--tg-viewport-height", `${h}px`)
      }
      handleViewport()
      tg.onEvent("viewportChanged", handleViewport)

      console.log("[Telegram] Initialized", {
        user: tg.initDataUnsafe?.user,
        scheme: tg.colorScheme,
      })

      setReady(true)

      return () => {
        tg.offEvent("themeChanged", handleThemeChange)
        tg.offEvent("viewportChanged", handleViewport)
      }
    } catch (err) {
      console.error("[Telegram] Init failed:", err)
      setReady(true)
    }
  }, [])

  return <>{children}</>
}

// ─────────────────────────────────────────────
// Хук для доступа к Telegram WebApp из любого компонента
// ─────────────────────────────────────────────
export function useTelegram() {
  const [tg, setTg] = useState<TelegramWebApp | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    setTg(window.Telegram?.WebApp ?? null)
  }, [])

  const user = tg?.initDataUnsafe?.user

  return {
    tg,
    user,
    isTelegram: !!tg,
    haptic: (style: "light" | "medium" | "heavy" | "rigid" | "soft" = "light") => {
      tg?.HapticFeedback?.impactOccurred(style)
    },
    notify: (type: "error" | "success" | "warning" = "success") => {
      tg?.HapticFeedback?.notificationOccurred(type)
    },
    close: () => tg?.close(),
  }
}