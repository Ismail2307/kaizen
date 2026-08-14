"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Target, ArrowRight, TrendingUp, AlertTriangle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getStatusColor, formatDate } from "@/lib/utils"
import type { Goal } from "@/types"

interface ActiveGoalsProps {
  goals: Goal[] | null
}

export function ActiveGoals({ goals }: ActiveGoalsProps) {
  if (!goals || goals.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-kaizen-400" />
            Active Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No active goals</p>
            <Link href="/goals">
              <Button variant="ghost" size="sm" className="mt-2">
                Create a goal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getGoalStatus = (goal: Goal) => {
    if (goal.progress >= 100) return { label: "Completed", icon: TrendingUp, color: "text-emerald-400" }
    if (goal.status === "at_risk") return { label: "At Risk", icon: AlertTriangle, color: "text-yellow-400" }
    if (goal.status === "behind") return { label: "Behind", icon: Clock, color: "text-red-400" }
    return { label: "On Track", icon: TrendingUp, color: "text-emerald-400" }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-kaizen-400" />
          Active Goals
        </CardTitle>
        <Link href="/goals">
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal, i) => {
          const status = getGoalStatus(goal)
          const StatusIcon = status.icon
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: goal.color || "#8b5cf6" }}
                  />
                  <p className="text-sm font-medium truncate">{goal.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={`text-[10px] ${getStatusColor(goal.status)}`}>
                    <StatusIcon className={`h-3 w-3 mr-1 ${status.color}`} />
                    {status.label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={goal.progress} className="h-1.5 flex-1" />
                <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                  {goal.progress}%
                </span>
              </div>
              {goal.deadline && (
                <p className="text-xs text-muted-foreground">
                  Due {formatDate(goal.deadline)}
                </p>
              )}
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
