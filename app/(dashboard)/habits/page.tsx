import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HabitsManager } from "@/components/habits/habits-manager"

export default async function HabitsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: habits } = await supabase
    .from("habits")
    .select("*, habit_completions(*)")
    .eq("user_id", user.id)
    .eq("active", true)
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
