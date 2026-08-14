"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Repeat, Plus, Check, Flame, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { XpToast } from "@/components/xp/xp-toast"
import { LevelUpModal } from "@/components/xp/level-up-modal"
import { createClient } from "@/lib/supabase/client"
import type { Habit, HabitCompletion } from "@/types"

interface HabitsManagerProps {
  habits: (Habit & { habit_completions?: HabitCompletion[] })[]
}

export function HabitsManager({ habits }: HabitsManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkedHabits, setCheckedHabits] = useState<Set<string>>(new Set())
  const [xpToast, setXpToast] = useState<{ amount: number; source: string } | null>(null)
  const [levelUp, setLevelUp] = useState<{ show: boolean; newLevel: number }>({ show: false, newLevel: 0 })
  const supabase = createClient()
  const today = new Date().toISOString().split("T")[0]

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await supabase.from("habits").insert({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        frequency: formData.get("frequency") as string,
        target_days: Number(formData.get("target_days")) || 7,
        color: formData.get("color") as string,
      })
      setIsOpen(false)
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function toggleHabit(habit: Habit & { habit_completions?: HabitCompletion[] }) {
    const isCompletedToday = habit.habit_completions?.some(c => c.completed_date === today)
    if (isCompletedToday || checkedHabits.has(habit.id)) return

    setCheckedHabits(prev => new Set(prev).add(habit.id))

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: beforeProfile } = await supabase
      .from("profiles")
      .select("level")
      .eq("id", user.id)
      .single()

    const beforeLevel = beforeProfile?.level || 1

    try {
      await supabase.from("habit_completions").insert({
        habit_id: habit.id,
        completed_date: today,
      })

      // Award XP via RPC
      await supabase.rpc("add_xp", {
        p_user_id: user.id,
        p_amount: habit.xp_reward,
        p_source: "habit",
        p_source_id: habit.id,
        p_description: "Completed habit",
      })

      setXpToast({ amount: habit.xp_reward, source: "habit" })

      const { data: afterProfile } = await supabase
        .from("profiles")
        .select("level")
        .eq("id", user.id)
        .single()

      if (afterProfile && afterProfile.level > beforeLevel) {
        setTimeout(() => {
          setLevelUp({ show: true, newLevel: afterProfile.level })
        }, 1000)
      }

      setTimeout(() => {
        setXpToast(null)
        window.location.reload()
      }, 2500)
    } catch (err: any) {
      alert(err.message)
      setCheckedHabits(prev => {
        const next = new Set(prev)
        next.delete(habit.id)
        return next
      })
    }
  }

  async function deleteHabit(habitId: string) {
    if (!confirm("Delete this habit?")) return
    await supabase.from("habits").delete().eq("id", habitId)
    window.location.reload()
  }

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split("T")[0]
  })

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#06b6d4"]

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Habit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input name="title" placeholder="e.g., Read 20 pages" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input name="description" placeholder="Optional details" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <label key={c} className="cursor-pointer">
                        <input type="radio" name="color" value={c} defaultChecked={c === COLORS[0]} className="sr-only peer" />
                        <div className="h-6 w-6 rounded-full border-2 border-transparent peer-checked:border-white peer-checked:scale-110 transition-all" style={{ backgroundColor: c }} />
                      </label>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  Create Habit
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {habits.map((habit, i) => {
              const isCompletedToday = habit.habit_completions?.some(c => c.completed_date === today)
              const isChecked = checkedHabits.has(habit.id) || isCompletedToday
              const completions = new Set(habit.habit_completions?.map(c => c.completed_date) || [])

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${habit.color}20` }}
                          >
                            <Repeat className="h-5 w-5" style={{ color: habit.color }} />
                          </div>
                          <div>
                            <p className="font-semibold">{habit.title}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Flame className="h-3.5 w-3.5 text-orange-400" />
                              <span className="text-xs text-muted-foreground">
                                {habit.streak} day streak
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-300"
                          onClick={() => deleteHabit(habit.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="flex gap-1 justify-between">
                        {days.slice(-14).map((day) => {
                          const completed = completions.has(day)
                          const isToday = day === today
                          return (
                            <div
                              key={day}
                              className={`h-6 w-6 rounded-sm flex items-center justify-center text-[10px] transition-colors ${
                                completed
                                  ? "text-white"
                                  : isToday
                                  ? "border border-dashed border-muted-foreground/40"
                                  : "bg-secondary/50"
                              }`}
                              style={completed ? { backgroundColor: habit.color } : {}}
                              title={day}
                            >
                              {isToday && !completed ? (
                                <span className="text-muted-foreground">{new Date(day).getDate()}</span>
                              ) : completed ? (
                                <Check className="h-3 w-3" />
                              ) : null}
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          <Calendar className="h-3 w-3 mr-1" />
                          {habit.frequency}
                        </Badge>
                        <Button
                          size="sm"
                          variant={isChecked ? "ghost" : "default"}
                          disabled={isChecked}
                          onClick={() => toggleHabit(habit)}
                          className={isChecked ? "text-emerald-400" : ""}
                        >
                          {isChecked ? (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Done
                            </>
                          ) : (
                            "Complete"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {habits.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 py-20">
            <Repeat className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
            <h3 className="text-lg font-semibold">No habits yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start building consistency with daily habits
            </p>
          </div>
        )}
      </div>

      {xpToast && (
        <XpToast amount={xpToast.amount} source={xpToast.source} />
      )}

      <LevelUpModal
        newLevel={levelUp.newLevel}
        open={levelUp.show}
        onClose={() => setLevelUp({ show: false, newLevel: 0 })}
      />
    </>
  )
}
