import { createClient, getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HabitsManager } from "@/components/habits/habits-manager"

export default async function HabitsPage() {
  const supabase = createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect("/")

  // streak / longest_streak are already computed and stored on the habit
  // row itself (server-side, via the add_xp trigger) — the join below is
  // only needed to render the 14-day mini calendar, so scope it to that
  // window instead of pulling a habit's entire completion history.
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]

  const { data: habits } = await supabase
    .from("habits")
    .select("*, habit_completions(*)")
    .eq("user_id", user.id)
    .eq("active", true)
    .gte("habit_completions.completed_date", fourteenDaysAgo)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
        <p className="text-muted-foreground mt-1">
          Build consistency with daily and weekly habits
        </p>
      </div>
      <HabitsManager habits={habits || []} />
    </div>
  )
}