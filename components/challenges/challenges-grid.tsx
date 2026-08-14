"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Zap, Users, Trophy, Calendar, CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Challenge, ChallengeParticipant } from "@/types"

interface ChallengesGridProps {
  challenges: Challenge[]
  myParticipations: ChallengeParticipant[]
  userId: string
}

export function ChallengesGrid({ challenges, myParticipations, userId }: ChallengesGridProps) {
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const supabase = createClient()

  const myParticipationMap = new Map(myParticipations.map(p => [p.challenge_id, p]))

  async function joinChallenge(challengeId: string) {
    setJoiningId(challengeId)
    try {
      await supabase.from("challenge_participants").insert({
        challenge_id: challengeId,
        user_id: userId,
        progress: 0,
      })
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
      setJoiningId(null)
    }
  }

  async function updateProgress(challengeId: string, currentProgress: number) {
    const newProgress = Math.min(currentProgress + 10, 100)
    const completed = newProgress >= 100

    await supabase
      .from("challenge_participants")
      .update({
        progress: newProgress,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("challenge_id", challengeId)
      .eq("user_id", userId)

    if (completed) {
      // Award challenge XP
      const challenge = challenges.find(c => c.id === challengeId)
      if (challenge) {
        await supabase.rpc("add_xp", {
          p_user_id: userId,
          p_amount: challenge.xp_reward,
          p_source: "challenge",
          p_source_id: challengeId,
          p_description: `Completed challenge: ${challenge.title}`,
        })
      }
    }

    window.location.reload()
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {challenges.map((challenge, i) => {
        const participation = myParticipationMap.get(challenge.id)
        const isJoined = !!participation
        const progress = participation?.progress || 0
        const isCompleted = participation?.completed || false

        return (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`border-border/50 bg-card/50 backdrop-blur-sm h-full flex flex-col ${isCompleted ? "border-gold/30 bg-gold/5" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-kaizen-500/10">
                    <Zap className="h-5 w-5 text-kaizen-400" />
                  </div>
                  {isCompleted && (
                    <Badge variant="gold" className="text-[10px]">
                      <Trophy className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base mt-3">{challenge.title}</CardTitle>
                {challenge.description && (
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {challenge.duration_days} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5 text-gold" />
                      +{challenge.xp_reward} XP
                    </span>
                  </div>

                  {isJoined && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Your progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {!isJoined ? (
                    <Button
                      className="w-full"
                      onClick={() => joinChallenge(challenge.id)}
                      disabled={joiningId === challenge.id}
                    >
                      {joiningId === challenge.id && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Join Challenge
                    </Button>
                  ) : isCompleted ? (
                    <Button variant="ghost" className="w-full text-emerald-400" disabled>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Completed
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => updateProgress(challenge.id, progress)}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Log Progress (+10%)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}

      {challenges.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 py-20">
          <Zap className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
          <h3 className="text-lg font-semibold">No challenges available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later for new community challenges
          </p>
        </div>
      )}
    </div>
  )
}
