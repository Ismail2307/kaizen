import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GoalMap } from "@/components/goals/goal-map"

export default async function GoalMapPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: goals } = await supabase
    .from("goals")
    .select("*, milestones(*), tasks(*)")
    .eq("user_id", user.id)
    .neq("status", "archived")

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Goal Map</h1>
        <p className="text-muted-foreground mt-1">
          Visualize your goals, milestones, and tasks
        </p>
      </div>
      <div className="flex-1 rounded-xl border border-border bg-card/30 overflow-hidden" style={{ height: "calc(100vh - 12rem)" }}>
        <GoalMap goals={goals || []} />
      </div>
    </div>
  )
}
