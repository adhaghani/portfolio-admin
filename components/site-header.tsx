"use client"

import { SidebarIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"

function pathToTitle(pathname: string): string {
  const map: Record<string, string> = {
    blog: "Blog",
    projects: "Projects",
    education: "Education",
    activities: "Activities",
    certificates: "Certificates",
    media: "Media",
    settings: "Settings",
  }
  const segment = pathname.split("/")[2]
  return map[segment] ?? "Dashboard"
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 bg-card px-4">
      <Button
        className="h-8 w-8"
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
      >
        <SidebarIcon />
      </Button>
      <Separator orientation="vertical" className="h-full " />
      <h1 className="heading-mono text-lg">{pathToTitle(pathname)}</h1>
      <span className="ml-auto font-mono text-xs text-muted-foreground">
        {user?.email ?? ""}
      </span>
    </header>
  )
}
