"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Instagram, Plus, Trash2, Users, Image, Calendar, Facebook, ExternalLink } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { ConexionSocial } from '@/lib/types'

interface InstagramConnectionProps {
  onConnectionChange?: () => void
}

export function InstagramConnection({ onConnectionChange }: InstagramConnectionProps) {
  const { user } = useUser()
  const [connections, setConnections] = useState<ConexionSocial[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [connectingFacebook, setConnectingFacebook] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchConnections()
    
    // Verificar si hay errores en la URL
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const message = urlParams.get('message')
    
    if (error && message) {
      setError(message)
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    // Verificar si hay mensaje de éxito
    const success = urlParams.get('success')
    const successMessage = urlParams.get('message')
    
    if (success && successMessage) {
      setSuccess(successMessage)
      // Mostrar mensaje de éxito temporalmente
      setTimeout(() => {
        setSuccess(null)
      }, 5000)
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const fetchConnections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/social/connections')
      const data = await response.json()

      if (response.ok) {
        setConnections(data.connections || [])
      } else {
        setError(data.error || 'Error al cargar conexiones')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      setConnecting(true)
      setError(null)

      // Obtener URL de autorización
      const response = await fetch('/api/instagram/auth-url')
      const data = await response.json()

      if (response.ok) {
        // Redirigir a Instagram para autorización
        window.location.href = data.authUrl
      } else {
        setError(data.error || 'Error al iniciar conexión')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('¿Estás seguro de que quieres desconectar esta cuenta?')) {
      return
    }

    try {
      const response = await fetch('/api/social/connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      })

      if (response.ok) {
        setConnections(connections.filter(conn => conn.id !== connectionId))
        onConnectionChange?.()
      } else {
        const data = await response.json()
        setError(data.error || 'Error al desconectar')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleConnectFacebook = async () => {
    try {
      setConnectingFacebook(true)
      setError(null)

      // Obtener URL de autorización para Facebook
      const response = await fetch('/api/facebook/auth-url')
      const data = await response.json()

      if (response.ok) {
        // Redirigir a Facebook para autorización
        window.location.href = data.authUrl
      } else {
        setError(data.error || 'Error al iniciar conexión con Facebook')
      }
    } catch (error) {
      setError('Error de conexión con Facebook')
    } finally {
      setConnectingFacebook(false)
    }
  }

  const formatFollowers = (followers: number) => {
    if (followers >= 1000000) {
      return `${(followers / 1000000).toFixed(1)}M`
    } else if (followers >= 1000) {
      return `${(followers / 1000).toFixed(1)}K`
    }
    return followers.toString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            Conexiones de Instagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Conexiones de Instagram */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="w-5 h-5" />
                Conexiones de Instagram
              </CardTitle>
              <CardDescription>
                Gestiona tus cuentas conectadas de Instagram
              </CardDescription>
            </div>
            <Button onClick={handleConnect} disabled={connecting}>
              <Plus className="w-4 h-4 mr-2" />
              {connecting ? 'Conectando...' : 'Conectar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {connections.filter(connection => connection.plataforma === 'instagram').length === 0 ? (
            <div className="text-center py-8">
              <Instagram className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay cuentas conectadas</h3>
              <p className="text-muted-foreground mb-4">
                Conecta tu cuenta de Instagram Business para empezar a publicar contenido
              </p>
              <Button onClick={handleConnect} disabled={connecting}>
                <Plus className="w-4 h-4 mr-2" />
                {connecting ? 'Conectando...' : 'Conectar Instagram'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {connections
                .filter(connection => connection.plataforma === 'instagram')
                .map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">@{connection.nombre_cuenta}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {connection.metadata?.followers && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {formatFollowers(connection.metadata.followers)} seguidores
                          </span>
                        )}
                        {connection.metadata?.tipo_cuenta && (
                          <Badge variant="secondary" className="text-xs">
                            {connection.metadata.tipo_cuenta}
                          </Badge>
                        )}
                      </div>
                                             {/* Información de la página de Facebook asociada */}
                       {connection.metadata?.page_name && (
                         <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 text-xs text-blue-700">
                               <Facebook className="w-3 h-3" />
                               <span className="font-medium">Página de Facebook asociada:</span>
                               <span>{connection.metadata?.page_name}</span>
                             </div>
                             {connection.metadata?.page_id && (
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="text-xs h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                 onClick={() => window.open(`https://facebook.com/${connection.metadata?.page_id}`, '_blank')}
                               >
                                 Ver Página
                               </Button>
                             )}
                           </div>
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Conectado
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(connection.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {connections.filter(connection => connection.plataforma === 'instagram').length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">¿Qué puedes hacer?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Publicar imágenes con texto personalizado
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Programar publicaciones para el futuro
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Ver estadísticas de engagement
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conexiones de Facebook */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="w-5 h-5" />
                Conexiones de Facebook
              </CardTitle>
              <CardDescription>
                Gestiona tus páginas conectadas de Facebook
              </CardDescription>
            </div>
            <Button onClick={handleConnectFacebook} disabled={connectingFacebook}>
              <Plus className="w-4 h-4 mr-2" />
              {connectingFacebook ? 'Conectando...' : 'Conectar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {connections.filter(connection => connection.plataforma === 'facebook').length === 0 ? (
            <div className="text-center py-8">
              <Facebook className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay páginas conectadas</h3>
              <p className="text-muted-foreground mb-4">
                Conecta tu página de Facebook para publicar contenido también en Facebook
              </p>
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-4">
                <p className="font-medium mb-1">⚠️ Requisitos:</p>
                <ul className="space-y-1">
                  <li>• Debes tener una página de Facebook (no solo cuenta personal)</li>
                  <li>• Debes ser administrador de la página</li>
                  <li>• Si no tienes una página, créala en <a href="https://facebook.com/pages/create" target="_blank" className="underline">facebook.com/pages/create</a></li>
                </ul>
              </div>
              <Button onClick={handleConnectFacebook} disabled={connectingFacebook}>
                <Plus className="w-4 h-4 mr-2" />
                {connectingFacebook ? 'Conectando...' : 'Conectar Facebook'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {connections
                .filter(connection => connection.plataforma === 'facebook')
                .map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Facebook className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{connection.nombre_cuenta}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {connection.metadata?.page_category && (
                          <Badge variant="secondary" className="text-xs">
                            {connection.metadata.page_category}
                          </Badge>
                        )}
                                                 {connection.metadata?.page_id && (
                           <Button
                             variant="ghost"
                             size="sm"
                             className="text-xs h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                             onClick={() => window.open(`https://facebook.com/${connection.metadata?.page_id}`, '_blank')}
                           >
                             <ExternalLink className="w-3 h-3 mr-1" />
                             Ver Página
                           </Button>
                         )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Conectado
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(connection.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">¿Qué puedes hacer con Facebook?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Publicar imágenes con texto personalizado
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Programar publicaciones para el futuro
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Llegar a una audiencia más amplia
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
