"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Plus, Upload, Link, Camera } from "lucide-react"
import { useState, useRef } from "react"

interface ProductStepProps {
  formData: {
    productName: string
    communicationType: string
    characteristics: string[]
    productImage?: string
    imageSource?: "file" | "url" | "camera"
  }
  updateFormData: (data: any) => void
}

export function ProductStep({ formData, updateFormData }: ProductStepProps) {
  const [newCharacteristic, setNewCharacteristic] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [showCamera, setShowCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const addCharacteristic = () => {
    if (newCharacteristic.trim() && formData.characteristics.length < 5) {
      updateFormData({
        characteristics: [...formData.characteristics, newCharacteristic.trim()],
      })
      setNewCharacteristic("")
    }
  }

  const removeCharacteristic = (index: number) => {
    updateFormData({
      characteristics: formData.characteristics.filter((_, i) => i !== index),
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('📁 Archivo seleccionado:', file.name, file.size, file.type)
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        console.log('📸 Imagen cargada, tamaño:', imageData.length)
        console.log('📸 Tipo de imagen:', imageData.substring(0, 50) + '...')
        updateFormData({
          productImage: imageData,
          imageSource: "file",
        })
        console.log('✅ updateFormData llamado con imagen')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlUpload = () => {
    if (imageUrl.trim()) {
      console.log('🔗 URL de imagen ingresada:', imageUrl)
      updateFormData({
        productImage: imageUrl,
        imageSource: "url",
      })
      console.log('✅ updateFormData llamado con URL')
      setImageUrl("")
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setShowCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("No se pudo acceder a la cámara")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0)

      const imageData = canvas.toDataURL("image/jpeg")
      updateFormData({
        productImage: imageData,
        imageSource: "camera",
      })

      // Stop camera
      const stream = video.srcObject as MediaStream
      stream?.getTracks().forEach((track) => track.stop())
      setShowCamera(false)
    }
  }

  const removeImage = () => {
    updateFormData({
      productImage: undefined,
      imageSource: undefined,
    })
    if (showCamera && videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream
      stream?.getTracks().forEach((track) => track.stop())
      setShowCamera(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div className="space-y-2">
        <Label htmlFor="productName">Nombre del Producto *</Label>
        <Input
          id="productName"
          placeholder="Ej: Café Especial Colombiano, Vestido Floral, Hamburguesa Gourmet..."
          value={formData.productName}
          onChange={(e) => updateFormData({ productName: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Imagen del Producto</Label>
        <Card className="p-4">
          {!formData.productImage && !showCamera && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Sube una imagen de tu producto:</p>

              {/* File Upload */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Subir desde PC
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Camera className="w-4 h-4" />
                  Tomar Foto
                </Button>
              </div>

              {/* URL Upload */}
              <div className="flex gap-2">
                <Input
                  placeholder="O pega la URL de una imagen..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={handleUrlUpload} disabled={!imageUrl.trim()}>
                  <Link className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Camera View */}
          {showCamera && (
            <div className="space-y-4">
              <video ref={videoRef} autoPlay playsInline className="w-full max-w-md mx-auto rounded-lg" />
              <div className="flex justify-center gap-2">
                <Button onClick={capturePhoto} className="bg-purple-600 hover:bg-purple-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar
                </Button>
                <Button variant="outline" onClick={() => setShowCamera(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {formData.productImage && !showCamera && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={formData.productImage || "/placeholder.svg"}
                  alt="Producto"
                  className="w-full max-w-md mx-auto rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Imagen cargada desde:{" "}
                {formData.imageSource === "file"
                  ? "PC"
                  : formData.imageSource === "url"
                    ? "URL"
                    : formData.imageSource === "camera"
                      ? "Cámara"
                      : ""}
              </p>
            </div>
          )}
        </Card>
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Communication Type */}
      <div className="space-y-2">
        <Label htmlFor="communicationType">Tipo de Comunicación *</Label>
        <Textarea
          id="communicationType"
          placeholder="Describe el tipo de comunicación: promoción especial, comunicación genérica, aviso importante, lanzamiento de producto..."
          value={formData.communicationType}
          onChange={(e) => updateFormData({ communicationType: e.target.value })}
          rows={3}
        />
      </div>

      {/* Characteristics */}
      <div className="space-y-2">
        <Label>Características del Producto * (mínimo 1, máximo 5)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ej: artesanal, premium, orgánico..."
            value={newCharacteristic}
            onChange={(e) => setNewCharacteristic(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCharacteristic()}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCharacteristic}
            disabled={!newCharacteristic.trim() || formData.characteristics.length >= 5}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.characteristics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.characteristics.map((char, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {char}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 w-4 h-4"
                  onClick={() => removeCharacteristic(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">{formData.characteristics.length}/5 características agregadas</p>
      </div>
    </div>
  )
}
