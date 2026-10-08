"use client"

import { useState } from "react"
import {
  KeyRound, Plus, Trash2, Copy, Check, Eye, EyeOff,
  AlertTriangle, Save,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useLocalSettings } from "@/hooks/use-local-settings"

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: number
  lastUsed: number | null
}

function generateKey() {
  const rand = () =>
    Math.random().toString(36).slice(2, 10)
  return `mno_${rand()}${rand()}${rand()}`.slice(0, 36)
}

export default function ApiKeysPage() {
  const { value: keys, setValue: setKeys, hydrated } =
    useLocalSettings<ApiKey[]>("api-keys", [])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [draftName, setDraftName] = useState("")

  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const createKey = () => {
    if (!draftName.trim()) return
    const newKey: ApiKey = {
      id: crypto.randomUUID(),
      name: draftName.trim(),
      key: generateKey(),
      createdAt: Date.now(),
      lastUsed: null,
    }
    setKeys([...keys, newKey])
    setDialogOpen(false)
    setDraftName("")
  }

  const deleteKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id))
  }

  const copyKey = async (k: ApiKey) => {
    try {
      await navigator.clipboard.writeText(k.key)
      setCopied(k.id)
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  const toggleReveal = (id: string) =>
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }))

  if (!hydrated) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">API Keys</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage keys for programmatic access
          </p>
        </div>
        <div className="h-64 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">API Keys</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage keys for programmatic access to predictions
        </p>
      </div>

      {/* Keys list */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              Your keys
            </CardTitle>
            <CardDescription>
              {keys.length} {keys.length === 1 ? "key" : "keys"} active
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create key
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {keys.length === 0 ? (
            <div className="py-12 text-center">
              <KeyRound className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No API keys yet. Create one to get started.
              </p>
            </div>
          ) : (
            keys.map((k) => (
              <div key={k.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{k.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Created {new Date(k.createdAt).toLocaleDateString("en-US", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                      {k.lastUsed && ` · Last used ${new Date(k.lastUsed).toLocaleDateString("en-US")}`}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <code className="flex-1 text-xs font-mono bg-muted rounded-md px-3 py-2 truncate">
                    {revealed[k.id] ? k.key : k.key.replace(/./g, "•").slice(0, 32)}
                  </code>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => toggleReveal(k.id)}
                    title={revealed[k.id] ? "Hide" : "Reveal"}
                  >
                    {revealed[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyKey(k)}
                    title="Copy"
                  >
                    {copied === k.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 hover:text-red-500"
                    onClick={() => deleteKey(k.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-xs">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Keep your keys secret. Anyone with a key can use your account.
          Regenerate immediately if leaked.
        </p>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Give the key a name so you can recognize it later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key name</Label>
              <Input
                id="key-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g. Mobile app, Telegram bot"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createKey} disabled={!draftName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}