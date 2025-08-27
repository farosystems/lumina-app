import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🕐 Iniciando procesamiento de posts programados...')
    
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000) // 5 minutos atrás
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutos adelante
    
    // Buscar posts programados que deben publicarse ahora
    const { data: scheduledPosts, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        titulo,
        contenido,
        plataforma,
        hashtags,
        imagen_url,
        fecha_programada,
        usuarios!inner(id, clerk_id),
        empresas!inner(id, nombre)
      `)
      .eq('estado', 'programado')
      .gte('fecha_programada', fiveMinutesAgo.toISOString())
      .lte('fecha_programada', fiveMinutesFromNow.toISOString())
      .order('fecha_programada', { ascending: true })

    if (fetchError) {
      console.error('❌ Error obteniendo posts programados:', fetchError)
      return NextResponse.json({ error: 'Error obteniendo posts programados' }, { status: 500 })
    }

    console.log(`📅 Encontrados ${scheduledPosts?.length || 0} posts programados para procesar`)

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No hay posts programados para procesar',
        processed: 0 
      })
    }

    let processedCount = 0
    let successCount = 0
    let errorCount = 0

    for (const post of scheduledPosts) {
      try {
        console.log(`🔄 Procesando post ${post.id}: ${post.titulo}`)
        
        // Verificar que el post aún debe publicarse
        const scheduledTime = new Date(post.fecha_programada)
        if (scheduledTime > now) {
          console.log(`⏰ Post ${post.id} aún no debe publicarse (programado para ${scheduledTime})`)
          continue
        }

        // Obtener conexiones de Instagram del usuario
        const { data: connections, error: connectionsError } = await supabaseAdmin
          .from('conexiones_instagram')
          .select('id, nombre_cuenta, access_token, refresh_token')
          .eq('usuario_id', post.usuarios.id)
          .eq('estado', 'activa')
          .limit(1)

        if (connectionsError || !connections || connections.length === 0) {
          console.error(`❌ No se encontraron conexiones de Instagram para el usuario ${post.usuarios.id}`)
          
          // Marcar el post como fallido
          await supabaseAdmin
            .from('posts')
            .update({ 
              estado: 'error',
              updated_at: new Date().toISOString()
            })
            .eq('id', post.id)

          errorCount++
          continue
        }

        const connection = connections[0]
        console.log(`📸 Usando conexión de Instagram: ${connection.nombre_cuenta}`)

        // Publicar en Instagram
        const publishData = {
          connectionId: connection.id,
          caption: `${post.contenido}\n\n${(post.hashtags || []).join(' ')}`,
          imageUrl: post.imagen_url,
          postId: post.id
        }

        const publishResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(publishData)
        })

        if (!publishResponse.ok) {
          const errorData = await publishResponse.json()
          console.error(`❌ Error publicando post ${post.id} en Instagram:`, errorData)
          
          // Marcar el post como fallido
          await supabaseAdmin
            .from('posts')
            .update({ 
              estado: 'error',
              updated_at: new Date().toISOString()
            })
            .eq('id', post.id)

          errorCount++
          continue
        }

        const publishResult = await publishResponse.json()
        console.log(`✅ Post ${post.id} publicado exitosamente en Instagram`)

        // Actualizar el estado del post a "publicado"
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({ 
            estado: 'publicado',
            fecha_publicacion: new Date().toISOString(),
            fecha_programada: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id)

        if (updateError) {
          console.error(`❌ Error actualizando estado del post ${post.id}:`, updateError)
        }

        // Registrar actividad
        await supabaseAdmin
          .from('registro_actividad')
          .insert({
            usuario_id: post.usuarios.id,
            empresa_id: post.empresas.id,
            accion: 'publicar_post_programado',
            descripcion: `Post programado publicado automáticamente en ${post.plataforma}`,
            metadata: {
              post_id: post.id,
              plataforma: post.plataforma,
              fecha_programada: post.fecha_programada,
              fecha_publicacion: new Date().toISOString()
            }
          })

        successCount++
        console.log(`🎉 Post ${post.id} procesado exitosamente`)

      } catch (error) {
        console.error(`❌ Error procesando post ${post.id}:`, error)
        
        // Marcar el post como fallido
        try {
          await supabaseAdmin
            .from('posts')
            .update({ 
              estado: 'error',
              updated_at: new Date().toISOString()
            })
            .eq('id', post.id)
        } catch (updateError) {
          console.error(`❌ Error marcando post ${post.id} como fallido:`, updateError)
        }
        
        errorCount++
      }

      processedCount++
    }

    console.log(`✅ Procesamiento completado: ${processedCount} procesados, ${successCount} exitosos, ${errorCount} errores`)

    return NextResponse.json({
      success: true,
      message: 'Procesamiento de posts programados completado',
      processed: processedCount,
      successful: successCount,
      errors: errorCount
    })

  } catch (error) {
    console.error('❌ Error en procesamiento de posts programados:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
