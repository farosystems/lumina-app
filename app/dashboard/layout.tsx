"use client"

import type React from "react"
import { ClientSidebar } from "@/components/client/client-sidebar"
import { UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { PaymentRequired } from "@/components/payment-required"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessCheck, setAccessCheck] = useState<any>(null)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in')
        return
      }

      // Verificar acceso del usuario
      checkUserAccess()
    }
  }, [isSignedIn, isLoaded, router])

  const checkUserAccess = async () => {
    try {
      setIsCheckingAccess(true)
      const response = await fetch('/api/auth/check-access')
      
      if (response.ok) {
        const data = await response.json()
        setAccessCheck(data)
        
        if (data.hasAccess) {
          // Si tiene acceso, cargar datos del usuario
          fetchUserData()
        }
      } else {
        console.error('Error verificando acceso')
        router.push('/sign-in')
      }
    } catch (error) {
      console.error('Error en checkUserAccess:', error)
      router.push('/sign-in')
    } finally {
      setIsCheckingAccess(false)
    }
  }

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

  // Mostrar loading mientras se verifica el acceso
  if (isCheckingAccess || !isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Mostrar pantalla de pago requerido si no tiene acceso
  if (accessCheck && !accessCheck.hasAccess) {
    return (
      <PaymentRequired 
        empresaNombre={accessCheck.empresa?.nombre || 'Empresa'}
        reason={accessCheck.reason}
      />
    )
  }

  // Mostrar loading mientras se cargan los datos del usuario
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando dashboard...</p>
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
