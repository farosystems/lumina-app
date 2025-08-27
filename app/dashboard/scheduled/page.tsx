"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Instagram, Facebook, Twitter, Linkedin, Calendar, Clock, User, Edit, X, Play } from "lucide-react"
import { PageTransition, StaggeredPageTransition, CardTransition, ListTransition, ListItemTransition } from "@/components/page-transition"
import { Post } from "@/lib/types"
import toast from 'react-hot-toast'

export default function ScheduledPage() {
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [canceling, setCanceling] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)

  useEffect(() => {
    fetchScheduledPosts()
  }, [])

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts')
      
      if (response.ok) {
        const data = await response.json()
        // Filtrar solo los posts con estado "programado"
        const scheduledPosts = data.posts.filter((post: Post) => post.estado === 'programado')
        setScheduledPosts(scheduledPosts)
      } else {
        setError('Error cargando posts programados')
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error)
      setError('Error cargando posts programados')
    } finally {
      setLoading(false)
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

  const formatTimeUntil = (dateString: string) => {
    const now = new Date()
    const scheduledDate = new Date(dateString)
    const diff = scheduledDate.getTime() - now.getTime()
    
    if (diff < 0) {
      return 'Vencido'
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const handleCancelScheduled = async (postId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta programación? El post volverá a estado borrador.')) {
      return
    }

    setCanceling(postId)
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'borrador',
          fecha_programada: null
        }),
      })

      if (response.ok) {
        toast.success('Programación cancelada exitosamente')
        // Actualizar la lista de posts programados
        setScheduledPosts(scheduledPosts.filter(post => post.id !== postId))
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al cancelar la programación')
      }
    } catch (error) {
      console.error('Error canceling scheduled post:', error)
      toast.error('Error al cancelar la programación')
    } finally {
      setCanceling(null)
    }
  }

  const handlePublishNow = async (postId: string) => {
    if (!confirm('¿Estás seguro de que quieres publicar este post ahora? Se publicará inmediatamente en lugar de esperar la fecha programada.')) {
      return
    }

    setPublishing(postId)
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'publicado',
          fecha_publicacion: new Date().toISOString(),
          fecha_programada: null
        }),
      })

      if (response.ok) {
        toast.success('Post publicado exitosamente')
        // Actualizar la lista de posts programados
        setScheduledPosts(scheduledPosts.filter(post => post.id !== postId))
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

  const filteredScheduledPosts = scheduledPosts.filter(post =>
    post.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.contenido.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando posts programados...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Posts Programados</h1>
            <p className="text-muted-foreground">
              Gestiona tus posts programados para publicación automática
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar posts programados..."
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
              <CardTitle className="text-sm font-medium">Total Programados</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledPosts.length}</div>
              <p className="text-xs text-muted-foreground">
                Posts programados para publicación
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos 24h</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {scheduledPosts.filter(post => {
                  const scheduledDate = new Date(post.fecha_programada || '')
                  const now = new Date()
                  const diff = scheduledDate.getTime() - now.getTime()
                  return diff > 0 && diff <= 24 * 60 * 60 * 1000
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Se publicarán en las próximas 24 horas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {scheduledPosts.filter(post => {
                  const scheduledDate = new Date(post.fecha_programada || '')
                  const now = new Date()
                  const diff = scheduledDate.getTime() - now.getTime()
                  return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Se publicarán esta semana
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Posts Grid */}
        <ListTransition className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScheduledPosts.length === 0 ? (
            <div className="col-span-full">
              <CardTransition>
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'No se encontraron posts programados' : 'No hay posts programados'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm 
                          ? 'Intenta con otros términos de búsqueda'
                          : 'Programa tu primer post desde la sección "Generar Post"'
                        }
                      </p>
                      {!searchTerm && (
                        <Button asChild>
                          <a href="/dashboard/generate">Crear Post</a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CardTransition>
            </div>
          ) : (
            filteredScheduledPosts.map((post, index) => (
              <ListItemTransition key={post.id}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 ${getPlatformColor(post.plataforma)} rounded-lg flex items-center justify-center`}>
                          {getPlatformIcon(post.plataforma)}
                        </div>
                        <span className="font-semibold capitalize">{post.plataforma}</span>
                      </div>
                      <Badge className={getEstadoColor(post.estado)}>
                        {post.estado}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{post.usuarios?.nombre} {post.usuarios?.apellido}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {post.imagen_url && (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={post.imagen_url} 
                          alt="Post image" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold mb-2">
                        {post.titulo || `Post en ${post.plataforma}`}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.contenido}
                      </p>
                    </div>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.slice(0, 3).map((hashtag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {hashtag}
                          </Badge>
                        ))}
                        {post.hashtags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{post.hashtags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Programado: {formatDate(post.fecha_programada || '')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeUntil(post.fecha_programada || '')}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishNow(post.id)}
                        disabled={publishing === post.id}
                        className="flex-1"
                      >
                        {publishing === post.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        ) : (
                          <Play className="w-4 h-4 mr-1" />
                        )}
                        Publicar Ahora
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelScheduled(post.id)}
                        disabled={canceling === post.id}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        {canceling === post.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        ) : (
                          <X className="w-4 h-4" />
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

