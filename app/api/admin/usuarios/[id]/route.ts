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

    const userIdToUpdate = params.id

    if (!userIdToUpdate) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, role, company, cargo, telefono } = body

    console.log('🔍 Actualizando usuario con datos:', { name, email, role, company, cargo, telefono })

    // Validar datos requeridos
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Separar nombre y apellido
    const nameParts = name.trim().split(' ')
    const nombre = nameParts[0] || ''
    const apellido = nameParts.slice(1).join(' ') || null

    // Actualizar el usuario en Supabase
    const { data: updatedUser, error } = await supabaseAdmin
      .from('usuarios')
      .update({
        nombre,
        apellido,
        email: email.toLowerCase(),
        rol: role,
        cargo: cargo || null,
        telefono: telefono || null,
        empresa_id: role === 'cliente' ? company : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userIdToUpdate)
      .select()
      .single()

    if (error) {
      console.error('❌ Error actualizando usuario en Supabase:', error)
      return NextResponse.json({ error: 'Error actualizando usuario', details: error.message }, { status: 500 })
    }

    console.log('✅ Usuario actualizado exitosamente:', updatedUser)

    return NextResponse.json({
      success: true,
      usuario: updatedUser,
      message: 'Usuario actualizado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en PUT /api/admin/usuarios/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}







