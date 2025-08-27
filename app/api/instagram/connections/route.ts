import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { InstagramService } from '@/lib/services/instagram.service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener información del usuario
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, rol')
      .eq('clerk_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Si es admin, obtener todas las conexiones
    if (userData.rol === 'admin') {
      const { data: connections, error } = await supabase
        .from('conexiones_sociales')
        .select(`
          *,
          usuarios:usuario_id(nombre, apellido, email),
          empresas:empresa_id(nombre)
        `)
        .eq('plataforma', 'instagram')
        .eq('is_active', true)

      if (error) {
        return NextResponse.json({ error: 'Error al obtener conexiones' }, { status: 500 })
      }

      return NextResponse.json({ connections })
    }

    // Si es cliente, obtener solo sus conexiones
    const connections = await InstagramService.getConnections(userData.id)
    return NextResponse.json({ connections })

  } catch (error) {
    console.error('Error al obtener conexiones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { connectionId } = await request.json()

    if (!connectionId) {
      return NextResponse.json({ error: 'ID de conexión requerido' }, { status: 400 })
    }

    // Verificar que el usuario sea dueño de la conexión o sea admin
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, rol')
      .eq('clerk_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (userData.rol !== 'admin') {
      // Verificar que la conexión pertenezca al usuario
      const { data: connection, error: connectionError } = await supabase
        .from('conexiones_sociales')
        .select('usuario_id')
        .eq('id', connectionId)
        .single()

      if (connectionError || !connection || connection.usuario_id !== userData.id) {
        return NextResponse.json({ error: 'No autorizado para eliminar esta conexión' }, { status: 403 })
      }
    }

    // Eliminar la conexión
    await InstagramService.deleteConnection(connectionId)

    return NextResponse.json({ message: 'Conexión eliminada exitosamente' })

  } catch (error) {
    console.error('Error al eliminar conexión:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
