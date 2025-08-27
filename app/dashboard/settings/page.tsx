"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Instagram, Facebook, Building2, User, Clock } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { InstagramConnection } from "@/components/instagram/instagram-connection"
import { InstagramSetupHelp } from "@/components/instagram/instagram-setup-help"
import { InstagramDebug } from "@/components/instagram/instagram-debug"
import { InstagramBusinessSetup } from "@/components/instagram/instagram-business-setup"
import { InstagramPermissionsHelp } from "@/components/instagram/instagram-permissions-help"

export default function SettingsPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [userData, setUserData] = useState<any>(null)
  const [empresaData, setEmpresaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('🔧 Settings: Iniciando carga...')
      fetchUserData()
    }
  }, [isSignedIn, isLoaded])

  // Verificar si hay debug token en la URL
  const [debugToken, setDebugToken] = useState<string | undefined>()
  const [showBusinessSetup, setShowBusinessSetup] = useState(false)
  const [showPermissionsHelp, setShowPermissionsHelp] = useState(false)
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const debugTokenParam = urlParams.get('debug_token')
    const errorParam = urlParams.get('error')
    
    if (debugTokenParam) {
      setDebugToken(debugTokenParam)
    }
    
    if (errorParam === 'no_instagram_business') {
      setShowBusinessSetup(true)
    }
    
    if (errorParam === 'instagram_details_failed') {
      setShowPermissionsHelp(true)
    }
    
    // Limpiar la URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }, [])

  const fetchUserData = async () => {
    try {
      console.log('🔍 Settings: Obteniendo datos del usuario...')
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Settings: Usuario obtenido:', data)
        setUserData(data)
        
        // Si el usuario tiene una empresa asignada, obtener los datos de la empresa
        if (data.empresa_id) {
          fetchEmpresaData(data.empresa_id)
        }
      } else {
        console.error('❌ Settings: Error obteniendo usuario')
      }
    } catch (error) {
      console.error('❌ Settings: Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEmpresaData = async (empresaId: string) => {
    try {
      console.log('🔍 Settings: Obteniendo datos de la empresa...')
      const response = await fetch(`/api/empresas/${empresaId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Settings: Empresa obtenida:', data)
        setEmpresaData(data)
      } else {
        console.error('❌ Settings: Error obteniendo empresa')
      }
    } catch (error) {
      console.error('❌ Settings: Error fetching empresa data:', error)
    }
  }

  if (isLoading || !isLoaded) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tu perfil y conexiones de redes sociales</p>
      </div>

      {/* Conexiones de Instagram */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Conexiones de Instagram</h2>
            <p className="text-sm text-muted-foreground">
              Conecta tus cuentas de Instagram Business para publicar contenido
            </p>
          </div>
          <InstagramSetupHelp />
        </div>
        <InstagramConnection onConnectionChange={() => {
          // Recargar datos si es necesario
          console.log('Conexión de Instagram actualizada')
        }} />
        
        {/* Debug Component */}
        {debugToken && <InstagramDebug debugToken={debugToken} />}
        
        {/* Business Setup Component */}
        {showBusinessSetup && <InstagramBusinessSetup />}
        
        {/* Permissions Help Component */}
        {showPermissionsHelp && <InstagramPermissionsHelp />}
      </div>

      {/* Información de la Empresa */}
      {empresaData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Información de la Empresa</span>
            </CardTitle>
            <CardDescription>Información de tu empresa (solo lectura)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={empresaData.logo_url || "/placeholder-logo.png"} 
                      alt={`Logo de ${empresaData.nombre}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-logo.png"
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                    <p className="text-base font-semibold">{empresaData.nombre}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sitio Web</label>
                  <p className="text-base font-semibold">
                    {empresaData.sitio_web ? (
                      <a 
                        href={empresaData.sitio_web.startsWith('http') ? empresaData.sitio_web : `https://${empresaData.sitio_web}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {empresaData.sitio_web}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">No especificado</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                  <p className="text-base font-semibold">
                    {empresaData.descripcion || 'No especificada'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Industria</label>
                  <p className="text-base font-semibold">{empresaData.rubro || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
                  <p className="text-base font-semibold">
                    {empresaData.created_at ? 
                      new Date(empresaData.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 
                      'No especificada'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <Badge variant={empresaData.is_active ? "default" : "secondary"}>
                    {empresaData.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Perfil de Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>Perfil de Usuario</span>
          </CardTitle>
          <CardDescription>Información personal del usuario</CardDescription>
        </CardHeader>
        <CardContent>
          {userData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                  <p className="text-base font-semibold">{userData.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Apellido</label>
                  <p className="text-base font-semibold">{userData.apellido}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-base font-semibold">{userData.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                  <p className="text-base font-semibold">{userData.cargo || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                  <p className="text-base font-semibold">{userData.telefono || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rol</label>
                  <Badge variant={userData.rol === 'admin' ? "default" : "secondary"}>
                    {userData.rol === 'admin' ? 'Administrador' : 'Cliente'}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se pudieron cargar los datos del usuario</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
