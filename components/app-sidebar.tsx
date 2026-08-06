"use client"

import { usePathname } from "next/navigation"
import {
  Award,
  FileText,
  FolderKanban,
  GraduationCap,
  Image,
  Settings,
  Users,
} from "lucide-react"
import {TooltipProvider} from "@/components/ui/tooltip"
import { NavMain } from "@/components/nav-main"
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

  const items = navItems.map((item) => ({
    ...item,
    isActive: pathname.startsWith(item.url),
  }))

  return (
    <Sidebar {...props}>
      <TooltipProvider>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard/blog">
                <div className="flex aspect-square size-8 items-center justify-center rounded-none bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="font-mono text-xs font-semibold">a</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-mono font-semibold tracking-tighter">
                    adhaghani
                  </span>
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    admin
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Content" items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      </TooltipProvider>
    </Sidebar>
  )
}
