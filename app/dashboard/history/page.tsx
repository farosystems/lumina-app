"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Instagram, Facebook, Twitter, Linkedin, Clock, Calendar, User, FileText } from "lucide-react"
import { PageTransition, StaggeredPageTransition, CardTransition, ListTransition, ListItemTransition } from "@/components/page-transition"
import { Post } from "@/lib/types"

export default function HistoryPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts')
      
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      } else {
        setError('Error cargando posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Error cargando posts')
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
        return 'bg-green-100 text-green-800'
      case 'programado':
        return 'bg-blue-100 text-blue-800'
      case 'borrador':
        return 'bg-gray-100 text-gray-800'
      case 'fallido':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Historial de Posts</h1>
              <p className="text-muted-foreground">Gestiona todo tu contenido generado</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (error) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Historial de Posts</h1>
              <p className="text-muted-foreground">Gestiona todo tu contenido generado</p>
            </div>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    )
  }

  return (
    <StaggeredPageTransition className="space-y-8">
      {/* Header */}
      <CardTransition>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Historial de Posts</h1>
            <p className="text-muted-foreground">Gestiona todo tu contenido generado</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardTransition>

      {/* Filters */}
      <CardTransition delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
            <CardDescription>Encuentra el contenido que buscas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Buscar por contenido..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                  <SelectItem value="programado">Programado</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </CardTransition>

      {/* Posts Grid */}
      <ListTransition className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 ? (
          <div className="col-span-full">
            <CardTransition>
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay posts aún</h3>
                    <p className="text-gray-500">Crea tu primer post para verlo aquí</p>
                  </div>
                </CardContent>
              </Card>
            </CardTransition>
          </div>
        ) : (
          posts.map((post, index) => (
            <ListItemTransition key={post.id}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 ${getPlatformColor(post.plataforma)} rounded-lg flex items-center justify-center`}>
                        {getPlatformIcon(post.plataforma)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold capitalize">{post.plataforma}</span>
                        <Badge variant="outline" className="text-xs mt-1 w-fit">
                          {(post.tipo || 'publicacion') === 'historia' ? '📱 Historia' : '📄 Publicación'}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={getEstadoColor(post.estado)}>
                      {post.estado}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{post.usuarios.nombre} {post.usuarios.apellido}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                    {post.imagen_url ? (
                      <>
                        <img 
                          src={post.imagen_url} 
                          alt="Post image" 
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.image-fallback');
                            if (fallback) {
                              fallback.classList.remove('hidden');
                            }
                          }}
                        />
                        <div className="image-fallback hidden absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-500" />
                            </div>
                            <p className="text-gray-500 text-sm">Imagen no disponible</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-500" />
                        </div>
                        <p className="text-gray-500 text-sm">Sin imagen</p>
                      </div>
                    )}
                  </div>
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
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    {post.fecha_programada && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Programado: {formatDate(post.fecha_programada)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </ListItemTransition>
          ))
        )}
      </ListTransition>
    </StaggeredPageTransition>
  )
}
