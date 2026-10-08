"use client"

import { useState } from "react"
import {
  Layers, Check, Save, Sparkles, BarChart3,
  MessageCircle, Zap as ZapIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLocalSettings } from "@/hooks/use-local-settings"

const PERSONAS = [
  {
    id: "analytical",
    name: "Analytical",
    icon: BarChart3,
    desc: "Dry, fact-driven. Cites xG, form, injuries.",
    prompt:
      "You are a dry, factual football analyst. Always cite statistics (xG, possession, form), injuries, and head-to-head history. Avoid opinions without data.",
    tags: ["Default", "Data-heavy"],
  },
  {
    id: "friendly",
    name: "Friendly",
    icon: MessageCircle,
    desc: "Warm, casual tone. Explains simply.",
    prompt:
      "You are a friendly football expert. Explain predictions in simple, warm language. Use analogies. Avoid jargon.",
    tags: ["Beginner-friendly"],
  },
  {
    id: "sharp",
    name: "Sharp",
    icon: ZapIcon,
    desc: "Short, no fluff. For experienced bettors.",
    prompt:
      "You are a sharp bettor. Reply briefly. Focus on value, line movement, and ROI. No small talk.",
    tags: ["Expert"],
  },
  {
    id: "storyteller",
    name: "Storyteller",
    icon: Sparkles,
    desc: "Explains through narrative and context.",
    prompt:
      "You are a football storyteller. Frame predictions with narrative, historical context, and drama. Keep it engaging but accurate.",
    tags: ["Fun"],
  },
]

const DEFAULT_PERSONA = "analytical"

export default function PersonasPage() {
  const { value: active, setValue: setActive, hydrated } =
    useLocalSettings<string>("active-persona", DEFAULT_PERSONA)

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  // Скелетон пока не загрузилось из localStorage
  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Personas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preset personalities that shape how the AI communicates
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const currentPersona = PERSONAS.find((p) => p.id === active) ?? PERSONAS[0]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Personas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Preset personalities that shape how the AI communicates
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PERSONAS.map((p) => {
          const Icon = p.icon
          const isActive = active === p.id
          return (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`relative text-left p-5 rounded-2xl border transition
                ${isActive
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-muted-foreground/40"}`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                  ${isActive ? "bg-primary/15" : "bg-muted"}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{p.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-3">{p.desc}</p>

              <div className="text-[11px] text-muted-foreground/70 bg-muted/50 rounded-lg p-2.5 leading-relaxed line-clamp-2">
                {p.prompt}
              </div>
            </button>
          )
        })}
      </div>

      {/* Active preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Active persona prompt
          </CardTitle>
          <CardDescription>
            This text is added to the system prompt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 text-xs font-mono leading-relaxed text-muted-foreground">
            {currentPersona.prompt}
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