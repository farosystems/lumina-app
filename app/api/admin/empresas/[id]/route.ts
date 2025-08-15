import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.log('❌ No hay usuario autenticado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🔍 Verificando permisos de admin...')

    // Verificar que el usuario sea admin
    const { data: user, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('rol')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (userError) {
      console.error('❌ Error verificando usuario:', userError)
      return NextResponse.json({ error: 'Error verificando permisos' }, { status: 500 })
    }

    if (!user || user.rol !== 'admin') {
      console.log('❌ Usuario no es admin')
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const empresaId = params.id

    if (!empresaId) {
      return NextResponse.json({ error: 'ID de empresa requerido' }, { status: 400 })
    }

    const body = await request.json()
    const { nombre, rubro, sitio_web, descripcion, logo_url, is_active } = body

    console.log('🔍 Actualizando empresa con datos:', { nombre, rubro, sitio_web, descripcion, logo_url, is_active })

    // Validar datos requeridos
    if (!nombre || !rubro) {
      return NextResponse.json({ error: 'Nombre y rubro son requeridos' }, { status: 400 })
    }

    // Actualizar la empresa en Supabase
    const { data: updatedEmpresa, error } = await supabaseAdmin
      .from('empresas')
      .update({
        nombre: nombre.trim(),
        rubro: rubro.trim(),
        sitio_web: sitio_web?.trim() || null,
        descripcion: descripcion?.trim() || null,
        logo_url: logo_url?.trim() || null,
        is_active: is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', empresaId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error actualizando empresa en Supabase:', error)
      return NextResponse.json({ error: 'Error actualizando empresa', details: error.message }, { status: 500 })
    }

    console.log('✅ Empresa actualizada exitosamente:', updatedEmpresa)

    return NextResponse.json({
      success: true,
      empresa: updatedEmpresa,
      message: 'Empresa actualizada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en PUT /api/admin/empresas/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}





