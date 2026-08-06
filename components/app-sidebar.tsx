"use client"

import * as React from "react"
import {
  Award,
  FileText,
  FolderKanban,
  GraduationCap,
  Image,
  Settings,
  Users,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"

const navItems = [
  { title: "Blog", url: "/dashboard/blog", icon: FileText },
  { title: "Projects", url: "/dashboard/projects", icon: FolderKanban },
  { title: "Education", url: "/dashboard/education", icon: GraduationCap },
  { title: "Activities", url: "/dashboard/activities", icon: Users },
  { title: "Certificates", url: "/dashboard/certificates", icon: Award },
  { title: "Media", url: "/dashboard/media", icon: Image },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Build nav items with active state based on pathname
  const items = navItems.map((item) => ({
    ...item,
    isActive: pathname.startsWith(item.url),
  }))

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard/blog">
                <span className="font-mono text-lg font-semibold tracking-tighter">
                  adhaghani
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavSecondary items={items} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user?.email?.split("@")[0] ?? "Admin",
            email: user?.email ?? "",
          }}
          onLogout={logout}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
