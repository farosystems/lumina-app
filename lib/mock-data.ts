// Mock data para demostrar los procesos sin base de datos

export const mockCompanies = [
  {
    id: "1",
    name: "Café Aroma",
    industry: "Gastronomía",
    description: "Cafetería artesanal especializada en café de origen",
    website: "https://cafearoma.com",
    logo: "/placeholder.svg?height=40&width=40",
    createdAt: "2024-01-15",
    usersCount: 3,
    postsCount: 45,
  },
  {
    id: "2",
    name: "Boutique Luna",
    industry: "Moda",
    description: "Tienda de ropa femenina con diseños únicos",
    website: "https://boutiqueluna.com",
    logo: "/placeholder.svg?height=40&width=40",
    createdAt: "2024-02-01",
    usersCount: 2,
    postsCount: 32,
  },
]

export const mockUsers = [
  {
    id: "user_1",
    name: "María González",
    email: "maria@cafearoma.com",
    role: "client",
    company: "Café Aroma",
    avatar: "/placeholder.svg?height=32&width=32",
    lastActive: "2024-03-15",
  },
  {
    id: "user_2",
    name: "Carlos Admin",
    email: "admin@lumina.com",
    role: "admin",
    company: null,
    avatar: "/placeholder.svg?height=32&width=32",
    lastActive: "2024-03-15",
  },
]

export const mockPosts = [
  {
    id: "1",
    productName: "Café Colombiano Premium",
    content:
      "☕ Descubre el sabor auténtico de Colombia en cada sorbo. Nuestro café premium te transporta a las montañas cafeteras con su aroma intenso y sabor único.",
    hashtags: "#CaféPremium #Colombia #CaféArtesanal #SaborAuténtico #CaféAroma",
    imageUrl: "/placeholder.svg?height=400&width=400",
    platforms: ["instagram", "facebook"],
    status: "published",
    createdAt: "2024-03-14",
    engagement: { likes: 124, comments: 18, shares: 7 },
  },
  {
    id: "2",
    productName: "Vestido Floral Primavera",
    content:
      "🌸 La primavera llegó a Boutique Luna. Este vestido floral es perfecto para lucir elegante y fresca en cualquier ocasión especial.",
    hashtags: "#ModaFemenina #Primavera2024 #VestidoFloral #BoutiqueLuna #EstiloÚnico",
    imageUrl: "/placeholder.svg?height=400&width=400",
    platforms: ["instagram"],
    status: "draft",
    createdAt: "2024-03-13",
    engagement: { likes: 0, comments: 0, shares: 0 },
  },
]

export const mockStats = {
  totalCompanies: 12,
  postsToday: 8,
  activeUsers: 24,
  totalPosts: 156,
}

export const mockActivity = [
  {
    id: "1",
    type: "post_created",
    user: "María González",
    company: "Café Aroma",
    description: "Creó un nuevo post para Café Colombiano Premium",
    timestamp: "2024-03-15T10:30:00Z",
  },
  {
    id: "2",
    type: "user_registered",
    user: "Ana Martínez",
    company: "Boutique Luna",
    description: "Se registró como nuevo usuario",
    timestamp: "2024-03-15T09:15:00Z",
  },
]
