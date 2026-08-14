"use client"

import { motion } from "framer-motion"
import { Award, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Achievement, UserAchievement } from "@/types"

interface AchievementsListProps {
  unlocked: (UserAchievement & { achievement?: Achievement })[]
  all: Achievement[]
}

export function AchievementsList({ unlocked, all }: AchievementsListProps) {
  const unlockedIds = new Set(unlocked.map(u => u.achievement_id))

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-gold" />
          Achievements
          <Badge variant="secondary" className="ml-2">
            {unlocked.length} / {all.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((achievement, i) => {
            const isUnlocked = unlockedIds.has(achievement.id)
            const userAchievement = unlocked.find(u => u.achievement_id === achievement.id)

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`rounded-lg border p-4 transition-colors ${
                  isUnlocked
                    ? "border-gold/20 bg-gold/5"
                    : "border-border/50 bg-secondary/20 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isUnlocked ? "bg-gold/20" : "bg-muted"
                    }`}
                  >
                    {isUnlocked ? (
                      <Award className="h-5 w-5 text-gold" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${isUnlocked ? "" : "text-muted-foreground"}`}>
                      {achievement.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {achievement.requirement_type.replace("_", " ")}
                      </span>
                      {isUnlocked ? (
                        <span className="text-xs font-bold text-gold">+{achievement.xp_reward} XP</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Need {achievement.requirement_value}
                        </span>
                      )}
                    </div>
                    {isUnlocked && userAchievement && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Unlocked {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
