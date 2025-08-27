"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageCircle, Share, MoreHorizontal } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface FacebookPreviewProps {
  copy: string
  hashtags: string
  isRegeneratingImage?: boolean
  imageUrl?: string | null
}

export function FacebookPreview({ copy, hashtags, isRegeneratingImage, imageUrl }: FacebookPreviewProps) {
  return (
    <Card className="w-full max-w-md mx-auto bg-white border-gray-200">
      <CardContent className="p-0">
        {/* Facebook Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Cafetería Luna" />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white">
                  CL
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-900">Cafetería Luna</p>
                <p className="text-xs text-gray-500">Hace 2 minutos · 🌍</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="p-1">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Facebook Content */}
        <div className="p-4 space-y-3">
          <div className="text-sm text-gray-900 whitespace-pre-wrap">{copy}</div>
          {hashtags && <p className="text-sm text-blue-600 font-medium">{hashtags}</p>}
        </div>

        {/* Facebook Image */}
        <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
          {isRegeneratingImage ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                <p className="text-sm text-gray-500">Generando imagen...</p>
              </div>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Generated content"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('❌ Error cargando imagen generada:', imageUrl)
                // Fallback si la imagen generada falla
                (e.target as HTMLImageElement).src = "/placeholder.svg?height=320&width=512&text=Error+cargando+imagen"
              }}
              onLoad={() => {
                console.log('✅ Imagen cargada exitosamente en preview de Facebook')
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-gray-500 text-xl">🎨</span>
                </div>
                <p className="text-sm text-gray-500">Imagen generada con IA</p>
              </div>
            </div>
          )}
        </div>

        {/* Facebook Actions */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>👍❤️ 47 personas</span>
            <span>12 comentarios · 3 veces compartido</span>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <div className="grid grid-cols-3 gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center justify-center space-x-2 text-gray-600 hover:bg-gray-50"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">Me gusta</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center justify-center space-x-2 text-gray-600 hover:bg-gray-50"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Comentar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center justify-center space-x-2 text-gray-600 hover:bg-gray-50"
              >
                <Share className="w-4 h-4" />
                <span className="text-sm">Compartir</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
