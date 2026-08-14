"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckSquare, Plus, Check, Trash2, Clock, Zap, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

interface TaskManagerProps {
  tasks: Task[]
  goals: { id: string; title: string }[]
}

export function TaskManager({ tasks, goals }: TaskManagerProps) {
  const [filter, setFilter] = useState("all")
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [xpToast, setXpToast] = useState<{ amount: number; source: string } | null>(null)
  const [levelUp, setLevelUp] = useState<{ show: boolean; newLevel: number }>({ show: false, newLevel: 0 })
  const supabase = createClient()

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return task.status !== "completed"
    if (filter === "completed") return task.status === "completed"
    return true
  })

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createTask({
        goal_id: (formData.get("goal_id") as string) || undefined,
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

    await completeTask(task.id, task.goal_id || undefined)

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
    await deleteTask(task.id, task.goal_id || undefined)
    window.location.reload()
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({tasks.filter(t => t.status !== "completed").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Done ({tasks.filter(t => t.status === "completed").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
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
                {goals.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Linked Goal (optional)</label>
                    <Select name="goal_id">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (standalone)</SelectItem>
                        {goals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, i) => {
              const isCompleted = task.status === "completed" || completedIds.includes(task.id)
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={`border-border/50 ${isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card/50"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
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
                            <p className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gold">+{task.xp_reward} XP</span>
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
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                            {task.goal_id && (
                              <span className="text-xs text-kaizen-400 flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Linked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
              <CheckSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tasks found</p>
              <p className="text-xs mt-1">
                {filter === "completed" ? "Complete some tasks to see them here" : "Create your first task to get started"}
              </p>
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
