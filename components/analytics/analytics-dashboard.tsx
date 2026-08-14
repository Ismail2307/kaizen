"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TrendingUp, Target, CheckSquare, Repeat } from "lucide-react"
import type { XpTransaction, Goal, Task, HabitCompletion } from "@/types"

interface AnalyticsDashboardProps {
  xpHistory: XpTransaction[]
  goals: Goal[]
  tasks: Task[]
  habitCompletions: HabitCompletion[]
}

export function AnalyticsDashboard({
  xpHistory,
  goals,
  tasks,
  habitCompletions,
}: AnalyticsDashboardProps) {
  // XP Over Time - last 14 days
  const xpOverTime = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      return d.toISOString().split("T")[0]
    })

    return days.map((day) => {
      const dayXp = xpHistory
        .filter((tx) => tx.created_at.startsWith(day))
        .reduce((sum, tx) => sum + tx.amount, 0)
      return {
        date: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
        xp: dayXp,
      }
    })
  }, [xpHistory])

  // Task completion by difficulty
  const taskByDifficulty = useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      if (t.status === "completed") {
        counts[t.difficulty] = (counts[t.difficulty] || 0) + 1
      }
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [tasks])

  const difficultyColors: Record<string, string> = {
    tiny: "#94a3b8",
    easy: "#10b981",
    medium: "#8b5cf6",
    hard: "#f59e0b",
    epic: "#ef4444",
  }

  // Goal progress
  const goalProgress = useMemo(() => {
    return goals
      .filter((g) => g.status !== "archived")
      .map((g) => ({
        name: g.title.length > 15 ? g.title.slice(0, 15) + "..." : g.title,
        progress: g.progress,
      }))
  }, [goals])

  // Habit heatmap data (last 30 days)
  const habitHeatmap = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      return d.toISOString().split("T")[0]
    })

    return days.map((day) => ({
      date: new Date(day).getDate(),
      completions: habitCompletions.filter((c) => c.completed_date === day).length,
      fullDate: day,
    }))
  }, [habitCompletions])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="xp" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="xp">XP</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
        </TabsList>

        {/* XP Tab */}
        <TabsContent value="xp" className="space-y-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" />
                  XP Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={xpOverTime}>
                      <defs>
                        <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f0f11",
                          border: "1px solid #27272a",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#a1a1aa" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="xp"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fill="url(#xpGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Total XP Earned</p>
                <p className="text-2xl font-bold text-gold">
                  {xpHistory.reduce((sum, tx) => sum + tx.amount, 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">XP This Week</p>
                <p className="text-2xl font-bold text-gold">
                  {xpOverTime.slice(-7).reduce((sum, d) => sum + d.xp, 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Avg Daily XP</p>
                <p className="text-2xl font-bold text-gold">
                  {Math.round(xpOverTime.reduce((sum, d) => sum + d.xp, 0) / 14)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-emerald-400" />
                  Completed by Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskByDifficulty}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f0f11",
                          border: "1px solid #27272a",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {taskByDifficulty.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={difficultyColors[entry.name] || "#8b5cf6"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {tasks.filter((t) => t.status === "completed").length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {tasks.length > 0
                    ? Math.round(
                        (tasks.filter((t) => t.status === "completed").length / tasks.length) * 100
                      )
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-kaizen-400" />
                  Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={goalProgress} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f0f11",
                          border: "1px solid #27272a",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Progress"]}
                      />
                      <Bar dataKey="progress" radius={[0, 4, 4, 0]} fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold text-kaizen-400">
                  {goals.filter((g) => g.status === "active").length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {goals.filter((g) => g.status === "completed").length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">
                  {goals.length > 0
                    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Habits Tab */}
        <TabsContent value="habits" className="space-y-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-orange-400" />
                  Habit Consistency (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {habitHeatmap.map((day) => (
                    <div
                      key={day.fullDate}
                      className="h-8 w-8 rounded-sm flex items-center justify-center text-[10px] font-medium transition-colors"
                      style={{
                        backgroundColor:
                          day.completions === 0
                            ? "#18181b"
                            : day.completions === 1
                            ? "#10b98130"
                            : day.completions === 2
                            ? "#10b98160"
                            : "#10b98190",
                        color: day.completions > 0 ? "#10b981" : "#52525b",
                      }}
                      title={`${day.fullDate}: ${day.completions} completions`}
                    >
                      {day.date}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="h-3 w-3 rounded-sm bg-[#18181b]" />
                    <div className="h-3 w-3 rounded-sm bg-[#10b98130]" />
                    <div className="h-3 w-3 rounded-sm bg-[#10b98160]" />
                    <div className="h-3 w-3 rounded-sm bg-[#10b98190]" />
                  </div>
                  <span>More</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Total Completions</p>
                <p className="text-2xl font-bold text-orange-400">{habitCompletions.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-orange-400">
                  {habitHeatmap.reduce((sum, d) => sum + d.completions, 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
