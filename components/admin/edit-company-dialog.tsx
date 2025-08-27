"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Building2, Globe, FileText, Palette, Users, Target, Calendar } from "lucide-react"

interface Empresa {
  id: string
  nombre: string
  rubro: string
  sitio_web?: string
  descripcion?: string
  logo_url?: string
  is_active: boolean
  pago_recibido: boolean
  created_at: string
  updated_at: string
  usuarios_count: number
  estado: string
  fecha_registro: string
  ultima_actualizacion: string
}

interface EditCompanyDialogProps {
  empresa: Empresa | null
  isOpen: boolean
  onClose: () => void
  onSave: (empresa: Empresa) => void
}

export function EditCompanyDialog({ empresa, isOpen, onClose, onSave }: EditCompanyDialogProps) {
  const [formData, setFormData] = useState<Partial<Empresa>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (empresa) {
      setFormData({
        nombre: empresa.nombre,
        rubro: empresa.rubro,
        sitio_web: empresa.sitio_web || '',
        descripcion: empresa.descripcion || '',
        logo_url: empresa.logo_url || '',
        is_active: empresa.is_active
      })
    }
  }, [empresa])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa) return

    setIsLoading(true)
    try {
      console.log('🔍 Actualizando empresa:', { ...empresa, ...formData })
      
      // Validar datos requeridos
      if (!formData.nombre || !formData.rubro) {
        alert('Por favor completa los campos requeridos (Nombre y Rubro)')
        return
      }

      // Actualizar empresa usando la API
      console.log('🔍 Enviando datos al endpoint:', formData)
      const response = await fetch(`/api/admin/empresas/${empresa.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Empresa actualizada exitosamente:', result)

        // Llamar a onSave con los datos actualizados
        onSave({ ...empresa, ...formData })
        onClose()
        
        // Mostrar mensaje de éxito
        alert('Empresa actualizada exitosamente')
      } else {
        const errorData = await response.json()
        console.error('❌ Error actualizando empresa:', errorData)
        alert(`Error actualizando empresa: ${errorData.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('❌ Error actualizando empresa:', error)
      alert('Error actualizando la empresa. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!empresa) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] bg-white border border-gray-200 shadow-lg">
                 <DialogHeader className="pb-6 border-b border-gray-200">
           <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
               <Building2 className="w-5 h-5 text-white" />
             </div>
             <div>
               <DialogTitle className="text-xl font-semibold text-gray-900">Editar Empresa</DialogTitle>
               <DialogDescription className="text-gray-600">
                 Modifica la información de <span className="font-medium text-gray-800">{empresa.nombre}</span>
               </DialogDescription>
             </div>
           </div>
         </DialogHeader>

        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-8">
                             {/* Primera sección: Información básica */}
               <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                 <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                   <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                   Información Básica
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                       Nombre de la Empresa *
                     </Label>
                     <Input
                       id="nombre"
                       value={formData.nombre || ''}
                       onChange={(e) => handleInputChange('nombre', e.target.value)}
                       className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                       required
                     />
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="rubro" className="text-sm font-medium text-gray-700">
                       Rubro de la Empresa *
                     </Label>
                     <Input
                       id="rubro"
                       value={formData.rubro || ''}
                       onChange={(e) => handleInputChange('rubro', e.target.value)}
                       className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                       required
                     />
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="sitio_web" className="text-sm font-medium text-gray-700">
                       Sitio Web
                     </Label>
                     <Input
                       id="sitio_web"
                       type="url"
                       value={formData.sitio_web || ''}
                       onChange={(e) => handleInputChange('sitio_web', e.target.value)}
                       placeholder="https://www.empresa.com"
                       className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                     />
                   </div>
                 </div>
               </div>

                             {/* Segunda sección: Información adicional */}
               <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                 <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                   <Globe className="w-4 h-4 mr-2 text-indigo-600" />
                   Información Adicional
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="logo_url" className="text-sm font-medium text-gray-700">
                       URL del Logo
                     </Label>
                     <Input
                       id="logo_url"
                       type="url"
                       value={formData.logo_url || ''}
                       onChange={(e) => handleInputChange('logo_url', e.target.value)}
                       placeholder="https://ejemplo.com/logo.png"
                       className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                     />
                   </div>
                   
                   <div className="space-y-2">
                     <Label className="text-sm font-medium text-gray-700">
                       Estado de la Empresa
                     </Label>
                     <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md bg-white">
                       <Switch
                         checked={formData.is_active}
                         onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                         className="data-[state=checked]:bg-indigo-600"
                       />
                       <span className="text-sm text-gray-600">
                         {formData.is_active ? 'Activa' : 'Inactiva'}
                       </span>
                     </div>
                   </div>
                 </div>
               </div>

                             {/* Tercera sección: Descripción */}
               <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-100">
                 <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                   <FileText className="w-4 h-4 mr-2 text-violet-600" />
                   Descripción
                 </h3>
                 <div className="space-y-2">
                   <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                     Descripción de la Empresa
                   </Label>
                   <Textarea
                     id="descripcion"
                     value={formData.descripcion || ''}
                     onChange={(e) => handleInputChange('descripcion', e.target.value)}
                     placeholder="Breve descripción de la empresa"
                     className="border-gray-300 focus:border-violet-500 focus:ring-violet-500 transition-colors"
                     rows={6}
                   />
                 </div>
               </div>

                             {/* Cuarta sección: Información del sistema */}
               <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-lg p-4 border border-slate-200">
                 <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                   <Calendar className="w-4 h-4 mr-2 text-slate-600" />
                   Información del Sistema
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <Label className="text-sm font-medium text-gray-600">Fecha de Registro</Label>
                     <p className="text-sm text-gray-900 bg-white p-2 rounded border border-slate-200">{empresa.fecha_registro}</p>
                   </div>
                   
                   <div className="space-y-2">
                     <Label className="text-sm font-medium text-gray-600">Última Actualización</Label>
                     <p className="text-sm text-gray-900 bg-white p-2 rounded border border-slate-200">{empresa.ultima_actualizacion}</p>
                   </div>
                   
                   <div className="space-y-2">
                     <Label className="text-sm font-medium text-gray-600">Usuarios Asociados</Label>
                     <p className="text-sm text-gray-900 bg-white p-2 rounded border border-slate-200">{empresa.usuarios_count} usuarios</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>

                     {/* Botones de Acción */}
           <div className="flex justify-center p-6 border-t border-gray-200 bg-white">
             <Button
               type="submit"
               disabled={isLoading}
               className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
             >
               {isLoading ? (
                 <div className="flex items-center space-x-2">
                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   <span>Guardando...</span>
                 </div>
               ) : (
                 'Guardar Cambios'
               )}
             </Button>
           </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
