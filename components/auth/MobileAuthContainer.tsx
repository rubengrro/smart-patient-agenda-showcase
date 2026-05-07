import React from 'react'
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const MobileAuthContainer = () => {
  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to continue
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input placeholder="Email" />
        <Input placeholder="Password" type="password" />
        <Button className="w-full">Continue</Button>
      </div>

      <div className="flex-1" />

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground">
        Dont have an account? Sign up
      </p>
    </div>
  );
};

export default MobileAuthContainer