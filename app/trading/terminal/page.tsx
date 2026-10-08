// app/trading/terminal/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CandlestickChart } from 'lucide-react'

export default function TerminalPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Trading Terminal</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CandlestickChart className="w-5 h-5" />
            Terminal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Здесь будет график и торговый интерфейс.</p>
        </CardContent>
      </Card>
    </div>
  )
}