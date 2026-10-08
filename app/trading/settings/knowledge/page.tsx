"use client"

import { useState } from "react"
import {
  Brain, Plus, Trash2, Save, Check, FileText, Edit3,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useLocalSettings } from "@/hooks/use-local-settings"

interface Note {
  id: string
  title: string
  content: string
  createdAt: number
}

export default function KnowledgePage() {
  const { value: notes, setValue: setNotes, hydrated } = useLocalSettings<Note[]>(
    "knowledge-notes",
    []   // ⬅️ пустой массив по умолчанию
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [draftTitle, setDraftTitle] = useState("")
  const [draftContent, setDraftContent] = useState("")

  const openCreate = () => {
    setEditing(null)
    setDraftTitle("")
    setDraftContent("")
    setDialogOpen(true)
  }

  const openEdit = (note: Note) => {
    setEditing(note)
    setDraftTitle(note.title)
    setDraftContent(note.content)
    setDialogOpen(true)
  }

  const handleSaveNote = () => {
    if (!draftTitle.trim() || !draftContent.trim()) return

    if (editing) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editing.id
            ? { ...n, title: draftTitle, content: draftContent }
            : n
        )
      )
    } else {
      setNotes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: draftTitle,
          content: draftContent,
          createdAt: Date.now(),
        },
      ])
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Knowledge Base</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Notes and facts the AI will reference when analyzing matches
        </p>
      </div>

      {/* Notes list */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Your notes
            </CardTitle>
            <CardDescription>
              {hydrated
                ? `${notes.length} ${notes.length === 1 ? "note" : "notes"} stored`
                : "Loading…"}
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Add note
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hydrated ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : notes.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No notes yet. Add your first one to teach the AI.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border p-4 hover:border-muted-foreground/40 transition group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <h4 className="text-sm font-semibold truncate">{note.title}</h4>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(note)}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-red-500"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3">
                  {note.content}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-2">
                  {new Date(note.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
        <Brain className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          The AI reads your notes before every prediction. Keep them concise —
          focus on criteria, favorite leagues, and betting philosophy.
        </p>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit note" : "New note"}</DialogTitle>
            <DialogDescription>
              The AI will use this as context when generating predictions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="e.g. Favorite leagues and betting style"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                className="min-h-[140px]"
                placeholder="Write what you want the AI to remember..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={!draftTitle.trim() || !draftContent.trim()}
            >
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}