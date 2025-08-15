"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, UserCheck, UserX, Crown, AlertCircle } from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { PageTransition, StaggeredPageTransition, CardTransition } from "@/components/page-transition"
import { Usuario } from "@/lib/types"

// Componente de loading optimizado
const LoadingSpinner = () => (
  <PageTransition>
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Cargando usuarios...</p>
      </div>
    </div>
  </PageTransition>
)

// Componente de error optimizado
const ErrorCard = ({ error }: { error: string }) => (
  <CardTransition>
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      </CardContent>
    </Card>
  </CardTransition>
)

// Componente de estadísticas optimizado
const StatsGrid = ({ stats }: { stats: { total: number; activos: number; administradores: number; clientes: number } }) => {
  const statsCards = useMemo(() => [
    {
      title: "Total Usuarios",
      value: stats.total.toString(),
      description: "Usuarios registrados",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Usuarios Activos",
      value: stats.activos.toString(),
      description: "Usuarios operativos",
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "Administradores",
      value: stats.administradores.toString(),
      description: "Usuarios admin",
      icon: Crown,
      color: "text-purple-600"
    },
    {
      title: "Clientes",
      value: stats.clientes.toString(),
      description: "Usuarios cliente",
      icon: Users,
      color: "text-orange-600"
    }
  ], [stats])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {statsCards.map((stat, index) => (
        <CardTransition key={stat.title} delay={index * 0.1}>
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        </CardTransition>
      ))}
    </div>
  )
}

// Componente de tabla de usuarios optimizado
const UsersTable = ({ usuarios, empresas, onEditUser }: { 
  usuarios: Usuario[], 
  empresas: any[], 
  onEditUser: (user: Usuario) => void 
}) => {
  const getEmpresaName = useCallback((empresaId: string | null | undefined) => {
    if (!empresaId) return 'Sin empresa'
    const empresa = empresas.find(e => e.id === empresaId)
    return empresa?.nombre || 'Empresa no encontrada'
  }, [empresas])

  const getAvatarFallback = useCallback((nombre: string, apellido: string | null) => {
    return `${nombre.charAt(0)}${apellido ? apellido.charAt(0) : ''}`.toUpperCase()
  }, [])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha Registro</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((usuario, index) => (
          <motion.tr
            key={usuario.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
          >
            <TableCell>
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={usuario.avatar_url} />
                  <AvatarFallback>
                    {getAvatarFallback(usuario.nombre, usuario.apellido)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {usuario.nombre} {usuario.apellido || ''}
                  </div>
                  {usuario.cargo && (
                    <div className="text-sm text-muted-foreground">{usuario.cargo}</div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{usuario.email}</TableCell>
            <TableCell>{getEmpresaName(usuario.empresa_id)}</TableCell>
            <TableCell>
              <Badge variant={usuario.rol === 'admin' ? 'default' : 'secondary'}>
                {usuario.rol}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={usuario.is_active ? 'default' : 'destructive'}>
                {usuario.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(usuario.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditUser(usuario)}
              >
                Editar
              </Button>
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  )
}

export default function UsersPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "cliente",
    company: "",
    cargo: "",
    telefono: ""
  })

  // Memoizar la función de fetch para evitar recreaciones
  const fetchUsuarios = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/admin/usuarios')
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data.usuarios || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error obteniendo usuarios')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchEmpresas = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/empresas')
      if (response.ok) {
        const data = await response.json()
        setEmpresas(data.empresas || [])
      }
    } catch (error) {
      // Error silencioso para empresas
    }
  }, [])

  const handleCreateUser = useCallback(async () => {
    try {
      if (!formData.name || !formData.email || !formData.role) {
        alert('Por favor completa todos los campos requeridos')
        return
      }

      if (formData.role === 'cliente' && !formData.company) {
        alert('Por favor selecciona una empresa para usuarios cliente')
        return
      }

      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        
        setIsDialogOpen(false)
        setFormData({ 
          name: "", 
          email: "", 
          role: "cliente", 
          company: "",
          cargo: "",
          telefono: ""
        })
        
        await fetchUsuarios()
        alert('Usuario creado exitosamente.')
      } else {
        const errorData = await response.json()
        alert(`Error creando usuario: ${errorData.error || 'Error desconocido'}`)
      }
    } catch (error) {
      alert('Error creando el usuario. Intenta nuevamente.')
    }
  }, [formData, fetchUsuarios])

  const handleUpdateUser = useCallback(async () => {
    if (!selectedUser) return

    try {
      if (!formData.name || !formData.email || !formData.role) {
        alert('Por favor completa todos los campos requeridos')
        return
      }

      if (formData.role === 'cliente' && !formData.company) {
        alert('Por favor selecciona una empresa para usuarios cliente')
        return
      }

      const response = await fetch(`/api/admin/usuarios/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        setFormData({ 
          name: "", 
          email: "", 
          role: "cliente", 
          company: "",
          cargo: "",
          telefono: ""
        })
        
        await fetchUsuarios()
        alert('Usuario actualizado exitosamente.')
      } else {
        const errorData = await response.json()
        alert(`Error actualizando usuario: ${errorData.error || 'Error desconocido'}`)
      }
    } catch (error) {
      alert('Error actualizando el usuario. Intenta nuevamente.')
    }
  }, [formData, selectedUser, fetchUsuarios])

  const handleEditUser = useCallback((user: Usuario) => {
    setSelectedUser(user)
    setFormData({
      name: `${user.nombre} ${user.apellido || ''}`.trim(),
      email: user.email,
      role: user.rol,
      company: user.empresa_id || "",
      cargo: user.cargo || "",
      telefono: user.telefono || ""
    })
    setIsEditDialogOpen(true)
  }, [])

  // Memoizar las estadísticas calculadas
  const stats = useMemo(() => {
    const total = usuarios.length
    const activos = usuarios.filter(u => u.is_active).length
    const administradores = usuarios.filter(u => u.rol === 'admin').length
    const clientes = usuarios.filter(u => u.rol === 'cliente').length
    
    return { total, activos, administradores, clientes }
  }, [usuarios])

  useEffect(() => {
    fetchUsuarios()
    fetchEmpresas()
  }, [fetchUsuarios, fetchEmpresas])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <StaggeredPageTransition className="space-y-8">
      {/* Header */}
      <CardTransition>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Usuarios</h1>
            <p className="text-muted-foreground">Gestiona todos los usuarios del sistema</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Completa la información del nuevo usuario
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Rol *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="cliente">Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    />
                  </div>
                  {formData.role === 'cliente' && (
                    <div>
                      <Label htmlFor="company">Empresa *</Label>
                      <Select value={formData.company} onValueChange={(value) => setFormData({...formData, company: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {empresas.map((empresa) => (
                            <SelectItem key={empresa.id} value={empresa.id}>
                              {empresa.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser}>Crear Usuario</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardTransition>

      {/* Error Message */}
      {error && <ErrorCard error={error} />}

      {/* Stats Cards */}
      <StatsGrid stats={stats} />

      {/* Users Table */}
      <CardTransition delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              Todos los usuarios registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable 
              usuarios={usuarios} 
              empresas={empresas} 
              onEditUser={handleEditUser} 
            />
          </CardContent>
        </Card>
      </CardTransition>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nombre Completo *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role">Rol *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-cargo">Cargo</Label>
                <Input
                  id="edit-cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input
                  id="edit-telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
              {formData.role === 'cliente' && (
                <div>
                  <Label htmlFor="edit-company">Empresa *</Label>
                  <Select value={formData.company} onValueChange={(value) => setFormData({...formData, company: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {empresa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateUser}>Actualizar Usuario</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </StaggeredPageTransition>
  )
}
