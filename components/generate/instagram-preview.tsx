"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface InstagramPreviewProps {
  copy: string
  hashtags: string
  isRegeneratingImage?: boolean
}

export function InstagramPreview({ copy, hashtags, isRegeneratingImage }: InstagramPreviewProps) {
  return (
    <Card className="w-full max-w-sm mx-auto bg-white border-gray-200">
      <CardContent className="p-0">
        {/* Instagram Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="cafeteluna" />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                CL
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-gray-900">cafeteluna</p>
              <p className="text-xs text-gray-500">Cafetería Luna</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="p-1">
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </Button>
        </div>

        {/* Instagram Image */}
        <div className="aspect-[4/5] bg-gray-100 relative">
          {isRegeneratingImage ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                <p className="text-sm text-gray-500">Generando imagen...</p>
              </div>
            </div>
          ) : (
            <img
              src="/placeholder.svg?height=400&width=320&text=Café+Colombiano+Premium"
              alt="Generated content"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Instagram Actions */}
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="p-0">
                <Heart className="w-6 h-6 text-gray-700" />
              </Button>
              <Button variant="ghost" size="sm" className="p-0">
                <MessageCircle className="w-6 h-6 text-gray-700" />
              </Button>
              <Button variant="ghost" size="sm" className="p-0">
                <Send className="w-6 h-6 text-gray-700" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="p-0">
              <Bookmark className="w-6 h-6 text-gray-700" />
            </Button>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">124 Me gusta</p>
            <div className="text-sm text-gray-900">
              <span className="font-semibold">cafeteluna</span> <span className="whitespace-pre-wrap">{copy}</span>
            </div>
            {hashtags && <p className="text-sm text-blue-900 font-medium">{hashtags}</p>}
            <p className="text-xs text-gray-500 uppercase tracking-wide">Hace 2 minutos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
