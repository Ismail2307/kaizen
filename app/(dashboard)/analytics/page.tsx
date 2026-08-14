import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: xpHistory } = await supabase
    .from("xp_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)

  const { data: habitCompletions } = await supabase
    .from("habit_completions")
    .select("*")
    .eq("user_id", user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your progress with detailed insights
        </p>
      </div>
      <AnalyticsDashboard
        xpHistory={xpHistory || []}
        goals={goals || []}
        tasks={tasks || []}
        habitCompletions={habitCompletions || []}
      />
    </div>
  )
}
