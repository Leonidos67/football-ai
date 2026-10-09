"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { SETTINGS_GROUPS } from "./trading-sidebar"

export function MobileSettingsTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // ⬅️ На десктопе не рендерим вообще
  if (!isMobile) return null

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/")

  const allItems = SETTINGS_GROUPS.flatMap((g) => g.items)

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b shrink-0">
      {/* Back to chat */}
      <div className="flex items-center px-3 py-2">
        <button
          onClick={() => router.push("/chat")}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to chat
        </button>
      </div>

      {/* Horizontal chips */}
      <div
        className="flex gap-1.5 overflow-x-auto px-3 pb-2"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {allItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.url)
          return (
            <button
              key={item.url}
              onClick={() => router.push(item.url)}
              className={`shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-medium transition whitespace-nowrap
                ${active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-muted-foreground/40 hover:text-foreground"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.title}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}