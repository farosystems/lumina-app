"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Instagram, Facebook, Building2, User, Clock } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

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

      {/* Conexiones de Redes Sociales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>Conexiones de Redes Sociales</span>
          </CardTitle>
          <CardDescription>
            Conecta tus cuentas de redes sociales para publicar directamente desde Lumina
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Instagram */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">Instagram</div>
                  <div className="text-sm text-muted-foreground">@cafeteluna</div>
                  <div className="text-xs text-green-600 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Conectado hace 2 días
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Conectado
                </Badge>
                <Button variant="outline" size="sm">
                  Desconectar
                </Button>
              </div>
            </div>

            {/* Facebook */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">Facebook</div>
                  <div className="text-sm text-muted-foreground">No conectado</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Conecta tu página de Facebook
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  No conectado
                </Badge>
                <Button size="sm">
                  Conectar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
