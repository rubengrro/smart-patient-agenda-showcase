import LandingNavbar from '@/components/root/LandingNavbar'
import React from 'react'

const LandingLayout = ({children}: {children:React.ReactNode}) => {
  return (
    <div className='flex flex-col min-h-screen'>
      <LandingNavbar />
        {children}
    </div>
  )
}

export default LandingLayout