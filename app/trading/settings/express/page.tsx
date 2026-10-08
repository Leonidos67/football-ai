"use client"

import { useState } from "react"
import {
  Ticket, Save, Check, RotateCcw, ShieldCheck,
  TrendingUp, Layers, AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalSettings } from "@/hooks/use-local-settings"

interface ExpressSettings {
  enabled: boolean
  minLegs: number
  maxLegs: number
  minConfidence: number
  riskProfile: "safe" | "balanced" | "aggressive"
  excludeSameLeague: boolean
  excludeSameTime: boolean
}

const DEFAULT: ExpressSettings = {
  enabled: true,
  minLegs: 2,
  maxLegs: 4,
  minConfidence: 65,
  riskProfile: "balanced",
  excludeSameLeague: false,
  excludeSameTime: true,
}

export default function ExpressPage() {
  const { value: settings, setValue: setSettings, reset, hydrated } =
    useLocalSettings<ExpressSettings>("express", DEFAULT)

  const [saved, setSaved] = useState(false)

  const update = <K extends keyof ExpressSettings>(key: K, val: ExpressSettings[K]) =>
    setSettings({ ...settings, [key]: val })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Express Rules</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure how the AI automatically builds accumulator tickets
          </p>
        </div>
        <div className="h-96 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Express Rules</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how the AI automatically builds accumulator tickets
        </p>
      </div>

      {/* Enable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Auto-express
          </CardTitle>
          <CardDescription>
            Let the AI suggest accumulator tickets from your picks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Enable auto-express</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The AI will offer combined bets when you ask for "top picks"
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(v) => update("enabled", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Ticket size
          </CardTitle>
          <CardDescription>
            How many events to combine into one express
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Minimum legs</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {settings.minLegs}
              </span>
            </div>
            <Slider
              value={[settings.minLegs]}
              onValueChange={([v]) => update("minLegs", v)}
              min={2}
              max={5}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Maximum legs</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {settings.maxLegs}
              </span>
            </div>
            <Slider
              value={[settings.maxLegs]}
              onValueChange={([v]) => update("maxLegs", v)}
              min={2}
              max={8}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              More legs = higher odds, but lower chance to win
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Confidence & risk */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Confidence & Risk
          </CardTitle>
          <CardDescription>
            Only include picks that meet these criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Min confidence per leg</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {settings.minConfidence}%
              </span>
            </div>
            <Slider
              value={[settings.minConfidence]}
              onValueChange={([v]) => update("minConfidence", v)}
              min={50}
              max={90}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Picks below this threshold are never added to an express
            </p>
          </div>

          <div className="space-y-2">
            <Label>Risk profile</Label>
            <Select
              value={settings.riskProfile}
              onValueChange={(v) => update("riskProfile", v as ExpressSettings["riskProfile"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safe">Safe — 2 legs, 75%+ confidence</SelectItem>
                <SelectItem value="balanced">Balanced — 3 legs, 65%+ confidence</SelectItem>
                <SelectItem value="aggressive">Aggressive — 4-5 legs, 55%+ confidence</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Risk profile adjusts the recommended stake and minimum confidence
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Filters
          </CardTitle>
          <CardDescription>
            Rules that exclude certain combinations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Exclude same league</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Don't combine picks from the same league in one express
              </p>
            </div>
            <Switch
              checked={settings.excludeSameLeague}
              onCheckedChange={(v) => update("excludeSameLeague", v)}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Exclude same kick-off time</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Don't include matches that start at the same time
              </p>
            </div>
            <Switch
              checked={settings.excludeSameTime}
              onCheckedChange={(v) => update("excludeSameTime", v)}
            />
          </div>

        </CardContent>
      </Card>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-xs">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Expresses are riskier than single bets. Higher legs and lower confidence
          mean bigger payouts but lower win rate.
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