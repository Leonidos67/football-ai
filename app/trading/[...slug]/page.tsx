// app/trading/[...slug]/page.tsx
"use client"

import { useParams } from 'next/navigation'
import {
  // AI
  Bot, Sparkles, Cpu, Brain, Layers, Zap,
  // Predictions
  Target, Trophy, Ban, Ticket, Bell,
  // Account
  User, Shield, CreditCard, BarChart3, KeyRound,
  // Appearance
  Palette, Globe, Clock, CalendarDays,
  // Data & Privacy
  Database, Download, Lock, Trash2,
  // Advanced
  Keyboard, FlaskConical, Code2,
  // Прочее
  SlidersHorizontal,
  // fallback
  AlertCircle,
  Construction,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const pageConfig: Record<string, { title: string; icon: any; description: string }> = {
  // ─────────────────────────── AI ───────────────────────────
  'settings/model':       { title: 'Model & Tokens',   icon: Cpu,        description: 'Выбор модели, температура, лимиты токенов' },
  'settings/knowledge':   { title: 'Knowledge Base',   icon: Brain,      description: 'Свои заметки и файлы, которые ИИ учитывает при анализе' },
  'settings/personas':    { title: 'Personas',         icon: Layers,     description: 'Пресеты характера: аналитик, друг, шарп' },
  'settings/skills':      { title: 'Skills',           icon: Zap,        description: 'Включение и настройка умений ИИ' },

  // ─────────────────────── Predictions ──────────────────────
  'settings/markets':       { title: 'Default Markets', icon: Target,     description: 'Какие рынки использовать по умолчанию' },
  'settings/excluded':      { title: 'Excluded Teams',  icon: Ban,        description: 'Команды и матчи, которые исключить из прогнозов' },
  'settings/express':       { title: 'Express Rules',   icon: Ticket,     description: 'Правила автосборки экспрессов' },
  'settings/notifications': { title: 'Notifications',   icon: Bell,       description: 'Куда и когда отправлять уведомления' },

  // ───────────────────────── Account ────────────────────────
  'settings/account':   { title: 'Account',      icon: User,       description: 'Личные данные и профиль' },
  'settings/security':  { title: 'Security',     icon: Shield,     description: 'Пароль, 2FA, активные сессии' },
  'settings/billing':   { title: 'Subscription', icon: CreditCard, description: 'Тариф, лимиты, история платежей' },
  'settings/usage':     { title: 'Usage',        icon: BarChart3,  description: 'Сколько прогнозов использовано' },
  'settings/api-keys':  { title: 'API Keys',     icon: KeyRound,   description: 'Ключи доступа к API' },

  // ─────────────────────── Appearance ───────────────────────
  'settings/theme':       { title: 'Theme',       icon: Palette,      description: 'Светлая, тёмная или системная тема' },
  'settings/language':    { title: 'Language',    icon: Globe,        description: 'Язык интерфейса' },
  'settings/timezone':    { title: 'Time Zone',   icon: Clock,        description: 'Часовой пояс для отображения матчей' },
  'settings/date-format': { title: 'Date Format', icon: CalendarDays, description: 'Формат даты и времени' },

  // ─────────────────────── Data & Privacy ───────────────────
  'settings/history': { title: 'History',        icon: Database, description: 'История прогнозов и чатов' },
  'settings/export':  { title: 'Data Export',    icon: Download, description: 'Скачать все свои данные' },
  'settings/privacy': { title: 'Privacy',        icon: Lock,     description: 'Какие данные собираем и как используем' },
  'settings/delete':  { title: 'Delete Account', icon: Trash2,   description: 'Удалить аккаунт и все данные' },

  // ───────────────────────── Advanced ───────────────────────
  'settings/shortcuts': { title: 'Keyboard Shortcuts', icon: Keyboard,     description: 'Горячие клавиши' },
  'settings/beta':      { title: 'Beta Features',      icon: FlaskConical, description: 'Экспериментальные функции' },
  'settings/developer': { title: 'Developer',          icon: Code2,        description: 'Вебхуки, отладка, логи' },

  // ─────────────────────── Прочее ──────────────────────────
  'settings/preferences': { title: 'Preferences', icon: SlidersHorizontal, description: 'Общие настройки интерфейса' },
}

export default function TradingSubPage() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : ''

  const config = pageConfig[slug] || {
    title: 'The section was not found',
    icon: AlertCircle,
    description: 'There is no such page.',
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Заголовок — единый стиль */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{config.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
      </div>

      {/* Заглушка */}
      <Card className="border-dashed">
        <CardContent className="py-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Construction className="w-10 h-10 text-muted-foreground" />
          </div>

          <Badge variant="secondary" className="mb-3">
            Coming soon
          </Badge>

          <h3 className="text-lg font-semibold mb-1">
            A section in development
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            We are working on this section of the settings. A full set of fine-tuning options will appear here soon.
          </p>
        </CardContent>
      </Card>

    </div>
  )
}