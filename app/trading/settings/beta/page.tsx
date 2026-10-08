"use client"

import { useState } from "react"
import {
  FlaskConical, Save, Check, RotateCcw, AlertTriangle,
  Sparkles, Mic, Brain, Globe2, Users, Zap, Layers,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useLocalSettings } from "@/hooks/use-local-settings"

const BETA_FEATURES = [
  {
    id: "voice",
    name: "Voice input",
    icon: Mic,
    desc: "Ask predictions with your voice instead of typing",
    tag: "Experimental",
  },
  {
    id: "agent-mode",
    name: "Agent mode",
    icon: Brain,
    desc: "AI keeps analyzing matches in the background and pings you",
    tag: "New",
  },
  {
    id: "live-odds",
    name: "Live odds streaming",
    icon: Zap,
    desc: "Real-time line updates while the match is in play",
    tag: "New",
  },
  {
    id: "compare-models",
    name: "Multi-model compare",
    icon: Layers,
    desc: "Run 2-3 models side-by-side and compare picks",
  },
  {
    id: "social",
    name: "Community picks",
    icon: Users,
    desc: "See what other users are betting on today",
  },
  {
    id: "global-leagues",
    name: "Global leagues",
    icon: Globe2,
    desc: "Coverage of smaller leagues worldwide",
    tag: "Experimental",
  },
]

const DEFAULT_BETA: Record<string, boolean> = BETA_FEATURES.reduce(
  (acc, f) => ({ ...acc, [f.id]: false }),
  {} as Record<string, boolean>
)

export default function BetaPage() {
  const { value: enabled, setValue: setEnabled, reset, hydrated } =
    useLocalSettings<Record<string, boolean>>("beta", DEFAULT_BETA)

  const [saved, setSaved] = useState(false)

  const toggle = (id: string) =>
    setEnabled({ ...enabled, [id]: !enabled[id] })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Beta Features</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Experimental features that may change or break
          </p>
        </div>
        <div className="h-96 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  const activeCount = BETA_FEATURES.filter((f) => enabled[f.id]).length

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Beta Features</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Experimental features that may change or break — {activeCount} enabled
        </p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-xs">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Beta features are still being tested. They may behave unexpectedly,
          change without notice, or disappear.
        </p>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            Available in beta
          </CardTitle>
          <CardDescription>
            Turn on what you want to try — you can disable any of them anytime
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {BETA_FEATURES.map((f) => {
            const Icon = f.icon
            const isOn = !!enabled[f.id]
            return (
              <div
                key={f.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                    ${isOn ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`w-4 h-4 ${isOn ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{f.name}</p>
                      {f.tag && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {f.tag}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </div>
                <Switch checked={isOn} onCheckedChange={() => toggle(f.id)} />
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