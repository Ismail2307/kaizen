import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard/stats"
import { TodayTasks } from "@/components/dashboard/today-tasks"
import { ActiveGoals } from "@/components/dashboard/active-goals"
import { HabitsOverview } from "@/components/dashboard/habits-overview"
import { RecentAchievements } from "@/components/dashboard/recent-achievements"
import { KaizenScore } from "@/components/dashboard/kaizen-score"

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/")

  // Fetch all dashboard data in parallel
  const [
    { data: profile },
    { data: goals },
    { data: tasks },
    { data: habits },
    { data: achievements },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("goals").select("*").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(4),
    supabase.from("tasks").select("*").eq("user_id", user.id).in("status", ["pending", "in_progress"]).order("deadline", { ascending: true }).limit(5),
    supabase.from("habits").select("*, habit_completions(*)").eq("user_id", user.id).eq("active", true).limit(4),
    supabase.from("user_achievements").select("*, achievement(*)").eq("user_id", user.id).order("unlocked_at", { ascending: false }).limit(3),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, <span className="text-gradient">{profile?.username || "Kaizen"}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s how you&apos;re doing today
        </p>
      </div>

      {/* Stats Row */}
      <DashboardStats profile={profile} tasks={tasks} goals={goals} />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <KaizenScore profile={profile} />
          <TodayTasks tasks={tasks} />
          <ActiveGoals goals={goals} />
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          <HabitsOverview habits={habits} />
          <RecentAchievements achievements={achievements} />
        </div>
      </div>
    </div>
  )
}
