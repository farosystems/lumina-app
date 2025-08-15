import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
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

    console.log('✅ Usuario admin verificado, obteniendo empresas...')

    // Obtener todas las empresas con conteo de usuarios
    const { data: empresas, error } = await supabaseAdmin
      .from('empresas')
      .select(`
        *,
        usuarios:usuarios(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error en Supabase:', error)
      return NextResponse.json({ error: 'Error en Supabase', details: error.message }, { status: 500 })
    }

    console.log('✅ Empresas obtenidas:', empresas?.length || 0)

         // Procesar los datos para el dashboard
     const empresasProcesadas = empresas?.map(empresa => ({
       id: empresa.id,
       nombre: empresa.nombre,
       rubro: empresa.rubro,
       imagen_transmitir: empresa.imagen_transmitir,
       colores: empresa.colores,
       fuentes: empresa.fuentes,
       publico_ideal: empresa.publico_ideal,
       descripcion: empresa.descripcion,
       sitio_web: empresa.sitio_web,
       logo_url: empresa.logo_url,
       is_active: empresa.is_active,
       created_at: empresa.created_at,
       updated_at: empresa.updated_at,
       // Información adicional para el dashboard
       usuarios_count: empresa.usuarios?.[0]?.count || 0,
       estado: empresa.is_active ? 'Activa' : 'Inactiva',
       fecha_registro: new Date(empresa.created_at).toLocaleDateString('es-ES'),
       ultima_actualizacion: new Date(empresa.updated_at).toLocaleDateString('es-ES')
     })) || []

    // Calcular estadísticas
    const totalEmpresas = empresasProcesadas.length
    const empresasActivas = empresasProcesadas.filter(e => e.is_active).length
    const empresasInactivas = totalEmpresas - empresasActivas

    return NextResponse.json({
      empresas: empresasProcesadas,
      total: totalEmpresas,
      activas: empresasActivas,
      inactivas: empresasInactivas
    })
  } catch (error) {
    console.error('❌ Error en /api/admin/empresas:', error)
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
     const { 
       nombre, 
       rubro, 
       imagen_transmitir, 
       colores, 
       fuentes, 
       publico_ideal_edad_min, 
       publico_ideal_edad_max, 
       publico_ideal_zona, 
       publico_ideal_intereses, 
       descripcion, 
       sitio_web,
       logo_url
     } = body

         console.log('🔍 Creando empresa con datos:', { 
       nombre, 
       rubro, 
       imagen_transmitir, 
       colores, 
       fuentes, 
       publico_ideal_edad_min, 
       publico_ideal_edad_max, 
       publico_ideal_zona, 
       publico_ideal_intereses, 
       descripcion, 
       sitio_web,
       logo_url
     })

    // Validar datos requeridos
    if (!nombre || !rubro || !imagen_transmitir || !colores || !fuentes || 
        !publico_ideal_edad_min || !publico_ideal_edad_max || !publico_ideal_zona || !publico_ideal_intereses) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Crear el objeto público_ideal
    const publico_ideal = {
      edad_minima: parseInt(publico_ideal_edad_min),
      edad_maxima: parseInt(publico_ideal_edad_max),
      zona: publico_ideal_zona,
      intereses: publico_ideal_intereses
    }

         // Crear la empresa en Supabase
     const { data: newEmpresa, error } = await supabaseAdmin
       .from('empresas')
       .insert({
         nombre: nombre.trim(),
         rubro: rubro.trim(),
         imagen_transmitir: imagen_transmitir.trim(),
         colores: colores.trim(),
         fuentes: fuentes.trim(),
         publico_ideal: publico_ideal,
         descripcion: descripcion?.trim() || null,
         sitio_web: sitio_web?.trim() || null,
         logo_url: logo_url?.trim() || null,
         is_active: true,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       })
       .select()
       .single()

    if (error) {
      console.error('❌ Error creando empresa en Supabase:', error)
      return NextResponse.json({ error: 'Error creando empresa', details: error.message }, { status: 500 })
    }

    console.log('✅ Empresa creada exitosamente:', newEmpresa)

    return NextResponse.json({
      success: true,
      empresa: newEmpresa,
      message: 'Empresa creada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en POST /api/admin/empresas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
