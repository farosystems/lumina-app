"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Instagram, Facebook } from "lucide-react"

interface StoryPreviewProps {
  imageUrl: string | null
  isRegeneratingImage: boolean
  platform: "instagram" | "facebook"
}

export function StoryPreview({ imageUrl, isRegeneratingImage, platform }: StoryPreviewProps) {
  const isInstagram = platform === "instagram"

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Story Preview Container */}
      <div className="relative">
        <div className="w-64 h-[455px] bg-black rounded-3xl p-2 shadow-2xl">
          <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    {isInstagram ? (
                      <Instagram className="w-4 h-4 text-white" />
                    ) : (
                      <Facebook className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="text-white text-sm font-medium">
                    {isInstagram ? "Instagram" : "Facebook"}
                  </div>
                </div>
                <div className="text-white text-xs opacity-75">
                  {new Date().toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="w-full h-full relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Story preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {isRegeneratingImage ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Generando imagen...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                        {isInstagram ? (
                          <Instagram className="w-6 h-6 text-gray-500" />
                        ) : (
                          <Facebook className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      <p className="text-gray-500 text-sm">Imagen de historia</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
              <div className="flex items-center justify-between">
                <div className="text-white text-xs opacity-75">
                  Desliza para ver más
                </div>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full opacity-100"></div>
                  <div className="w-1 h-1 bg-white rounded-full opacity-50"></div>
                  <div className="w-1 h-1 bg-white rounded-full opacity-50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Info */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isInstagram 
              ? "bg-gradient-to-br from-purple-500 to-pink-500" 
              : "bg-blue-600"
          }`}>
            {isInstagram ? (
              <Instagram className="w-3 h-3 text-white" />
            ) : (
              <Facebook className="w-3 h-3 text-white" />
            )}
          </div>
          <span className="text-sm font-medium">
            {isInstagram ? "Instagram Story" : "Facebook Story"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Formato 9:16 - Optimizado para historias
        </p>
      </div>
    </div>
  )
}









