import { createClient, getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WeeklyReviewCard } from "@/components/weekly-review/weekly-review-card"

export default async function WeeklyReviewPage() {
  const supabase = createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect("/")

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const weekStartStr = weekStart.toISOString()
  const weekEndStr = weekEnd.toISOString()

  const [
    { data: tasksCompleted },
    { data: xpEarned },
    { data: habitsCompleted },
    { data: goalsProgressed },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("completed_at", weekStartStr)
      .lte("completed_at", weekEndStr),
    supabase
      .from("xp_transactions")
      .select("amount")
      .eq("user_id", user.id)
      .gte("created_at", weekStartStr)
      .lte("created_at", weekEndStr),
    supabase
      .from("habit_completions")
      .select("*")
      .eq("user_id", user.id)
      .gte("completed_date", weekStart.toISOString().split("T")[0])
      .lte("completed_date", weekEnd.toISOString().split("T")[0]),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .gte("updated_at", weekStartStr)
      .lte("updated_at", weekEndStr),
    supabase
      .from("profiles")
      .select("streak, kaizen_score, total_tasks_completed, total_goals_completed, total_habits_completed")
      .eq("id", user.id)
      .single(),
  ])

  const totalXp = xpEarned?.reduce((sum, tx) => sum + tx.amount, 0) || 0
  const taskCount = tasksCompleted?.length || 0
  const habitCount = habitsCompleted?.length || 0
  const goalCount = goalsProgressed?.length || 0

  const areaScores = {
    tasks: taskCount * 10,
    habits: habitCount * 5,
    goals: goalCount * 20,
  }
  const sortedAreas = Object.entries(areaScores).sort((a, b) => b[1] - a[1])
  const strongest = sortedAreas[0]?.[0] || "tasks"
  const weakest = sortedAreas[sortedAreas.length - 1]?.[0] || "habits"

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weekly Review</h1>
        <p className="text-muted-foreground mt-1">
          Your week at a glance · {weekStart.toLocaleDateString()} – {weekEnd.toLocaleDateString()}
        </p>
      </div>
      <WeeklyReviewCard
        tasksCompleted={taskCount}
        xpEarned={totalXp}
        goalsProgressed={goalCount}
        habitsCompleted={habitCount}
        streak={profile?.streak || 0}
        strongestArea={strongest}
        weakestArea={weakest}
        kaizenScore={profile?.kaizen_score || 0}
        tasks={tasksCompleted || []}
      />
    </div>
  )
}