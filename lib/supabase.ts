import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente para el lado del cliente (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para el lado del servidor (con permisos elevados)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Tipos para TypeScript
export type Database = {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string
          nombre: string
          slug: string
          rubro: string
          imagen_transmitir: string | null
          colores: any
          fuentes: any
          publico_ideal: any
          logo_url: string | null
          sitio_web: string | null
          telefono: string | null
          email: string | null
          direccion: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          nombre: string
          slug: string
          rubro: string
          imagen_transmitir?: string | null
          colores?: any
          fuentes?: any
          publico_ideal?: any
          logo_url?: string | null
          sitio_web?: string | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          nombre?: string
          slug?: string
          rubro?: string
          imagen_transmitir?: string | null
          colores?: any
          fuentes?: any
          publico_ideal?: any
          logo_url?: string | null
          sitio_web?: string | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      usuarios: {
        Row: {
          id: string
          clerk_id: string
          email: string
          nombre: string | null
          apellido: string | null
          avatar_url: string | null
          rol: 'admin' | 'cliente'
          empresa_id: string | null
          cargo: string | null
          telefono: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          nombre?: string | null
          apellido?: string | null
          avatar_url?: string | null
          rol: 'admin' | 'cliente'
          empresa_id?: string | null
          cargo?: string | null
          telefono?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          nombre?: string | null
          apellido?: string | null
          avatar_url?: string | null
          rol?: 'admin' | 'cliente'
          empresa_id?: string | null
          cargo?: string | null
          telefono?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      posts: {
        Row: {
          id: string
          empresa_id: string
          usuario_id: string
          titulo: string | null
          contenido: string
          plataforma: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'
          estado: 'borrador' | 'programado' | 'publicado' | 'fallido'
          fecha_programada: string | null
          fecha_publicacion: string | null
          imagen_url: string | null
          hashtags: string[] | null
          metadata: any
          prompt_utilizado: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          usuario_id: string
          titulo?: string | null
          contenido: string
          plataforma: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'
          estado?: 'borrador' | 'programado' | 'publicado' | 'fallido'
          fecha_programada?: string | null
          fecha_publicacion?: string | null
          imagen_url?: string | null
          hashtags?: string[] | null
          metadata?: any
          prompt_utilizado?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string
          usuario_id?: string
          titulo?: string | null
          contenido?: string
          plataforma?: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'
          estado?: 'borrador' | 'programado' | 'publicado' | 'fallido'
          fecha_programada?: string | null
          fecha_publicacion?: string | null
          imagen_url?: string | null
          hashtags?: string[] | null
          metadata?: any
          prompt_utilizado?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plantillas_posts: {
        Row: {
          id: string
          empresa_id: string
          nombre: string
          descripcion: string | null
          tipo_contenido: string | null
          estructura_prompt: string | null
          variables: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          nombre: string
          descripcion?: string | null
          tipo_contenido?: string | null
          estructura_prompt?: string | null
          variables?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string
          nombre?: string
          descripcion?: string | null
          tipo_contenido?: string | null
          estructura_prompt?: string | null
          variables?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      registro_actividad: {
        Row: {
          id: string
          usuario_id: string | null
          empresa_id: string
          accion: string
          descripcion: string | null
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id?: string | null
          empresa_id: string
          accion: string
          descripcion?: string | null
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string | null
          empresa_id?: string
          accion?: string
          descripcion?: string | null
          metadata?: any
          created_at?: string
        }
      }
    }
  }
}




