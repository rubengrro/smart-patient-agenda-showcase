"use client"

import { useMemo, useState } from "react"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import DashboardTopbar from "@/components/dashboard/DashboardTopbar"
import OnboardingCard from "@/components/onboarding/OnboardingCard"
import { DASHBOARD_TABS, DashboardTabId } from "@/lib/dashboardTabs"
import type { AppUser } from "@/types/auth"

interface DashboardShellProps {
  needsOnboarding: boolean
  clinicSlug: string | null
  user: Pick<AppUser, "name" | "email" | "role" | "image">
}

const DashboardShell = ({
  needsOnboarding,
  clinicSlug,
  user,
}: DashboardShellProps) => {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("agenda")
  const [manuallyOpened, setManuallyOpened] = useState(false)

  const isOnboardingOpen = needsOnboarding || manuallyOpened

  const ActiveComponent = useMemo(() => {
    return DASHBOARD_TABS.find((tab) => tab.id === activeTab)?.component
  }, [activeTab])

  const handleOpenOnboarding = () => setManuallyOpened(true)
  const handleCloseOnboarding = () => setManuallyOpened(false)

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <DashboardTopbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        needsOnboarding={needsOnboarding}
        onOpenOnboarding={handleOpenOnboarding}
        user={user}
        clinicSlug={clinicSlug}
      />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          needsOnboarding={needsOnboarding}
          clinicSlug={clinicSlug}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {needsOnboarding ? (
            <div className="flex min-h-[60vh] items-center justify-center rounded-xl border border-dashed bg-muted/30 p-8 text-center">
              <div className="max-w-md space-y-3">
                <h2 className="text-xl font-semibold">
                  Finish clinic setup
                </h2>

                <p className="text-sm text-muted-foreground">
                  Complete onboarding to unlock scheduling, patients, treatments,
                  staff, modules, inventory, and clinic schedule.
                </p>
              </div>
            </div>
          ) : ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div>Tab not found</div>
          )}
        </main>
      </div>

      <OnboardingCard
        open={isOnboardingOpen}
        onClose={handleCloseOnboarding}
      />
    </div>
  )
}

export default DashboardShell