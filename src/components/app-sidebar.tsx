"use client"

import * as React from "react"
import { ArchiveX, Command, File, Inbox, Send, Trash2 } from "lucide-react"
import { api } from "~/trpc/react"
import { Skeleton } from "~/components/ui/skeleton"
import { EmptyState } from "~/components/ui/empty-state"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"

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

// Memoized skeleton loader component
const SkeletonLoader = React.memo(() => (
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
))
SkeletonLoader.displayName = "SkeletonLoader"

// Memoized application item component
const ApplicationItem = React.memo(({ app }: { app: any }) => {
  const handleImageError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = "/favicon.ico";
  }, []);

  return (
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
          onError={handleImageError}
        />
        <span>{app.name}</span>
      </div>
      {app.description && (
        <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
          {app.description}
        </span>
      )}
    </a>
  )
})
ApplicationItem.displayName = "ApplicationItem"

// Memoized applications list component
const ApplicationsList = React.memo(({ 
  applications, 
  isLoading, 
  isLoadingAll 
}: { 
  applications: any[] | undefined; 
  isLoading: boolean; 
  isLoadingAll: boolean; 
}) => {
  if (isLoading || isLoadingAll) {
    return <SkeletonLoader />
  }

  if (!applications || applications.length === 0) {
    return <EmptyState title="No applications found" description="Try a different search or add a new application." />
  }

  return (
    <>
      {applications.map((app) => (
        <ApplicationItem key={app.id} app={app} />
      ))}
    </>
  )
})
ApplicationsList.displayName = "ApplicationsList"

// Memoized filter dropdown component
const FilterDropdown = React.memo(({ 
  filter, 
  onFilterChange 
}: { 
  filter: "text" | "id"; 
  onFilterChange: (filter: "text" | "id") => void; 
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        type="button"
      >
        {filter === "id" ? "ID" : "Text"}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        onSelect={() => onFilterChange("text")}
        data-state={filter === "text" ? "active" : undefined}
      >
        Text
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => onFilterChange("id")}
        data-state={filter === "id" ? "active" : undefined}
      >
        ID
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
))
FilterDropdown.displayName = "FilterDropdown"

// Memoized navigation menu component
const NavigationMenu = React.memo(({ 
  navMain, 
  activeItem, 
  onItemClick 
}: { 
  navMain: any[]; 
  activeItem: any; 
  onItemClick: (item: any) => void; 
}) => (
  <SidebarMenu>
    {navMain.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          tooltip={{
            children: item.title,
            hidden: false,
          }}
          onClick={() => onItemClick(item)}
          isActive={activeItem?.title === item.title}
          className="px-2.5 md:px-2"
        >
          <item.icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </SidebarMenu>
))
NavigationMenu.displayName = "NavigationMenu"

export const AppSidebar = React.memo(({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  // Memoize static navigation data
  const navMain = React.useMemo(() => [
    {
      title: "Applications",
      url: "#",
      icon: Inbox,
      isActive: true,
    },
  ], []);

  const [activeItem, setActiveItem] = React.useState(() => navMain[0]);
  const { setOpen } = useSidebar();

  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"text" | "id">("text");

  // Memoize API query parameters to prevent unnecessary re-renders
  const searchQueryParams = React.useMemo(() => ({ 
    query: search, 
    filter 
  }), [search, filter]);

  const {
    data: applications,
    isLoading,
  } = api.applications.search.useQuery(searchQueryParams, { 
    enabled: search.length > 0 
  });

  const {
    data: allApplications,
    isLoading: isLoadingAll,
  } = api.applications.getAll.useQuery(undefined, { 
    enabled: search.length === 0 
  });

  // Memoize the shown applications to prevent recalculation
  const shownApplications = React.useMemo(() => 
    search.length > 0 ? applications : allApplications,
    [search.length, applications, allApplications]
  );

  // Memoize event handlers
  const handleItemClick = React.useCallback((item: any) => {
    setActiveItem(item);
    setOpen(true);
  }, [setOpen]);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleFilterChange = React.useCallback((newFilter: "text" | "id") => {
    setFilter(newFilter);
  }, []);

  // Memoize user data
  const userData = React.useMemo(() => ({
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  }), []);

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
              <NavigationMenu 
                navMain={navMain} 
                activeItem={activeItem} 
                onItemClick={handleItemClick}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
      </Sidebar>

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <SidebarInput
              placeholder={filter === "id" ? "Search by ID..." : "Type to search..."}
              value={search}
              onChange={handleSearchChange}
              className="flex-1"
            />
            <FilterDropdown 
              filter={filter} 
              onFilterChange={handleFilterChange} 
            />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              <ApplicationsList 
                applications={shownApplications}
                isLoading={isLoading}
                isLoadingAll={isLoadingAll}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
})

AppSidebar.displayName = "AppSidebar"