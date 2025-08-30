"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Instagram, Facebook, Twitter, Linkedin, Send, Trash2, Eye, Edit, FileText, User, Clock, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PageTransition, StaggeredPageTransition, CardTransition, ListTransition, ListItemTransition } from "@/components/page-transition"
import { Post } from "@/lib/types"
import toast from 'react-hot-toast'

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [publishing, setPublishing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<Post | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [connections, setConnections] = useState<any[]>([])

  useEffect(() => {
    fetchDrafts()
    fetchConnections()
  }, [])

  const fetchDrafts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts')
      
      if (response.ok) {
        const data = await response.json()
        // Filtrar solo los posts con estado "borrador"
        const draftPosts = data.posts.filter((post: Post) => post.estado === 'borrador')
        setDrafts(draftPosts)
      } else {
        setError('Error cargando borradores')
      }
    } catch (error) {
      console.error('Error fetching drafts:', error)
      setError('Error cargando borradores')
    } finally {
      setLoading(false)
    }
  }

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/social/connections')
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || [])
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }

  const getPlatformIcon = (plataforma: string) => {
    switch (plataforma) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />
      case 'facebook':
        return <Facebook className="w-4 h-4" />
      case 'twitter':
        return <Twitter className="w-4 h-4" />
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />
      default:
        return <Instagram className="w-4 h-4" />
    }
  }

  const getPlatformColor = (plataforma: string) => {
    switch (plataforma) {
      case 'instagram':
        return 'bg-gradient-to-br from-purple-500 to-pink-500'
      case 'facebook':
        return 'bg-blue-600'
      case 'twitter':
        return 'bg-blue-400'
      case 'linkedin':
        return 'bg-blue-700'
      default:
        return 'bg-gray-500'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'publicado':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'programado':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'borrador':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePublish = async (postId: string) => {
    setPublishing(postId)
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'publicado',
          fecha_publicacion: new Date().toISOString()
        }),
      })

      if (response.ok) {
        toast.success('Post publicado exitosamente')
        // Actualizar la lista de borradores
        setDrafts(drafts.filter(draft => draft.id !== postId))
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al publicar el post')
      }
    } catch (error) {
      console.error('Error publishing post:', error)
      toast.error('Error al publicar el post')
    } finally {
      setPublishing(null)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este borrador? Esta acción no se puede deshacer.')) {
      return
    }

    setDeleting(postId)
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Borrador eliminado exitosamente')
        // Actualizar la lista de borradores
        setDrafts(drafts.filter(draft => draft.id !== postId))
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al eliminar el borrador')
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
      toast.error('Error al eliminar el borrador')
    } finally {
      setDeleting(null)
    }
  }

  const filteredDrafts = drafts.filter(draft =>
    draft.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.contenido.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando borradores...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (error) {
    return (
      <CardTransition>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      </CardTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Borradores</h1>
            <p className="text-muted-foreground">
              Gestiona tus posts guardados como borradores
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar borradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Borradores</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drafts.length}</div>
              <p className="text-xs text-muted-foreground">
                Posts guardados como borrador
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instagram</CardTitle>
              <Instagram className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {drafts.filter(d => d.plataforma === 'instagram').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Borradores para Instagram
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facebook</CardTitle>
              <Facebook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {drafts.filter(d => d.plataforma === 'facebook').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Borradores para Facebook
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Drafts Grid */}
        <ListTransition className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrafts.length === 0 ? (
            <div className="col-span-full">
              <CardTransition>
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? 'No se encontraron borradores' : 'No hay borradores'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm 
                        ? 'Intenta con otros términos de búsqueda'
                        : 'Crea tu primer borrador desde la sección "Generar Post"'
                      }
                    </p>
                    {!searchTerm && (
                      <Button asChild>
                        <a href="/dashboard/generate">Crear Borrador</a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardTransition>
          </div>
        ) : (
          filteredDrafts.map((draft, index) => (
            <ListItemTransition key={draft.id}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 ${getPlatformColor(draft.plataforma)} rounded-lg flex items-center justify-center`}>
                        {getPlatformIcon(draft.plataforma)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold capitalize">{draft.plataforma}</span>
                        <Badge variant="outline" className="text-xs mt-1 w-fit">
                          {(draft.tipo || 'publicacion') === 'historia' ? '📱 Historia' : '📄 Publicación'}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={getEstadoColor(draft.estado)}>
                      {draft.estado}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{draft.usuarios?.nombre} {draft.usuarios?.apellido}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {draft.imagen_url ? (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                      <img 
                        src={draft.imagen_url} 
                        alt="Post image" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-500" />
                          </div>
                          <p className="text-gray-500 text-sm">Imagen no disponible</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-500" />
                        </div>
                        <p className="text-gray-500 text-sm">Sin imagen</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold mb-2">
                      {draft.titulo || `Post en ${draft.plataforma}`}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {draft.contenido}
                    </p>
                  </div>
                  {draft.hashtags && draft.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {draft.hashtags.slice(0, 3).map((hashtag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {hashtag}
                        </Badge>
                      ))}
                      {draft.hashtags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{draft.hashtags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(draft.created_at)}</span>
                    </div>
                    {draft.fecha_programada && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Programado: {formatDate(draft.fecha_programada)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePublish(draft.id)}
                      disabled={publishing === draft.id}
                      className="flex-1"
                    >
                      {publishing === draft.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      ) : (
                        <Send className="w-4 h-4 mr-1" />
                      )}
                      Publicar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(draft.id)}
                      disabled={deleting === draft.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deleting === draft.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ListItemTransition>
          ))
        )}
      </ListTransition>
      </div>
    </PageTransition>
  )
}
