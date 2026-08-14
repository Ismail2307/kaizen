"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flag, Plus, CheckCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { XpToast } from "@/components/xp/xp-toast"
import { LevelUpModal } from "@/components/xp/level-up-modal"
import { createMilestone, completeMilestone, deleteMilestone } from "@/app/actions"
import { createClient } from "@/lib/supabase/client"
import type { Milestone } from "@/types"

interface MilestoneListProps {
  goalId: string
  milestones: Milestone[]
}

export function MilestoneList({ goalId, milestones }: MilestoneListProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [xpToast, setXpToast] = useState<{ amount: number; source: string } | null>(null)
  const [levelUp, setLevelUp] = useState<{ show: boolean; newLevel: number }>({ show: false, newLevel: 0 })
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createMilestone({
        goal_id: goalId,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        order_index: milestones.length,
      })
      setIsOpen(false)
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(milestone: Milestone) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: beforeProfile } = await supabase
      .from("profiles")
      .select("level")
      .eq("id", user.id)
      .single()

    const beforeLevel = beforeProfile?.level || 1

    await completeMilestone(milestone.id, goalId)

    setXpToast({ amount: milestone.xp_reward, source: "milestone" })

    const { data: afterProfile } = await supabase
      .from("profiles")
      .select("level")
      .eq("id", user.id)
      .single()

    if (afterProfile && afterProfile.level > beforeLevel) {
      setTimeout(() => {
        setLevelUp({ show: true, newLevel: afterProfile.level })
      }, 1000)
    }

    setTimeout(() => setXpToast(null), 2500)
    window.location.reload()
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flag className="h-5 w-5 text-kaizen-400" />
            Milestones
            <Badge variant="secondary" className="ml-2">{milestones.length}</Badge>
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Milestone</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input name="title" placeholder="e.g., Learn Frontend" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea name="description" placeholder="What needs to be done?" rows={2} />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  Create Milestone
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {milestones.map((milestone, i) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border-border/50 ${milestone.status === "completed" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card/50"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          if (milestone.status !== "completed") {
                            handleComplete(milestone)
                          }
                        }}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          milestone.status === "completed"
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-muted-foreground/30 hover:border-kaizen-400"
                        }`}
                      >
                        {milestone.status === "completed" && (
                          <CheckCircle className="h-3.5 w-3.5 text-white" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${milestone.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                            {milestone.title}
                          </p>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setExpandedId(expandedId === milestone.id ? null : milestone.id)}
                            >
                              {expandedId === milestone.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-400 hover:text-red-300"
                              onClick={() => {
                                if (confirm("Delete this milestone?")) {
                                  deleteMilestone(milestone.id, goalId)
                                  window.location.reload()
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {milestone.description && expandedId === milestone.id && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-muted-foreground mt-1"
                          >
                            {milestone.description}
                          </motion.p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <Progress value={milestone.progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {milestone.progress}%
                          </span>
                          <span className="text-xs font-medium text-gold">+{milestone.xp_reward} XP</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {milestones.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
              <Flag className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No milestones yet</p>
              <p className="text-xs mt-1">Break your goal into smaller milestones</p>
            </div>
          )}
        </div>
      </div>

      {xpToast && (
        <XpToast amount={xpToast.amount} source={xpToast.source} />
      )}

      <LevelUpModal
        newLevel={levelUp.newLevel}
        open={levelUp.show}
        onClose={() => setLevelUp({ show: false, newLevel: 0 })}
      />
    </>
  )
}
