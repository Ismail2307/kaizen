import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MilestoneList } from "@/components/goals/milestone-list"
import { TaskList } from "@/components/goals/task-list"
import { getStatusColor, formatDate } from "@/lib/utils"

interface GoalDetailPageProps {
  params: { id: string }
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: goal } = await supabase
    .from("goals")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!goal) notFound()

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("goal_id", params.id)
    .eq("user_id", user.id)
    .order("order_index", { ascending: true })

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("goal_id", params.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const statusConfig: Record<string, { label: string; emoji: string }> = {
    active: { label: "On Track", emoji: "🟢" },
    at_risk: { label: "At Risk", emoji: "🟡" },
    behind: { label: "Behind", emoji: "🔴" },
    completed: { label: "Completed", emoji: "✅" },
    paused: { label: "Paused", emoji: "⏸️" },
    archived: { label: "Archived", emoji: "📦" },
  }
  const status = statusConfig[goal.status] || statusConfig.active

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/goals">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: goal.color || "#8b5cf6" }}
            />
            <h1 className="text-2xl font-bold">{goal.title}</h1>
          </div>
          {goal.description && (
            <p className="text-muted-foreground pl-11">{goal.description}</p>
          )}
        </div>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className={`${getStatusColor(goal.status)}`}>
          {status.emoji} {status.label}
        </Badge>
        {goal.category && <Badge variant="secondary">{goal.category}</Badge>}
        {goal.priority && <Badge variant="outline">{goal.priority} priority</Badge>}
        {goal.deadline && (
          <span className="text-sm text-muted-foreground">
            Due {formatDate(goal.deadline)}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-bold">{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-3" />
        {goal.target_value && goal.unit && (
          <p className="text-xs text-muted-foreground">
            {goal.current_value} / {goal.target_value} {goal.unit}
          </p>
        )}
      </div>

      <Separator />

      <MilestoneList goalId={goal.id} milestones={milestones || []} />

      <Separator />

      <TaskList goalId={goal.id} tasks={tasks || []} />
    </div>
  )
}
