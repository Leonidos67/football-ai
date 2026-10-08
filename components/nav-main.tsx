"use client"

import { useState } from "react"
import { Plus, Minus, Search, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    action?: string
    tooltip?: string
    external?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
      tooltip?: string
      external?: boolean
    }[]
  }[]
}) {
  const pathname = usePathname();

  const handleItemClick = (e: React.MouseEvent, item: any) => {
    if (item.action === "openCommandMenu") {
      e.preventDefault();
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <SidebarGroup>
        <SidebarMenu>
          {items.map((item) => {
            const isItemActive = item.url !== '#' && pathname === item.url;
            const hasActiveSubItem = item.items?.some(subItem => pathname === subItem.url);
            const shouldBeActive = isItemActive || hasActiveSubItem;
            const [isOpen, setIsOpen] = useState(shouldBeActive || false);
            
            return (
            <Collapsible key={item.title} asChild open={isOpen} onOpenChange={setIsOpen}>
              <SidebarMenuItem>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className={`cursor-pointer group ${shouldBeActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}>
                        <item.icon />
                        <span>{item.title}</span>
                        {isOpen ? (
                          <Minus className="ml-auto transition-all duration-200" />
                        ) : (
                          <Plus className="ml-auto transition-all duration-200" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubActive = pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              {/* Если есть tooltip - оборачиваем в Tooltip */}
                              {subItem.tooltip ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <SidebarMenuSubButton 
                                      asChild 
                                      className={isSubActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}
                                    >
                                      <a 
                                        href={subItem.url}
                                        target={subItem.external ? "_blank" : undefined}
                                        rel={subItem.external ? "noopener noreferrer" : undefined}
                                      >
                                        {subItem.icon && <subItem.icon className="w-3.5 h-3.5" />}
                                        <span>{subItem.title}</span>
                                      </a>
                                    </SidebarMenuSubButton>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    {subItem.tooltip}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <SidebarMenuSubButton 
                                  asChild 
                                  className={isSubActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}
                                >
                                  <a 
                                    href={subItem.url}
                                    target={subItem.external ? "_blank" : undefined}
                                    rel={subItem.external ? "noopener noreferrer" : undefined}
                                  >
                                    {subItem.icon && <subItem.icon className="w-3.5 h-3.5" />}
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              )}
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton 
                        asChild 
                        isActive={shouldBeActive}
                        className={shouldBeActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}
                        onClick={(e) => handleItemClick(e, item)}
                      >
                        <a 
                          href={item.url}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          {item.action === "openCommandMenu" && (
                            <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Ctrl+L
                            </span>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.tooltip || item.title}
                    </TooltipContent>
                  </Tooltip>
                )}
              </SidebarMenuItem>
            </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </TooltipProvider>
  )
}