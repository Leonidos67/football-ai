"use client"

import { useState } from "react"
import {
  Cpu, Save, Check, RotateCcw, Gauge, Zap, Brain, Sparkles,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useLocalSettings } from "@/hooks/use-local-settings"

const MODELS = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    desc: "Fast, cheap, good for most predictions",
    icon: Zap,
    tags: ["Fast", "Cheap"],
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    desc: "Best quality for detailed analysis",
    icon: Brain,
    tags: ["Recommended", "Smart"],
    recommended: true,
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    desc: "Great at long reasoning and nuance",
    icon: Sparkles,
    tags: ["Long context"],
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    desc: "Balanced and affordable",
    icon: Cpu,
    tags: ["Value"],
  },
]

interface ModelSettings {
  model: string
  temperature: number[]
  maxTokens: number[]
}

const DEFAULT: ModelSettings = {
  model: "gpt-4o",
  temperature: [0.7],
  maxTokens: [1200],
}

export default function ModelPage() {
  const { value: settings, setValue: setSettings, reset, hydrated } =
    useLocalSettings<ModelSettings>("model", DEFAULT)

  const { model, temperature, maxTokens } = settings

  const update = <K extends keyof ModelSettings>(key: K, val: ModelSettings[K]) =>
    setSettings({ ...settings, [key]: val })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  // пока не загрузилось из localStorage — не мигаем дефолтом
  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Model & Tokens</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pick the AI model and tune how it generates predictions
          </p>
        </div>
        <div className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Model & Tokens</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pick the AI model and tune how it generates predictions
        </p>
      </div>

      {/* ───────── MODEL ───────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            AI Model
          </CardTitle>
          <CardDescription>
            Different models trade speed, cost, and quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MODELS.map((m) => {
              const Icon = m.icon
              const active = model === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => update("model", m.id)}
                  className={`text-left p-4 rounded-xl border transition relative
                    ${active
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground/40"}`}
                >
                  {m.recommended && (
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3 text-[10px]"
                    >
                      Recommended
                    </Badge>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-semibold">{m.name}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{m.desc}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {m.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ───────── FINE-TUNING ───────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Fine-tuning
          </CardTitle>
          <CardDescription>
            Advanced parameters — leave defaults if unsure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperature</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {temperature[0].toFixed(1)}
              </span>
            </div>
            <Slider
              value={temperature}
              onValueChange={(v) => update("temperature", v)}
              min={0}
              max={1}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground">
              Lower = consistent & safe. Higher = creative & varied.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Max tokens</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {maxTokens[0]}
              </span>
            </div>
            <Slider
              value={maxTokens}
              onValueChange={(v) => update("maxTokens", v)}
              min={200}
              max={4000}
              step={100}
            />
            <p className="text-xs text-muted-foreground">
              Maximum length of a single prediction response.
            </p>
          </div>

        </CardContent>
      </Card>

      {/* ───────── SAVE ───────── */}
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