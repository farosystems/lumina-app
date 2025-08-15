"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, FileText, TrendingUp, Clock } from "lucide-react"
import { StatsCard } from "@/components/admin/stats-card"
import { ActivityFeed } from "@/components/admin/activity-feed"
import { PostsChart } from "@/components/admin/posts-chart"
import { BarChart3 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState, useMemo, useCallback } from "react"
import { PageTransition, StaggeredPageTransition, CardTransition } from "@/components/page-transition"
import { Actividad } from "@/lib/types"

interface DashboardStats {
  empresas: {
    total: number
    activas: number
    nuevasEsteMes: number
    tendencia: number
  }
  usuarios: {
    total: number
    activos: number
    activosHoy: number
    tendencia: number
  }
  posts: {
    total: number
    generadosHoy: number
    generadosAyer: number
    publicados: number
    tendencia: number
  }
  conversion: {
    tasa: number
    tendencia: number
  }
}

interface GraficoPost {
  dia: string
  posts: number
}

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

// Componente de error optimizado
const ErrorCard = ({ error }: { error: string }) => (
  <CardTransition>
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <p className="text-red-700">{error}</p>
      </CardContent>
    </Card>
  </CardTransition>
)

// Componente de bienvenida optimizado
const WelcomeCard = ({ userName }: { userName: string }) => (
  <CardTransition>
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="text-xl">
          ¡Bienvenido, {userName}!
        </CardTitle>
        <CardDescription>
          Panel de administración de Lumina
        </CardDescription>
      </CardHeader>
    </Card>
  </CardTransition>
)

// Componente de estadísticas optimizado
const StatsGrid = ({ stats }: { stats: DashboardStats }) => {
  const statsCards = useMemo(() => [
    {
      title: "Total Empresas",
      value: stats.empresas.total.toString(),
      description: `${stats.empresas.nuevasEsteMes} nuevas este mes`,
      icon: Building2,
      trend: `+${stats.empresas.tendencia}%`,
      trendUp: stats.empresas.tendencia >= 0,
      delay: 0.1
    },
    {
      title: "Usuarios Activos",
      value: stats.usuarios.total.toString(),
      description: `${stats.usuarios.activosHoy} activos hoy`,
      icon: Users,
      trend: `+${stats.usuarios.tendencia}%`,
      trendUp: stats.usuarios.tendencia >= 0,
      delay: 0.2
    },
    {
      title: "Posts Generados Hoy",
      value: stats.posts.generadosHoy.toString(),
      description: `${stats.posts.generadosAyer} más que ayer`,
      icon: FileText,
      trend: `+${stats.posts.tendencia}%`,
      trendUp: stats.posts.tendencia >= 0,
      delay: 0.3
    },
    {
      title: "Tasa de Conversión",
      value: `${stats.conversion.tasa}%`,
      description: "Posts publicados",
      icon: TrendingUp,
      trend: `+${stats.conversion.tendencia}%`,
      trendUp: stats.conversion.tendencia >= 0,
      delay: 0.4
    }
  ], [stats])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {statsCards.map((card, index) => (
        <CardTransition key={card.title} delay={card.delay}>
          <StatsCard {...card} />
        </CardTransition>
      ))}
    </div>
  )
}

// Componente de acciones rápidas optimizado
const QuickActions = () => (
  <CardTransition delay={0.7}>
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>Tareas comunes de administración</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button className="p-4 h-auto bg-gradient-primary hover:opacity-90 border border-border rounded-lg transition-colors">
            <div className="flex items-center space-x-3 w-full">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Nueva Empresa</h3>
                <p className="text-sm text-white/80">Crear empresa y configurar usuarios</p>
              </div>
            </div>
          </Button>
          <div className="p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Invitar Usuario</h3>
                <p className="text-sm text-muted-foreground">Enviar invitación por email</p>
              </div>
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Ver Reportes</h3>
                <p className="text-sm text-muted-foreground">Análisis detallado de uso</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </CardTransition>
)

export default function AdminDashboard() {
  const { isSignedIn, isLoaded } = useUser()
  const [userData, setUserData] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [graficoPosts, setGraficoPosts] = useState<GraficoPost[]>([])
  const [actividadesRecientes, setActividadesRecientes] = useState<Actividad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Memoizar la función de fetch para evitar recreaciones
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        
        if (data.rol !== 'admin') {
          window.location.href = '/dashboard'
          return
        }
        
        setUserData(data)
        fetchDashboardStats()
      } else {
        window.location.href = '/sign-in'
      }
    } catch (error) {
      window.location.href = '/sign-in'
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.estadisticas)
        setGraficoPosts(data.graficoPosts || [])
        setActividadesRecientes(data.actividadReciente || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error obteniendo estadísticas')
      }
    } catch (error) {
      setError('Error de conexión')
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

  if (shouldShowLoading) {
    return <LoadingSpinner />
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <StaggeredPageTransition className="space-y-8">
      {/* Welcome Message */}
      {userData && <WelcomeCard userName={userData.nombre} />}

      {/* Error Message */}
      {error && <ErrorCard error={error} />}

      {/* Stats Cards */}
      {stats && <StatsGrid stats={stats} />}

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Posts Chart */}
        <CardTransition delay={0.5}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Posts Generados (Últimos 7 días)</span>
              </CardTitle>
              <CardDescription>Tendencia de generación de contenido</CardDescription>
            </CardHeader>
            <CardContent>
              <PostsChart data={graficoPosts} />
            </CardContent>
          </Card>
        </CardTransition>

        {/* Recent Activity */}
        <CardTransition delay={0.6}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Actividad Reciente</span>
              </CardTitle>
              <CardDescription>Últimas acciones en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed actividades={actividadesRecientes} />
            </CardContent>
          </Card>
        </CardTransition>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </StaggeredPageTransition>
  )
}
