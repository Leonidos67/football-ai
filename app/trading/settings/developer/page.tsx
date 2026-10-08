"use client"

import { useState } from "react"
import {
  Code2, Save, Check, RotateCcw, Webhook, FileJson,
  Bug, Copy, Download, Trash2, AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useLocalSettings } from "@/hooks/use-local-settings"

interface DevSettings {
  webhookUrl: string
  webhookEvents: string
  debugMode: boolean
  verboseLogs: boolean
  requestLogging: boolean
}

const DEFAULT: DevSettings = {
  webhookUrl: "",
  webhookEvents: "predictions",
  debugMode: false,
  verboseLogs: false,
  requestLogging: true,
}

export default function DeveloperPage() {
  const { value: settings, setValue: setSettings, reset, hydrated } =
    useLocalSettings<DevSettings>("developer", DEFAULT)

  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const update = <K extends keyof DevSettings>(key: K, val: DevSettings[K]) =>
    setSettings({ ...settings, [key]: val })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const exportConfig = () => {
    // собираем все настройки mnoonx:* из localStorage
    const dump: Record<string, any> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith("mnoonx:settings:")) continue
      try {
        dump[key.replace("mnoonx:settings:", "")] = JSON.parse(localStorage.getItem(key) || "null")
      } catch {}
    }

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mnoonx-settings-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(settings.webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const clearAllSettings = () => {
    if (!confirm("Delete all local settings? This cannot be undone.")) return
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("mnoonx:settings:")) keysToRemove.push(key)
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }

  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Developer</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Webhooks, logs, and advanced debug tools
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
        <h2 className="text-2xl font-semibold tracking-tight">Developer</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Webhooks, logs, and advanced debug tools
        </p>
      </div>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhooks
          </CardTitle>
          <CardDescription>
            Receive HTTP callbacks when predictions happen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="webhook">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook"
                type="url"
                placeholder="https://your-server.com/hooks/"
                value={settings.webhookUrl}
                onChange={(e) => update("webhookUrl", e.target.value)}
              />
              {settings.webhookUrl && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyWebhook}
                  title="Copy"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              We'll POST JSON to this URL for the events below
            </p>
          </div>

          <div className="space-y-2">
            <Label>Events to send</Label>
            <Select
              value={settings.webhookEvents}
              onValueChange={(v) => update("webhookEvents", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="predictions">New predictions only</SelectItem>
                <SelectItem value="high-confidence">High-confidence picks only (80%+)</SelectItem>
                <SelectItem value="express">Express tickets only</SelectItem>
                <SelectItem value="all">All events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t">
            <div>
              <p className="text-sm font-medium">Log requests</p>
              <p className="text-xs text-muted-foreground">
                Save every webhook delivery to a local log
              </p>
            </div>
            <Switch
              checked={settings.requestLogging}
              onCheckedChange={(v) => update("requestLogging", v)}
            />
          </div>

        </CardContent>
      </Card>

      {/* Debug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Debug
          </CardTitle>
          <CardDescription>
            Tools for diagnosing issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Debug mode</p>
              <p className="text-xs text-muted-foreground">
                Show token usage, latency, and model info under each response
              </p>
            </div>
            <Switch
              checked={settings.debugMode}
              onCheckedChange={(v) => update("debugMode", v)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t">
            <div>
              <p className="text-sm font-medium">Verbose logs</p>
              <p className="text-xs text-muted-foreground">
                Print every HTTP request to browser console
              </p>
            </div>
            <Switch
              checked={settings.verboseLogs}
              onCheckedChange={(v) => update("verboseLogs", v)}
            />
          </div>

        </CardContent>
      </Card>

      {/* Config export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            Config file
          </CardTitle>
          <CardDescription>
            Export or wipe all local settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">

          <Button variant="outline" onClick={exportConfig} className="gap-2">
            <Download className="w-4 h-4" />
            Export as JSON
          </Button>

          <Button
            variant="outline"
            onClick={clearAllSettings}
            className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
            Clear all settings
          </Button>

        </CardContent>
      </Card>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-xs">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Debug options may slow down responses and log sensitive data.
          Turn them off when you're done.
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