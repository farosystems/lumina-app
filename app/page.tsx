"use client"

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [hasCheckedUser, setHasCheckedUser] = useState(false)

  useEffect(() => {
    if (isLoaded && !hasCheckedUser) {
      if (isSignedIn && user) {
        // Usuario autenticado, verificar rol y redirigir
        checkUserAndRedirect()
      } else {
        // Usuario no autenticado, redirigir a sign-in
        router.push('/sign-in')
      }
    }
  }, [isSignedIn, isLoaded, user, router, hasCheckedUser])

  const checkUserAndRedirect = async () => {
    try {
      console.log('🔍 Verificando usuario en la base de datos...')
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        const userData = await response.json()
        console.log('✅ Usuario encontrado:', userData)
        console.log('🔍 Campo rol:', userData.rol)
        console.log('🔍 Campo role:', userData.role)
        console.log('🔍 Todos los campos:', Object.keys(userData))
        
        // Verificar si es admin usando el campo correcto
        if (userData.rol === 'admin' || userData.role === 'admin') {
          console.log('🚀 Redirigiendo a /admin (usuario admin)')
          router.push('/admin')
        } else if (userData.rol === 'cliente' || userData.role === 'cliente') {
          console.log('🚀 Redirigiendo a /dashboard (usuario cliente)')
          router.push('/dashboard')
        } else {
          console.log('⚠️ Rol no reconocido:', userData.rol || userData.role)
          // Rol no reconocido, redirigir a dashboard por defecto
          router.push('/dashboard')
        }
      } else {
        console.log('❌ Usuario no encontrado en la base de datos')
        // Usuario no existe en nuestra BD, redirigir a sign-in
        router.push('/sign-in')
      }
    } catch (error) {
      console.error('❌ Error checking user:', error)
      router.push('/sign-in')
    } finally {
      setHasCheckedUser(true)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return null
}
