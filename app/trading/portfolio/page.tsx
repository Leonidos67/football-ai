"use client"

import { useRouter } from "next/navigation";
import { 
  Wallet, TrendingUp, TrendingDown, Briefcase, ArrowUpRight, ArrowDownRight, Plus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Заглушка данных
const positions = [
  { id: 1, pair: "BTC/USDT", type: "Long", size: "0.05 BTC", entry: "64,200", current: "67,500", pnl: "+$165", pnlPercent: "+5.1%", status: "open" },
  { id: 2, pair: "ETH/USDT", type: "Short", size: "2.5 ETH", entry: "3,400", current: "3,320", pnl: "+$200", pnlPercent: "+2.3%", status: "open" },
  { id: 3, pair: "EUR/USD", type: "Long", size: "10,000", entry: "1.0845", current: "1.0820", pnl: "-$25", pnlPercent: "-0.2%", status: "closed" },
];

export default function PortfolioPage() {
  const router = useRouter();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground">Управление активами и позициями</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => router.push("/trading/terminal")}>
          <Plus className="w-4 h-4" />
          Открыть позицию
        </Button>
      </div>

      {/* Сводка */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общая стоимость</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$85,230.00</div>
            <p className="text-xs text-muted-foreground">2 открытые позиции</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нереализованный P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+$365.00</div>
            <p className="text-xs text-muted-foreground">+0.43% от депозита</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных сделок</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 закрыта сегодня</p>
          </CardContent>
        </Card>
      </div>

      {/* Таблица позиций */}
      <Card>
        <CardHeader>
          <CardTitle>Открытые и закрытые позиции</CardTitle>
          <CardDescription>Все сделки по всем активам</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пара</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Цена входа</TableHead>
                <TableHead>Текущая цена</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((pos) => (
                <TableRow key={pos.id}>
                  <TableCell className="font-medium">{pos.pair}</TableCell>
                  <TableCell>
                    <Badge variant={pos.type === "Long" ? "default" : "destructive"} className="gap-1">
                      {pos.type === "Long" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {pos.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{pos.size}</TableCell>
                  <TableCell>{pos.entry}</TableCell>
                  <TableCell>{pos.current}</TableCell>
                  <TableCell className={pos.pnl.startsWith("+") ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                    {pos.pnl} ({pos.pnlPercent})
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={pos.status === "open" ? "border-green-500 text-green-500" : "text-muted-foreground"}>
                      {pos.status === "open" ? "Открыта" : "Закрыта"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}