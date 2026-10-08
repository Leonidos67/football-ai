"use client"

import { useEffect, useState } from "react"
import {
  Keyboard, Save, Check, RotateCcw, Search, Command,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useLocalSettings } from "@/hooks/use-local-settings"

// ─────────────────────────────────────────────
// Определения шорткатов
// ─────────────────────────────────────────────
const SHORTCUTS = [
  { id: "new-chat",      name: "New chat",            desc: "Start a fresh conversation",       keys: ["⌘", "N"] },
  { id: "focus-input",   name: "Focus input",         desc: "Jump to the message box",          keys: ["/"] },
  { id: "send",          name: "Send message",        desc: "Submit the current input",         keys: ["↵"] },
  { id: "newline",       name: "Insert newline",      desc: "Multi-line message input",         keys: ["⇧", "↵"] },
  { id: "upload-image",  name: "Upload image",        desc: "Open image picker",                keys: ["⌘", "U"] },
  { id: "open-settings", name: "Open AI settings",    desc: "Jump to AI Settings",              keys: ["⌘", ","] },
  { id: "open-express",  name: "Express builder",     desc: "Open the accumulator panel",       keys: ["⌘", "E"] },
  { id: "regen",         name: "Regenerate",          desc: "Re-run the last prediction",       keys: ["⌘", "R"] },
  { id: "clear-chat",    name: "Clear chat",          desc: "Wipe the current conversation",    keys: ["⌘", "⇧", "⌫"] },
  { id: "sidebar",       name: "Toggle sidebar",      desc: "Show or hide the sidebar",         keys: ["⌘", "B"] },
]

interface ShortcutState {
  enabled: Record<string, boolean>
}

const DEFAULT: ShortcutState = {
  enabled: SHORTCUTS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {} as Record<string, boolean>),
}

export default function ShortcutsPage() {
  const { value: settings, setValue: setSettings, reset, hydrated } =
    useLocalSettings<ShortcutState>("shortcuts", DEFAULT)

  const [query, setQuery] = useState("")
  const [saved, setSaved] = useState(false)

  const toggle = (id: string) =>
    setSettings({
      ...settings,
      enabled: { ...settings.enabled, [id]: !settings.enabled[id] },
    })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  // live-фильтр по имени/описанию
  const filtered = SHORTCUTS.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.desc.toLowerCase().includes(query.toLowerCase())
  )

  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Keyboard Shortcuts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Speedy access to the features you use most
          </p>
        </div>
        <div className="h-96 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  const activeCount = SHORTCUTS.filter((s) => settings.enabled[s.id]).length

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Keyboard Shortcuts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Speedy access to the features you use most — {activeCount} of {SHORTCUTS.length} active
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search shortcuts..."
          className="pl-9"
        />
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Available shortcuts
          </CardTitle>
          <CardDescription>
            Toggle each shortcut on or off. Disabled shortcuts won't fire.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No shortcuts match "{query}"
            </div>
          ) : (
            filtered.map((s) => {
              const isOn = !!settings.enabled[s.id]
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <kbd
                          key={i}
                          className="min-w-[28px] h-7 px-2 inline-flex items-center justify-center rounded-md border border-border bg-muted text-xs font-mono"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                    <Switch checked={isOn} onCheckedChange={() => toggle(s.id)} />
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
        <Command className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          On Windows / Linux, use <kbd className="px-1 py-0.5 rounded border bg-muted font-mono">Ctrl</kbd> instead of <kbd className="px-1 py-0.5 rounded border bg-muted font-mono">⌘</kbd>.
        </p>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
        <Button onClick={handleSave} className="gap-2">
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved" : "Save changes"}
        </Button>
      </div>

    </div>
  )
}