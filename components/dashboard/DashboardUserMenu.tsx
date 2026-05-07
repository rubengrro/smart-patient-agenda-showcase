import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "../ui/badge"
import type { AppUser } from "@/types/auth"

interface DashboardUserMenuProps {
  user?: Pick<AppUser, "name" | "email" | "role" | "image">
}

export function DashboardUserMenu({ user }: DashboardUserMenuProps) {
  if (!user) {
    return (
      <div className="rounded-lg border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground">
        No user
      </div>
    )
  }

  const safeName = user.name ?? "User"
  const safeEmail = user.email ?? "No email"
  const safeRole = user.role ?? "STAFF"

  const fallback = safeName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return (
    <button
      type="button"
      className="flex max-w-55 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/70 sm:max-w-none sm:gap-3 sm:px-3 sm:py-2"
    >
      <Avatar className="size-8 ring-1 ring-border sm:size-9">
        <AvatarImage src={user.image ?? undefined} alt={safeName} />
        <AvatarFallback className="text-xs">
          {fallback || "U"}
        </AvatarFallback>
        <AvatarBadge className="size-2.5 border-background bg-emerald-500 dark:bg-emerald-500" />
      </Avatar>

      <div className="hidden min-w-0 text-left sm:flex sm:flex-col">
        <span className="truncate text-sm font-medium leading-none">
          {safeName}
        </span>

        <div className="mt-1 flex min-w-0 items-center gap-2">
          <span className="max-w-35 truncate text-xs text-muted-foreground lg:max-w-45">
            {safeEmail}
          </span>

          <Badge
            variant="secondary"
            className="shrink-0 px-1.5 py-0 text-[10px] font-medium"
          >
            {safeRole}
          </Badge>
        </div>
      </div>
    </button>
  )
}