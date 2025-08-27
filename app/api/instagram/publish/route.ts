import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { InstagramService } from '@/lib/services/instagram.service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { connectionId, caption, imageUrl, scheduledTime, postId } = await request.json()

    if (!connectionId || !caption) {
      return NextResponse.json({ error: 'Conexión y caption son requeridos' }, { status: 400 })
    }

    // Obtener información del usuario
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, empresa_id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar que la conexión pertenezca al usuario
    const { data: connection, error: connectionError } = await supabase
      .from('conexiones_sociales')
      .select('*')
      .eq('id', connectionId)
      .eq('usuario_id', userData.id)
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json({ error: 'Conexión no encontrada o no autorizada' }, { status: 404 })
    }

    // Publicar contenido en Instagram
    const publishResult = await InstagramService.publishContent(
      connectionId,
      caption,
      imageUrl,
      scheduledTime
    )

    // Si hay un postId, crear registro de publicación social
    if (postId) {
      await supabase
        .from('publicaciones_sociales')
        .insert({
          post_id: postId,
          conexion_social_id: connectionId,
          plataforma: 'instagram',
          estado: 'publicado',
          fecha_publicacion: new Date().toISOString(),
          post_id_plataforma: publishResult.id,
          metadata: {
            published_at: new Date().toISOString()
          }
        })
    }

    // Registrar actividad
    await supabase
      .from('registro_actividad')
      .insert({
        usuario_id: userData.id,
        empresa_id: userData.empresa_id,
        accion: 'publicar_instagram',
        descripcion: `Publicó contenido en Instagram: ${connection.nombre_cuenta}`,
        metadata: {
          plataforma: 'instagram',
          account: connection.nombre_cuenta,
          post_id: publishResult.id
        }
      })

    return NextResponse.json({
      success: true,
      postId: publishResult.id,
      message: 'Contenido publicado exitosamente'
    })

  } catch (error) {
    console.error('Error al publicar en Instagram:', error)
    return NextResponse.json({ 
      error: 'Error al publicar contenido',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
