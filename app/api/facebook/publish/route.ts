import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { 
      connectionId, 
      caption, 
      imageUrl, 
      postId,
      isSchedulerRequest = false,
      schedulerUserId = null 
    } = await request.json()

    console.log('📘 Iniciando publicación en Facebook:', { connectionId, postId, isSchedulerRequest })

    // Obtener información del usuario
    const userIdToUse = isSchedulerRequest ? schedulerUserId : null
    
    let userData
    if (userIdToUse) {
      // Para scheduler, usar el ID de usuario directo de la DB
      const { data, error } = await supabaseAdmin
        .from('usuarios')
        .select('id, empresa_id, clerk_id')
        .eq('id', userIdToUse)
        .single()
      
      if (error || !data) {
        console.error('❌ Error obteniendo usuario para scheduler:', error)
        return NextResponse.json({ success: false, error: 'Usuario no encontrado para scheduler' })
      }
      userData = data
    } else {
      // Para requests normales, usar el clerk_id
      const { data, error } = await supabaseAdmin
        .from('usuarios')
        .select('id, empresa_id, clerk_id')
        .eq('clerk_id', userId)
        .single()
      
      if (error || !data) {
        console.error('❌ Error obteniendo usuario:', error)
        return NextResponse.json({ success: false, error: 'Usuario no encontrado' })
      }
      userData = data
    }

    // Obtener conexión de Facebook
    let connection
    if (connectionId && connectionId.trim() !== '') {
      // Usar conexión específica
      const { data, error } = await supabaseAdmin
        .from('conexiones_sociales')
        .select('*')
        .eq('id', connectionId)
        .eq('usuario_id', userData.id)
        .eq('plataforma', 'facebook')
        .eq('is_active', true)
        .single()
      
      if (error || !data) {
        console.error('❌ Error obteniendo conexión específica:', error)
        return NextResponse.json({ success: false, error: 'Conexión de Facebook no encontrada' })
      }
      connection = data
    } else {
      // Usar primera conexión disponible
      const { data, error } = await supabaseAdmin
        .from('conexiones_sociales')
        .select('*')
        .eq('usuario_id', userData.id)
        .eq('plataforma', 'facebook')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (error || !data) {
        console.error('❌ No hay conexiones de Facebook activas:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'No hay páginas de Facebook conectadas. Por favor conecta una página primero.' 
        })
      }
      connection = data
    }

    console.log('📘 Usando conexión de Facebook:', connection.nombre_cuenta)

    // Extraer información de la página
    const pageId = connection.metadata?.page_id
    const pageAccessToken = connection.access_token

    if (!pageId || !pageAccessToken) {
      console.error('❌ Información de página incompleta:', { pageId: !!pageId, token: !!pageAccessToken })
      return NextResponse.json({ 
        success: false, 
        error: 'Información de la página de Facebook incompleta' 
      })
    }

    // Preparar datos para publicación
    const postData: any = {
      message: caption || '',
    }

    // Si hay imagen, subirla a Facebook y obtener el media_id
    if (imageUrl) {
      console.log('📘 Subiendo imagen a Facebook...')
      
      // Subir imagen a Facebook
      const uploadResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: imageUrl,
          published: false,
          access_token: pageAccessToken,
        }),
      })

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json()
        console.error('❌ Error subiendo imagen a Facebook:', uploadError)
        return NextResponse.json({ 
          success: false, 
          error: `Error subiendo imagen: ${uploadError.error?.message || 'Error desconocido'}` 
        })
      }

      const uploadResult = await uploadResponse.json()
      console.log('✅ Imagen subida a Facebook:', uploadResult.id)

      // Usar el ID de la imagen subida para el attachment
      postData.attached_media = [{
        media_fbid: uploadResult.id
      }]
    }

    // Publicar en la página de Facebook
    console.log('📘 Publicando en Facebook Page...')
    console.log('📘 Datos que se envían a Facebook:', JSON.stringify({ ...postData, access_token: '***' }, null, 2))
    
    const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...postData,
        access_token: pageAccessToken,
      }),
    })

    if (!publishResponse.ok) {
      const publishError = await publishResponse.json()
      console.error('❌ Error publicando en Facebook:', publishError)
      return NextResponse.json({ 
        success: false, 
        error: `Error publicando: ${publishError.error?.message || 'Error desconocido'}` 
      })
    }

    const publishResult = await publishResponse.json()
    console.log('✅ Post publicado en Facebook:', publishResult.id)

    // Actualizar estado del post en la base de datos si se proporcionó postId
    if (postId) {
      await supabaseAdmin
        .from('posts')
        .update({ 
          estado: 'publicado',
          fecha_publicacion: new Date().toISOString(),
          metadata: {
            ...connection.metadata,
            facebook_post_id: publishResult.id,
            published_at: new Date().toISOString()
          }
        })
        .eq('id', postId)
      
      console.log('✅ Estado del post actualizado en DB')
    }

    return NextResponse.json({
      success: true,
      postId: publishResult.id,
      message: `Post publicado exitosamente en ${connection.nombre_cuenta}`,
      platform: 'facebook',
      account: connection.nombre_cuenta
    })

  } catch (error) {
    console.error('❌ Error general publicando en Facebook:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { status: 500 })
  }
}