"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MenuIcon } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"
import { Button } from "../ui/button"
import Logo from "../root/Logo"

import { DASHBOARD_TABS, DashboardTabId } from "@/lib/dashboardTabs"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

interface DashboardMobileNavigationProps {
  activeTab: DashboardTabId
  onTabChange: (tab: DashboardTabId) => void
}

const DashboardMobileNavigation = ({
  activeTab,
  onTabChange,
}: DashboardMobileNavigationProps) => {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleTabClick = (tabId: DashboardTabId) => {
    onTabChange(tabId)
    setOpen(false)
  }

  const handleSignOut = async () => {
  try {
    setIsLoggingOut(true)
    await fetch("/api/demo/cleanup", {
      method: "POST",
    })

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setOpen(false)
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
    <div className="flex md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open dashboard navigation"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-background transition-colors hover:bg-muted"
          >
            <MenuIcon className="size-4" />
          </button>
        </SheetTrigger>

        <SheetContent
          showCloseButton={false}
          side="left"
          className="w-70 border-r border-border/60 p-0"
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-border/60 px-4 py-4 text-left">
              <SheetTitle>
                <Logo />
              </SheetTitle>

              <SheetDescription className="sr-only">
                Dashboard navigation menu
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
              {DASHBOARD_TABS.map((tab) => {
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>

            <SheetFooter className="border-t border-border/60 p-3">
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full justify-start"
                disabled={isLoggingOut}
                onClick={handleSignOut}
              >
                {isLoggingOut ? "Logging out..." : "Log out"}
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default DashboardMobileNavigation