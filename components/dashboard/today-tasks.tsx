"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { CheckSquare, Clock, ArrowRight, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { XpToast } from "@/components/xp/xp-toast"
import { LevelUpModal } from "@/components/xp/level-up-modal"
import { getPriorityColor, formatDate } from "@/lib/utils"
import { completeTask } from "@/app/actions"
import { createClient } from "@/lib/supabase/client"
import type { Task } from "@/types"

interface TodayTasksProps {
  tasks: Task[] | null
}

export function TodayTasks({ tasks }: TodayTasksProps) {
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [xpToast, setXpToast] = useState<{ amount: number; source: string } | null>(null)
  const [levelUp, setLevelUp] = useState<{ show: boolean; newLevel: number }>({ show: false, newLevel: 0 })
  const supabase = createClient()

  async function handleComplete(task: Task) {
    if (completedIds.includes(task.id)) return
    setCompletedIds([...completedIds, task.id])

    // Get current level before completion
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: beforeProfile } = await supabase
      .from("profiles")
      .select("level")
      .eq("id", user.id)
      .single()

    const beforeLevel = beforeProfile?.level || 1

    // Complete task
    await completeTask(task.id, task.goal_id || undefined)

    // Show XP toast
    setXpToast({ amount: task.xp_reward, source: "task" })

    // Check for level up
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

    setTimeout(() => setXpToast(null), 2500)
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-kaizen-400" />
            Today&apos;s Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No pending tasks</p>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Add a task
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-kaizen-400" />
            Today&apos;s Tasks
          </CardTitle>
          <Link href="/tasks">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          <AnimatePresence>
            {tasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary/50 ${
                  completedIds.includes(task.id) ? "opacity-50" : ""
                }`}
              >
                <button
                  onClick={() => handleComplete(task)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    completedIds.includes(task.id)
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-muted-foreground/30 hover:border-kaizen-400"
                  }`}
                >
                  {completedIds.includes(task.id) && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${completedIds.includes(task.id) ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`text-[10px] ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                    {task.deadline && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(task.deadline)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-medium text-gold">+{task.xp_reward} XP</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

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
