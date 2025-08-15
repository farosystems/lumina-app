import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Instagram, Facebook, MoreHorizontal, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const recentPosts = [
  {
    id: 1,
    product: "Café Especial Colombiano",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2024-03-15",
    status: "published",
    platforms: ["instagram", "facebook"],
    copy: "☕ Descubre el sabor auténtico de Colombia en cada sorbo...",
  },
  {
    id: 2,
    product: "Croissant Artesanal",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2024-03-14",
    status: "scheduled",
    platforms: ["instagram"],
    copy: "🥐 Horneado fresco cada mañana con ingredientes premium...",
  },
  {
    id: 3,
    product: "Promoción Desayuno",
    image: "/placeholder.svg?height=80&width=80",
    createdAt: "2024-03-13",
    status: "draft",
    platforms: [],
    copy: "🌅 Comienza tu día con energía. Desayuno completo...",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "published":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          Publicado
        </Badge>
      )
    case "scheduled":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Programado
        </Badge>
      )
    case "draft":
      return <Badge variant="outline">Borrador</Badge>
    default:
      return <Badge variant="outline">Desconocido</Badge>
  }
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "instagram":
      return <Instagram className="w-4 h-4 text-purple-600" />
    case "facebook":
      return <Facebook className="w-4 h-4 text-blue-600" />
    default:
      return null
  }
}

export function RecentPosts() {
  return (
    <div className="space-y-4">
      {recentPosts.map((post) => (
        <div
          key={post.id}
          className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
        >
          {/* Post Image */}
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            <img src={post.image || "/placeholder.svg"} alt={post.product} className="w-full h-full object-cover" />
          </div>

          {/* Post Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium truncate">{post.product}</h3>
              {getStatusBadge(post.status)}
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">{post.copy}</p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{new Date(post.createdAt).toLocaleDateString("es-ES")}</span>
              {post.platforms.length > 0 && (
                <div className="flex items-center space-x-1">
                  {post.platforms.map((platform) => (
                    <span key={platform}>{getPlatformIcon(platform)}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem>Duplicar</DropdownMenuItem>
                <DropdownMenuItem>Programar</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}
