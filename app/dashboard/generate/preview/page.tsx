"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Save, Send, Calendar, ArrowLeft, Instagram, Facebook, X, Plus } from "lucide-react"
import Link from "next/link"
import { InstagramPreview } from "@/components/generate/instagram-preview"
import { FacebookPreview } from "@/components/generate/facebook-preview"

export default function PreviewPage() {
  const [copy, setCopy] = useState(
    "☕ Descubre el sabor auténtico de Colombia en cada sorbo. Nuestro café especial tostado artesanalmente te transporta a las montañas cafeteras. ¡Solo por tiempo limitado con 20% OFF!",
  )

  const [hashtags, setHashtags] = useState([
    "#CaféPremium",
    "#Colombia",
    "#TostadoArtesanal",
    "#CafeteríaLuna",
    "#CaféEspecial",
    "#OfertaEspecial",
  ])

  const [newHashtag, setNewHashtag] = useState("")
  const [isRegenerating, setIsRegenerating] = useState({ copy: false, image: false })
  const [selectedPlatform, setSelectedPlatform] = useState("instagram")
  const [isPublishing, setIsPublishing] = useState(false)

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
    // Simulate AI regeneration
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setCopy(
      "🌟 Experimenta la magia del café colombiano premium. Cada grano seleccionado cuidadosamente para ofrecerte una experiencia única. ¡Aprovecha nuestra promoción especial del 20% de descuento!",
    )
    setIsRegenerating({ ...isRegenerating, copy: false })
  }

  const regenerateImage = async () => {
    setIsRegenerating({ ...isRegenerating, image: true })
    // Simulate AI regeneration
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRegenerating({ ...isRegenerating, image: false })
  }

  const handlePublishNow = async () => {
    setIsPublishing(true)
    try {
      console.log('🔍 Publicando post...')
      
      const postData = {
        titulo: `Post en ${getPlatformName(selectedPlatform)}`,
        contenido: copy,
        plataforma: selectedPlatform,
        hashtags: hashtags,
        imagen_url: null, // Por ahora null, se puede agregar después
        prompt_utilizado: "Generado desde la interfaz web"
      }

      console.log('📤 Enviando datos:', postData)

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Post creado exitosamente:', result)
        
        // Mostrar mensaje de éxito
        alert('¡Post creado exitosamente!')
        
        // Redirigir al historial
        window.location.href = '/dashboard/history'
      } else {
        const errorData = await response.json()
        console.error('❌ Error creando post:', errorData)
        alert(`Error creando post: ${errorData.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('❌ Error publicando post:', error)
      alert('Error publicando el post. Intenta nuevamente.')
    } finally {
      setIsPublishing(false)
    }
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
            <h1 className="text-3xl font-heading font-bold">Preview del Contenido</h1>
            <p className="text-muted-foreground">Revisa y edita tu contenido antes de publicar</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Content Editor */}
        <div className="space-y-6">
          {/* Copy Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Copy del Post</CardTitle>
                <Button variant="outline" size="sm" onClick={regenerateCopy} disabled={isRegenerating.copy}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating.copy ? "animate-spin" : ""}`} />
                  {isRegenerating.copy ? "Regenerando..." : "Regenerar"}
                </Button>
              </div>
              <CardDescription>Edita el texto de tu publicación</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={copy} onChange={(e) => setCopy(e.target.value)} rows={6} className="resize-none" />
              <p className="text-xs text-muted-foreground mt-2">{copy.length} caracteres</p>
            </CardContent>
          </Card>

          {/* Hashtags Editor */}
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
              <Button variant="outline" className="w-full bg-transparent">
                <Save className="w-4 h-4 mr-2" />
                Guardar como Borrador
              </Button>
              <Button 
                className="w-full bg-gradient-primary hover:opacity-90" 
                onClick={handlePublishNow}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Publicando...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publicar Ahora
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Calendar className="w-4 h-4 mr-2" />
                Programar Publicación
              </Button>
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
              {selectedPlatform === "instagram" ? (
                <InstagramPreview copy={copy} hashtags={hashtags.join(" ")} isRegeneratingImage={isRegenerating.image} />
              ) : (
                <FacebookPreview copy={copy} hashtags={hashtags.join(" ")} isRegeneratingImage={isRegenerating.image} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
