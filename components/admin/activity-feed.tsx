import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, User, FileText, Building2 } from "lucide-react"
import { Actividad } from "@/lib/types"

interface ActivityFeedProps {
  actividades: Actividad[]
}

const getActionIcon = (accion: string) => {
  switch (accion) {
    case "crear_post":
      return <FileText className="w-4 h-4" />
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
    case "crear_usuario":
      return (
        <Badge variant="secondary" className="text-xs">
          Usuario
        </Badge>
      )
    case "crear_empresa":
      return (
        <Badge variant="outline" className="text-xs">
          Empresa
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

export function ActivityFeed({ actividades }: ActivityFeedProps) {
  if (!actividades || actividades.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No hay actividad reciente</p>
        <p className="text-sm text-muted-foreground mt-2">Las actividades aparecerán aquí cuando los usuarios realicen acciones</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {actividades.map((actividad) => (
        <div key={actividad.id} className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            {getActionIcon(actividad.accion)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium truncate">
                {actividad.usuarios?.nombre} {actividad.usuarios?.apellido}
              </p>
              {getActionBadge(actividad.accion)}
            </div>
            <p className="text-sm text-muted-foreground">
              {actividad.descripcion}
              {actividad.empresas?.nombre && (
                <span className="font-medium"> en {actividad.empresas.nombre}</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(actividad.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
