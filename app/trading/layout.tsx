import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TradingSidebar } from '@/components/trading-sidebar'

export default function TradingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <TradingSidebar />
      <SidebarInset className="overflow-auto">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}