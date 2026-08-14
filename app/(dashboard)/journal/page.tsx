import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { JournalManager } from "@/components/journal/journal-manager"

export default async function JournalPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: reflections } = await supabase
    .from("reflections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
        <p className="text-muted-foreground mt-1">
          Reflect on your journey and track your thoughts
        </p>
      </div>
      <JournalManager reflections={reflections || []} />
    </div>
  )
}
