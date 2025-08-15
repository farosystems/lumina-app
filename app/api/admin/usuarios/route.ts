import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
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

    console.log('✅ Usuario admin verificado, obteniendo usuarios...')

    // Obtener todos los usuarios con información de empresa
    const { data: usuarios, error } = await supabaseAdmin
      .from('usuarios')
      .select(`
        *,
        empresa:empresas(nombre)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error en Supabase:', error)
      return NextResponse.json({ error: 'Error en Supabase', details: error.message }, { status: 500 })
    }

    console.log('✅ Usuarios obtenidos:', usuarios?.length || 0)

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

    // Procesar los datos para el dashboard
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
      // Información adicional para el dashboard
      nombre_completo: `${usuario.nombre} ${usuario.apellido || ''}`.trim(),
      empresa_nombre: usuario.empresa?.nombre || null,
      estado: usuario.is_active ? 'Activo' : 'Inactivo',
      fecha_registro: new Date(usuario.created_at).toLocaleDateString('es-ES'),
      ultima_actualizacion: new Date(usuario.updated_at).toLocaleDateString('es-ES'),
      // Avatar fallback
      avatar_fallback: usuario.nombre && usuario.apellido
        ? `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase()
        : usuario.nombre
          ? usuario.nombre[0].toUpperCase()
          : 'U'
    })) || []

    // Calcular estadísticas
    const totalUsuarios = usuariosProcesados.length
    const usuariosActivos = usuariosProcesados.filter(u => u.is_active).length
    const administradores = usuariosProcesados.filter(u => u.rol === 'admin').length
    const clientes = usuariosProcesados.filter(u => u.rol === 'cliente').length

    return NextResponse.json({
      usuarios: usuariosProcesados,
      estadisticas: {
        total: totalUsuarios,
        activos: usuariosActivos,
        administradores,
        clientes,
        porcentaje_activos: totalUsuarios > 0 ? Math.round((usuariosActivos / totalUsuarios) * 100) : 0
      }
    })
  } catch (error) {
    console.error('❌ Error en /api/admin/usuarios:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { name, email, role, company, cargo, telefono } = body

    console.log('🔍 Creando usuario con datos:', { name, email, role, company, cargo, telefono })

    // Validar datos requeridos
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Separar nombre y apellido
    const nameParts = name.trim().split(' ')
    const nombre = nameParts[0] || ''
    const apellido = nameParts.slice(1).join(' ') || null

    // Crear el usuario en Supabase
    const { data: newUser, error } = await supabaseAdmin
      .from('usuarios')
      .insert({
        nombre,
        apellido,
        email: email.toLowerCase(),
        rol: role,
        cargo: cargo || null,
        telefono: telefono || null,
        empresa_id: role === 'cliente' ? company : null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creando usuario en Supabase:', error)
      return NextResponse.json({ error: 'Error creando usuario', details: error.message }, { status: 500 })
    }

    console.log('✅ Usuario creado exitosamente:', newUser)

    return NextResponse.json({
      success: true,
      usuario: newUser,
      message: 'Usuario creado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en POST /api/admin/usuarios:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
