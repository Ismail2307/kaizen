"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Award, ArrowRight, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { UserAchievement } from "@/types"

interface RecentAchievementsProps {
  achievements: (UserAchievement & { achievement?: { title: string; description: string; icon: string | null; color: string; xp_reward: number } })[] | null
}

export function RecentAchievements({ achievements }: RecentAchievementsProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-gold" />
          Achievements
        </CardTitle>
        <Link href="/profile">
          <Button variant="ghost" size="sm">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements && achievements.length > 0 ? (
          achievements.map((ua, i) => (
            <motion.div
              key={ua.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 rounded-lg border border-gold/20 bg-gold/5 p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20">
                <Award className="h-5 w-5 text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{ua.achievement?.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {ua.achievement?.description}
                </p>
              </div>
              <span className="text-xs font-bold text-gold">+{ua.achievement?.xp_reward} XP</span>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Lock className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No achievements yet</p>
            <p className="text-xs mt-1">Complete tasks and goals to unlock them</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
