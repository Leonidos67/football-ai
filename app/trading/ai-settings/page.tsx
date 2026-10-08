"use client"

import { useState } from "react"
import {
  Save, Sparkles, AlertTriangle, Check, RotateCcw,
  Cpu, Gauge, Languages, Globe2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function AISettingsPage() {
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("gpt-4o-mini")
  const [riskLevel, setRiskLevel] = useState("medium")
  const [tone, setTone] = useState("analytical")
  const [language, setLanguage] = useState("ru")
  const [temperature, setTemperature] = useState([0.7])
  const [maxTokens, setMaxTokens] = useState([1200])

  const [autoExpress, setAutoExpress] = useState(true)
  const [visionEnabled, setVisionEnabled] = useState(true)
  const [historyContext, setHistoryContext] = useState(true)

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const handleReset = () => {
    setPrompt("")
    setModel("gpt-4o-mini")
    setRiskLevel("medium")
    setTone("analytical")
    setLanguage("ru")
    setTemperature([0.7])
    setMaxTokens([1200])
    setAutoExpress(true)
    setVisionEnabled(true)
    setHistoryContext(true)
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">AI Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how your AI analyst thinks, speaks, and picks predictions
        </p>
      </div>

      {/* ───────────── SYSTEM PROMPT ───────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            System Prompt
          </CardTitle>
          <CardDescription>
            Instructions the AI will strictly follow when generating predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Custom instructions</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              placeholder={`Example:\nYou are an experienced football analyst. Always back up your predictions with team form, xG, injuries, and head-to-head history. Be honest about confidence levels.\n\nLeave empty to use the default system prompt.`}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the built-in default. Custom prompts override the default completely.
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Your prompt directly affects prediction quality. Specify concrete criteria
              (form, xG, injuries) instead of vague instructions.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} className="gap-2">
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
            <Badge variant="secondary">Last update: just now</Badge>
          </div>
        </CardContent>
      </Card>

      {/* ───────────── MODEL & RISK ───────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Model & Risk
          </CardTitle>
          <CardDescription>
            Choose the model, tone, and risk appetite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>AI Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o mini (fast)</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o (recommended)</SelectItem>
                  <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                  <SelectItem value="deepseek-v3">DeepSeek V3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — confident only (80%+)</SelectItem>
                  <SelectItem value="medium">Medium — balanced (65%+)</SelectItem>
                  <SelectItem value="high">High — includes risky (50%+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analytical">Analytical — dry, factual</SelectItem>
                  <SelectItem value="friendly">Friendly — warm, casual</SelectItem>
                  <SelectItem value="sharp">Sharp — short, to the point</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5" />
                Response Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Russian</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="auto">Auto (match user)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-muted-foreground text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Higher risk = lower confidence threshold. More predictions, but also more misses.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ───────────── FINE-TUNING ───────────── */}
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
              onValueChange={setTemperature}
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
              onValueChange={setMaxTokens}
              min={200}
              max={4000}
              step={100}
            />
            <p className="text-xs text-muted-foreground">
              Maximum length of a single response.
            </p>
          </div>

        </CardContent>
      </Card>

      {/* ───────────── FEATURES ───────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="w-4 h-4" />
            Features
          </CardTitle>
          <CardDescription>
            Enable or disable specific AI capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <FeatureToggle
            title="Vision (image analysis)"
            description="Analyze screenshots of betting lines and match photos"
            checked={visionEnabled}
            onChange={setVisionEnabled}
          />

          <FeatureToggle
            title="Auto-express"
            description="Automatically suggest accumulator tickets from your picks"
            checked={autoExpress}
            onChange={setAutoExpress}
          />

          <FeatureToggle
            title="Conversation memory"
            description="Use chat history as context for follow-up predictions"
            checked={historyContext}
            onChange={setHistoryContext}
          />

        </CardContent>
      </Card>

      {/* ───────────── SAVE FOOTER ───────────── */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset all
        </Button>
        <Button onClick={handleSave} className="gap-2">
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved" : "Save changes"}
        </Button>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────
// FeatureToggle — вспомогательный компонент
// ─────────────────────────────────────────────
function FeatureToggle({
  title, description, checked, onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}