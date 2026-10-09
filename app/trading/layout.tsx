import { TradingSidebar } from "@/components/trading-sidebar"
import { MobileSettingsTabs } from "@/components/mobile-settings-tabs"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* Desktop sidebar (скрыт на мобилке) */}
      <TradingSidebar />

      {/* Content area */}
      <SidebarInset className="overflow-hidden flex flex-col">
        {/* Mobile tabs (скрыты на десктопе) */}
        <MobileSettingsTabs />

        {/* Page content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}