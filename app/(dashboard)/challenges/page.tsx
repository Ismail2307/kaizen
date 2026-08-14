import { createClient, getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChallengesGrid } from "@/components/challenges/challenges-grid"

export default async function ChallengesPage() {
  const supabase = createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect("/")

  const [{ data: challenges }, { data: myParticipations }] = await Promise.all([
    supabase.from("challenges").select("*").eq("is_public", true).order("created_at", { ascending: false }),
    supabase.from("challenge_participants").select("*").eq("user_id", user.id),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
        <p className="text-muted-foreground mt-1">
          Join community challenges and earn bonus XP
        </p>
      </div>
      <ChallengesGrid
        challenges={challenges || []}
        myParticipations={myParticipations || []}
        userId={user.id}
      />
    </div>
  )
}