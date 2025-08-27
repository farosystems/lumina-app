import { Badge } from "@/components/ui/badge"
import { Clock, FileText, Calendar, TrendingUp, Instagram, Facebook, User, Building2 } from "lucide-react"
import { useActividad } from "@/lib/hooks/use-actividad"

interface RecentActivityProps {
  limit?: number
}

const getActionIcon = (accion: string) => {
  switch (accion) {
    case "crear_post":
      return <FileText className="w-4 h-4" />
    case "publicar_post":
      return <Instagram className="w-4 h-4" />
    case "programar_post":
      return <Calendar className="w-4 h-4" />
    case "conectar_instagram":
      return <Instagram className="w-4 h-4" />
    case "conectar_facebook":
      return <Facebook className="w-4 h-4" />
    case "analisis_completado":
      return <TrendingUp className="w-4 h-4" />
    case "crear_usuario":
      return <User className="w-4 h-4" />
    case "crear_empresa":
      return <Building2 className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getActionBadge = (accion: string) => {
  switch (accion) {
    case "crear_post":
      return (
        <Badge variant="default" className="text-xs">
          Post
        </Badge>
      )
    case "publicar_post":
      return (
        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
          Publicado
        </Badge>
      )
    case "programar_post":
      return (
        <Badge variant="secondary" className="text-xs">
          Programado
        </Badge>
      )
    case "conectar_instagram":
    case "conectar_facebook":
      return (
        <Badge variant="outline" className="text-xs">
          Conexión
        </Badge>
      )
    case "analisis_completado":
      return (
        <Badge variant="outline" className="text-xs">
          Completado
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Actividad
        </Badge>
      )
  }
}

const getActionColor = (accion: string) => {
  switch (accion) {
    case "crear_post":
      return "bg-blue-100 text-blue-600"
    case "publicar_post":
      return "bg-green-100 text-green-600"
    case "programar_post":
      return "bg-purple-100 text-purple-600"
    case "conectar_instagram":
      return "bg-pink-100 text-pink-600"
    case "conectar_facebook":
      return "bg-blue-600 text-white"
    case "analisis_completado":
      return "bg-green-100 text-green-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return 'Ahora mismo'
  } else if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `Hace ${days} día${days > 1 ? 's' : ''}`
  }
}

export function RecentActivity({ limit = 10 }: RecentActivityProps) {
  const { actividades, isLoading, error } = useActividad(limit)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">Error cargando actividades</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    )
  }

  if (!actividades || actividades.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No hay actividad reciente</p>
        <p className="text-sm text-muted-foreground mt-2">Las actividades aparecerán aquí cuando realices acciones</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {actividades.map((actividad) => (
        <div key={actividad.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionColor(actividad.accion)}`}>
              {getActionIcon(actividad.accion)}
            </div>
            <div>
              <p className="font-medium">{actividad.descripcion}</p>
              <p className="text-sm text-muted-foreground">{formatDate(actividad.created_at)}</p>
            </div>
          </div>
          {getActionBadge(actividad.accion)}
        </div>
      ))}
    </div>
  )
}
