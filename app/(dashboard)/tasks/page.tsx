import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TaskManager } from "@/components/tasks/task-manager"

export default async function TasksPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: goals } = await supabase
    .from("goals")
    .select("id, title")
    .eq("user_id", user.id)
    .eq("status", "active")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground mt-1">
          Manage all your tasks in one place
        </p>
      </div>
      <TaskManager tasks={tasks || []} goals={goals || []} />
    </div>
  )
}
