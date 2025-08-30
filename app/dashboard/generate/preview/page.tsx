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
import { RefreshCw, Save, Send, Calendar, ArrowLeft, Instagram, Facebook, X, Plus, Clock, ChevronLeft, ChevronRight } from "lucide-react"
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
  
  // Historial de regeneraciones
  const [copyHistory, setCopyHistory] = useState<Array<{
    id: string;
    copy: string;
    hashtags: string[];
    timestamp: Date;
  }>>([])
  const [imageHistory, setImageHistory] = useState<Array<{
    id: string;
    imageUrl: string;
    storageInfo: {
      storage_file_name: string | null;
      is_permanent_image: boolean;
    } | null;
    timestamp: Date;
  }>>([])
  const [selectedCopyVersion, setSelectedCopyVersion] = useState<string>("")
  const [selectedImageVersion, setSelectedImageVersion] = useState<string>("")

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
        
        // Cargar historial si existe
        if (content.copyHistory) {
          setCopyHistory(content.copyHistory.map((v: any) => ({
            ...v,
            timestamp: new Date(v.timestamp)
          })))
        }
        if (content.imageHistory) {
          setImageHistory(content.imageHistory.map((v: any) => ({
            ...v,
            timestamp: new Date(v.timestamp)
          })))
        }
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

  // Cargar información de todas las conexiones sociales
  useEffect(() => {
    const fetchSocialConnections = async () => {
      try {
        const response = await fetch('/api/social/connections')
        if (response.ok) {
          const data = await response.json()
          setConnections(data.connections || [])
          // Set Instagram account for backwards compatibility
          const instagramConnection = data.connections?.find((c: any) => c.plataforma === 'instagram')
          if (instagramConnection) {
            console.log('📸 Cuenta de Instagram cargada:', instagramConnection)
            setInstagramAccount({
              username: instagramConnection.nombre_cuenta,
              name: instagramConnection.metadata?.name || instagramConnection.nombre_cuenta,
              profile_picture_url: instagramConnection.metadata?.profile_picture_url,
              followers_count: instagramConnection.metadata?.followers_count
            })
          }
        }
      } catch (error) {
        console.error('❌ Error cargando conexiones sociales:', error)
      }
    }

    fetchSocialConnections()
  }, [])

  const [newHashtag, setNewHashtag] = useState("")
  const [isRegenerating, setIsRegenerating] = useState({ copy: false, image: false })
  const [selectedPlatform, setSelectedPlatform] = useState("instagram")
  const [connections, setConnections] = useState<any[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublishingInstagram, setIsPublishingInstagram] = useState(false)
  const [isPublishingFacebook, setIsPublishingFacebook] = useState(false)
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

  const selectCopyVersion = (versionId: string) => {
    const version = copyHistory.find(v => v.id === versionId)
    if (version) {
      setCopy(version.copy)
      setHashtags(version.hashtags)
      setSelectedCopyVersion(versionId)
      toast.success('Versión de copy seleccionada')
    }
  }

  const selectImageVersion = (versionId: string) => {
    const version = imageHistory.find(v => v.id === versionId)
    if (version) {
      setImageUrl(version.imageUrl)
      setStorageInfo(version.storageInfo)
      setSelectedImageVersion(versionId)
      toast.success('Versión de imagen seleccionada')
    }
  }

  // Funciones de navegación para copy
  const navigateCopyHistory = (direction: 'prev' | 'next') => {
    if (copyHistory.length === 0) return
    
    let currentIndex = copyHistory.findIndex(v => v.id === selectedCopyVersion)
    if (currentIndex === -1) currentIndex = copyHistory.length - 1 // Si no hay selección, empezar desde el final
    
    let newIndex: number

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : copyHistory.length - 1
    } else {
      newIndex = currentIndex < copyHistory.length - 1 ? currentIndex + 1 : 0
    }

    if (newIndex >= 0 && newIndex < copyHistory.length) {
      const version = copyHistory[newIndex]
      setCopy(version.copy)
      setHashtags(version.hashtags)
      setSelectedCopyVersion(version.id)
      toast.success(`Versión ${copyHistory.length - newIndex} seleccionada`)
    }
  }

  // Funciones de navegación para imagen
  const navigateImageHistory = (direction: 'prev' | 'next') => {
    if (imageHistory.length === 0) return
    
    let currentIndex = imageHistory.findIndex(v => v.id === selectedImageVersion)
    if (currentIndex === -1) currentIndex = imageHistory.length - 1 // Si no hay selección, empezar desde el final
    
    let newIndex: number

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : imageHistory.length - 1
    } else {
      newIndex = currentIndex < imageHistory.length - 1 ? currentIndex + 1 : 0
    }

    if (newIndex >= 0 && newIndex < imageHistory.length) {
      const version = imageHistory[newIndex]
      setImageUrl(version.imageUrl)
      setStorageInfo(version.storageInfo)
      setSelectedImageVersion(version.id)
      toast.success(`Versión ${imageHistory.length - newIndex} seleccionada`)
    }
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
        
        // Agregar la versión actual al historial ANTES de actualizar
        if (copy && copy.trim()) {
          const currentVersion = {
            id: `copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            copy: copy,
            hashtags: [...hashtags],
            timestamp: new Date()
          }
          setCopyHistory(prev => [...prev, currentVersion])
        }
        
        // Actualizar con la nueva versión (sin crear una nueva entrada en el historial)
        setCopy(newContent.copy)
        setHashtags(newContent.hashtags || [])
        setRegenerationCount(newContent.regenerationCount || 0)
        // No establecer selectedCopyVersion aquí, ya que es la versión actual
        
        // Actualizar localStorage con el historial
        const updatedContent = {
          ...newContent,
          copyHistory: copyHistory,
          imageHistory: imageHistory
        }
        localStorage.setItem('generatedContent', JSON.stringify(updatedContent))
        
        toast.success('Copy regenerado exitosamente')
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
        
        // Agregar la versión actual al historial ANTES de actualizar
        if (imageUrl) {
          const currentVersion = {
            id: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            imageUrl: imageUrl,
            storageInfo: storageInfo,
            timestamp: new Date()
          }
          setImageHistory(prev => [...prev, currentVersion])
        }
        
        // Actualizar con la nueva versión (sin crear una nueva entrada en el historial)
        setImageUrl(newContent.imageUrl)
        setStorageInfo(newContent.storageInfo || null)
        // No establecer selectedImageVersion aquí, ya que es la versión actual
        
        // Actualizar localStorage con el historial
        const updatedContent = { 
          ...content, 
          imageUrl: newContent.imageUrl, 
          storageInfo: newContent.storageInfo,
          copyHistory: copyHistory,
          imageHistory: imageHistory
        }
        localStorage.setItem('generatedContent', JSON.stringify(updatedContent))
        
        toast.success('Imagen regenerada exitosamente')
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

      const savedDrafts = []
      
      // Crear un borrador para la plataforma seleccionada
      const platform = selectedPlatform
      const postData = {
        titulo: `${isStory ? 'Historia' : 'Post'} en ${getPlatformName(platform)} - ${new Date().toLocaleDateString()}`,
        contenido: copy,
        plataforma: platform,
        tipo: isStory ? 'historia' : 'publicacion',
        hashtags: hashtags,
        imagen_url: imageUrl,
        prompt_utilizado: "Generado con IA desde la interfaz web",
        storage_file_name: storageInfo?.storage_file_name || null,
        is_permanent_image: storageInfo?.is_permanent_image || false
      }

      console.log(`💾 Guardando borrador para ${platform}...`)
      const postResponse = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      })

      if (postResponse.ok) {
        const postResult = await postResponse.json()
        savedDrafts.push({ platform, id: postResult.id })
        console.log(`✅ Borrador para ${platform} guardado:`, postResult.id)
      } else {
        const errorData = await postResponse.json()
        console.error(`❌ Error guardando borrador para ${platform}:`, errorData.error)
      }

      if (savedDrafts.length === 0) {
        throw new Error('No se pudo guardar ningún borrador')
      }
      
      // Dismissar el toast de loading
      toast.dismiss(loadingToast)
      
      // Mostrar mensaje de éxito
      const platforms = savedDrafts.map(d => getPlatformName(d.platform)).join(', ')
      toast.success(`¡${savedDrafts.length} ${isStory ? 'historia(s)' : 'borrador(es)'} guardado(s) para ${platforms}! 📝`, {
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
        if (!imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas una imagen para publicar la historia.')
          return
        }
      } else {
        if (!copy || !imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas contenido (copy) e imagen para publicar.')
          return
        }
      }

      // Crear el post en la base de datos con estado "publicado"
      const postData = {
        titulo: `${isStory ? 'Historia' : 'Post'} en Instagram - ${new Date().toLocaleDateString()}`,
        contenido: copy,
        plataforma: 'instagram',
        tipo: isStory ? 'historia' : 'publicacion',
        hashtags: hashtags,
        imagen_url: imageUrl,
        prompt_utilizado: "Generado con IA desde la interfaz web",
        storage_file_name: storageInfo?.storage_file_name || null,
        is_permanent_image: storageInfo?.is_permanent_image || false,
        estado: 'publicado'
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
      console.log('✅ Post guardado en BD con ID:', postResult.id)

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

      // Publicar en Instagram usando el endpoint específico
      console.log('🚀 Publicando en Instagram...')
      const publishResponse = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: connection.id,
          caption: copy,
          imageUrl: imageUrl,
          postId: postResult.id,
          contentType: isStory ? 'story' : 'post'
        })
      })

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json()
        console.error('❌ Error en respuesta de Instagram:', errorData)
        throw new Error(`Error publicando en Instagram: ${errorData.error || errorData.details || 'Error desconocido'}`)
      }

      const publishResult = await publishResponse.json()
      console.log('🎉 ¡Publicado exitosamente en Instagram!', publishResult)
      
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

  const handlePublishToInstagram = async () => {
    setIsPublishingInstagram(true)
    
    const loadingToast = toast.loading('Publicando en Instagram...', {
      duration: Infinity,
    })
    
    try {
      console.log('🚀 Iniciando publicación en Instagram...')
      
      // Verificar que tenemos una cuenta de Instagram conectada
      const instagramConnection = connections.find(c => c.plataforma === 'instagram')
      if (!instagramConnection) {
        toast.dismiss(loadingToast)
        toast.error('No hay cuenta de Instagram conectada. Ve a Configuración para conectar tu cuenta.')
        return
      }

      // Verificar que tenemos contenido para publicar
      if (isStory) {
        if (!imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas una imagen para publicar la historia.')
          return
        }
      } else {
        if (!copy || !imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas contenido (copy) e imagen para publicar.')
          return
        }
      }

      // Crear el post en la base de datos con estado "publicado"
      const postData = {
        titulo: `${isStory ? 'Historia' : 'Post'} en Instagram - ${new Date().toLocaleDateString()}`,
        contenido: copy,
        plataforma: 'instagram',
        tipo: isStory ? 'historia' : 'publicacion',
        hashtags: hashtags,
        imagen_url: imageUrl,
        prompt_utilizado: "Generado con IA desde la interfaz web",
        storage_file_name: storageInfo?.storage_file_name || null,
        is_permanent_image: storageInfo?.is_permanent_image || false,
        estado: 'publicado'
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
      console.log('✅ Post guardado en BD con ID:', postResult.id)

      // Publicar en Instagram usando el endpoint específico
      console.log('🚀 Publicando en Instagram...')
      const publishResponse = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: instagramConnection.id,
          caption: copy,
          imageUrl: imageUrl,
          postId: postResult.id,
          contentType: isStory ? 'story' : 'post'
        })
      })

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json()
        console.error('❌ Error en respuesta de Instagram:', errorData)
        throw new Error(`Error publicando en Instagram: ${errorData.error || errorData.details || 'Error desconocido'}`)
      }

      const publishResult = await publishResponse.json()
      console.log('🎉 ¡Publicado exitosamente en Instagram!', publishResult)
      
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
      console.error('❌ Error publicando en Instagram:', error)
      
      // Dismissar el toast de loading
      toast.dismiss(loadingToast)
      
      toast.error(`Error publicando en Instagram: ${error instanceof Error ? error.message : 'Error desconocido'}`, {
        duration: 6000,
      })
    } finally {
      setIsPublishingInstagram(false)
    }
  }

  const handlePublishToFacebook = async () => {
    setIsPublishingFacebook(true)
    
    const loadingToast = toast.loading('Publicando en Facebook...', {
      duration: Infinity,
    })
    
    try {
      console.log('🚀 Iniciando publicación en Facebook...')
      
      // Verificar que tenemos una cuenta de Facebook conectada
      const facebookConnection = connections.find(c => c.plataforma === 'facebook')
      if (!facebookConnection) {
        toast.dismiss(loadingToast)
        toast.error('No hay cuenta de Facebook conectada. Ve a Configuración para conectar tu cuenta.')
        return
      }

      // Verificar que tenemos contenido para publicar
      if (isStory) {
        if (!imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas una imagen para publicar la historia.')
          return
        }
      } else {
        if (!copy || !imageUrl) {
          toast.dismiss(loadingToast)
          toast.error('Necesitas contenido (copy) e imagen para publicar.')
          return
        }
      }

      // Crear el post en la base de datos con estado "publicado"
      const postData = {
        titulo: `${isStory ? 'Historia' : 'Post'} en Facebook - ${new Date().toLocaleDateString()}`,
        contenido: copy,
        plataforma: 'facebook',
        tipo: isStory ? 'historia' : 'publicacion',
        hashtags: hashtags,
        imagen_url: imageUrl,
        prompt_utilizado: "Generado con IA desde la interfaz web",
        storage_file_name: storageInfo?.storage_file_name || null,
        is_permanent_image: storageInfo?.is_permanent_image || false,
        estado: 'publicado'
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
      console.log('✅ Post guardado en BD con ID:', postResult.id)

      // Publicar en Facebook usando el endpoint específico
      console.log('🚀 Publicando en Facebook...')
      const publishResponse = await fetch('/api/facebook/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: facebookConnection.id,
          caption: copy,
          imageUrl: imageUrl,
          postId: postResult.id,
          contentType: isStory ? 'story' : 'post'
        })
      })

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json()
        console.error('❌ Error en respuesta de Facebook:', errorData)
        throw new Error(`Error publicando en Facebook: ${errorData.error || errorData.details || 'Error desconocido'}`)
      }

      const publishResult = await publishResponse.json()
      console.log('🎉 ¡Publicado exitosamente en Facebook!', publishResult)
      
      // Dismissar el toast de loading
      toast.dismiss(loadingToast)
      
      // Mostrar mensaje de éxito
      toast.success(`¡${isStory ? 'Historia' : 'Post'} publicado exitosamente en Facebook! 🎉`, {
        duration: 4000,
        icon: '📵',
      })
      
      // Pequeña pausa para que el usuario vea el toast
      setTimeout(() => {
        window.location.href = '/dashboard/history'
      }, 1500)

    } catch (error) {
      console.error('❌ Error publicando en Facebook:', error)
      
      // Dismissar el toast de loading
      toast.dismiss(loadingToast)
      
      toast.error(`Error publicando en Facebook: ${error instanceof Error ? error.message : 'Error desconocido'}`, {
        duration: 6000,
      })
    } finally {
      setIsPublishingFacebook(false)
    }
  }

  const handleSchedulePost = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Por favor selecciona una fecha y hora para programar el post')
      return
    }

    console.log('📅 Fecha programada:', scheduledDate)
    console.log('⏰ Hora programada:', scheduledTime)
    
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    console.log('🕐 DateTime construido:', scheduledDateTime.toISOString())
    
    const now = new Date()
    console.log('🕐 Ahora:', now.toISOString())

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

      const scheduledPosts = []
      
      // Create posts for the selected platform with 'programado' status
      const platform = selectedPlatform
      const postData = {
        titulo: `${isStory ? 'Historia' : 'Post'} programado en ${getPlatformName(platform)} - ${scheduledDate}`,
        contenido: copy,
        plataforma: platform,
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

      if (postResponse.ok) {
        const postResult = await postResponse.json()
        scheduledPosts.push({ platform, id: postResult.id })
        console.log(`✅ Post programado para ${platform}:`, postResult.id)
      } else {
        const errorData = await postResponse.json()
        console.error(`❌ Error programando post para ${platform}:`, errorData.error)
      }

      if (scheduledPosts.length === 0) {
        throw new Error('No se pudo programar ningún post')
      }

      toast.dismiss(loadingToast)
      const platforms = scheduledPosts.map(p => getPlatformName(p.platform)).join(', ')
      toast.success(`¡${scheduledPosts.length} ${isStory ? 'historia(s)' : 'post(s)'} programado(s) para ${platforms} el ${formatScheduledDate(scheduledDateTime)}! 📅`, { 
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
                  <div className="flex items-center space-x-2">
                    {/* Navegación de versiones */}
                    {copyHistory.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateCopyHistory('prev')}
                          disabled={copyHistory.length <= 1}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground px-2">
                          {selectedCopyVersion ? copyHistory.findIndex(v => v.id === selectedCopyVersion) + 1 : 0} / {copyHistory.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateCopyHistory('next')}
                          disabled={copyHistory.length <= 1}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
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
                </div>
                <CardDescription>Edita el texto de tu publicación</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea value={copy} onChange={(e) => setCopy(e.target.value)} rows={6} className="resize-none" />
                <p className="text-xs text-muted-foreground mt-2">{copy.length} caracteres</p>
                
                {/* Historial de versiones de copy */}
                {copyHistory.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Versiones anteriores:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {copyHistory.map((version, index) => (
                        <div 
                          key={version.id}
                          className={`p-2 rounded border cursor-pointer transition-colors ${
                            selectedCopyVersion === version.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => selectCopyVersion(version.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Versión {copyHistory.length - index} - {version.timestamp.toLocaleTimeString()}
                            </span>
                            {selectedCopyVersion === version.id && (
                              <Badge variant="secondary" className="text-xs">Seleccionada</Badge>
                            )}
                          </div>
                          <p className="text-xs mt-1 line-clamp-2">{version.copy}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Imagen</CardTitle>
                <div className="flex items-center space-x-2">
                  {/* Navegación de versiones */}
                  {imageHistory.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateImageHistory('prev')}
                        disabled={imageHistory.length <= 1}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </Button>
                      <span className="text-xs text-muted-foreground px-2">
                        {selectedImageVersion ? imageHistory.findIndex(v => v.id === selectedImageVersion) + 1 : 0} / {imageHistory.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateImageHistory('next')}
                        disabled={imageHistory.length <= 1}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
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
              
              {/* Historial de versiones de imagen */}
              {imageHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Versiones anteriores:</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {imageHistory.map((version, index) => (
                      <div 
                        key={version.id}
                        className={`relative rounded border cursor-pointer transition-colors overflow-hidden ${
                          selectedImageVersion === version.id 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => selectImageVersion(version.id)}
                      >
                        <img 
                          src={version.imageUrl} 
                          alt={`Versión ${imageHistory.length - index}`}
                          className="w-full h-16 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                          <div className="flex items-center justify-between">
                            <span>V{imageHistory.length - index}</span>
                            {selectedImageVersion === version.id && (
                              <Badge variant="secondary" className="text-xs bg-white text-black">✓</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              {/* Instagram Publish Button */}
              <Button 
                className="w-full bg-gradient-to-br from-purple-500 to-pink-500 hover:opacity-90" 
                onClick={handlePublishToInstagram}
                disabled={isPublishingInstagram || !connections.find(c => c.plataforma === 'instagram')}
              >
                {isPublishingInstagram ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isStory ? "Publicando Historia en Instagram..." : "Publicando en Instagram..."}</span>
                  </div>
                ) : (
                  <>
                    <Instagram className="w-4 h-4 mr-2" />
                    {isStory ? "Publicar Historia en Instagram" : "Publicar en Instagram"}
                  </>
                )}
              </Button>
              
              {/* Facebook Publish Button */}
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handlePublishToFacebook}
                disabled={isPublishingFacebook || !connections.find(c => c.plataforma === 'facebook')}
              >
                {isPublishingFacebook ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isStory ? "Publicando Historia en Facebook..." : "Publicando en Facebook..."}</span>
                  </div>
                ) : (
                  <>
                    <Facebook className="w-4 h-4 mr-2" />
                    {isStory ? "Publicar Historia en Facebook" : "Publicar en Facebook"}
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
          {/* Platform Preview Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vista Previa</CardTitle>
              <CardDescription>Selecciona qué plataforma quieres previsualizar</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">
                    <div className="flex items-center space-x-2">
                      <Instagram className="w-4 h-4" />
                      <span>Instagram</span>
                      {connections.find(c => c.plataforma === 'instagram') && (
                        <Badge variant="secondary" className="text-xs ml-1">
                          @{connections.find(c => c.plataforma === 'instagram')?.nombre_cuenta}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="facebook">
                    <div className="flex items-center space-x-2">
                      <Facebook className="w-4 h-4" />
                      <span>Facebook</span>
                      {connections.find(c => c.plataforma === 'facebook') && (
                        <Badge variant="secondary" className="text-xs ml-1">
                          {connections.find(c => c.plataforma === 'facebook')?.nombre_cuenta}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="min-h-[600px]">
            <CardHeader>
              <CardTitle className="text-lg">Preview de {getPlatformName(selectedPlatform)}</CardTitle>
              <CardDescription>
                Cómo se verá tu {isStory ? 'historia' : 'publicación'} en {getPlatformName(selectedPlatform)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`w-6 h-6 ${getPlatformColor(selectedPlatform)} rounded flex items-center justify-center`}>
                    {getPlatformIcon(selectedPlatform)}
                  </div>
                  <h4 className="font-medium">{getPlatformName(selectedPlatform)}</h4>
                  {connections.find(c => c.plataforma === selectedPlatform) && (
                    <Badge variant="outline" className="text-xs">
                      {selectedPlatform === 'instagram' ? '@' : ''}{connections.find(c => c.plataforma === selectedPlatform)?.nombre_cuenta}
                    </Badge>
                  )}
                </div>
                
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
