import { createClient, getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileCard } from "@/components/profile/profile-card"
import { AchievementsList } from "@/components/profile/achievements-list"
import { StatsGrid } from "@/components/profile/stats-grid"

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect("/")

  const [
    { data: profile },
    { data: achievements },
    { data: allAchievements },
    { data: xpHistory },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("user_achievements")
      .select("*, achievement(*)")
      .eq("user_id", user.id)
      .order("unlocked_at", { ascending: false }),
    supabase.from("achievements").select("*").order("xp_reward", { ascending: false }),
    supabase
      .from("xp_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Your journey and achievements
        </p>
      </div>

      <ProfileCard profile={profile} />
      <StatsGrid profile={profile} xpHistory={xpHistory || []} />
      <AchievementsList
        unlocked={achievements || []}
        all={allAchievements || []}
      />
    </div>
  )
}