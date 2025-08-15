"use client"

import type React from "react"
import { ClientSidebar } from "@/components/client/client-sidebar"
import { UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in')
        return
      }

      // Cargar datos del usuario
      fetchUserData()
    }
  }, [isSignedIn, isLoaded, router])

  const fetchUserData = async () => {
    try {
      console.log('🔧 Layout: Cargando datos del usuario...')
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Layout: Usuario obtenido:', data)
        setUserData(data)
      } else {
        console.error('❌ Layout: Error obteniendo usuario')
        router.push('/sign-in')
        return
      }
    } catch (error) {
      console.error('❌ Layout: Error fetching user data:', error)
      router.push('/sign-in')
      return
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientSidebar />
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {userData?.nombre || user?.firstName || 'Usuario'}
              </p>
            </div>
            <UserButton 
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-lg border border-gray-200",
                  userButtonPopoverActionButton: "hover:bg-gray-50",
                  userButtonPopoverActionButtonText: "text-gray-700"
                }
              }}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
