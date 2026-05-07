"use client"

import Logo from "../root/Logo"
import DashboardMobileNavigation from "./DashboardMobileNavigation"
import { Button } from "../ui/button"
import { ModeToggle } from "../root/ModeToggle"
import { DashboardTabId } from "@/lib/dashboardTabs"
import { DashboardUserMenu } from "./DashboardUserMenu"
import type { AppUser } from "@/types/auth"
import { SystemClock } from "./SystemClock"

interface DashboardTopbarProps {
  activeTab: DashboardTabId
  onTabChange: (tab: DashboardTabId) => void
  needsOnboarding: boolean
  onOpenOnboarding: () => void
  clinicSlug: string | null
  user: Pick<AppUser, "name" | "email" | "role" | "image">
}

const DashboardTopbar = ({
  activeTab,
  onTabChange,
  needsOnboarding,
  onOpenOnboarding,
  user,
}: DashboardTopbarProps) => {
  return (
    <header className="h-16 w-full border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
      <nav className="flex h-full items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <DashboardMobileNavigation
            activeTab={activeTab}
            onTabChange={onTabChange}
          />

          <div className="min-w-0">
            <Logo />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {needsOnboarding && (
            <Button
              type="button"
              size="sm"
              onClick={onOpenOnboarding}
              className="hidden sm:inline-flex"
            >
              Complete setup
            </Button>
          )}

          <div className="hidden lg:block">
            <SystemClock />
          </div>

          <ModeToggle />

          <div className="hidden md:flex">
            <DashboardUserMenu user={user} />
          </div>
        </div>
      </nav>
    </header>
  )
}

export default DashboardTopbar