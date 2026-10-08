"use client"

import { useEffect, useState } from "react"
import { Sun, Moon, Monitor, Palette, Check, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocalSettings } from "@/hooks/use-local-settings"

type ThemeMode = "light" | "dark" | "system"

const THEMES: {
  id: ThemeMode
  name: string
  icon: any
  desc: string
}[] = [
  { id: "light",  name: "Light",  icon: Sun,     desc: "Bright, clean, easy on the eyes" },
  { id: "dark",   name: "Dark",   icon: Moon,    desc: "Reduced eye strain at night" },
  { id: "system", name: "System", icon: Monitor, desc: "Follow your OS preference" },
]

const ACCENTS = [
  { id: "red",     name: "Red",     color: "#e72930" },
  { id: "emerald", name: "Emerald", color: "#10b981" },
  { id: "blue",    name: "Blue",    color: "#3b82f6" },
  { id: "violet",  name: "Violet",  color: "#8b5cf6" },
  { id: "amber",   name: "Amber",   color: "#f59e0b" },
  { id: "rose",    name: "Rose",    color: "#f43f5e" },
]

interface ThemeSettings {
  mode: ThemeMode
  accent: string
}

const DEFAULT: ThemeSettings = { mode: "system", accent: "red" }

export default function ThemePage() {
  const { value: settings, setValue: setSettings, hydrated } =
    useLocalSettings<ThemeSettings>("theme", DEFAULT)

  const [saved, setSaved] = useState(false)

  const update = <K extends keyof ThemeSettings>(key: K, val: ThemeSettings[K]) =>
    setSettings({ ...settings, [key]: val })

  // применение темы
  useEffect(() => {
    if (!hydrated) return
    const root = document.documentElement

    const apply = (isDark: boolean) => {
      if (isDark) root.classList.add("dark")
      else root.classList.remove("dark")
    }

    if (settings.mode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      apply(mq.matches)
      const listener = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener("change", listener)
      return () => mq.removeEventListener("change", listener)
    } else {
      apply(settings.mode === "dark")
    }
  }, [settings.mode, hydrated])

  // применение акцента
  useEffect(() => {
    if (!hydrated) return
    const color = ACCENTS.find((a) => a.id === settings.accent)?.color
    if (!color) return
    document.documentElement.style.setProperty("--accent-color", color)
    document.documentElement.style.setProperty("--primary", hexToHsl(color))
  }, [settings.accent, hydrated])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Theme</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose your preferred look and feel
          </p>
        </div>
        <div className="h-64 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Theme</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose your preferred look and feel
        </p>
      </div>

      {/* Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance mode
          </CardTitle>
          <CardDescription>
            Pick light, dark, or follow the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {THEMES.map((t) => {
              const Icon = t.icon
              const active = settings.mode === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => update("mode", t.id)}
                  className={`relative text-left p-5 rounded-2xl border transition
                    ${active
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground/40"}`}
                >
                  {active && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3
                    ${active ? "bg-primary/15" : "bg-muted"}`}>
                    <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  </div>

                  <h4 className="font-semibold text-sm mb-1">{t.name}</h4>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Accent color */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Accent color
          </CardTitle>
          <CardDescription>
            Choose the primary color used across the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {ACCENTS.map((a) => {
              const active = settings.accent === a.id
              return (
                <button
                  key={a.id}
                  onClick={() => update("accent", a.id)}
                  className={`relative w-12 h-12 rounded-full border-2 transition
                    ${active
                      ? "border-foreground scale-110 ring-2 ring-offset-2 ring-offset-background ring-foreground/20"
                      : "border-border hover:scale-105"}`}
                  style={{ background: a.color }}
                  title={a.name}
                >
                  {active && (
                    <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow" />
                  )}
                </button>
              )
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Active: <span className="font-medium text-foreground">
              {ACCENTS.find((a) => a.id === settings.accent)?.name}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            How it looks in context
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Real Madrid — Barcelona</p>
                <p className="text-xs text-muted-foreground">La Liga · 21:00</p>
              </div>
              <Badge style={{ background: ACCENTS.find((a) => a.id === settings.accent)?.color }}>
                <span className="text-white">P1 · 1.85</span>
              </Badge>
            </div>
            <Button
              size="sm"
              style={{ background: ACCENTS.find((a) => a.id === settings.accent)?.color }}
              className="text-white hover:opacity-90"
            >
              Get prediction
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center justify-end">
        <Button onClick={handleSave} className="gap-2">
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved" : "Save changes"}
        </Button>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────
// hex → HSL для shadcn переменных
// ─────────────────────────────────────────────
function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16)
    g = parseInt(hex[2] + hex[2], 16)
    b = parseInt(hex[3] + hex[3], 16)
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16)
    g = parseInt(hex.slice(3, 5), 16)
    b = parseInt(hex.slice(5, 7), 16)
  }
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}