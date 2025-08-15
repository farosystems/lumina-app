import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario sea admin
    const { data: user, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('rol')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (userError) {
      return NextResponse.json({ error: 'Error verificando permisos' }, { status: 500 })
    }

    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }
    
    // Obtener estadísticas de empresas
    const { data: empresas, error: empresasError } = await supabaseAdmin
      .from('empresas')
      .select('*')

    if (empresasError) {
      return NextResponse.json({ error: 'Error obteniendo empresas' }, { status: 500 })
    }

    // Obtener estadísticas de usuarios
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuarios')
      .select('*')

    if (usuariosError) {
      return NextResponse.json({ error: 'Error obteniendo usuarios' }, { status: 500 })
    }

    // Obtener estadísticas de posts (si existe la tabla)
    let posts = []
    try {
      const { data: postsData, error: postsError } = await supabaseAdmin
        .from('posts')
        .select('*')
      
      if (!postsError && postsData) {
        posts = postsData
      }
    } catch (error) {
      // Tabla posts no existe o no hay datos
    }

    // Calcular estadísticas
    const totalEmpresas = empresas?.length || 0
    const empresasActivas = empresas?.filter(e => e.is_active).length || 0
    const empresasNuevasEsteMes = empresas?.filter(e => {
      const fechaCreacion = new Date(e.created_at)
      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)
      return fechaCreacion >= inicioMes
    }).length || 0

    const totalUsuarios = usuarios?.length || 0
    const usuariosActivos = usuarios?.filter(u => u.is_active).length || 0
    const usuariosActivosHoy = usuarios?.filter(u => {
      const ultimaActualizacion = new Date(u.updated_at)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      return ultimaActualizacion >= hoy
    }).length || 0

    const totalPosts = posts?.length || 0
    const postsGeneradosHoy = posts?.filter(p => {
      const fechaCreacion = new Date(p.created_at)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      return fechaCreacion >= hoy
    }).length || 0

    const postsGeneradosAyer = posts?.filter(p => {
      const fechaCreacion = new Date(p.created_at)
      const ayer = new Date()
      ayer.setDate(ayer.getDate() - 1)
      ayer.setHours(0, 0, 0, 0)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      return fechaCreacion >= ayer && fechaCreacion < hoy
    }).length || 0

    const postsPublicados = posts?.filter(p => p.estado === 'publicado').length || 0
    const tasaConversion = totalPosts > 0 ? Math.round((postsPublicados / totalPosts) * 100) : 0

    // Calcular tendencias (simuladas por ahora)
    const tendenciaEmpresas = totalEmpresas > 0 ? Math.round((empresasNuevasEsteMes / totalEmpresas) * 100) : 0
    const tendenciaUsuarios = totalUsuarios > 0 ? Math.round((usuariosActivos / totalUsuarios) * 100) : 0
    const tendenciaPosts = postsGeneradosAyer > 0 ? Math.round(((postsGeneradosHoy - postsGeneradosAyer) / postsGeneradosAyer) * 100) : 0
    const tendenciaConversion = tasaConversion > 0 ? Math.round(tasaConversion * 0.1) : 0

    // Obtener actividades recientes
    let actividadesRecientes = []
    try {
      const { data: actividades, error: actividadesError } = await supabaseAdmin
        .from('registro_actividad')
        .select(`
          *,
          usuarios:usuario_id (
            nombre,
            apellido,
            email
          ),
          empresas:empresa_id (
            nombre
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (!actividadesError && actividades) {
        actividadesRecientes = actividades
      }
    } catch (error) {
      // Tabla registro_actividad no existe o no hay datos
    }

    // Datos para el gráfico de posts (últimos 7 días)
    const ultimos7Dias = []
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)
      fecha.setHours(0, 0, 0, 0)
      
      const postsDelDia = posts?.filter(p => {
        const fechaPost = new Date(p.created_at)
        fechaPost.setHours(0, 0, 0, 0)
        return fechaPost.getTime() === fecha.getTime()
      }).length || 0

      ultimos7Dias.push({
        dia: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
        posts: postsDelDia
      })
    }

    return NextResponse.json({
      estadisticas: {
        empresas: {
          total: totalEmpresas,
          activas: empresasActivas,
          nuevasEsteMes: empresasNuevasEsteMes,
          tendencia: tendenciaEmpresas
        },
        usuarios: {
          total: totalUsuarios,
          activos: usuariosActivos,
          activosHoy: usuariosActivosHoy,
          tendencia: tendenciaUsuarios
        },
        posts: {
          total: totalPosts,
          generadosHoy: postsGeneradosHoy,
          generadosAyer: postsGeneradosAyer,
          publicados: postsPublicados,
          tendencia: tendenciaPosts
        },
        conversion: {
          tasa: tasaConversion,
          tendencia: tendenciaConversion
        }
      },
      graficoPosts: ultimos7Dias,
      actividadReciente: actividadesRecientes
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
