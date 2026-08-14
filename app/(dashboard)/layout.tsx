import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { UserButton } from "@/components/auth/user-button"
import { Separator } from "@/components/ui/separator"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <MobileNav profile={profile} />
      <div className="hidden lg:block">
        <Sidebar profile={profile} />
      </div>

      <main className="lg:ml-[260px] min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg px-6">
          <div />
          <div className="flex items-center gap-4">
            <UserButton profile={profile} />
          </div>
        </header>
        <div className="p-6 pb-24 lg:pb-6">
          {children}
        </div>
      </main>
    </div>
  )
}
