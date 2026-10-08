"use client"

import { useMemo, useState } from "react"
import {
  BarChart3, Activity, Zap, TrendingUp, TrendingDown,
  Image as ImageIcon, Ticket, MessageCircle, Cpu,
  ChevronDown, Calendar, Flame,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar,
} from "recharts"
import { useLocalSettings } from "@/hooks/use-local-settings"

// ─────────────────────────────────────────────
// Генерация реалистичных данных за последние 90 дней
// (потом заменим на реальные из API)
// ─────────────────────────────────────────────
interface DayUsage {
  date: string   // "2025-10-07"
  ts: number
  requests: number
  predictions: number
  images: number
  express: number
}

function generateUsage(days = 90): DayUsage[] {
  const out: DayUsage[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // seed на основе даты — стабильные значения между перезагрузками
  const seed = 42
  let state = seed
  const rand = () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)

    const dow = d.getDay() // 0=вс, 6=сб
    const isWeekend = dow === 0 || dow === 6

    // базовый уровень + выходные пики + шум
    const base = 3 + (isWeekend ? 6 : 0) + Math.floor(rand() * 8)

    const requests = Math.max(0, base)
    const predictions = Math.round(requests * (0.4 + rand() * 0.3))
    const images = Math.round(requests * (0.1 + rand() * 0.15))
    const express = Math.round(requests * (0.05 + rand() * 0.1))

    out.push({
      date: d.toISOString().slice(0, 10),
      ts: d.getTime(),
      requests,
      predictions,
      images,
      express,
    })
  }
  return out
}

// ─────────────────────────────────────────────
// Heatmap за квартал (13 недель × 7 дней)
// ─────────────────────────────────────────────
function QuarterHeatmap({ data }: { data: DayUsage[] }) {
  // строим сетку: колонки — недели, строки — дни недели
  const cells = useMemo(() => {
    if (!data.length) return []
    const first = new Date(data[0].ts)
    // сдвигаем к понедельнику
    const firstDow = (first.getDay() + 6) % 7 // 0=пн
    const grid: (DayUsage | null)[] = []
    for (let i = 0; i < firstDow; i++) grid.push(null)
    data.forEach((d) => grid.push(d))
    // добиваем до 13 недель * 7
    const total = Math.max(13 * 7, grid.length)
    while (grid.length < total) grid.push(null)
    // транспонируем по колонкам — по 7
    const cols: (DayUsage | null)[][] = []
    for (let i = 0; i < grid.length; i += 7) {
      cols.push(grid.slice(i, i + 7))
    }
    return cols
  }, [data])

  const max = Math.max(...data.map((d) => d.requests), 1)

  const level = (n: number) => {
    if (n === 0) return "bg-muted"
    const p = n / max
    if (p < 0.25) return "bg-emerald-500/25"
    if (p < 0.5)  return "bg-emerald-500/45"
    if (p < 0.75) return "bg-emerald-500/70"
    return "bg-emerald-500"
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {cells.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((cell, ri) => (
              <div
                key={ri}
                title={
                  cell
                    ? `${cell.date} · ${cell.requests} requests`
                    : ""
                }
                className={`w-3 h-3 rounded-sm transition-colors ${
                  cell ? level(cell.requests) : "bg-transparent"
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500/25" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500/45" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500/70" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Кастомный тултип для графика
// ─────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as DayUsage
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold mb-1">
        {new Date(d.ts).toLocaleDateString("en-US", {
          day: "numeric", month: "short",
        })}
      </p>
      <p className="text-muted-foreground">
        Requests: <span className="text-foreground font-mono">{d.requests}</span>
      </p>
      <p className="text-muted-foreground">
        Predictions: <span className="text-foreground font-mono">{d.predictions}</span>
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
const RANGE_OPTIONS = [
  { value: "7",   label: "Last 7 days" },
  { value: "30",  label: "Last 30 days" },
  { value: "90",  label: "Last quarter" },
]

export default function UsagePage() {
  const { value: prefs, setValue: setPrefs, hydrated } =
    useLocalSettings<{ range: string }>("usage-range", { range: "90" })

  const allData = useMemo(() => generateUsage(90), [])
  const range = Number(prefs.range) || 90
  const data = useMemo(() => allData.slice(-range), [allData, range])

  // агрегаты
  const total = data.reduce((s, d) => s + d.requests, 0)
  const predictions = data.reduce((s, d) => s + d.predictions, 0)
  const images = data.reduce((s, d) => s + d.images, 0)
  const express = data.reduce((s, d) => s + d.express, 0)

  // сравнение с прошлым периодом (для тренда)
  const prev = allData.slice(-range * 2, -range)
  const prevTotal = prev.reduce((s, d) => s + d.requests, 0)
  const trend = prevTotal > 0
    ? Math.round(((total - prevTotal) / prevTotal) * 100)
    : 0

  // серия активности — сколько дней подряд > 0
  let streak = 0
  for (let i = allData.length - 1; i >= 0; i--) {
    if (allData[i].requests > 0) streak++
    else break
  }

  // среднее в день
  const avgPerDay = data.length ? Math.round(total / data.length) : 0

  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Usage</h2>
          <p className="text-sm text-muted-foreground mt-1">
            How much you've been using the AI
          </p>
        </div>
        <div className="h-96 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Usage</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your AI activity overview
          </p>
        </div>
        <Select
          value={prefs.range}
          onValueChange={(v) => setPrefs({ range: v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={Activity}
          label="Total requests"
          value={total}
          trend={trend}
        />
        <KpiCard
          icon={TrendingUp}
          label="Predictions"
          value={predictions}
        />
        <KpiCard
          icon={ImageIcon}
          label="Images analyzed"
          value={images}
        />
        <KpiCard
          icon={Ticket}
          label="Expresses built"
          value={express}
        />
      </div>

      {/* Line chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Activity over time
          </CardTitle>
          <CardDescription>
            Requests per day · {avgPerDay} avg · {streak}-day streak 🔥
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e72930" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#e72930" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="ts"
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-US", {
                      day: "numeric", month: "short",
                    })
                  }
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#e72930"
                  strokeWidth={2}
                  fill="url(#colorReq)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Feature split */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Feature breakdown
          </CardTitle>
          <CardDescription>
            What you actually used the AI for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-52 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="ts"
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-US", {
                      day: "numeric", month: "short",
                    })
                  }
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="predictions" stackId="a" fill="#e72930" radius={[0, 0, 0, 0]} />
                <Bar dataKey="images" stackId="a" fill="#f97316" />
                <Bar dataKey="express" stackId="a" fill="#a855f7" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
            <Legend color="#e72930" label="Predictions" />
            <Legend color="#f97316" label="Images" />
            <Legend color="#a855f7" label="Express" />
          </div>
        </CardContent>
      </Card>

      {/* Quarter heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last quarter activity
          </CardTitle>
          <CardDescription>
            One cell per day · darker = more requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuarterHeatmap data={allData} />
        </CardContent>
      </Card>

      {/* Streak / Bonus card */}
      <div className="flex items-center gap-3 p-4 rounded-2xl border bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
        <Flame className="w-8 h-8 text-orange-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold">{streak}-day streak</p>
          <p className="text-xs text-muted-foreground">
            Keep it up — the more consistent you are, the better predictions get.
          </p>
        </div>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────
// KPI card
// ─────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, trend,
}: {
  icon: any
  label: string
  value: number
  trend?: number
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          {trend !== undefined && trend !== 0 && (
            <Badge
              variant="secondary"
              className={`text-[10px] h-5 ${
                trend > 0
                  ? "text-emerald-600 bg-emerald-500/10"
                  : "text-red-500 bg-red-500/10"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </Badge>
          )}
        </div>
        <p className="text-2xl font-bold tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-sm"
        style={{ background: color }}
      />
      <span>{label}</span>
    </div>
  )
}