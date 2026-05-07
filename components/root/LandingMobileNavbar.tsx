import React from 'react'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Menu } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'

const LandingMobileNavbar = () => {
  return (
    <div className='flex md:hidden'>
        <Sheet>
            <SheetTrigger className='cursor-pointer'>
                <Menu />
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Welcome Back</SheetTitle>
                </SheetHeader>
                <SheetDescription>
                    This is the landing navigation
                </SheetDescription>
                <div>
                    <ul>
                        <li>Links go here</li>
                    </ul>
                </div>
            <SheetFooter>
                <Link href="/log-in">
                    <Button className='w-full h-12 rounded-md cursor-pointer'>Log In</Button>
                </Link>
            </SheetFooter>
            </SheetContent>
        </Sheet>
    </div>
  )
}

export default LandingMobileNavbar