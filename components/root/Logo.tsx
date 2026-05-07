"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"

const Logo = () => {
  const { resolvedTheme } = useTheme()
  const logoSrc =
    resolvedTheme === "dark"
      ? "/logo.png"
      : "/lightLogo.png"

  return (
    <div>
      <Link
        href="/dashboard"
        className="flex flex-row items-center gap-2"
      >
        <Image
          src={logoSrc}
          alt="Smart Patient Agenda logo"
          width={40}
          height={40}
          priority
          className="h-auto w-auto"
        />

        <div className="flex flex-row items-center">
          <h2 className="text-sm font-light">
            Smart
          </h2>

          <span className="font-semibold">
            Agenda.
          </span>
        </div>
      </Link>
    </div>
  )
}

export default Logo