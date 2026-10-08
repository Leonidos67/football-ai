"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import {
  Brain,
  Settings,
  Volleyball,
} from "lucide-react"

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onLogout: () => void;
}

export function AppSidebar({ user, onLogout, ...props }: AppSidebarProps) {
  const params = useParams();
  const projectId = params?.id as string;

  const userData = {
    name: user.name,
    email: user.email,
    avatar: "/avatars/shadcn.jpg",
  };

  const navMainData = [
    {
      title: "Chat",
      url: "/chat",
      icon: Brain,
    },
    {
      title: "AI Settings",
      url: "/trading/ai-settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/app">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#e72930] text-white shadow-sm shadow-[#e72930]/30">
                  <Volleyball className="size-5" strokeWidth={2.2} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold tracking-tight">Pelada</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter>
        <div>
          <NavUser user={userData} />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}