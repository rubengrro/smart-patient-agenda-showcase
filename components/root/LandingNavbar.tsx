import React from 'react'
import LandingMobileNavbar from './LandingMobileNavbar'
import Logo from './Logo'
import { ModeToggle } from './ModeToggle'
import { Button } from '../ui/button'
import Link from 'next/link'

const LandingNavbar = () => {
  return (
    <div className='w-full p-4'>
        <nav className='flex flex-row justify-between items-cente'>
            <Logo />
            <div className='hidden md:flex'>Links</div>
            <div className='flex flex-row gap-4'>
                <div className='flex flex-row gap-6 items-center'>
                    <ModeToggle />
                    <LandingMobileNavbar />
                </div>
                <Link href="/log-in">
                    <Button className='hidden md:flex w-24 h-10 rounded-full bg-emerald-600'>Log In</Button>
                </Link>
            </div>
        </nav>
    </div>
  )
}

export default LandingNavbar