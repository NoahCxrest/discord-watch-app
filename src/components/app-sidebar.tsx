"use client"

import { Inbox, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { useInView } from "react-intersection-observer"
import ReactMarkdown from "react-markdown"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu"
import { EmptyState } from "~/components/ui/empty-state"
import { Skeleton } from "~/components/ui/skeleton"
import { api } from "~/trpc/react"
import type { ApplicationListItem } from "~/types/application"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
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

const ApplicationItem = React.memo(({ app }: { app: ApplicationListItem }) => {
  const pathname = usePathname();
  const isActive = pathname === `/applications/${app.id}`;
  return (
    <Link
      href={`/applications/${app.id}`}
      className={
        `flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 ` +
        (isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")
      }
      prefetch={false}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="flex w-full items-center gap-2">
        <img
          src={app.icon ? `https://cdn.discordapp.com/avatars/${app.id}/${app.icon}.png?size=512` : "/0.png"}
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith("/0.png")) {
              target.src = "/0.png";
            }
          }}
          alt={app.name}
          className="size-6 rounded-full"
          width={24}
          height={24}
        />
        <span>{app.name}</span>
      </div>
      {app.description && (
        <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
          <ReactMarkdown
            components={{
              a: ({ children }) => (
                <span className="underline decoration-dotted cursor-help">{children}</span>
              ),
            }}
          >
            {app.description}
          </ReactMarkdown>
        </span>
      )}
    </Link>
  );
})
ApplicationItem.displayName = "ApplicationItem"

// Memoized applications list component
const ApplicationsList = React.memo(({ 
  applications, 
  isLoading, 
  isFetchingNextPage, 
  fetchNextPage, 
  hasNextPage 
}: { 
  applications: ApplicationListItem[] | undefined; 
  isLoading: boolean; 
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
}) => {
  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  if (isLoading) {
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
      {hasNextPage && (
        <div ref={ref} className="flex justify-center p-4">
          <Loader2 className="animate-spin size-5 text-muted-foreground" />
        </div>
      )}
    </>
  )
})
ApplicationsList.displayName = "ApplicationsList"


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

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive: boolean;
};

const NavigationMenu = React.memo(({ 
  navMain, 
  activeItem, 
  onItemClick 
}: { 
  navMain: NavItem[]; 
  activeItem: NavItem; 
  onItemClick: (item: NavItem) => void; 
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
  const navMain = React.useMemo<NavItem[]>(() => [
    {
      title: "Applications",
      url: "#",
      icon: Inbox,
      isActive: true,
    },
  ], []);

  const [activeItem] = React.useState<NavItem>(navMain[0]!);
  useSidebar();


  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"text" | "id">("text");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const searchQueryParams = React.useMemo(() => ({
    query: debouncedSearch,
    filter
  }), [debouncedSearch, filter]);

  // Infinite query for paginated applications (no search)
  const {
    data: paginatedData,
    isLoading: isLoadingPaginated,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.applications.getPaginated.useInfiniteQuery(
    {
      limit: 20,
    },
    {
      enabled: debouncedSearch.length === 0,
      getNextPageParam: (lastPage) => {
        if (!lastPage || lastPage.length < 20) return undefined;
        return lastPage[lastPage.length - 1]?.id;
      },
    }
  );

  // Query for search
  const {
    data: searchData,
    isLoading: isLoadingSearch,
  } = api.applications.search.useQuery(
    {
      query: debouncedSearch,
      filter,
    },
    {
      enabled: debouncedSearch.length > 0,
    }
  );

  // Decide which list to show
  const shownApplications: ApplicationListItem[] = React.useMemo(() => {
    if (debouncedSearch.length > 0) return (searchData as ApplicationListItem[]) ?? [];
    return (paginatedData?.pages.flat() as ApplicationListItem[]) ?? [];
  }, [debouncedSearch.length, searchData, paginatedData]);

  const isLoading = debouncedSearch.length > 0 ? isLoadingSearch : isLoadingPaginated;

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleFilterChange = React.useCallback((newFilter: "text" | "id") => {
    setFilter(newFilter);
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >

      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <SidebarInput
                ref={inputRef}
                placeholder={filter === "id" ? "Search by ID..." : "Type to search..."}
                value={search}
                onChange={handleSearchChange}
                className="pr-8"
                autoComplete="off"
              />
              {/* Loading indicator for search removed (pagination handles loading) */}
              {search && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearch("")}
                  tabIndex={0}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
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
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                hasNextPage={debouncedSearch.length > 0 ? false : hasNextPage}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
})

AppSidebar.displayName = "AppSidebar"