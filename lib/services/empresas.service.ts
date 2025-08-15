import { supabaseAdmin } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Empresa = Database['public']['Tables']['empresas']['Row']
type EmpresaInsert = Database['public']['Tables']['empresas']['Insert']
type EmpresaUpdate = Database['public']['Tables']['empresas']['Update']

export class EmpresasService {
  // Obtener todas las empresas (solo admin)
  static async getAllEmpresas() {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al obtener empresas: ${error.message}`)
    return data
  }

  // Obtener empresa por ID
  static async getEmpresaById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Error al obtener empresa: ${error.message}`)
    return data
  }

  // Obtener empresa por slug
  static async getEmpresaBySlug(slug: string) {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw new Error(`Error al obtener empresa: ${error.message}`)
    return data
  }

  // Crear nueva empresa
  static async createEmpresa(empresa: EmpresaInsert) {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .insert(empresa)
      .select()
      .single()

    if (error) throw new Error(`Error al crear empresa: ${error.message}`)
    return data
  }

  // Actualizar empresa
  static async updateEmpresa(id: string, empresa: EmpresaUpdate) {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .update(empresa)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar empresa: ${error.message}`)
    return data
  }

  // Eliminar empresa (soft delete)
  static async deleteEmpresa(id: string) {
    const { error } = await supabaseAdmin
      .from('empresas')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw new Error(`Error al eliminar empresa: ${error.message}`)
    return true
  }

  // Verificar si el slug existe
  static async slugExists(slug: string, excludeId?: string) {
    let query = supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('slug', slug)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error al verificar slug: ${error.message}`)
    return data.length > 0
  }

  // Generar slug único
  static async generateUniqueSlug(nombre: string, excludeId?: string) {
    let baseSlug = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    let slug = baseSlug
    let counter = 1

    while (await this.slugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  // Obtener estadísticas de empresa
  static async getEmpresaStats(empresaId: string) {
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('estado')
      .eq('empresa_id', empresaId)

    if (postsError) throw new Error(`Error al obtener posts: ${postsError.message}`)

    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('is_active', true)

    if (usuariosError) throw new Error(`Error al obtener usuarios: ${usuariosError.message}`)

    const stats = {
      totalPosts: posts.length,
      postsBorrador: posts.filter(p => p.estado === 'borrador').length,
      postsProgramados: posts.filter(p => p.estado === 'programado').length,
      postsPublicados: posts.filter(p => p.estado === 'publicado').length,
      totalUsuarios: usuarios.length
    }

    return stats
  }
}




