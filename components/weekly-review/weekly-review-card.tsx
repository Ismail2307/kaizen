"use client"

import { motion } from "framer-motion"
import {
  CheckSquare,
  Coins,
  Target,
  Repeat,
  Flame,
  TrendingUp,
  TrendingDown,
  Award,
  Zap,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Task } from "@/types"

interface WeeklyReviewCardProps {
  tasksCompleted: number
  xpEarned: number
  goalsProgressed: number
  habitsCompleted: number
  streak: number
  strongestArea: string
  weakestArea: string
  kaizenScore: number
  tasks: Task[]
}

export function WeeklyReviewCard({
  tasksCompleted,
  xpEarned,
  goalsProgressed,
  habitsCompleted,
  streak,
  strongestArea,
  weakestArea,
  kaizenScore,
  tasks,
}: WeeklyReviewCardProps) {
  const stats = [
    {
      label: "Tasks Completed",
      value: tasksCompleted,
      icon: CheckSquare,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "XP Earned",
      value: xpEarned,
      icon: Coins,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      label: "Goals Progressed",
      value: goalsProgressed,
      icon: Target,
      color: "text-kaizen-400",
      bg: "bg-kaizen-500/10",
    },
    {
      label: "Habits Done",
      value: habitsCompleted,
      icon: Repeat,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ]

  const areaLabels: Record<string, string> = {
    tasks: "Task Completion",
    habits: "Habit Consistency",
    goals: "Goal Progress",
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Streak & Kaizen Score */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                  <Flame className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold">{streak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-kaizen-500/10">
                  <TrendingUp className="h-6 w-6 text-kaizen-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kaizen Score</p>
                  <p className="text-2xl font-bold">{kaizenScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Strongest & Weakest Areas */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Strongest Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold capitalize">{areaLabels[strongestArea] || strongestArea}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Keep up the momentum! You&apos;re excelling here.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-400" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold capitalize">{areaLabels[weakestArea] || weakestArea}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Small improvements here will boost your Kaizen Score significantly.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Completed Tasks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" />
              Tasks You Crushed This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-gold" />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {task.difficulty}
                      </Badge>
                      <span className="text-xs font-bold text-gold">+{task.xp_reward} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No tasks completed this week yet</p>
                <p className="text-xs mt-1">Complete some tasks to see them here!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
