"use client"

import { useState } from "react"
import {
  Target, Save, Check, RotateCcw, Home, Plane, Minus,
  TrendingUp, TrendingDown, Users, Trophy, Shield,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useLocalSettings } from "@/hooks/use-local-settings"

const MARKETS = [
  { id: "1",   name: "Home Win (1)",         icon: Home,         desc: "Victory for the home team",        tag: "Popular" },
  { id: "x",   name: "Draw (X)",             icon: Minus,        desc: "Match ends in a draw" },
  { id: "2",   name: "Away Win (2)",         icon: Plane,        desc: "Victory for the away team",        tag: "Popular" },
  { id: "1x",  name: "Double Chance 1X",     icon: Shield,       desc: "Home win or draw" },
  { id: "12",  name: "Double Chance 12",     icon: Shield,       desc: "No draw" },
  { id: "x2",  name: "Double Chance X2",     icon: Shield,       desc: "Draw or away win" },
  { id: "o25", name: "Over 2.5 goals",       icon: TrendingUp,   desc: "3 or more goals total",            tag: "Popular" },
  { id: "u25", name: "Under 2.5 goals",      icon: TrendingDown, desc: "0 to 2 goals total" },
  { id: "btts", name: "Both teams to score", icon: Users,        desc: "BTTS — yes",                       tag: "Popular" },
  { id: "hcp", name: "Handicap",             icon: Target,       desc: "Asian / European handicap markets" },
  { id: "trophy", name: "Tournament Winner", icon: Trophy,       desc: "Long-term outright bets" },
]

interface MarketSettings {
  enabled: Record<string, boolean>
}

const DEFAULT: MarketSettings = {
  enabled: {
    "1": true,
    "x": true,
    "2": true,
    "1x": false,
    "12": false,
    "x2": false,
    "o25": true,
    "u25": true,
    "btts": true,
    "hcp": false,
    "trophy": false,
  },
}

export default function MarketsPage() {
  const { value: settings, setValue: setSettings, reset, hydrated } =
    useLocalSettings<MarketSettings>("markets", DEFAULT)

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

  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Default Markets</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose which betting markets the AI considers by default
          </p>
        </div>
        <div className="h-96 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  const activeCount = MARKETS.filter((m) => settings.enabled[m.id]).length

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Default Markets</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose which betting markets the AI considers — {activeCount} of {MARKETS.length} active
        </p>
      </div>

      {/* Markets list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Available markets
          </CardTitle>
          <CardDescription>
            Enabled markets are preferred by the AI when suggesting predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {MARKETS.map((m) => {
            const Icon = m.icon
            const isOn = !!settings.enabled[m.id]
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                    ${isOn ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`w-4 h-4 ${isOn ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{m.name}</p>
                      {m.tag && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {m.tag}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                  </div>
                </div>
                <Switch checked={isOn} onCheckedChange={() => toggle(m.id)} />
              </div>
            )
          })}
        </CardContent>
      </Card>

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