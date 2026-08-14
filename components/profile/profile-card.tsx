"use client"

import { motion } from "framer-motion"
import { User, MapPin, Calendar, Zap, Flame, Trophy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getXpForLevel, getLeague } from "@/lib/utils"
import type { Profile } from "@/types"

interface ProfileCardProps {
  profile: Profile | null
}

export function ProfileCard({ profile }: ProfileCardProps) {
  if (!profile) return null

  const xpForNext = getXpForLevel(profile.level)
  const xpProgress = (profile.xp / xpForNext) * 100

  const leagueColors: Record<string, string> = {
    Bronze: "from-amber-700 to-amber-600",
    Silver: "from-slate-400 to-slate-300",
    Gold: "from-gold to-gold-light",
    Platinum: "from-cyan-300 to-slate-200",
    Diamond: "from-cyan-400 to-blue-400",
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Avatar className="h-24 w-24 border-4 border-kaizen-500/30">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-kaizen-600 text-white text-3xl">
                {profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold">{profile.username}</h2>
                <Badge
                  variant="outline"
                  className={`bg-gradient-to-r ${leagueColors[profile.league] || leagueColors.Bronze} text-black border-0 font-bold`}
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  {profile.league}
                </Badge>
              </div>
              {profile.full_name && (
                <p className="text-muted-foreground">{profile.full_name}</p>
              )}
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {profile.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.city ? `${profile.city}, ${profile.country}` : profile.country}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Level & XP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-kaizen-400" />
                  <span className="font-bold">Level {profile.level}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {profile.xp} / {xpForNext} XP
                </span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                <p className="text-lg font-bold">{profile.streak}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <Zap className="h-5 w-5 text-kaizen-400 mx-auto mb-1" />
                <p className="text-lg font-bold">{profile.total_tasks_completed}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <Trophy className="h-5 w-5 text-gold mx-auto mb-1" />
                <p className="text-lg font-bold">{profile.total_goals_completed}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Goals</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
