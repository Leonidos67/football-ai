"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Target,
  MoreHorizontal,
  Trash2,
  Plus,
  X,
  TrendingUp,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  loadHistory,
  removePrediction,
  type PredictionHistoryItem,
} from '@/lib/prediction-history'
import { useTranslation } from '@/lib/i18n'

export function NavProjects() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { t } = useTranslation()
  const [items, setItems] = useState<PredictionHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    const refresh = () => {
      setItems(loadHistory())
      setLoading(false)
    }
    refresh()
    window.addEventListener("prediction-history:update", refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener("prediction-history:update", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  const handleItemClick = (item: PredictionHistoryItem) => {
    const params = new URLSearchParams({
      prompt: `give detailed analysis for ${item.match}`,
      pinned: item.id,
      t: String(Date.now()),
    })
    router.push(`/chat?${params.toString()}`)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removePrediction(id)
  }

  const formatDate = (ts: number) => {
    const diff = Date.now() - ts
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return t("side.justNow")
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days === 1) return '1d'
    if (days < 7) return `${days}d`
    return new Date(ts).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  const confDot = (c: number) =>
    c >= 80 ? 'bg-emerald-500' :
    c >= 65 ? 'bg-amber-500' :
    c >= 50 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="flex flex-col h-full group-data-[collapsible=icon]:hidden">

      {/* TOP: PREDICTIONS */}
      <div className="flex-1 overflow-y-auto">
        <SidebarGroup className="p-0">

          <div className="flex items-center px-2 py-1.5">
            <Target className="w-3 h-3 text-muted-foreground mr-2" />
            <SidebarGroupLabel className="p-0 text-xs">
              {t("side.predictions")}
            </SidebarGroupLabel>
            {items.length > 0 && (
              <span className="ml-auto text-[10px] text-muted-foreground pr-2 tabular-nums">
                {items.length}
              </span>
            )}
          </div>

          <SidebarMenu>
            {loading ? (
              <div className="space-y-2 px-3 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-3 w-32 bg-muted rounded mb-1" />
                    <div className="h-2.5 w-24 bg-muted/60 rounded" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 px-4 gap-3">
                <div className="relative w-14 h-14">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-muted rounded-md opacity-50 rotate-[-5deg]" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-muted rounded-md opacity-80" />
                  <div className="absolute bottom-2 right-0 w-5 h-5 bg-background border border-muted rounded-full flex items-center justify-center z-10">
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>

                <span className="text-sm font-semibold text-foreground">
                  {t("side.noPredictions")}
                </span>
                <span className="text-xs text-muted-foreground -mt-2">
                  {t("side.askFirst")}
                </span>

                <button
                  onClick={() => router.push('/chat')}
                  className="mt-1 text-[11px] px-3 py-1 rounded-full bg-[#e72930] text-white hover:bg-[#e72930]/80 transition-colors font-medium"
                >
                  {t("side.openChat")}
                </button>
              </div>
            ) : (
              <div className="px-1 space-y-0.5">
                {items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleItemClick(item)}
                      className="h-auto py-2 px-2 rounded-lg hover:bg-muted/60 data-[active=true]:bg-muted group/item"
                    >
                      <div className="relative shrink-0 mr-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${confDot(item.confidence)}`} />
                      </div>

                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="truncate text-xs font-medium leading-tight">
                          {item.match}
                        </span>

                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className="truncate max-w-[70px]">
                            {item.market}
                          </span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="font-mono tabular-nums">
                            {item.odds.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="tabular-nums">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </SidebarMenuButton>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover className="top-2">
                          <MoreHorizontal />
                          <span className="sr-only">More</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-48"
                        side={isMobile ? "bottom" : "right"}
                        align={isMobile ? "end" : "start"}
                      >
                        <DropdownMenuItem onClick={() => handleItemClick(item)}>
                          <TrendingUp className="text-muted-foreground" />
                          <span>{t("side.detailedAnalysis")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(e, item.id)}
                          className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                        >
                          <Trash2 />
                          <span>{t("side.remove")}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </div>

      {/* BOTTOM: 1WIN BANNER */}
      <div className="mt-auto p-3">
        {showBanner && (
          <div className="rounded-xl p-4 relative text-left group/banner overflow-hidden border border-border/60 bg-muted/40">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors z-30"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-[11px] font-medium text-muted-foreground mb-1 tracking-wide">
              🎁 LaVencer BONUS
            </p>
            <p className="text-sm font-bold leading-snug mb-3 text-foreground">
              Leia nossos guias
            </p>

            <div className="relative flex justify-center items-center h-24 mb-3">
              <Image
                src="/guide/1.png"
                alt="Bonus"
                width={100}
                height={100}
                className="object-cover h-20 w-20 rounded-xl border border-white/10 shadow-lg rotate-[-10deg] z-10 translate-y-6 group-hover/banner:translate-y-0 group-hover/banner:rotate-[-5deg] transition-all duration-500 ease-out"
              />
              <Image
                src="/guide/2.png"
                alt="Trophy"
                width={100}
                height={100}
                className="object-cover h-24 w-24 rounded-xl border border-white/10 shadow-lg z-20 -ml-5 -mr-5 translate-y-6 group-hover/banner:translate-y-0 transition-all duration-500 ease-out"
              />
              <Image
                src="/guide/3.png"
                alt="Coins"
                width={100}
                height={100}
                className="object-cover h-20 w-20 rounded-xl border border-white/10 shadow-lg rotate-[10deg] z-10 translate-y-6 group-hover/banner:translate-y-0 group-hover/banner:rotate-[5deg] transition-all duration-500 ease-out"
              />
            </div>

            <a
              href="https://r1wjvzfr.life/?open=register&p=ypdt"
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="block w-full text-center bg-[#e72930] text-white text-sm font-bold py-2 rounded-lg hover:bg-[#d01f26] transition-colors relative z-30"
            >
              Claim
            </a>
          </div>
        )}
      </div>
    </div>
  )
}