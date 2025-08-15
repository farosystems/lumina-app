'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { EmpresasService } from '@/lib/services/empresas.service'
import { UsuariosService } from '@/lib/services/usuarios.service'
import type { Database } from '@/lib/supabase'

type EmpresaInsert = Database['public']['Tables']['empresas']['Insert']
type EmpresaUpdate = Database['public']['Tables']['empresas']['Update']

export async function createEmpresa(formData: FormData) {
  try {
    const nombre = formData.get('nombre') as string
    const rubro = formData.get('rubro') as string
    const imagenTransmitir = formData.get('imagen_transmitir') as string
    const colores = JSON.parse(formData.get('colores') as string || '[]')
    const fuentes = JSON.parse(formData.get('fuentes') as string || '[]')
    const publicoIdeal = JSON.parse(formData.get('publico_ideal') as string || '{}')
    const logoUrl = formData.get('logo_url') as string
    const sitioWeb = formData.get('sitio_web') as string
    const telefono = formData.get('telefono') as string
    const email = formData.get('email') as string
    const direccion = formData.get('direccion') as string

    // Validaciones
    if (!nombre || !rubro) {
      throw new Error('Nombre y rubro son obligatorios')
    }

    // Generar slug único
    const slug = await EmpresasService.generateUniqueSlug(nombre)

    const empresaData: EmpresaInsert = {
      nombre,
      slug,
      rubro,
      imagen_transmitir: imagenTransmitir || null,
      colores,
      fuentes,
      publico_ideal: publicoIdeal,
      logo_url: logoUrl || null,
      sitio_web: sitioWeb || null,
      telefono: telefono || null,
      email: email || null,
      direccion: direccion || null
    }

    const empresa = await EmpresasService.createEmpresa(empresaData)

    revalidatePath('/admin/companies')
    return { success: true, data: empresa }
  } catch (error) {
    console.error('Error al crear empresa:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

export async function updateEmpresa(id: string, formData: FormData) {
  try {
    const nombre = formData.get('nombre') as string
    const rubro = formData.get('rubro') as string
    const imagenTransmitir = formData.get('imagen_transmitir') as string
    const colores = JSON.parse(formData.get('colores') as string || '[]')
    const fuentes = JSON.parse(formData.get('fuentes') as string || '[]')
    const publicoIdeal = JSON.parse(formData.get('publico_ideal') as string || '{}')
    const logoUrl = formData.get('logo_url') as string
    const sitioWeb = formData.get('sitio_web') as string
    const telefono = formData.get('telefono') as string
    const email = formData.get('email') as string
    const direccion = formData.get('direccion') as string

    // Validaciones
    if (!nombre || !rubro) {
      throw new Error('Nombre y rubro son obligatorios')
    }

    // Verificar si el slug necesita actualización
    const empresaActual = await EmpresasService.getEmpresaById(id)
    let slug = empresaActual.slug
    
    if (nombre !== empresaActual.nombre) {
      slug = await EmpresasService.generateUniqueSlug(nombre, id)
    }

    const empresaData: EmpresaUpdate = {
      nombre,
      slug,
      rubro,
      imagen_transmitir: imagenTransmitir || null,
      colores,
      fuentes,
      publico_ideal: publicoIdeal,
      logo_url: logoUrl || null,
      sitio_web: sitioWeb || null,
      telefono: telefono || null,
      email: email || null,
      direccion: direccion || null
    }

    const empresa = await EmpresasService.updateEmpresa(id, empresaData)

    revalidatePath('/admin/companies')
    revalidatePath(`/admin/companies/${id}`)
    return { success: true, data: empresa }
  } catch (error) {
    console.error('Error al actualizar empresa:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

export async function deleteEmpresa(id: string) {
  try {
    await EmpresasService.deleteEmpresa(id)
    
    revalidatePath('/admin/companies')
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar empresa:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

export async function getEmpresaStats(empresaId: string) {
  try {
    const stats = await EmpresasService.getEmpresaStats(empresaId)
    return { success: true, data: stats }
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

export async function getAllEmpresas() {
  try {
    const empresas = await EmpresasService.getAllEmpresas()
    return { success: true, data: empresas }
  } catch (error) {
    console.error('Error al obtener empresas:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}




