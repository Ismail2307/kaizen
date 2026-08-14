"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Plus, Trash2, Tag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import type { Reflection } from "@/types"

interface JournalManagerProps {
  reflections: Reflection[]
}

const MOODS = ["🌟 Amazing", "😊 Good", "😐 Okay", "😔 Down", "🔥 Motivated"]

export function JournalManager({ reflections }: JournalManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const tags = (formData.get("tags") as string)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      await supabase.from("reflections").insert({
        content: formData.get("content") as string,
        mood: formData.get("mood") as string,
        tags: tags.length > 0 ? tags : null,
      })
      setIsOpen(false)
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteReflection(id: string) {
    if (!confirm("Delete this entry?")) return
    await supabase.from("reflections").delete().eq("id", id)
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Journal Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">How are you feeling?</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => (
                    <label key={mood} className="cursor-pointer">
                      <input
                        type="radio"
                        name="mood"
                        value={mood}
                        className="sr-only peer"
                        defaultChecked={mood === MOODS[0]}
                      />
                      <div className="rounded-lg border border-border px-3 py-1.5 text-sm peer-checked:border-kaizen-500 peer-checked:bg-kaizen-500/10 transition-colors">
                        {mood}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Your thoughts</label>
                <Textarea
                  name="content"
                  placeholder="What's on your mind?"
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input name="tags" placeholder="gratitude, goals, reflection" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                Save Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {reflections.map((reflection, i) => (
            <motion.div
              key={reflection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{reflection.mood?.split(" ")[0]}</span>
                      <span className="text-sm text-muted-foreground">
                        {reflection.mood?.split(" ").slice(1).join(" ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(reflection.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-300"
                        onClick={() => deleteReflection(reflection.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {reflection.content}
                  </p>
                  {reflection.tags && reflection.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {reflection.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          <Tag className="h-2.5 w-2.5 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {reflections.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 py-20">
            <BookOpen className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
            <h3 className="text-lg font-semibold">No entries yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start journaling to track your thoughts and reflections
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
