"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

export default function SettingsPage() {
  const { user } = useAuth()

  const [notifications, setNotifications] = useState({
    signals: true,
    priceAlerts: false,
    dailyReport: true,
  })

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Заголовок — единый стиль */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление аккаунтом и уведомлениями
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Профиль */}
        <Card>
          <CardHeader>
            <CardTitle>Профиль</CardTitle>
            <CardDescription>Ваши личные данные</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-muted">
                  {user?.name?.slice(0, 2).toUpperCase() || "NN"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{user?.name || "Leonid"}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || "leonid@mail.ru"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" defaultValue={user?.name || "Leonid"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user?.email || "leonid@mail.ru"} />
            </div>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Сохранить
            </Button>
          </CardContent>
        </Card>

        {/* Уведомления + API */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>Куда присылать алерты</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Сигналы ИИ</p>
                  <p className="text-xs text-muted-foreground">
                    Уведомлять о новых прогнозах
                  </p>
                </div>
                <Switch
                  checked={notifications.signals}
                  onCheckedChange={(v) => setNotifications({ ...notifications, signals: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Движение кэфов</p>
                  <p className="text-xs text-muted-foreground">
                    Оповещение при изменении коэффициента
                  </p>
                </div>
                <Switch
                  checked={notifications.priceAlerts}
                  onCheckedChange={(v) => setNotifications({ ...notifications, priceAlerts: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Дневная сводка</p>
                  <p className="text-xs text-muted-foreground">
                    Топ-матчи и прогнозы каждое утро
                  </p>
                </div>
                <Switch
                  checked={notifications.dailyReport}
                  onCheckedChange={(v) => setNotifications({ ...notifications, dailyReport: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Ключи</CardTitle>
              <CardDescription>Доступ к прогнозам</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">Pelada API</p>
                  <p className="text-xs text-muted-foreground">Подключён</p>
                </div>
                <Badge variant="secondary">Активен</Badge>
              </div>
              <Button variant="outline" className="w-full">
                Управлять ключами
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}