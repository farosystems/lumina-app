"use client"

import { useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const { signOut } = useClerk()

  const handleSignOut = () => {
    signOut(() => {
      window.location.href = '/login'
    })
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleSignOut}
      className="text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Cerrar Sesión
    </Button>
  )
}










