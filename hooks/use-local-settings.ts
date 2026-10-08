"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Хук для хранения любых настроек в localStorage.
 * Автоматически подгружает при монтировании и сохраняет при изменениях.
 *
 * @param key — уникальный ключ (например, "ai-settings", "model", "skills")
 * @param defaultValue — значение по умолчанию
 */
export function useLocalSettings<T>(key: string, defaultValue: T) {
  const storageKey = `mnoonx:settings:${key}`
  const [value, setValue] = useState<T>(defaultValue)
  const [hydrated, setHydrated] = useState(false)
  const firstRun = useRef(true)

  // Загрузка из localStorage при монтировании
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        setValue(parsed)
      }
    } catch (e) {
      console.warn(`[useLocalSettings] failed to load "${key}":`, e)
    } finally {
      setHydrated(true)
    }
  }, [storageKey])

  // Сохранение при каждом изменении (после гидратации)
  useEffect(() => {
    if (!hydrated) return
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch (e) {
      console.warn(`[useLocalSettings] failed to save "${key}":`, e)
    }
  }, [value, storageKey, hydrated])

  const reset = () => {
    setValue(defaultValue)
    try {
      localStorage.removeItem(storageKey)
    } catch {}
  }

  return { value, setValue, reset, hydrated }
}