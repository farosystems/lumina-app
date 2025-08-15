"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { UserButton } from "@clerk/nextjs"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in')
        return
      }

      // Verificar rol del usuario
      checkUserRole()
    }
  }, [isSignedIn, isLoaded, router])

  const checkUserRole = async () => {
    try {
      console.log('🔍 Admin Layout: Verificando rol del usuario...')
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Admin Layout: Usuario obtenido:', data)
        setUserData(data)

        // Verificar que el usuario sea admin usando el campo correcto
        if (data.rol !== 'admin') {
          console.log('❌ Admin Layout: Usuario no es admin, redirigiendo...')
          if (data.rol === 'cliente') {
            router.push('/dashboard')
          } else {
            router.push('/sign-in')
          }
          return
        }

        console.log('✅ Admin Layout: Usuario es admin, continuando...')
      } else {
        console.log('❌ Admin Layout: Usuario no encontrado en la base de datos')
        router.push('/sign-in')
        return
      }
    } catch (error) {
      console.error('❌ Admin Layout: Error checking user role:', error)
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
          <p className="mt-4 text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-heading font-bold">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {userData?.nombre || 'Administrador'}
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
