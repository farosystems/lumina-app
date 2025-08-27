"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ColorPicker } from "./color-picker"
import { FontPicker } from "./font-picker"
import { PublicoIdealPicker } from "./publico-ideal-picker"
import { getEjemploPorRubro } from "@/lib/utils/example-data"

interface EmpresaFormProps {
  initialData?: {
    nombre?: string
    rubro?: string
    imagen_transmitir?: string
    colores?: string[]
    fuentes?: string[]
    publico_ideal?: {
      edad_minima: number
      edad_maxima: number
      zona: string
      intereses: string[]
    }
    logo_url?: string
    sitio_web?: string
    telefono?: string
    email?: string
    direccion?: string
  }
  onSubmit: (formData: FormData) => void
  isLoading?: boolean
}

export function EmpresaForm({ initialData, onSubmit, isLoading = false }: EmpresaFormProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || "",
    rubro: initialData?.rubro || "",
    imagen_transmitir: initialData?.imagen_transmitir || "",
    colores: initialData?.colores || [],
    fuentes: initialData?.fuentes || [],
    publico_ideal: initialData?.publico_ideal || {
      edad_minima: 25,
      edad_maxima: 45,
      zona: "",
      intereses: []
    },
    logo_url: initialData?.logo_url || "",
    sitio_web: initialData?.sitio_web || "",
    telefono: initialData?.telefono || "",
    email: initialData?.email || "",
    direccion: initialData?.direccion || ""
  })

  // Cargar ejemplo cuando se selecciona un rubro
  const handleRubroChange = (rubro: string) => {
    setFormData(prev => ({ ...prev, rubro }))
    
    if (rubro && !initialData) {
      const ejemplo = getEjemploPorRubro(rubro)
      setFormData(prev => ({
        ...prev,
        rubro,
        colores: ejemplo.colores,
        fuentes: ejemplo.fuentes,
        publico_ideal: ejemplo.publico_ideal
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = new FormData()
    data.append('nombre', formData.nombre)
    data.append('rubro', formData.rubro)
    data.append('imagen_transmitir', formData.imagen_transmitir)
    data.append('colores', JSON.stringify(formData.colores))
    data.append('fuentes', JSON.stringify(formData.fuentes))
    data.append('publico_ideal', JSON.stringify(formData.publico_ideal))
    data.append('logo_url', formData.logo_url)
    data.append('sitio_web', formData.sitio_web)
    data.append('telefono', formData.telefono)
    data.append('email', formData.email)
    data.append('direccion', formData.direccion)
    
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>Datos principales de la empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre de la empresa *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Café del Sol"
                required
              />
            </div>
            <div>
              <Label htmlFor="rubro">Rubro *</Label>
              <Input
                id="rubro"
                value={formData.rubro}
                onChange={(e) => handleRubroChange(e.target.value)}
                placeholder="Ej: Gastronomía"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="imagen_transmitir">Imagen que desea transmitir</Label>
            <Textarea
              id="imagen_transmitir"
              value={formData.imagen_transmitir}
              onChange={(e) => setFormData(prev => ({ ...prev, imagen_transmitir: e.target.value }))}
              placeholder="Describe la imagen que quieres transmitir con tu marca..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Identidad visual */}
      <Card>
        <CardHeader>
          <CardTitle>Identidad Visual</CardTitle>
          <CardDescription>Colores y fuentes de la marca</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ColorPicker
            value={formData.colores}
            onChange={(colores) => setFormData(prev => ({ ...prev, colores }))}
            maxColors={5}
          />
          
          <FontPicker
            value={formData.fuentes}
            onChange={(fuentes) => setFormData(prev => ({ ...prev, fuentes }))}
            maxFonts={3}
          />
        </CardContent>
      </Card>

      {/* Público ideal */}
      <Card>
        <CardHeader>
          <CardTitle>Público Objetivo</CardTitle>
          <CardDescription>Define tu audiencia ideal</CardDescription>
        </CardHeader>
        <CardContent>
          <PublicoIdealPicker
            value={formData.publico_ideal}
            onChange={(publico_ideal) => setFormData(prev => ({ ...prev, publico_ideal }))}
          />
        </CardContent>
      </Card>

      {/* Información de contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
          <CardDescription>Datos de contacto de la empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="logo_url">URL del logo</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="sitio_web">Sitio web</Label>
              <Input
                id="sitio_web"
                type="url"
                value={formData.sitio_web}
                onChange={(e) => setFormData(prev => ({ ...prev, sitio_web: e.target.value }))}
                placeholder="https://ejemplo.com"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+54 11 1234-5678"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@empresa.com"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
              placeholder="Dirección completa de la empresa"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botón de envío */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? "Guardando..." : "Guardar Empresa"}
        </Button>
      </div>
    </form>
  )
}










