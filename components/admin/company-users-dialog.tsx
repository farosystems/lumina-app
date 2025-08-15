"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Mail, Phone, Calendar, Shield, User, Building2, X } from "lucide-react"

interface Usuario {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: string
  cargo?: string
  telefono?: string
  is_active: boolean
  created_at: string
  updated_at: string
  nombre_completo: string
  estado: string
  fecha_registro: string
  avatar_fallback: string
}

interface Empresa {
  id: string
  nombre: string
  rubro: string
  logo_url?: string
  usuarios_count: number
}

interface CompanyUsersDialogProps {
  empresa: Empresa | null
  isOpen: boolean
  onClose: () => void
}

export function CompanyUsersDialog({ empresa, isOpen, onClose }: CompanyUsersDialogProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (empresa && isOpen) {
      fetchUsuarios()
    }
  }, [empresa, isOpen])

  const fetchUsuarios = async () => {
    if (!empresa) return

    setIsLoading(true)
    setError('')
    try {
      console.log('🔍 Obteniendo usuarios de la empresa:', empresa.id)
      
      const response = await fetch(`/api/admin/empresas/${empresa.id}/usuarios`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Usuarios obtenidos:', data)
        setUsuarios(data.usuarios || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error obteniendo usuarios')
        console.error('❌ Error obteniendo usuarios:', errorData)
      }
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  if (!empresa) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] h-[85vh] p-0 bg-white border-0 shadow-2xl">
        {/* Header fijo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 border-b border-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Usuarios de {empresa.nombre}
                </DialogTitle>
                <DialogDescription className="text-purple-100">
                  Gestiona los usuarios asociados a esta empresa
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Estadísticas de la Empresa */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-700 flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>Empresa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-purple-900">{empresa.nombre}</div>
                  <p className="text-sm text-purple-600">{empresa.rubro}</p>
                </CardContent>
              </Card>

              <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-indigo-700 flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Total Usuarios</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-indigo-900">{usuarios.length}</div>
                  <p className="text-sm text-indigo-600">usuarios registrados</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-700 flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Usuarios Activos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-900">
                    {usuarios.filter(u => u.is_active).length}
                  </div>
                  <p className="text-sm text-green-600">usuarios activos</p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Usuarios */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <span>Lista de Usuarios</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Usuarios asociados a {empresa.nombre}
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando usuarios...</p>
                  </div>
                ) : usuarios.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No hay usuarios asociados a esta empresa</p>
                    <p className="text-sm text-gray-500 mt-2">Los usuarios aparecerán aquí cuando se registren</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {usuarios.map((usuario) => (
                      <div key={usuario.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          {/* Avatar */}
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            <AvatarImage src="/placeholder.svg" alt={usuario.nombre_completo} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold">
                              {usuario.avatar_fallback}
                            </AvatarFallback>
                          </Avatar>

                          {/* Información principal */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {usuario.nombre_completo}
                                </h3>
                                <p className="text-sm text-gray-500 truncate">
                                  {usuario.email}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Badge 
                                  variant={usuario.is_active ? "default" : "secondary"}
                                  className={usuario.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                                >
                                  {usuario.estado}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {usuario.rol === 'admin' ? 'Administrador' : 'Cliente'}
                                </Badge>
                              </div>
                            </div>

                            {/* Detalles adicionales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-700">Cargo:</span>
                                  <span className="text-gray-600">{usuario.cargo || 'No especificado'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600 truncate">{usuario.email}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {usuario.telefono && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{usuario.telefono}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-600">Registrado: {usuario.fecha_registro}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer fijo */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
