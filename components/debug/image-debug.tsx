"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Copy, ExternalLink } from "lucide-react"

interface ImageDebugProps {
  imageUrl: string | null
  postId: string
}

export function ImageDebug({ imageUrl, postId }: ImageDebugProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imageStatus, setImageStatus] = useState<'unknown' | 'loading' | 'success' | 'error'>('unknown')

  const checkImageStatus = async () => {
    if (!imageUrl) return
    
    setIsLoading(true)
    setImageStatus('loading')
    
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' })
      setImageStatus(response.ok ? 'success' : 'error')
    } catch (error) {
      setImageStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const copyUrl = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl)
    }
  }

  const openInNewTab = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank')
    }
  }

  const getStatusBadge = () => {
    switch (imageStatus) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">✅ Accesible</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">❌ Error</Badge>
      case 'loading':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Verificando...</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">❓ No verificado</Badge>
    }
  }

  if (!imageUrl) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug: Imagen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-700">No hay URL de imagen para este post</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm">Debug: Imagen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado:</span>
          {getStatusBadge()}
        </div>
        
        <div className="space-y-2">
          <span className="text-sm font-medium">URL:</span>
          <div className="text-xs bg-white p-2 rounded border break-all">
            {imageUrl}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkImageStatus}
            disabled={isLoading}
          >
            <Eye className="w-3 h-3 mr-1" />
            Verificar
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={copyUrl}
          >
            <Copy className="w-3 h-3 mr-1" />
            Copiar URL
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={openInNewTab}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Abrir
          </Button>
        </div>

        <div className="text-xs text-gray-600">
          <p>Post ID: {postId}</p>
          <p>URL Length: {imageUrl.length} caracteres</p>
          <p>Is HTTPS: {imageUrl.startsWith('https://') ? 'Sí' : 'No'}</p>
        </div>
      </CardContent>
    </Card>
  )
}









