import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
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

    console.log('✅ Usuario admin verificado, obteniendo usuarios de empresa:', empresaId)

    // Obtener usuarios de la empresa específica
    const { data: usuarios, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error en Supabase:', error)
      return NextResponse.json({ error: 'Error en Supabase', details: error.message }, { status: 500 })
    }

    console.log('✅ Usuarios de empresa obtenidos:', usuarios?.length || 0)

    // Obtener información de Clerk para cada usuario
    const usuariosConClerk = await Promise.all(
      usuarios?.map(async (usuario) => {
        let clerkUser = null
        if (usuario.clerk_id) {
          try {
            const clerk = await clerkClient()
            clerkUser = await clerk.users.getUser(usuario.clerk_id)
          } catch (error) {
            console.log(`⚠️ No se pudo obtener usuario de Clerk para ${usuario.clerk_id}:`, error)
          }
        }

        return {
          ...usuario,
          clerkUser
        }
      }) || []
    )

    // Procesar los datos para el popup
    const usuariosProcesados = usuariosConClerk?.map(usuario => ({
      id: usuario.id,
      clerk_id: usuario.clerk_id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      cargo: usuario.cargo,
      telefono: usuario.telefono,
      avatar_url: usuario.clerkUser?.imageUrl || usuario.avatar_url,
      empresa_id: usuario.empresa_id,
      is_active: usuario.is_active,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at,
      // Información adicional para el popup
      nombre_completo: `${usuario.nombre} ${usuario.apellido || ''}`.trim(),
      estado: usuario.is_active ? 'Activo' : 'Inactivo',
      fecha_registro: new Date(usuario.created_at).toLocaleDateString('es-ES'),
      // Avatar fallback
      avatar_fallback: usuario.nombre && usuario.apellido
        ? `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase()
        : usuario.nombre
          ? usuario.nombre[0].toUpperCase()
          : 'U'
    })) || []

    return NextResponse.json({
      usuarios: usuariosProcesados,
      total: usuariosProcesados.length,
      activos: usuariosProcesados.filter(u => u.is_active).length
    })

  } catch (error) {
    console.error('❌ Error en /api/admin/empresas/[id]/usuarios:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
