export interface Empresa {
  id: string
  nombre: string
  rubro: string
  sitio_web?: string
  descripcion?: string
  logo_url?: string
  is_active: boolean
  pago_recibido: boolean
  created_at: string
  updated_at: string
  usuarios_count: number
  estado: string
  fecha_registro: string
  ultima_actualizacion: string
}

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: string
  cargo?: string
  telefono?: string
  empresa_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
  avatar_url?: string
  clerk_id?: string
}

export interface Post {
  id: string
  titulo: string | null
  contenido: string
  plataforma: string
  estado: string
  tipo: 'publicacion' | 'historia'
  fecha_programada: string | null
  fecha_publicacion: string | null
  imagen_url: string | null
  hashtags: string[]
  created_at: string
  usuarios: {
    nombre: string
    apellido: string
    email: string
  }
}

export interface Actividad {
  id: string
  accion: string
  descripcion: string
  created_at: string
  usuarios: {
    nombre: string
    apellido: string
    email: string
  }
  empresas: {
    nombre: string
  }
}

export interface ConexionSocial {
  id: string
  usuario_id: string
  empresa_id: string
  plataforma: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'
  nombre_cuenta: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
  account_id?: string
  metadata?: {
    followers?: number
    tipo_cuenta?: string
    profile_picture?: string
    [key: string]: any
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PublicacionSocial {
  id: string
  post_id: string
  conexion_social_id: string
  plataforma: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'
  estado: 'pendiente' | 'publicando' | 'publicado' | 'fallido'
  fecha_programada?: string
  fecha_publicacion?: string
  post_id_plataforma?: string
  error_message?: string
  metadata?: {
    likes?: number
    comments?: number
    shares?: number
    reach?: number
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

export interface InstagramAccountInfo {
  id: string
  username: string
  name: string
  profile_picture_url?: string
  followers_count?: number
  media_count?: number
  account_type: 'BUSINESS' | 'CREATOR' | 'PERSONAL'
  page_id?: string
  page_name?: string
  page_access_token?: string
}







