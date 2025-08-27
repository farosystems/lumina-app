"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Instagram, Send, Image as ImageIcon, Calendar, Users, Loader2 } from 'lucide-react'
import { ConexionSocial } from '@/lib/types'

interface InstagramPublisherProps {
  postId?: string
  initialContent?: string
  initialImageUrl?: string
  onPublishSuccess?: (result: any) => void
}

export function InstagramPublisher({ 
  postId, 
  initialContent = '', 
  initialImageUrl = '',
  onPublishSuccess 
}: InstagramPublisherProps) {
  const [connections, setConnections] = useState<ConexionSocial[]>([])
  const [selectedConnection, setSelectedConnection] = useState<string>('')
  const [content, setContent] = useState(initialContent)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [scheduledTime, setScheduledTime] = useState('')
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/instagram/connections')
      const data = await response.json()

      if (response.ok) {
        setConnections(data.connections || [])
        if (data.connections?.length > 0) {
          setSelectedConnection(data.connections[0].id)
        }
      } else {
        setError(data.error || 'Error al cargar conexiones')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!selectedConnection) {
      setError('Selecciona una cuenta de Instagram')
      return
    }

    if (!content.trim()) {
      setError('El contenido es requerido')
      return
    }

    try {
      setPublishing(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: selectedConnection,
          caption: content,
          imageUrl: imageUrl || undefined,
          scheduledTime: scheduledTime || undefined,
          postId
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Contenido publicado exitosamente en Instagram')
        onPublishSuccess?.(data)
        setIsDialogOpen(false)
        // Limpiar formulario
        setContent('')
        setImageUrl('')
        setScheduledTime('')
      } else {
        setError(data.error || 'Error al publicar')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setPublishing(false)
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
            Publicar en Instagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            Publicar en Instagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Instagram className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay cuentas conectadas</h3>
            <p className="text-muted-foreground mb-4">
              Conecta tu cuenta de Instagram Business para publicar contenido
            </p>
            <Button onClick={() => window.location.href = '/dashboard/settings'}>
              Conectar Instagram
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Instagram className="w-4 h-4 mr-2" />
          Publicar en Instagram
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            Publicar en Instagram
          </DialogTitle>
          <DialogDescription>
            Publica tu contenido directamente en Instagram
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Selección de cuenta */}
          <div>
            <Label htmlFor="account">Cuenta de Instagram</Label>
            <select
              id="account"
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              {connections.map((connection) => (
                <option key={connection.id} value={connection.id}>
                  @{connection.nombre_cuenta} 
                  {connection.metadata?.followers && ` (${formatFollowers(connection.metadata.followers)} seguidores)`}
                </option>
              ))}
            </select>
          </div>

          {/* Contenido */}
          <div>
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu caption para Instagram..."
              className="mt-1"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/2200 caracteres
            </p>
          </div>

          {/* URL de imagen */}
          <div>
            <Label htmlFor="imageUrl">URL de imagen (opcional)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setImageUrl('')}
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Programación */}
          <div>
            <Label htmlFor="scheduledTime">Programar publicación (opcional)</Label>
            <Input
              id="scheduledTime"
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Vista previa */}
          {selectedConnection && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-2">Vista previa</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Cuenta:</strong> @{connections.find(c => c.id === selectedConnection)?.nombre_cuenta}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Contenido:</strong> {content || 'Sin contenido'}
                </p>
                {imageUrl && (
                  <p className="text-sm text-gray-600">
                    <strong>Imagen:</strong> Sí
                  </p>
                )}
                {scheduledTime && (
                  <p className="text-sm text-gray-600">
                    <strong>Programado para:</strong> {new Date(scheduledTime).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={publishing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishing || !selectedConnection || !content.trim()}
            >
              {publishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publicar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
