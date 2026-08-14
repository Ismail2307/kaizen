"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Target, MoreHorizontal, Pause, Play, Archive, Trash2, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { XpToast } from "@/components/xp/xp-toast"
import { LevelUpModal } from "@/components/xp/level-up-modal"
import { getStatusColor, formatDate } from "@/lib/utils"
import { updateGoal, deleteGoal, completeGoal } from "@/app/actions"
import { createClient } from "@/lib/supabase/client"
import type { Goal } from "@/types"

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  const [xpToast, setXpToast] = useState<{ amount: number; source: string } | null>(null)
  const [levelUp, setLevelUp] = useState<{ show: boolean; newLevel: number }>({ show: false, newLevel: 0 })
  const supabase = createClient()

  const statusConfig: Record<string, { label: string; emoji: string }> = {
    active: { label: "On Track", emoji: "🟢" },
    at_risk: { label: "At Risk", emoji: "🟡" },
    behind: { label: "Behind", emoji: "🔴" },
    completed: { label: "Completed", emoji: "✅" },
    paused: { label: "Paused", emoji: "⏸️" },
    archived: { label: "Archived", emoji: "📦" },
  }

  const status = statusConfig[goal.status] || statusConfig.active

  async function handleComplete() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: beforeProfile } = await supabase
      .from("profiles")
      .select("level")
      .eq("id", user.id)
      .single()

    const beforeLevel = beforeProfile?.level || 1

    await completeGoal(goal.id)

    setXpToast({ amount: 100, source: "goal" })

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
    window.location.reload()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="group border-border/50 bg-card/50 backdrop-blur-sm hover:border-kaizen-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <Link href={`/goals/${goal.id}`} className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: goal.color || "#8b5cf6" }}
                />
                <h3 className="font-semibold truncate">{goal.title}</h3>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {goal.status !== "completed" && (
                    <DropdownMenuItem onClick={handleComplete}>
                      <CheckCircle className="mr-2 h-4 w-4 text-emerald-400" />
                      Complete
                    </DropdownMenuItem>
                  )}
                  {goal.status === "active" ? (
                    <DropdownMenuItem onClick={() => { updateGoal(goal.id, { status: "paused" }); window.location.reload(); }}>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => { updateGoal(goal.id, { status: "active" }); window.location.reload(); }}>
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => { updateGoal(goal.id, { status: "archived" }); window.location.reload(); }}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { deleteGoal(goal.id); window.location.reload(); }} className="text-red-400">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {goal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {goal.description}
              </p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Progress value={goal.progress} className="h-1.5 flex-1" />
                <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                  {goal.progress}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${getStatusColor(goal.status)}`}>
                    {status.emoji} {status.label}
                  </Badge>
                  {goal.priority && (
                    <Badge variant="outline" className="text-[10px]">
                      {goal.priority}
                    </Badge>
                  )}
                </div>
                {goal.deadline && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(goal.deadline)}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
