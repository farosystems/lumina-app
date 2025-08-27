"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreHorizontal, Edit, Users, Trash2, Building2, CreditCard, CheckCircle, XCircle } from "lucide-react"
import { EditCompanyDialog } from "./edit-company-dialog"
import { CompanyUsersDialog } from "./company-users-dialog"
import { Empresa } from "@/lib/types"

interface CompaniesTableProps {
  empresas: Empresa[]
  onRefresh?: () => void
}

const getStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
      Activa
    </Badge>
  ) : (
    <Badge variant="secondary">Inactiva</Badge>
  )
}

const getPaymentBadge = (pagoRecibido: boolean) => {
  return pagoRecibido ? (
    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
      <CheckCircle className="w-3 h-3 mr-1" />
      Pagado
    </Badge>
  ) : (
    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
      <XCircle className="w-3 h-3 mr-1" />
      Pendiente
    </Badge>
  )
}

const getIndustryColor = (industry: string) => {
  const colors: { [key: string]: string } = {
    Gastronomía: "bg-orange-100 text-orange-800",
    Tecnología: "bg-blue-100 text-blue-800",
    Moda: "bg-purple-100 text-purple-800",
    Salud: "bg-green-100 text-green-800",
    Educación: "bg-indigo-100 text-indigo-800",
    Finanzas: "bg-emerald-100 text-emerald-800",
    Entretenimiento: "bg-pink-100 text-pink-800",
    Automotriz: "bg-gray-100 text-gray-800",
  }
  return colors[industry] || "bg-gray-100 text-gray-800"
}

export function CompaniesTable({ empresas, onRefresh }: CompaniesTableProps) {
  const [selectedCompany, setSelectedCompany] = useState<Empresa | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false)
  const [pendingPaymentAction, setPendingPaymentAction] = useState<{
    empresaId: string
    currentStatus: boolean
    empresaNombre: string
  } | null>(null)

  const handleEdit = (empresa: Empresa) => {
    setSelectedCompany(empresa)
    setIsEditDialogOpen(true)
  }

  const handleViewUsers = (empresa: Empresa) => {
    setSelectedCompany(empresa)
    setIsUsersDialogOpen(true)
  }

  const handleDelete = async (empresaId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta empresa? Esta acción no se puede deshacer.')) {
      console.log('🔍 Eliminando empresa:', empresaId)
      // Aquí iría la lógica para eliminar la empresa
      // await deleteEmpresa(empresaId)
      // onRefresh?.()
    }
  }

  const handleTogglePayment = (empresaId: string, currentStatus: boolean, empresaNombre: string) => {
    setPendingPaymentAction({
      empresaId,
      currentStatus,
      empresaNombre
    })
    setIsPaymentConfirmOpen(true)
  }

  const confirmPaymentToggle = async () => {
    if (!pendingPaymentAction) return

    const { empresaId, currentStatus } = pendingPaymentAction
    const newStatus = !currentStatus

    try {
      const response = await fetch(`/api/admin/empresas/${empresaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pago_recibido: newStatus
        })
      })

      if (response.ok) {
        console.log(`✅ Estado de pago actualizado para empresa ${empresaId}`)
        onRefresh?.()
      } else {
        console.error('❌ Error actualizando estado de pago')
        alert('Error actualizando el estado de pago')
      }
    } catch (error) {
      console.error('❌ Error en confirmPaymentToggle:', error)
      alert('Error actualizando el estado de pago')
    } finally {
      setIsPaymentConfirmOpen(false)
      setPendingPaymentAction(null)
    }
  }

  const handleSaveEdit = (empresaActualizada: Empresa) => {
    console.log('✅ Empresa actualizada:', empresaActualizada)
    // Recargar los datos de la tabla
    onRefresh?.()
  }

  if (!empresas || empresas.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No hay empresas registradas</p>
        <p className="text-sm text-muted-foreground mt-2">Crea la primera empresa para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Rubro</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Sitio Web</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresas.map((empresa) => (
              <TableRow key={empresa.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={empresa.logo_url || "/placeholder.svg"} alt={empresa.nombre} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                        {empresa.nombre.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{empresa.nombre}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getIndustryColor(empresa.rubro)}>
                    {empresa.rubro}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    {empresa.descripcion ? (
                      <div className="text-sm text-muted-foreground truncate" title={empresa.descripcion}>
                        {empresa.descripcion}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin descripción</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {empresa.sitio_web ? (
                    <a 
                      href={empresa.sitio_web.startsWith('http') ? empresa.sitio_web : `https://${empresa.sitio_web}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline text-sm"
                    >
                      {empresa.sitio_web}
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">No especificado</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{empresa.usuarios_count}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(empresa.is_active)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getPaymentBadge(empresa.pago_recibido)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePayment(empresa.id, empresa.pago_recibido, empresa.nombre)}
                      className="h-6 w-6 p-0"
                    >
                      <CreditCard className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {empresa.fecha_registro}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => handleEdit(empresa)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleViewUsers(empresa)}
                        className="cursor-pointer"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Ver Usuarios
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive cursor-pointer"
                        onClick={() => handleDelete(empresa.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Popup de Editar Empresa */}
      <EditCompanyDialog
        empresa={selectedCompany}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedCompany(null)
        }}
        onSave={handleSaveEdit}
      />

      {/* Popup de Ver Usuarios */}
      <CompanyUsersDialog
        empresa={selectedCompany}
        isOpen={isUsersDialogOpen}
        onClose={() => {
          setIsUsersDialogOpen(false)
          setSelectedCompany(null)
        }}
      />

      {/* Modal de Confirmación de Pago */}
      <Dialog open={isPaymentConfirmOpen} onOpenChange={setIsPaymentConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Cambio de Estado de Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              ¿Estás seguro de que quieres{' '}
              <span className="font-semibold">
                {pendingPaymentAction?.currentStatus ? 'marcar como pendiente' : 'marcar como pagado'}
              </span>{' '}
              para la empresa{' '}
              <span className="font-semibold text-primary">
                {pendingPaymentAction?.empresaNombre}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPaymentConfirmOpen(false)
                  setPendingPaymentAction(null)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={confirmPaymentToggle}>
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
