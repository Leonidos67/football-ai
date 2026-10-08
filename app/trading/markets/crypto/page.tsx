"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, TrendingUp, TrendingDown, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Данные котировок
const cryptoData = [
  { symbol: "BTC", name: "Bitcoin", price: "$67,450.00", change: "+2.4%", volume: "$32.4B", trend: "up" },
  { symbol: "ETH", name: "Ethereum", price: "$3,320.20", change: "-1.2%", volume: "$14.1B", trend: "down" },
  { symbol: "SOL", name: "Solana", price: "$142.80", change: "+5.8%", volume: "$4.2B", trend: "up" },
  { symbol: "XRP", name: "Ripple", price: "$0.52", change: "+0.3%", volume: "$1.1B", trend: "up" },
];

const forexData = [
  { symbol: "EUR/USD", name: "Euro / Dollar", price: "1.0845", change: "+0.12%", volume: "-", trend: "up" },
  { symbol: "GBP/USD", name: "Pound / Dollar", price: "1.2675", change: "-0.05%", volume: "-", trend: "down" },
  { symbol: "USD/JPY", name: "Dollar / Yen", price: "151.20", change: "+0.22%", volume: "-", trend: "up" },
];

export default function MarketsPage() {
  const router = useRouter();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Markets</h2>
          <p className="text-muted-foreground">Котировки в реальном времени</p>
        </div>
        <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">
          <Globe className="w-3 h-3 mr-1" /> Рынок открыт
        </Badge>
      </div>

      <Tabs defaultValue="crypto" className="w-full">
        <TabsList>
          <TabsTrigger value="crypto">Криптовалюты</TabsTrigger>
          <TabsTrigger value="forex">Форекс</TabsTrigger>
        </TabsList>

        <TabsContent value="crypto">
          <Card>
            <CardHeader>
              <CardTitle>Крипто рынок</CardTitle>
              <CardDescription>Топ монеты по объему торгов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cryptoData.map((coin) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                        {coin.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {coin.symbol}
                          <Star className="w-3 h-3 text-yellow-500" />
                        </p>
                        <p className="text-xs text-muted-foreground">{coin.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <p className="font-bold">{coin.price}</p>
                        <p className="text-xs text-muted-foreground">Объем: {coin.volume}</p>
                      </div>
                      <Badge variant={coin.trend === "up" ? "default" : "destructive"} className="gap-1">
                        {coin.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {coin.change}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push("/trading/terminal")}
                      >
                        Торговать
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forex">
          <Card>
            <CardHeader>
              <CardTitle>Валютные пары</CardTitle>
              <CardDescription>Основные и кросс-курсы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forexData.map((pair) => (
                  <div key={pair.symbol} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                        {pair.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{pair.symbol}</p>
                        <p className="text-xs text-muted-foreground">{pair.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <p className="font-bold">{pair.price}</p>
                      <Badge variant={pair.trend === "up" ? "default" : "destructive"} className="gap-1">
                        {pair.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {pair.change}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push("/trading/terminal")}
                      >
                        Торговать
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}