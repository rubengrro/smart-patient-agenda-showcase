"use client"

import { Copy } from "lucide-react"
import { Button } from "./button"
import { toast } from "sonner"

export default function CopyField({
  value,
  fallback = "-",
}: {
  value?: string | null
  fallback?: string
}) {
  const handleCopy = async () => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Failed to copy")
    }
  }

  if (!value) {
    return (
      <span className="text-sm text-muted-foreground">
        {fallback}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="max-w-45 truncate">
        {value}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}