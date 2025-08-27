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
      .single()

    if (userError || !user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener todas las empresas con todos los campos
    const { data: empresas, error } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error en Supabase:', error)
      return NextResponse.json({ error: 'Error en Supabase', details: error.message }, { status: 500 })
    }

    // Mostrar información detallada de cada empresa
    const empresasDebug = empresas?.map(empresa => ({
      id: empresa.id,
      nombre: empresa.nombre,
      pago_recibido: empresa.pago_recibido,
      pago_recibido_tipo: typeof empresa.pago_recibido,
      is_active: empresa.is_active,
      created_at: empresa.created_at
    })) || []

    return NextResponse.json({
      empresas: empresasDebug,
      total: empresasDebug.length,
      campos_disponibles: empresas && empresas.length > 0 ? Object.keys(empresas[0]) : []
    })

  } catch (error) {
    console.error('❌ Error en debug empresas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
