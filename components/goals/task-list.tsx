"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckSquare, Plus, Check, Trash2, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { XpToast } from "@/components/xp/xp-toast"
import { LevelUpModal } from "@/components/xp/level-up-modal"
import { createTask, completeTask, deleteTask } from "@/app/actions"
import { getPriorityColor, getDifficultyColor, formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Task } from "@/types"

interface TaskListProps {
  goalId: string
  tasks: Task[]
}

export function TaskList({ goalId, tasks }: TaskListProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [xpToast, setXpToast] = useState<{ amount: number; source: string } | null>(null)
  const [levelUp, setLevelUp] = useState<{ show: boolean; newLevel: number }>({ show: false, newLevel: 0 })
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createTask({
        goal_id: goalId,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        priority: formData.get("priority") as string,
        difficulty: formData.get("difficulty") as string,
        deadline: formData.get("deadline") as string,
      })
      setIsOpen(false)
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(task: Task) {
    if (completedIds.includes(task.id) || task.status === "completed") return
    setCompletedIds([...completedIds, task.id])

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: beforeProfile } = await supabase
      .from("profiles")
      .select("level")
      .eq("id", user.id)
      .single()

    const beforeLevel = beforeProfile?.level || 1

    await completeTask(task.id, goalId)

    setXpToast({ amount: task.xp_reward, source: "task" })

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
  }

  async function handleDelete(task: Task) {
    if (!confirm("Delete this task?")) return
    await deleteTask(task.id, goalId)
    window.location.reload()
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-kaizen-400" />
            Tasks
            <Badge variant="secondary" className="ml-2">
              {tasks.filter(t => t.status !== "completed").length} pending
            </Badge>
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input name="title" placeholder="What needs to be done?" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea name="description" placeholder="Details..." rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select name="difficulty" defaultValue="easy">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tiny">Tiny (5 XP)</SelectItem>
                        <SelectItem value="easy">Easy (10 XP)</SelectItem>
                        <SelectItem value="medium">Medium (25 XP)</SelectItem>
                        <SelectItem value="hard">Hard (50 XP)</SelectItem>
                        <SelectItem value="epic">Epic (100 XP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deadline</label>
                  <Input name="deadline" type="date" />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  Create Task
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const isCompleted = task.status === "completed" || completedIds.includes(task.id)
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                    isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card/50 border-border/50 hover:bg-secondary/30"
                  }`}>
                    <button
                      onClick={() => handleComplete(task)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        isCompleted
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-muted-foreground/30 hover:border-kaizen-400"
                      }`}
                    >
                      {isCompleted && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-gold">+{task.xp_reward} XP</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:text-red-300"
                            onClick={() => handleDelete(task)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className={`text-[10px] ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        <span className={`text-xs ${getDifficultyColor(task.difficulty)}`}>
                          <Zap className="inline h-3 w-3 mr-0.5" />
                          {task.difficulty}
                        </span>
                        {task.deadline && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(task.deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
              <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Add tasks to track your progress</p>
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
