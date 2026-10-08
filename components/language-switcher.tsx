"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getLanguage,
  setLanguage,
  onLanguageChange,
  LANGUAGES,
  type Language,
} from "@/lib/language"
import { useTranslation } from "@/lib/i18n"

// ─────────────────────────────────────────────
// SVG-флаги (как в прошлом сообщении)
// ─────────────────────────────────────────────
function FlagBR({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="14" fill="#009C3B" />
      <path d="M10 1.8L18.5 7L10 12.2L1.5 7L10 1.8Z" fill="#FFDF00" />
      <circle cx="10" cy="7" r="3.2" fill="#002776" />
      <path d="M6.9 6.2C8.5 5.5 11.5 5.5 13.1 6.4" stroke="#fff" strokeWidth="0.5" fill="none" />
    </svg>
  )
}

function FlagUS({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="14" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((y) => (
        <rect key={y} y={y} width="20" height="1" fill="#B22234" />
      ))}
      <rect width="9" height="7" fill="#3C3B6E" />
      {[
        [1.2, 1.2], [3.2, 1.2], [5.2, 1.2], [7.2, 1.2],
        [2.2, 2.4], [4.2, 2.4], [6.2, 2.4], [8.2, 2.4],
        [1.2, 3.6], [3.2, 3.6], [5.2, 3.6], [7.2, 3.6],
        [2.2, 4.8], [4.2, 4.8], [6.2, 4.8], [8.2, 4.8],
        [1.2, 6.0], [3.2, 6.0], [5.2, 6.0], [7.2, 6.0],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.35" fill="#fff" />
      ))}
    </svg>
  )
}

function FlagRU({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="4.67" fill="#fff" />
      <rect y="4.67" width="20" height="4.66" fill="#0039A6" />
      <rect y="9.33" width="20" height="4.67" fill="#D52B1E" />
    </svg>
  )
}

const FLAG_COMPONENTS: Record<Language, React.ComponentType<{ className?: string }>> = {
  "pt-BR": FlagBR,
  "en": FlagUS,
  "ru": FlagRU,
}

export function LanguageSwitcher() {
  const [lang, setLang] = useState<Language>("en")
  const { t } = useTranslation()

  useEffect(() => {
    setLang(getLanguage())
    return onLanguageChange(setLang)
  }, [])

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[1]
  const CurrentFlag = FLAG_COMPONENTS[current.code]

  const handleSelect = (code: Language) => {
    setLanguage(code)
    setLang(code)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t("nav.language")}>
          <CurrentFlag className="h-4 w-6 rounded-[2px] overflow-hidden shadow-sm ring-1 ring-black/10" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {LANGUAGES.map((l) => {
          const Flag = FLAG_COMPONENTS[l.code]
          const active = l.code === lang
          return (
            <DropdownMenuItem
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className="cursor-pointer"
            >
              <Flag className="h-4 w-6 rounded-[2px] overflow-hidden shadow-sm ring-1 ring-black/10 mr-2 shrink-0" />
              <span>{l.name}</span>
              {active && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}