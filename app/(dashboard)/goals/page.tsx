import { createClient, getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoalCard } from "@/components/goals/goal-card"

export default async function GoalsPage() {
  const supabase = createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect("/")

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your personal goals
          </p>
        </div>
        <Link href="/goals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </Link>
      </div>

      {goals && goals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 py-20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-kaizen-500/10">
            <Plus className="h-6 w-6 text-kaizen-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No goals yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first goal to start your journey
          </p>
          <Link href="/goals/new" className="mt-4">
            <Button>Create Goal</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
