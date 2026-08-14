"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Repeat, Flame, ArrowRight, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Habit, HabitCompletion } from "@/types"

interface HabitsOverviewProps {
  habits: (Habit & { habit_completions?: HabitCompletion[] })[] | null
}

export function HabitsOverview({ habits }: HabitsOverviewProps) {
  const [checkedHabits, setCheckedHabits] = useState<string[]>([])
  const today = new Date().toISOString().split("T")[0]

  if (!habits || habits.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Repeat className="h-5 w-5 text-kaizen-400" />
            Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>No active habits</p>
            <Link href="/habits">
              <Button variant="ghost" size="sm" className="mt-2">
                Create a habit
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const toggleHabit = (id: string) => {
    setCheckedHabits(prev => 
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    )
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Repeat className="h-5 w-5 text-kaizen-400" />
          Habits
        </CardTitle>
        <Link href="/habits">
          <Button variant="ghost" size="sm">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {habits.map((habit, i) => {
          const isChecked = checkedHabits.includes(habit.id)
          const isCompletedToday = habit.habit_completions?.some(
            c => c.completed_date === today
          )

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggleHabit(habit.id)}
              className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                isChecked || isCompletedToday
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "hover:bg-secondary/30"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isChecked || isCompletedToday
                    ? "bg-emerald-500 text-white"
                    : "bg-secondary"
                }`}
              >
                {isChecked || isCompletedToday ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Repeat className="h-4 w-4" style={{ color: habit.color }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${
                  isChecked || isCompletedToday ? "line-through text-muted-foreground" : ""
                }`}>
                  {habit.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Flame className="h-3 w-3 text-orange-400" />
                  <span className="text-xs text-muted-foreground">
                    {habit.streak} day streak
                  </span>
                </div>
              </div>
              <span className="text-xs font-medium text-gold">+{habit.xp_reward} XP</span>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
