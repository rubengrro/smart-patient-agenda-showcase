"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  Home,
  Package,
  Settings2,
  Stethoscope,
  Users,
  Wrench,
} from "lucide-react"

import { DASHBOARD_TABS, DashboardTabId } from "@/lib/dashboardTabs"
import { authClient } from "@/lib/auth-client"

import { Button } from "../ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

interface DashboardSidebarProps {
  activeTab: DashboardTabId
  onTabChange: (tab: DashboardTabId) => void
  clinicSlug: string | null
  needsOnboarding: boolean
}

const formatClinicBrand = (slug: string | null) => {
  if (!slug) return "Clinic workspace"

  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const TAB_ICONS: Record<DashboardTabId, React.ElementType> = {
  home: Home,
  agenda: CalendarDays,
  patients: Users,
  treatments: ClipboardList,
  staff: Stethoscope,
  modules: Wrench,
  inventory: Package,
  reports: BarChart3,
  settings: Settings2,
}

const DashboardSidebar = ({
  activeTab,
  onTabChange,
  clinicSlug,
}: DashboardSidebarProps) => {
  const router = useRouter()

  const [collapsed, setCollapsed] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
  try {
    setIsLoggingOut(true)
    await fetch("/api/demo/cleanup", {
      method: "POST",
    })

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/log-in")
        },
      },
    })
  } catch (error) {
    console.error("Sign out error:", error)
  } finally {
    setIsLoggingOut(false)
  }
}

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={[
          "hidden h-full flex-col justify-between border-r border-border/60 bg-background/95 px-2 py-4 backdrop-blur transition-all duration-300 md:flex",
          collapsed ? "w-16" : "w-56",
        ].join(" ")}
      >
        <div className="space-y-4">
          <div
            className={[
              "flex items-start",
              collapsed ? "justify-center" : "justify-between gap-2",
            ].join(" ")}
          >
            {!collapsed && (
              <div className="min-w-0 flex-1 rounded-xl border bg-muted/30 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Workspace
                </p>

                <p className="truncate text-sm font-semibold text-foreground">
                  {formatClinicBrand(clinicSlug)}
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setCollapsed((current) => !current)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          <nav className="flex flex-col gap-1">
            {DASHBOARD_TABS.map((tab) => {
              const isActive = activeTab === tab.id
              const Icon = TAB_ICONS[tab.id]

              const button = (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={[
                    "flex h-10 items-center rounded-xl text-sm font-medium transition-colors",
                    collapsed ? "justify-center px-0" : "justify-start gap-3 px-3",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 shrink-0" />

                  {!collapsed && <span className="truncate">{tab.label}</span>}
                </button>
              )

              if (!collapsed) return button

              return (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right">{tab.label}</TooltipContent>
                </Tooltip>
              )
            })}
          </nav>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className={[
                "h-10 rounded-xl",
                collapsed ? "w-10 px-0" : "w-full justify-center",
              ].join(" ")}
            >
              <DoorOpen className="h-4 w-4" />

              {!collapsed && (
                <span className="ml-2">
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </span>
              )}
            </Button>
          </TooltipTrigger>

          {collapsed && (
            <TooltipContent side="right">
              {isLoggingOut ? "Logging out..." : "Log out"}
            </TooltipContent>
          )}
        </Tooltip>
      </aside>
    </TooltipProvider>
  )
}

export default DashboardSidebar