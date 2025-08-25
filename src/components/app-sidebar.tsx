"use client"

import * as React from "react"
import { ArchiveX, Command, File, Inbox, Send, Trash2 } from "lucide-react"
import { api } from "~/trpc/react"
import { Skeleton } from "~/components/ui/skeleton"
import { EmptyState } from "~/components/ui/empty-state"

import { NavUser } from "~/components/nav-user"
import { Label } from "~/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navMain = [
    {
      title: "Applications",
      url: "#",
      icon: Inbox,
      isActive: true,
    },
  ];
  const [activeItem, setActiveItem] = React.useState(navMain[0]);
  const { setOpen } = useSidebar();

  const [search, setSearch] = React.useState("");
  const {
    data: applications,
    isLoading,
  } = api.applications.search.useQuery({ query: search }, { enabled: search.length > 0 });
  const {
    data: allApplications,
    isLoading: isLoadingAll,
  } = api.applications.getAll.useQuery(undefined, { enabled: search.length === 0 });
  const shownApplications = search.length > 0 ? applications : allApplications;

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item);
                        setOpen(true);
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={{
            name: "shadcn",
            email: "m@example.com",
            avatar: "/avatars/shadcn.jpg",
          }} />
        </SidebarFooter>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
          </div>
          <SidebarInput
            placeholder="Type to search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {(isLoading || isLoadingAll) && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-start gap-2 border-b p-4 last:border-b-0">
                      <div className="flex w-full items-center gap-2">
                        <Skeleton className="size-6 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))}
                </>
              )}
              {!isLoading && !isLoadingAll && shownApplications && shownApplications.length === 0 && (
                <EmptyState title="No applications found" description="Try a different search or add a new application." />
              )}
              {!isLoading && !isLoadingAll && shownApplications && shownApplications.map((app) => (
                <a
                  href="#"
                  key={app.id}
                  className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
                >
                  <div className="flex w-full items-center gap-2">
                    <img
                      src={`https://cdn.discordapp.com/avatars/${app.id}/${app.icon}.png?size=512`}
                      alt={app.name}
                      className="size-6 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/favicon.ico";
                      }}
                    />
                    <span>{app.name}</span>
                  </div>
                  {app.description && (
                    <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
                      {app.description}
                    </span>
                  )}
                </a>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
