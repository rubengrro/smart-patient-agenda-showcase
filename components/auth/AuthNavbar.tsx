import React from "react"

import Logo from "../root/Logo"
import { ModeToggle } from "../root/ModeToggle"

const AuthNavbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/75 backdrop-blur-xl backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Logo />

        <ModeToggle />
      </nav>
    </header>
  )
}

export default AuthNavbar