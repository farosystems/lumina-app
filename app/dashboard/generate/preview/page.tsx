"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RefreshCw, Save, Send, Calendar, ArrowLeft, Instagram, Facebook, X, Plus, Clock } from "lucide-react"
import Link from "next/link"
import { InstagramPreview } from "@/components/generate/instagram-preview"
import { FacebookPreview } from "@/components/generate/facebook-preview"
import { StoryPreview } from "@/components/generate/story-preview"
import toast from 'react-hot-toast'

export default function PreviewPage() {
  const [copy, setCopy] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [storageInfo, setStorageInfo] = useState<{
    storage_file_name: string | null;
    is_permanent_image: boolean;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [regenerationCount, setRegenerationCount] = useState(0)
  const [instagramAccount, setInstagramAccount] = useState<any>(null)
  const [isStory, setIsStory] = useState(false)

  // Cargar contenido generado desde localStorage
  useEffect(() => {
    const generatedContent = localStorage.getItem('generatedContent')
    if (generatedContent) {
      try {
        const content = JSON.parse(generatedContent)
        console.log('📄 Contenido cargado:', content)
        
        setCopy(content.copy || "")
        setHashtags(content.hashtags || [])
        setImageUrl(content.imageUrl || null)
        setStorageInfo(content.storageInfo || null)
        setRegenerationCount(content.regenerationCount || 0)
        setIsStory(content.formData?.isStory || false)
      } catch (error) {
        console.error('❌ Error cargando contenido generado:', error)
        // Fallback content
        setCopy("☕ Descubre el sabor auténtico de Colombia en cada sorbo. Nuestro café especial tostado artesanalmente te transporta a las montañas cafeteras. ¡Solo por tiempo limitado con 20% OFF!")
        setHashtags(["#CaféPremium", "#Colombia", "#TostadoArtesanal", "#CafeteríaLuna", "#CaféEspecial", "#OfertaEspecial"])
      }
    } else {
      // Fallback content si no hay contenido generado
      setCopy("☕ Descubre el sabor auténtico de Colombia en cada sorbo. Nuestro café especial tostado artesanalmente te transporta a las montañas cafeteras. ¡Solo por tiempo limitado con 20% OFF!")
      setHashtags(["#CaféPremium", "#Colombia", "#TostadoArtesanal", "#CafeteríaLuna", "#CaféEspecial", "#OfertaEspecial"])
    }
    
    setIsLoading(false)
  }, [])

  // Cargar información de la cuenta de Instagram conectada
  useEffect(() => {
    const fetchInstagramAccount = async () => {
      try {
        const response = await fetch('/api/instagram/connections')
        if (response.ok) {
          const data = await response.json()
          if (data.connections && data.connections.length > 0) {
            const connection = data.connections[0] // Usar la primera conexión
            console.log('📸 Cuenta de Instagram cargada:', connection)
            setInstagramAccount({
              username: connection.nombre_cuenta,
              name: connection.metadata?.name || connection.nombre_cuenta,
              profile_picture_url: connection.metadata?.profile_picture_url,
              followers_count: connection.metadata?.followers_count
            })
          }
        }
      } catch (error) {
        console.error('❌ Error cargando cuenta de Instagram:', error)
      }
    }

    fetchInstagramAccount()
  }, [])

  const [newHashtag, setNewHashtag] = useState("")
  const [isRegenerating, setIsRegenerating] = useState({ copy: false, image: false })
  const [selectedPlatform, setSelectedPlatform] = useState("instagram")
  const [isPublishing, setIsPublishing] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      setHashtags([...hashtags, newHashtag.trim()])
      setNewHashtag("")
    }
  }

  const removeHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index))
  }

  const regenerateCopy = async () => {
    setIsRegenerating({ ...isRegenerating, copy: true })
    
    try {
      // Obtener los datos originales del formulario
      const generatedContent = localStorage.getItem('generatedContent')
      if (!generatedContent) {
        toast.error('No se encontraron datos para regenerar')
        return
      }
      
      const content = JSON.parse(generatedContent)
      
      // Verificar límite de regeneraciones
      if (regenerationCount >= 3) {
        alert('Has alcanzado el límite máximo de 3 regeneraciones para el copy.')
        return
      }

      // Llamar a la API de generación nuevamente
      const response = await fetch('/api/generate/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          formData: content.formData,
          regenerationCount: regenerationCount
        }),
      })

      if (response.ok) {
        const newContent = await response.json()
        setCopy(newContent.copy)
        setHashtags(newContent.hashtags || [])
        setRegenerationCount(newContent.regenerationCount || 0)
        
        // Actualizar localStorage
        localStorage.setItem('generatedContent', JSON.stringify(newContent))
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al regenerar el copy')
      }
    } catch (error) {
      console.error('❌ Error regenerando copy:', error)
      toast.error('Error al regenerar el copy')
    } finally {
      setIsRegenerating({ ...isRegenerating, copy: false })
    }
  }

  const regenerateImage = async () => {
    setIsRegenerating({ ...isRegenerating, image: true })
    
    try {
      // Obtener los datos originales del formulario
      const generatedContent = localStorage.getItem('generatedContent')
      if (!generatedContent) {
        toast.error('No se encontraron datos para regenerar')
        return
      }
      
      const content = JSON.parse(generatedContent)
      
      // Llamar a la API de generación nuevamente
      const response = await fetch('/api/generate/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData: content.formData }),
      })

      if (response.ok) {
        const newContent = await response.json()
        setImageUrl(newContent.imageUrl)
        
        // Actualizar localStorage
        const updatedContent = { ...content, imageUrl: newContent.imageUrl }
        localStorage.setItem('generatedContent', JSON.stringify(updatedContent))
      } else {
        toast.error('Error al regenerar la imagen')
      }
    } catch (error) {
      console.error('❌ Error regenerando imagen:', error)
      toast.error('Error al regenerar la imagen')
    } finally {
      setIsRegenerating({ ...isRegenerating, image: false })
    }
  }

  const handleSaveDraft = async () => {
    setIsPublishing(true)
    
    // Mostrar toast de loading
    const loadingToast = toast.loading('Guardando como borrador...', {
      duration: Infinity,
    })
    
    try {
      console.log('💾 Guardando como borrador...')
      
      // Verificar que tenemos contenido para guardar
      if (isStory) {
        // Para historias, solo se requiere imagen
        if (!imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas una imagen para guardar la historia.')
          return
        }
      } else {
        // Para publicaciones, se requiere copy e imagen
        if (!copy || !imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas contenido (copy) e imagen para guardar.')
          return
        }
      }

      // Crear el post en la base de datos con estado "borrador"
      const postData = {
        titulo: `${isStory ? 'Historia' : 'Post'} en ${selectedPlatform} - ${new Date().toLocaleDateString()}`,
        contenido: copy,
        plataforma: selectedPlatform,
        tipo: isStory ? 'historia' : 'publicacion',
        hashtags: hashtags,
        imagen_url: imageUrl,
        prompt_utilizado: "Generado con IA desde la interfaz web",
        storage_file_name: storageInfo?.storage_file_name || null,
        is_permanent_image: storageInfo?.is_permanent_image || false
      }

      console.log('💾 Guardando post como borrador en base de datos...')
      const postResponse = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })

      if (!postResponse.ok) {
        const errorData = await postResponse.json()
        throw new Error(`Error guardando borrador: ${errorData.error || 'Error desconocido'}`)
      }

      const postResult = await postResponse.json()
      console.log('✅ Borrador guardado en BD:', postResult.id)
      
      // Dismissar el toast de loading
      toast.dismiss(loadingToast)
      
      // Mostrar mensaje de éxito
      toast.success(`¡${isStory ? 'Historia' : 'Borrador'} guardado exitosamente! 📝`, {
        duration: 4000,
        icon: '💾',
      })
      
      // Pequeña pausa para que el usuario vea el toast
      setTimeout(() => {
        window.location.href = '/dashboard/drafts'
      }, 1500)

    } catch (error) {
      console.error('❌ Error guardando borrador:', error)
      
      // Dismissar el toast de loading
      toast.dismiss(loadingToast)
      
      toast.error(`Error guardando el borrador: ${error instanceof Error ? error.message : 'Error desconocido'}`, {
        duration: 6000,
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handlePublishNow = async () => {
    setIsPublishing(true)
    
    // Mostrar toast de loading
    const loadingToast = toast.loading('Publicando en Instagram...', {
      duration: Infinity,
    })
    
    try {
      console.log('🚀 Iniciando publicación en Instagram...')
      
      // Verificar que tenemos una cuenta de Instagram conectada
      if (!instagramAccount) {
        toast.dismiss(loadingToast)
        toast.error('No hay cuenta de Instagram conectada. Ve a Configuración para conectar tu cuenta.')
        return
      }

      // Verificar que tenemos contenido para publicar
      if (isStory) {
        // Para historias, solo se requiere imagen
        if (!imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas una imagen para publicar la historia.')
          return
        }
      } else {
        // Para publicaciones, se requiere copy e imagen
        if (!copy || !imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas contenido (copy) e imagen para publicar.')
          return
        }
      }

      // Primero, crear el post en la base de datos con estado "borrador"
      const postData = {
        titulo: `${isStory ? 'Historia' : 'Post'} en Instagram - ${new Date().toLocaleDateString()}`,
        contenido: copy,
        plataforma: 'instagram',
        tipo: isStory ? 'historia' : 'publicacion',
        hashtags: hashtags,
        imagen_url: imageUrl,
        prompt_utilizado: "Generado con IA desde la interfaz web"
      }

      console.log('💾 Guardando post en base de datos...')
      const postResponse = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })

      if (!postResponse.ok) {
        const errorData = await postResponse.json()
        throw new Error(`Error guardando post: ${errorData.error || 'Error desconocido'}`)
      }

      const postResult = await postResponse.json()
      console.log('✅ Post guardado en BD:', postResult.id)

      // Obtener la conexión de Instagram
      console.log('🔍 Obteniendo conexión de Instagram...')
      const connectionsResponse = await fetch('/api/instagram/connections')
      if (!connectionsResponse.ok) {
        throw new Error('Error obteniendo conexiones de Instagram')
      }

      const connectionsData = await connectionsResponse.json()
      if (!connectionsData.connections || connectionsData.connections.length === 0) {
        throw new Error('No se encontraron conexiones de Instagram activas')
      }

      const connection = connectionsData.connections[0]
      console.log('📸 Usando conexión:', connection.nombre_cuenta)

      // Publicar en Instagram
      console.log('📤 Publicando en Instagram...')
      const publishData = {
        connectionId: connection.id,
        caption: `${copy}\n\n${hashtags.join(' ')}`,
        imageUrl: imageUrl,
        postId: postResult.id
      }

      const publishResponse = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishData)
      })

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json()
        throw new Error(`Error publicando en Instagram: ${errorData.error || errorData.details || 'Error desconocido'}`)
      }

      const publishResult = await publishResponse.json()
      console.log('🎉 ¡Publicado exitosamente en Instagram!', publishResult)

      // Actualizar el estado del post a "publicado"
      console.log('🔄 Actualizando estado del post a "publicado"...')
      const updateResponse = await fetch(`/api/posts/${postResult.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'publicado',
          fecha_publicacion: new Date().toISOString()
        })
      })

      if (!updateResponse.ok) {
        console.warn('⚠️ No se pudo actualizar el estado del post, pero se publicó en Instagram')
      } else {
        console.log('✅ Estado del post actualizado a "publicado"')
      }
      
      // Dismissar el toast de loading
      toast.dismiss(loadingToast)
      
      // Mostrar mensaje de éxito
      toast.success(`¡${isStory ? 'Historia' : 'Post'} publicado exitosamente en Instagram! 🎉`, {
        duration: 4000,
        icon: '📸',
      })
      
      // Pequeña pausa para que el usuario vea el toast
      setTimeout(() => {
        window.location.href = '/dashboard/history'
      }, 1500)

    } catch (error) {
      console.error('❌ Error publicando:', error)
      
      // Dismissar el toast de loading
      toast.dismiss(loadingToast)
      
      toast.error(`Error publicando el post: ${error instanceof Error ? error.message : 'Error desconocido'}`, {
        duration: 6000,
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSchedulePost = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Por favor selecciona una fecha y hora para programar el post')
      return
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    const now = new Date()

    if (scheduledDateTime <= now) {
      toast.error('La fecha y hora programada debe ser futura')
      return
    }

    setIsPublishing(true)
    const loadingToast = toast.loading('Programando post...', { duration: Infinity })
    
    try {
      // Verificar que tenemos contenido para programar
      if (isStory) {
        // Para historias, solo se requiere imagen
        if (!imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas una imagen para programar la historia.')
          return
        }
      } else {
        // Para publicaciones, se requiere copy e imagen
        if (!copy || !imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas contenido (copy) e imagen para programar.')
          return
        }
      }

      // Create post in DB with 'programado' status
      const postData = {
        titulo: `${isStory ? 'Historia' : 'Post'} programado en ${selectedPlatform} - ${scheduledDate}`,
        contenido: copy,
        plataforma: selectedPlatform,
        tipo: isStory ? 'historia' : 'publicacion',
        hashtags: hashtags,
        imagen_url: imageUrl,
        prompt_utilizado: "Generado con IA desde la interfaz web",
        storage_file_name: storageInfo?.storage_file_name || null,
        is_permanent_image: storageInfo?.is_permanent_image || false,
        estado: 'programado',
        fecha_programada: scheduledDateTime.toISOString()
      }

      const postResponse = await fetch('/api/posts', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(postData) 
      })

      if (!postResponse.ok) {
        const errorData = await postResponse.json()
        throw new Error(`Error programando post: ${errorData.error || 'Error desconocido'}`)
      }

      const postResult = await postResponse.json()

      toast.dismiss(loadingToast)
      toast.success(`¡${isStory ? 'Historia' : 'Post'} programado exitosamente para ${formatScheduledDate(scheduledDateTime)}! 📅`, { 
        duration: 4000, 
        icon: '⏰' 
      })
      
      setShowScheduleDialog(false)
      setScheduledDate('')
      setScheduledTime('')
      
      setTimeout(() => { window.location.href = '/dashboard/scheduled' }, 1500)
    } catch (error) {
      console.error('❌ Error programando post:', error)
      toast.dismiss(loadingToast)
      toast.error(`Error programando el post: ${error instanceof Error ? error.message : 'Error desconocido'}`, { duration: 6000 })
    } finally {
      setIsPublishing(false)
    }
  }

  const formatScheduledDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="w-4 h-4" />
      case "facebook":
        return <Facebook className="w-4 h-4" />
      default:
        return <Instagram className="w-4 h-4" />
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "Instagram"
      case "facebook":
        return "Facebook"
      default:
        return "Instagram"
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "bg-gradient-to-br from-purple-500 to-pink-500"
      case "facebook":
        return "bg-blue-600"
      default:
        return "bg-gradient-to-br from-purple-500 to-pink-500"
    }
  }

  // Mostrar loading mientras carga el contenido
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando contenido generado...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/generate">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold">
              {isStory ? "Preview de la Historia" : "Preview del Contenido"}
            </h1>
            <p className="text-muted-foreground">
              {isStory 
                ? "Revisa y edita tu historia antes de publicar" 
                : "Revisa y edita tu contenido antes de publicar"
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Content Editor */}
        <div className="space-y-6">
          {/* Copy Editor - Solo para publicaciones */}
          {!isStory && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Copy del Post</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={regenerateCopy} 
                    disabled={isRegenerating.copy || regenerationCount >= 3}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating.copy ? "animate-spin" : ""}`} />
                    {isRegenerating.copy ? "Regenerando..." : `Regenerar (${3 - regenerationCount} restantes)`}
                  </Button>
                </div>
                <CardDescription>Edita el texto de tu publicación</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea value={copy} onChange={(e) => setCopy(e.target.value)} rows={6} className="resize-none" />
                <p className="text-xs text-muted-foreground mt-2">{copy.length} caracteres</p>
              </CardContent>
            </Card>
          )}

          {/* Hashtags Editor - Solo para publicaciones */}
          {!isStory && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hashtags</CardTitle>
                <CardDescription>Gestiona los hashtags de tu publicación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar hashtag..."
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addHashtag()}
                  />
                  <Button type="button" variant="outline" onClick={addHashtag} disabled={!newHashtag.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {hashtag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 w-4 h-4"
                        onClick={() => removeHashtag(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imagen</CardTitle>
              <CardDescription>Controla la imagen de tu publicación</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={regenerateImage}
                disabled={isRegenerating.image}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating.image ? "animate-spin" : ""}`} />
                {isRegenerating.image ? "Regenerando Imagen..." : "Regenerar Imagen"}
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones</CardTitle>
              <CardDescription>¿Qué quieres hacer con tu contenido?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full bg-transparent"
                onClick={handleSaveDraft}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Guardando...</span>
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isStory ? "Guardar como Borrador" : "Guardar como Borrador"}
                  </>
                )}
              </Button>
              <Button 
                className="w-full bg-gradient-primary hover:opacity-90" 
                onClick={handlePublishNow}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isStory ? "Publicando Historia..." : "Publicando..."}</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {isStory ? "Publicar Historia" : "Publicar Ahora"}
                  </>
                )}
              </Button>
              <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Calendar className="w-4 h-4 mr-2" />
                    {isStory ? "Programar Historia" : "Programar Publicación"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{isStory ? "Programar Historia" : "Programar Publicación"}</DialogTitle>
                    <DialogDescription>
                      {isStory 
                        ? "Selecciona la fecha y hora en la que quieres que se publique tu historia automáticamente."
                        : "Selecciona la fecha y hora en la que quieres que se publique tu post automáticamente."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Fecha
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="time" className="text-right">
                        Hora
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    {scheduledDate && scheduledTime && (
                      <div className="text-sm text-muted-foreground text-center">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Programado para: {formatScheduledDate(new Date(`${scheduledDate}T${scheduledTime}`))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSchedulePost}
                      disabled={!scheduledDate || !scheduledTime || isPublishing}
                    >
                      {isPublishing ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          <span>Programando...</span>
                        </div>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Programar
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Social Media Preview */}
        <div className="space-y-6">
          {/* Platform Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview de Red Social</CardTitle>
              <CardDescription>Selecciona la plataforma para ver cómo se verá tu publicación</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                        <Instagram className="w-3 h-3 text-white" />
                      </div>
                      <span>Instagram</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="facebook">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                        <Facebook className="w-3 h-3 text-white" />
                      </div>
                      <span>Facebook</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="min-h-[600px]">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 ${getPlatformColor(selectedPlatform)} rounded-lg flex items-center justify-center`}>
                  {getPlatformIcon(selectedPlatform)}
                </div>
                <h3 className="text-lg font-semibold">{getPlatformName(selectedPlatform)}</h3>
              </div>
            </CardHeader>
            <CardContent>
              {isStory ? (
                <StoryPreview 
                  imageUrl={imageUrl}
                  isRegeneratingImage={isRegenerating.image}
                  platform={selectedPlatform as "instagram" | "facebook"}
                />
              ) : selectedPlatform === "instagram" ? (
                <InstagramPreview 
                  copy={copy} 
                  hashtags={hashtags.join(" ")} 
                  isRegeneratingImage={isRegenerating.image}
                  imageUrl={imageUrl}
                  instagramAccount={instagramAccount}
                />
              ) : (
                <FacebookPreview 
                  copy={copy} 
                  hashtags={hashtags.join(" ")} 
                  isRegeneratingImage={isRegenerating.image}
                  imageUrl={imageUrl}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
