import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Instagram, Facebook, MoreHorizontal, Eye, Copy, Calendar, Trash2 } from "lucide-react"

const posts = [
  {
    id: 1,
    product: "Café Especial Colombiano",
    image: "/placeholder.svg?height=200&width=200",
    createdAt: "2024-03-15",
    status: "published",
    platforms: ["instagram", "facebook"],
    copy: "☕ Descubre el sabor auténtico de Colombia en cada sorbo. Nuestro café especial tostado artesanalmente...",
  },
  {
    id: 2,
    product: "Croissant Artesanal",
    image: "/placeholder.svg?height=200&width=200",
    createdAt: "2024-03-14",
    status: "scheduled",
    platforms: ["instagram"],
    copy: "🥐 Horneado fresco cada mañana con ingredientes premium. La tradición francesa en cada bocado...",
  },
  {
    id: 3,
    product: "Promoción Desayuno",
    image: "/placeholder.svg?height=200&width=200",
    createdAt: "2024-03-13",
    status: "draft",
    platforms: [],
    copy: "🌅 Comienza tu día con energía. Desayuno completo con café, tostadas y jugo natural...",
  },
  {
    id: 4,
    product: "Torta de Chocolate",
    image: "/placeholder.svg?height=200&width=200",
    createdAt: "2024-03-12",
    status: "published",
    platforms: ["instagram", "facebook"],
    copy: "🍰 Indulgencia pura en cada porción. Nuestra torta de chocolate artesanal con ingredientes premium...",
  },
  {
    id: 5,
    product: "Café con Leche",
    image: "/placeholder.svg?height=200&width=200",
    createdAt: "2024-03-11",
    status: "published",
    platforms: ["instagram"],
    copy: "☕ La combinación perfecta de espresso y leche vaporizada. Cremoso, suave y delicioso...",
  },
  {
    id: 6,
    product: "Sandwich Gourmet",
    image: "/placeholder.svg?height=200&width=200",
    createdAt: "2024-03-10",
    status: "scheduled",
    platforms: ["facebook"],
    copy: "🥪 Ingredientes frescos y de calidad en cada sandwich. Perfecto para tu almuerzo...",
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

export function PostsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {/* Post Image */}
          <div className="aspect-square bg-muted overflow-hidden">
            <img src={post.image || "/placeholder.svg"} alt={post.product} className="w-full h-full object-cover" />
          </div>

          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold truncate flex-1">{post.product}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="mr-2 h-4 w-4" />
                    Programar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Copy Preview */}
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.copy}</p>

            {/* Status and Platforms */}
            <div className="flex items-center justify-between mb-3">
              {getStatusBadge(post.status)}
              <div className="flex items-center space-x-1">
                {post.platforms.map((platform) => (
                  <span key={platform}>{getPlatformIcon(platform)}</span>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
