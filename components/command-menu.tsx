"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Home,
  User,
  Folder,
  MonitorPlay,
  Sparkles,
  Search,
  Zap,
  Settings,
  BarChart3,
  Bot,
  MessageSquare,
  Compass,
} from "lucide-react"

export function CommandMenu() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  // Глобальный слушатель клавиш: Ctrl+L (или Cmd+L на Mac)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "l" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    const openCommandMenu = () => setOpen(true)
    window.addEventListener("open-command-menu", openCommandMenu)
    return () => window.removeEventListener("open-command-menu", openCommandMenu)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Введите команду или поиск..." />
      <CommandList>
        <CommandEmpty>Ничего не найдено.</CommandEmpty>
        
        <CommandGroup heading="Основное">
          <CommandItem onSelect={() => runCommand(() => router.push("/app"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Explore</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/profile"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Мой профиль</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/ai-studio"))}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>AI-Студия</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/app/platforms"))}>
            <MonitorPlay className="mr-2 h-4 w-4" />
            <span>Площадки</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Trading">
          <CommandItem onSelect={() => runCommand(() => router.push("/trading"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Trading Bot Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/chat"))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Chat с ИИ</span>
            <CommandShortcut>⌘L</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/trading/ai-settings"))}>
            <Bot className="mr-2 h-4 w-4" />
            <span>Настройки ИИ</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Настройки">
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Настройки</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}