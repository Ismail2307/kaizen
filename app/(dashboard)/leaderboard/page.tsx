import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const tab = searchParams.tab || "global"

  // Get current user's profile for context
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch leaderboard data
  let query = supabase
    .from("profiles")
    .select("*")
    .order("level", { ascending: false })
    .order("xp", { ascending: false })
    .limit(50)

  if (tab === "weekly") {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    // For weekly, we'd need a more complex query with xp_transactions
    // Simplified: just show top by XP for now
  }

  const { data: entries } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">
          See how you rank against other Kaizen users
        </p>
      </div>

      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="country">Country</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>
      </Tabs>

      <LeaderboardTable
        entries={entries || []}
        myUserId={user.id}
        myProfile={myProfile}
      />
    </div>
  )
}
