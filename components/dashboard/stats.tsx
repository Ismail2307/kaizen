"use client"

import { motion } from "framer-motion"
import { Target, CheckSquare, Flame, Zap, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getXpForLevel } from "@/lib/utils"
import type { Profile, Task, Goal } from "@/types"

interface DashboardStatsProps {
  profile: Profile | null
  tasks: Task[] | null
  goals: Goal[] | null
}

export function DashboardStats({ profile, tasks, goals }: DashboardStatsProps) {
  const xpForNextLevel = profile ? getXpForLevel(profile.level) : 100
  const xpProgress = profile ? (profile.xp / xpForNextLevel) * 100 : 0
  const pendingTasks = tasks?.filter(t => t.status === "pending").length || 0
  const inProgressTasks = tasks?.filter(t => t.status === "in_progress").length || 0

  const stats = [
    {
      label: "Level",
      value: profile?.level || 1,
      sub: `${profile?.xp || 0} / ${xpForNextLevel} XP`,
      icon: Zap,
      color: "text-kaizen-400",
      bg: "bg-kaizen-500/10",
      progress: xpProgress,
    },
    {
      label: "Active Goals",
      value: goals?.length || 0,
      sub: "in progress",
      icon: Target,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks,
      sub: `${inProgressTasks} in progress`,
      icon: CheckSquare,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Streak",
      value: profile?.streak || 0,
      sub: "days",
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              {stat.progress !== undefined && (
                <div className="mt-3">
                  <Progress value={stat.progress} className="h-1.5" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
