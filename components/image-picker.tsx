"use client"

import { useRef } from "react"
import { Camera, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/lib/i18n"

export function ImagePicker({
  onPick,
  disabled,
}: {
  onPick: (file: File) => void
  disabled?: boolean
}) {
  const { t } = useTranslation()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onPick(file)
    e.target.value = ""
  }

  return (
    <>
      {/* Скрытые input'ы */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handle}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handle}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full shrink-0"
            title={t("input.uploadTooltip")}
            aria-label={t("input.uploadTooltip")}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={() => cameraRef.current?.click()}
            className="cursor-pointer"
          >
            <Camera className="mr-2 h-4 w-4" />
            <span>{t("input.takePhoto")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => galleryRef.current?.click()}
            className="cursor-pointer"
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            <span>{t("input.chooseFromGallery")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}