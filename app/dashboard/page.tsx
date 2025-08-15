"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Calendar, Instagram, Facebook, TrendingUp, Clock, User, Building2, Globe, Target } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState, useMemo, useCallback } from "react"
import { PageTransition, StaggeredPageTransition, CardTransition } from "@/components/page-transition"

// Componente de loading optimizado
const LoadingSpinner = () => (
  <PageTransition>
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Cargando dashboard...</p>
      </div>
    </div>
  </PageTransition>
)

// Componente de estadísticas optimizado
const StatsCard = ({ title, value, description, icon: Icon, trend, trendUp }: {
  title: string
  value: string
  description: string
  icon: any
  trend?: string
  trendUp?: boolean
}) => (
  <Card className="hover:shadow-lg transition-all duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {trend && (
        <div className={`flex items-center text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`h-3 w-3 mr-1 ${trendUp ? '' : 'rotate-180'}`} />
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
)

// Componente de acción rápida optimizado
const QuickActionCard = ({ title, description, icon: Icon, href, variant = "default" }: {
  title: string
  description: string
  icon: any
  href: string
  variant?: "default" | "primary"
}) => (
  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
    <CardHeader>
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded-lg ${variant === "primary" ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button 
        variant={variant === "primary" ? "default" : variant} 
        className={`w-full group-hover:scale-105 transition-transform ${variant === "primary" ? 'bg-primary hover:bg-primary/90' : ''}`}
        onClick={() => window.location.href = href}
      >
        <Plus className="w-4 h-4 mr-2" />
        Crear
      </Button>
    </CardContent>
  </Card>
)

// Componente de información de empresa optimizado
const CompanyInfoCard = ({ empresaData }: { empresaData: any }) => (
  <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
    <CardHeader>
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <CardTitle className="text-xl">{empresaData?.nombre || 'Empresa'}</CardTitle>
          <CardDescription>Información de tu empresa</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            <strong>Sitio web:</strong> {empresaData?.sitio_web || 'No especificado'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            <strong>Rubro:</strong> {empresaData?.rubro || 'No especificado'}
          </span>
        </div>
      </div>
      {empresaData?.descripcion && (
        <div>
          <p className="text-sm text-muted-foreground">{empresaData.descripcion}</p>
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Registrada: {empresaData?.created_at ? new Date(empresaData.created_at).toLocaleDateString() : 'N/A'}</span>
        <Badge variant={empresaData?.is_active ? "default" : "secondary"}>
          {empresaData?.is_active ? 'Activa' : 'Inactiva'}
        </Badge>
      </div>
    </CardContent>
  </Card>
)

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser()
  const [userData, setUserData] = useState<any>(null)
  const [empresaData, setEmpresaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Memoizar la función de fetch para evitar recreaciones
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        
        if (data.empresa_id) {
          fetchEmpresaData(data.empresa_id)
        }
      }
    } catch (error) {
      // Error silencioso
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchEmpresaData = useCallback(async (empresaId: string) => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}`)
      if (response.ok) {
        const data = await response.json()
        setEmpresaData(data)
      }
    } catch (error) {
      // Error silencioso
    }
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUserData()
    }
  }, [isSignedIn, isLoaded, fetchUserData])

  // Memoizar el estado de carga
  const shouldShowLoading = useMemo(() => {
    return isLoading || !isLoaded
  }, [isLoading, isLoaded])

  // Memoizar las estadísticas
  const stats = useMemo(() => [
    {
      title: "Posts Generados",
      value: "12",
      description: "+2 desde la última semana",
      icon: FileText,
      trend: "+16%",
      trendUp: true
    },
    {
      title: "Campañas Activas",
      value: "3",
      description: "2 en Instagram, 1 en Facebook",
      icon: Calendar,
      trend: "+50%",
      trendUp: true
    },
    {
      title: "Alcance Total",
      value: "2.4K",
      description: "1.2K esta semana",
      icon: TrendingUp,
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Tiempo Promedio",
      value: "2.3s",
      description: "Tiempo de carga de posts",
      icon: Clock,
      trend: "-8%",
      trendUp: false
    }
  ], [])

  // Memoizar las acciones rápidas
  const quickActions = useMemo(() => [
    {
      title: "Nuevo Post",
      description: "Crea contenido para redes sociales",
      icon: Plus,
      href: "/dashboard/generate",
      variant: "primary" as const
    },
    {
      title: "Campaña",
      description: "Programa múltiples publicaciones",
      icon: Calendar,
      href: "/dashboard/campaigns"
    },
    {
      title: "Análisis",
      description: "Revisa métricas y rendimiento",
      icon: TrendingUp,
      href: "/dashboard/analytics"
    }
  ], [])

  if (shouldShowLoading) {
    return <LoadingSpinner />
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <StaggeredPageTransition className="space-y-8">
      {/* Header */}
      <CardTransition>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido de vuelta, {userData?.nombre || 'Usuario'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <User className="w-3 h-3 mr-1" />
              {userData?.rol || 'Usuario'}
            </Badge>
          </div>
        </div>
      </CardTransition>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <CardTransition key={stat.title} delay={index * 0.1}>
            <StatsCard {...stat} />
          </CardTransition>
        ))}
      </div>

      {/* Company Info */}
      {empresaData && (
        <CardTransition delay={0.4}>
          <CompanyInfoCard empresaData={empresaData} />
        </CardTransition>
      )}

      {/* Quick Actions */}
      <CardTransition delay={0.5}>
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Comienza a crear contenido para tus redes sociales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <QuickActionCard key={action.title} {...action} />
              ))}
            </div>
          </CardContent>
        </Card>
      </CardTransition>

      {/* Recent Activity */}
      <CardTransition delay={0.6}>
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas publicaciones y actividades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Post publicado en Instagram</p>
                    <p className="text-sm text-muted-foreground">Hace 2 horas</p>
                  </div>
                </div>
                <Badge variant="outline">Publicado</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Facebook className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Campaña programada</p>
                    <p className="text-sm text-muted-foreground">Para mañana a las 10:00</p>
                  </div>
                </div>
                <Badge variant="secondary">Programado</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Análisis completado</p>
                    <p className="text-sm text-muted-foreground">Rendimiento mejorado 15%</p>
                  </div>
                </div>
                <Badge variant="outline">Completado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardTransition>
    </StaggeredPageTransition>
  )
}
