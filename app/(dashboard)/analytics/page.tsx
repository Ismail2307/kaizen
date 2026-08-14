import { createClient, getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AnalyticsDashboardLazy as AnalyticsDashboard } from "@/components/analytics/analytics-dashboard-lazy"

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect("/")

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [
    { data: xpHistory },
    { data: goals },
    { data: tasks },
    { data: habitCompletions },
  ] = await Promise.all([
    // Only the last 14 days are ever shown (XP Over Time chart) — no need to
    // pull the user's entire XP history every time this page loads.
    supabase
      .from("xp_transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", fourteenDaysAgo)
      .order("created_at", { ascending: true }),
    supabase.from("goals").select("*").eq("user_id", user.id),
    supabase.from("tasks").select("*").eq("user_id", user.id),
    // Habit Consistency heatmap only shows the last 30 days.
    supabase
      .from("habit_completions")
      .select("*")
      .eq("user_id", user.id)
      .gte("completed_date", thirtyDaysAgo),
  ])

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