import { supabaseAdmin } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Usuario = Database['public']['Tables']['usuarios']['Row']
type UsuarioInsert = Database['public']['Tables']['usuarios']['Insert']
type UsuarioUpdate = Database['public']['Tables']['usuarios']['Update']

export class UsuariosService {
  // Obtener usuario por clerk_id
  static async getUsuarioByClerkId(clerkId: string) {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select(`
        *,
        empresas (*)
      `)
      .eq('clerk_id', clerkId)
      .single()

    if (error) throw new Error(`Error al obtener usuario: ${error.message}`)
    return data
  }

  // Obtener usuario por ID
  static async getUsuarioById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select(`
        *,
        empresas (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw new Error(`Error al obtener usuario: ${error.message}`)
    return data
  }

  // Obtener usuarios por empresa
  static async getUsuariosByEmpresa(empresaId: string) {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al obtener usuarios: ${error.message}`)
    return data
  }

  // Obtener todos los usuarios (solo admin)
  static async getAllUsuarios() {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select(`
        *,
        empresas (nombre, slug)
      `)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al obtener usuarios: ${error.message}`)
    return data
  }

  // Crear usuario
  static async createUsuario(usuario: UsuarioInsert) {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .insert(usuario)
      .select()
      .single()

    if (error) throw new Error(`Error al crear usuario: ${error.message}`)
    return data
  }

  // Actualizar usuario
  static async updateUsuario(id: string, usuario: UsuarioUpdate) {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update(usuario)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar usuario: ${error.message}`)
    return data
  }

  // Eliminar usuario (soft delete)
  static async deleteUsuario(id: string) {
    const { error } = await supabaseAdmin
      .from('usuarios')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw new Error(`Error al eliminar usuario: ${error.message}`)
    return true
  }

  // Verificar si el email existe
  static async emailExists(email: string, excludeId?: string) {
    let query = supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', email)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error al verificar email: ${error.message}`)
    return data.length > 0
  }

  // Obtener usuarios por rol
  static async getUsuariosByRol(rol: 'admin' | 'cliente') {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select(`
        *,
        empresas (nombre, slug)
      `)
      .eq('rol', rol)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al obtener usuarios: ${error.message}`)
    return data
  }

  // Asignar empresa a usuario
  static async asignarEmpresa(usuarioId: string, empresaId: string) {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update({ empresa_id: empresaId })
      .eq('id', usuarioId)
      .select()
      .single()

    if (error) throw new Error(`Error al asignar empresa: ${error.message}`)
    return data
  }

  // Cambiar rol de usuario
  static async cambiarRol(usuarioId: string, nuevoRol: 'admin' | 'cliente') {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update({ rol: nuevoRol })
      .eq('id', usuarioId)
      .select()
      .single()

    if (error) throw new Error(`Error al cambiar rol: ${error.message}`)
    return data
  }
}




