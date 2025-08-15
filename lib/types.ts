export interface Empresa {
  id: string
  nombre: string
  rubro: string
  sitio_web?: string
  descripcion?: string
  logo_url?: string
  is_active: boolean
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





