import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener el usuario de la base de datos usando el clerk_id
    const { data: usuario, error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .select('id, empresa_id')
      .eq('clerk_id', userId)
      .single()

    if (usuarioError || !usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener las actividades recientes del usuario
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
      .eq('usuario_id', usuario.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (actividadesError) {
      console.error('Error obteniendo actividades:', actividadesError)
      return NextResponse.json({ error: 'Error obteniendo actividades' }, { status: 500 })
    }

    return NextResponse.json({
      actividades: actividades || []
    })

  } catch (error) {
    console.error('Error en endpoint de actividad:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
