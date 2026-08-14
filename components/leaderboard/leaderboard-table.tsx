"use client"

import { motion } from "framer-motion"
import { Trophy, Medal, Crown, Flame, Zap } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getLeague, getXpForLevel } from "@/lib/utils"
import type { Profile } from "@/types"

interface LeaderboardTableProps {
  entries: Profile[]
  myUserId: string
  myProfile: Profile | null
}

export function LeaderboardTable({ entries, myUserId, myProfile }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-gold" />
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-300" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>
  }

  const getLeagueColor = (league: string) => {
    switch (league) {
      case "Diamond": return "from-cyan-400 to-blue-400"
      case "Platinum": return "from-slate-300 to-slate-100"
      case "Gold": return "from-gold to-gold-light"
      case "Silver": return "from-slate-400 to-slate-300"
      default: return "from-amber-700 to-amber-600"
    }
  }

  return (
    <div className="space-y-4">
      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-6">
          {[entries[1], entries[0], entries[2]].map((entry, i) => {
            if (!entry) return null
            const heights = ["h-24", "h-32", "h-20"]
            const positions = [2, 1, 3]
            const colors = ["bg-slate-400/20", "bg-gold/20", "bg-amber-700/20"]
            const borderColors = ["border-slate-400/30", "border-gold/40", "border-amber-700/30"]
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <Avatar className="h-12 w-12 border-2 border-border mb-2">
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback className="bg-kaizen-600 text-white text-sm">
                    {entry.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs font-medium truncate max-w-[80px]">{entry.username}</p>
                <p className="text-xs text-gold font-bold">Lvl {entry.level}</p>
                <div className={`mt-2 w-20 ${heights[i]} rounded-t-lg border ${borderColors[i]} ${colors[i]} flex items-end justify-center pb-2`}>
                  <span className="text-2xl font-bold text-muted-foreground">{positions[i]}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Full Table */}
      <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
        <div className="divide-y divide-border">
          {entries.map((entry, i) => {
            const rank = i + 1
            const isMe = entry.id === myUserId
            const xpForNext = getXpForLevel(entry.level)
            const xpProgress = (entry.xp / xpForNext) * 100

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                  isMe ? "bg-kaizen-500/5" : "hover:bg-secondary/30"
                }`}
              >
                <div className="w-8 flex justify-center shrink-0">
                  {getRankIcon(rank)}
                </div>

                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback className="bg-kaizen-600 text-white text-xs">
                    {entry.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${isMe ? "text-kaizen-300" : ""}`}>
                      {entry.username}
                      {isMe && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] bg-gradient-to-r ${getLeagueColor(entry.league)} bg-clip-text text-transparent border-transparent`}
                    >
                      {entry.league}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="h-3 w-3 text-kaizen-400" />
                      Lvl {entry.level}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="h-3 w-3 text-orange-400" />
                      {entry.streak} streak
                    </div>
                    <div className="flex-1 max-w-[100px]">
                      <Progress value={xpProgress} className="h-1" />
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{entry.xp}</p>
                  <p className="text-[10px] text-muted-foreground">XP</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* My Rank (if not in top 50) */}
      {myProfile && !entries.find(e => e.id === myUserId) && (
        <div className="rounded-xl border border-kaizen-500/20 bg-kaizen-500/5 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-muted-foreground w-8 text-center">...</span>
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={myProfile.avatar_url || undefined} />
              <AvatarFallback className="bg-kaizen-600 text-white text-xs">
                {myProfile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-kaizen-300">
                {myProfile.username} <span className="text-xs text-muted-foreground">(You)</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Level {myProfile.level} · {myProfile.xp} XP · {myProfile.league} League
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
