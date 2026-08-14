"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Repeat,
  Trophy,
  Menu,
  Map,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./sidebar"
import type { Profile } from "@/types"

const mobileItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/goals/map", icon: Map, label: "Map" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/habits", icon: Repeat, label: "Habits" },
]

interface MobileNavProps {
  profile: Profile | null
}

export function MobileNav({ profile }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-lg">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <Sidebar profile={profile} />
          </SheetContent>
        </Sheet>
        <span className="font-bold text-lg">Kaizen</span>
        <div className="w-9" />
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-around h-16">
          {mobileItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors",
                  isActive ? "text-kaizen-400" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
