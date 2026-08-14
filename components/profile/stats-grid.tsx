"use client"

import { motion } from "framer-motion"
import { TrendingUp, Coins, Target, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Profile, XpTransaction } from "@/types"

interface StatsGridProps {
  profile: Profile | null
  xpHistory: XpTransaction[]
}

export function StatsGrid({ profile, xpHistory }: StatsGridProps) {
  if (!profile) return null

  const totalXpEarned = xpHistory.reduce((sum, tx) => sum + tx.amount, 0)
  const xpBySource = xpHistory.reduce((acc, tx) => {
    acc[tx.source] = (acc[tx.source] || 0) + tx.amount
    return acc
  }, {} as Record<string, number>)

  const stats = [
    {
      label: "Total XP Earned",
      value: totalXpEarned,
      icon: Coins,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      label: "Kaizen Score",
      value: profile.kaizen_score,
      icon: TrendingUp,
      color: "text-kaizen-400",
      bg: "bg-kaizen-500/10",
    },
    {
      label: "Habits Completed",
      value: profile.total_habits_completed,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Longest Streak",
      value: profile.longest_streak,
      icon: Target,
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

      {/* XP Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="sm:col-span-2 lg:col-span-4"
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">XP Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(xpBySource).map(([source, amount]) => (
                <div
                  key={source}
                  className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2"
                >
                  <div className="h-2 w-2 rounded-full bg-kaizen-400" />
                  <span className="text-sm capitalize">{source}</span>
                  <span className="text-sm font-bold text-gold">+{amount}</span>
                </div>
              ))}
              {Object.keys(xpBySource).length === 0 && (
                <p className="text-sm text-muted-foreground">No XP earned yet. Start completing tasks!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
