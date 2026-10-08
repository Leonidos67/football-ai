"use client"

import { useState } from "react"
import {
  Bell, Save, Check, RotateCcw, Mail, MessageCircle,
  Send, Smartphone, Sparkles, TrendingUp, Trophy,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalSettings } from "@/hooks/use-local-settings"

interface NotificationSettings {
  // channels
  email: boolean
  telegram: boolean
  push: boolean

  // events
  highConfidence: boolean
  dailyDigest: boolean
  expressReady: boolean
  lineMovement: boolean

  // params
  confidenceThreshold: number
  digestTime: string
  emailAddress: string
  telegramHandle: string
}

const DEFAULT: NotificationSettings = {
  email: false,
  telegram: true,
  push: false,

  highConfidence: true,
  dailyDigest: true,
  expressReady: false,
  lineMovement: true,

  confidenceThreshold: 80,
  digestTime: "09:00",
  emailAddress: "",
  telegramHandle: "",
}

export default function NotificationsPage() {
  const { value: settings, setValue: setSettings, reset, hydrated } =
    useLocalSettings<NotificationSettings>("notifications", DEFAULT)

  const [saved, setSaved] = useState(false)

  const update = <K extends keyof NotificationSettings>(key: K, val: NotificationSettings[K]) =>
    setSettings({ ...settings, [key]: val })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose where and when to receive alerts
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
        <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose where and when to receive alerts
        </p>
      </div>

      {/* Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Channels
          </CardTitle>
          <CardDescription>
            Where to deliver your notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-muted-foreground">Daily digest to your inbox</p>
              </div>
            </div>
            <Switch checked={settings.email} onCheckedChange={(v) => update("email", v)} />
          </div>

          {settings.email && (
            <div className="pl-7 space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={settings.emailAddress}
                onChange={(e) => update("emailAddress", e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-2 border-t">
            <div className="flex items-start gap-3 min-w-0">
              <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Telegram</p>
                <p className="text-xs text-muted-foreground">Instant alerts via bot</p>
              </div>
            </div>
            <Switch checked={settings.telegram} onCheckedChange={(v) => update("telegram", v)} />
          </div>

          {settings.telegram && (
            <div className="pl-7 space-y-2">
              <Label htmlFor="tg">Telegram handle</Label>
              <Input
                id="tg"
                placeholder="@yourhandle"
                value={settings.telegramHandle}
                onChange={(e) => update("telegramHandle", e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-2 border-t">
            <div className="flex items-start gap-3 min-w-0">
              <Smartphone className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Push notifications</p>
                <p className="text-xs text-muted-foreground">Browser alerts</p>
              </div>
            </div>
            <Switch checked={settings.push} onCheckedChange={(v) => update("push", v)} />
          </div>

        </CardContent>
      </Card>

      {/* Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Events
          </CardTitle>
          <CardDescription>
            Which events trigger a notification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Sparkles className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">High-confidence prediction</p>
                <p className="text-xs text-muted-foreground">
                  When the AI finds a pick above your confidence threshold
                </p>
              </div>
            </div>
            <Switch
              checked={settings.highConfidence}
              onCheckedChange={(v) => update("highConfidence", v)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t">
            <div className="flex items-start gap-3 min-w-0">
              <Trophy className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Daily digest</p>
                <p className="text-xs text-muted-foreground">
                  Summary of today's top matches and predictions
                </p>
              </div>
            </div>
            <Switch
              checked={settings.dailyDigest}
              onCheckedChange={(v) => update("dailyDigest", v)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t">
            <div className="flex items-start gap-3 min-w-0">
              <Sparkles className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Express ready</p>
                <p className="text-xs text-muted-foreground">
                  When the AI composes an accumulator from your picks
                </p>
              </div>
            </div>
            <Switch
              checked={settings.expressReady}
              onCheckedChange={(v) => update("expressReady", v)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t">
            <div className="flex items-start gap-3 min-w-0">
              <TrendingUp className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Line movement</p>
                <p className="text-xs text-muted-foreground">
                  When odds shift significantly on your tracked matches
                </p>
              </div>
            </div>
            <Switch
              checked={settings.lineMovement}
              onCheckedChange={(v) => update("lineMovement", v)}
            />
          </div>

        </CardContent>
      </Card>

      {/* Timing */}
      <Card>
        <CardHeader>
          <CardTitle>Timing & Thresholds</CardTitle>
          <CardDescription>
            Fine-tune when alerts fire
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="space-y-2">
            <Label>Confidence threshold</Label>
            <Select
              value={String(settings.confidenceThreshold)}
              onValueChange={(v) => update("confidenceThreshold", Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="70">70%+ — a lot of alerts</SelectItem>
                <SelectItem value="75">75%+ — moderate</SelectItem>
                <SelectItem value="80">80%+ — balanced (recommended)</SelectItem>
                <SelectItem value="85">85%+ — only the best</SelectItem>
                <SelectItem value="90">90%+ — rare, very strict</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Daily digest time</Label>
            <Input
              id="time"
              type="time"
              value={settings.digestTime}
              onChange={(e) => update("digestTime", e.target.value)}
            />
          </div>

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