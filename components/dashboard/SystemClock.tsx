"use client"

import { useEffect, useState } from "react"

export function SystemClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  const date = now.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

  return (
    <div className="text-sm text-muted-foreground cursor-default">
      {date} · {time}
    </div>
  )
}