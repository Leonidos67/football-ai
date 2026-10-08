"use client"

import { useRouter, usePathname } from "next/navigation"
import {
  Bot, ArrowLeft, Cpu, Brain, Layers, Zap,
  Target, Trophy, Ticket, Bell, User, BarChart3, KeyRound,
  Palette,
  Keyboard, FlaskConical, Code2,
} from "lucide-react"

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const SETTINGS_GROUPS = [
  {
    label: "AI",
    items: [
      { title: "AI Settings",    url: "/trading/ai-settings",          icon: Bot },
      { title: "Model & Tokens", url: "/trading/settings/model",       icon: Cpu },
      { title: "Knowledge Base", url: "/trading/settings/knowledge",   icon: Brain },
      { title: "Personas",       url: "/trading/settings/personas",    icon: Layers },
      { title: "Skills",         url: "/trading/settings/skills",      icon: Zap },
    ],
  },
  {
    label: "Predictions",
    items: [
      { title: "Default Markets", url: "/trading/settings/markets",       icon: Target },
      { title: "Leagues",         url: "/trading/settings/leagues",       icon: Trophy },
      { title: "Express Rules",   url: "/trading/settings/express",       icon: Ticket },
      { title: "Notifications",   url: "/trading/settings/notifications", icon: Bell },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Account",  url: "/trading/settings/account",  icon: User },
      { title: "Usage",    url: "/trading/settings/usage",    icon: BarChart3 },
      { title: "API Keys", url: "/trading/settings/api-keys", icon: KeyRound },
      { title: "Theme",    url: "/trading/settings/theme",    icon: Palette },
    ],
  },
  {
    label: "Advanced",
    items: [
      { title: "Keyboard Shortcuts", url: "/trading/settings/shortcuts", icon: Keyboard },
      { title: "Beta Features",      url: "/trading/settings/beta",      icon: FlaskConical },
      { title: "Developer",          url: "/trading/settings/developer", icon: Code2 },
    ],
  },
]

export function TradingSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/")

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/chat">
                <div className="flex aspect-square size-6 items-center justify-center rounded-lg">
                  <ArrowLeft className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Back to chat</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        {SETTINGS_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <button
                        onClick={() => router.push(item.url)}
                        className="flex items-center gap-3 w-full"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}