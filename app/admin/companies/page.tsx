"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CompaniesTable } from "@/components/admin/companies-table"
import { Building2, Plus, Users, TrendingUp, AlertCircle } from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { PageTransition, StaggeredPageTransition, CardTransition } from "@/components/page-transition"
import { Empresa } from "@/lib/types"

// Componente de loading optimizado
const LoadingSpinner = () => (
  <PageTransition>
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Cargando empresas...</p>
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
const StatsGrid = ({ stats }: { stats: { total: number; activas: number; inactivas: number; pagadas: number; pendientes: number; totalUsuarios: number } }) => {
  const statsCards = useMemo(() => [
    {
      title: "Total Empresas",
      value: stats.total.toString(),
      description: "Empresas registradas",
      icon: Building2,
      color: "text-blue-600"
    },
    {
      title: "Empresas Activas",
      value: stats.activas.toString(),
      description: "Empresas operativas",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Licencias Pagadas",
      value: stats.pagadas.toString(),
      description: "Empresas con pago al día",
      icon: Users,
      color: "text-emerald-600"
    },
    {
      title: "Pagos Pendientes",
      value: stats.pendientes.toString(),
      description: "Empresas con pago pendiente",
      icon: AlertCircle,
      color: "text-red-600"
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

export default function CompaniesPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    rubro: "",
    sitio_web: "",
    descripcion: "",
    logo_url: "",
    is_active: true
  })

  // Memoizar la función de fetch para evitar recreaciones
  const fetchEmpresas = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/empresas')
      
      if (response.ok) {
        const data = await response.json()
        setEmpresas(data.empresas)
      } else {
        setError('Error cargando empresas')
      }
    } catch (error) {
      setError('Error cargando empresas')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCreateCompany = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setIsCreateDialogOpen(false)
        setFormData({
          nombre: "",
          rubro: "",
          sitio_web: "",
          descripcion: "",
          logo_url: "",
          is_active: true
        })
        fetchEmpresas() // Recargar datos
      } else {
        const errorData = await response.json()
        alert(`Error creando empresa: ${errorData.error || 'Error desconocido'}`)
      }
    } catch (error) {
      alert('Error creando empresa. Intenta nuevamente.')
    }
  }, [formData, fetchEmpresas])

  // Memoizar las estadísticas calculadas
  const stats = useMemo(() => {
    const total = empresas.length
    const activas = empresas.filter(e => e.is_active).length
    const inactivas = total - activas
    const pagadas = empresas.filter(e => e.pago_recibido).length
    const pendientes = total - pagadas
    const totalUsuarios = empresas.reduce((sum, empresa) => sum + (empresa.usuarios_count || 0), 0)
    
    return { total, activas, inactivas, pagadas, pendientes, totalUsuarios }
  }, [empresas])

  useEffect(() => {
    fetchEmpresas()
  }, [fetchEmpresas])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <StaggeredPageTransition className="space-y-8">
      {/* Header */}
      <CardTransition>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Empresas</h1>
            <p className="text-muted-foreground">Gestiona todas las empresas registradas</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Empresa</DialogTitle>
                <DialogDescription>
                  Completa la información de la nueva empresa
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre de la Empresa *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rubro">Rubro *</Label>
                    <Input
                      id="rubro"
                      value={formData.rubro}
                      onChange={(e) => setFormData({...formData, rubro: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sitio_web">Sitio Web</Label>
                  <Input
                    id="sitio_web"
                    type="url"
                    value={formData.sitio_web}
                    onChange={(e) => setFormData({...formData, sitio_web: e.target.value})}
                    placeholder="https://ejemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="logo_url">URL del Logo</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows={3}
                    placeholder="Describe la empresa..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Empresa</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardTransition>

      {/* Error Message */}
      {error && <ErrorCard error={error} />}

      {/* Stats Cards */}
      <StatsGrid stats={stats} />

      {/* Companies Table */}
      <CardTransition delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Empresas</CardTitle>
            <CardDescription>
              Todas las empresas registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompaniesTable empresas={empresas} onRefresh={fetchEmpresas} />
          </CardContent>
        </Card>
      </CardTransition>
    </StaggeredPageTransition>
  )
}
