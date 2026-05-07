import AuthNavbar from '@/components/auth/AuthNavbar'
import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='min-h-screen flex flex-col'>
      
      <AuthNavbar />

      <main className='flex-1 flex items-center justify-center'>
        {children}
      </main>

    </div>
  )
}

export default AuthLayout