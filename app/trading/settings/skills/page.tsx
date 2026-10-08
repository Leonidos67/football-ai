"use client"

import { useState } from "react"
import {
  Zap, Save, Check, Image as ImageIcon, Ticket,
  BarChart3, Newspaper, Users, Bell, Calendar,
  TrendingUp, Globe,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useLocalSettings } from "@/hooks/use-local-settings"

const SKILLS = [
  {
    id: "vision",
    name: "Vision",
    icon: ImageIcon,
    desc: "Analyze screenshots of betting lines and match photos",
    tag: "Popular",
  },
  {
    id: "express",
    name: "Express builder",
    icon: Ticket,
    desc: "Auto-compose accumulator tickets from your picks",
  },
  {
    id: "xg",
    name: "xG model",
    icon: BarChart3,
    desc: "Use expected goals data in predictions",
    tag: "Pro",
  },
  {
    id: "news",
    name: "News context",
    icon: Newspaper,
    desc: "Pull latest news about teams and lineups",
  },
  {
    id: "injuries",
    name: "Injury tracking",
    icon: Users,
    desc: "Check injured and suspended players",
  },
  {
    id: "h2h",
    name: "Head-to-head",
    icon: TrendingUp,
    desc: "Analyze historical matchups between teams",
  },
  {
    id: "leagues",
    name: "Multi-league coverage",
    icon: Globe,
    desc: "Expand analysis to all major leagues",
    tag: "Pro",
  },
  {
    id: "calendar",
    name: "Match calendar",
    icon: Calendar,
    desc: "Use upcoming fixtures and rest days",
  },
  {
    id: "alerts",
    name: "Smart alerts",
    icon: Bell,
    desc: "Notify when a high-confidence match appears",
  },
]

const DEFAULT_SKILLS: Record<string, boolean> = {
  vision: true,
  express: true,
  xg: true,
  news: false,
  injuries: true,
  h2h: true,
  leagues: false,
  calendar: true,
  alerts: false,
}

export default function SkillsPage() {
  const { value: enabled, setValue: setEnabled, hydrated } =
    useLocalSettings<Record<string, boolean>>("skills", DEFAULT_SKILLS)

  const [saved, setSaved] = useState(false)

  const toggle = (id: string) =>
    // ⚠️ функциональный апдейт не поддерживается — создаём новый объект
    setEnabled({ ...enabled, [id]: !enabled[id] })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  // Скелетон пока не загрузилось из localStorage
  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Skills</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enable or disable specific AI capabilities
          </p>
        </div>
        <div className="h-96 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  const activeCount = SKILLS.filter((s) => enabled[s.id]).length

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Skills</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enable or disable specific AI capabilities — {activeCount} of {SKILLS.length} active
        </p>
      </div>

      {/* Skills list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Available skills
          </CardTitle>
          <CardDescription>
            Each skill adds extra tools the AI can use during analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {SKILLS.map((skill) => {
            const Icon = skill.icon
            const isOn = !!enabled[skill.id]
            return (
              <div
                key={skill.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                    ${isOn ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`w-4 h-4 ${isOn ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{skill.name}</p>
                      {skill.tag && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {skill.tag}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{skill.desc}</p>
                  </div>
                </div>
                <Switch checked={isOn} onCheckedChange={() => toggle(skill.id)} />
              </div>
            )
          })}
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