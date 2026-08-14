"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Profile } from "@/types"

interface KaizenScoreProps {
  profile: Profile | null
}

export function KaizenScore({ profile }: KaizenScoreProps) {
  const score = profile?.kaizen_score || 0
  const maxScore = 1000
  const percentage = Math.min((score / maxScore) * 100, 100)

  let trend: "up" | "down" | "same" = "same"
  if (score > 500) trend = "up"
  else if (score < 200) trend = "down"

  const getScoreLabel = (s: number) => {
    if (s >= 800) return "Elite"
    if (s >= 600) return "Advanced"
    if (s >= 400) return "Intermediate"
    if (s >= 200) return "Beginner"
    return "Novice"
  }

  const getScoreColor = (s: number) => {
    if (s >= 800) return "from-kaizen-400 to-kaizen-300"
    if (s >= 600) return "from-emerald-400 to-emerald-300"
    if (s >= 400) return "from-amber-400 to-amber-300"
    if (s >= 200) return "from-orange-400 to-orange-300"
    return "from-slate-400 to-slate-300"
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-kaizen-400" />
          Kaizen Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative flex items-center justify-center">
            <svg className="h-24 w-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-secondary"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: `${2 * Math.PI * 40}` }}
                animate={{ strokeDashoffset: `${2 * Math.PI * 40 * (1 - percentage / 100)}` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`text-transparent bg-gradient-to-r ${getScoreColor(score)}`}
                style={{ stroke: "url(#scoreGradient)" }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className="text-kaizen-500" stopColor="currentColor" />
                  <stop offset="100%" className="text-kaizen-300" stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-bold">{score}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{getScoreLabel(score)}</span>
              {trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-400" />}
              {trend === "down" && <TrendingDown className="h-4 w-4 text-red-400" />}
              {trend === "same" && <Minus className="h-4 w-4 text-slate-400" />}
            </div>
            <p className="text-sm text-muted-foreground">
              Your Kaizen Score measures consistency, goal progress, and habit adherence over time.
            </p>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-kaizen-500 to-kaizen-300"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
