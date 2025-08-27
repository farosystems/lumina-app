import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.log('❌ No hay usuario autenticado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const postId = params.id
    console.log('🔍 Actualizando post:', postId)

    // Obtener datos del usuario
    const { data: user, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id, empresa_id')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (userError) {
      console.error('❌ Error obteniendo usuario:', userError)
      return NextResponse.json({ error: 'Error obteniendo datos del usuario' }, { status: 500 })
    }

    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos')
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { estado, fecha_publicacion, titulo, contenido, plataforma, hashtags, imagen_url } = body

    console.log('🔍 Datos a actualizar:', { estado, fecha_publicacion, titulo, contenido, plataforma, hashtags, imagen_url })

    // Verificar que el post pertenece al usuario
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, usuario_id')
      .eq('id', postId)
      .eq('usuario_id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.error('❌ Error verificando post:', fetchError)
      return NextResponse.json({ error: 'Error verificando post' }, { status: 500 })
    }

    if (!existingPost) {
      console.log('❌ Post no encontrado o no pertenece al usuario')
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
    }

    // Preparar datos de actualización
    const updateData: any = {}
    
    if (estado !== undefined) updateData.estado = estado
    if (fecha_publicacion !== undefined) updateData.fecha_publicacion = fecha_publicacion
    if (titulo !== undefined) updateData.titulo = titulo?.trim() || null
    if (contenido !== undefined) updateData.contenido = contenido?.trim()
    if (plataforma !== undefined) updateData.plataforma = plataforma
    if (hashtags !== undefined) updateData.hashtags = hashtags
    if (imagen_url !== undefined) updateData.imagen_url = imagen_url?.trim() || null

    // Agregar timestamp de actualización
    updateData.updated_at = new Date().toISOString()

    // Actualizar el post
    const { data: updatedPost, error: updateError } = await supabaseAdmin
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error actualizando post:', updateError)
      return NextResponse.json({ error: 'Error actualizando post', details: updateError.message }, { status: 500 })
    }

    console.log('✅ Post actualizado exitosamente:', updatedPost)

    // Crear registro de actividad
    const { error: activityError } = await supabaseAdmin
      .from('registro_actividad')
      .insert({
        usuario_id: user.id,
        empresa_id: user.empresa_id,
        accion: estado === 'publicado' ? 'publicar_post' : 'actualizar_post',
        descripcion: estado === 'publicado' 
          ? `Post publicado en ${updatedPost.plataforma}`
          : `Post actualizado en ${updatedPost.plataforma}`,
        metadata: {
          post_id: postId,
          plataforma: updatedPost.plataforma,
          estado_anterior: existingPost.estado,
          estado_nuevo: estado
        }
      })

    if (activityError) {
      console.error('⚠️ Error creando registro de actividad:', activityError)
      // No fallamos si no se puede crear el registro de actividad
    } else {
      console.log('✅ Registro de actividad creado')
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Post actualizado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en PATCH /api/posts/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.log('❌ No hay usuario autenticado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const postId = params.id
    console.log('🔍 Eliminando post:', postId)

    // Obtener datos del usuario
    const { data: user, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id, empresa_id')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (userError) {
      console.error('❌ Error obteniendo usuario:', userError)
      return NextResponse.json({ error: 'Error obteniendo datos del usuario' }, { status: 500 })
    }

    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos')
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar que el post pertenece al usuario
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, usuario_id, plataforma, estado')
      .eq('id', postId)
      .eq('usuario_id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.error('❌ Error verificando post:', fetchError)
      return NextResponse.json({ error: 'Error verificando post' }, { status: 500 })
    }

    if (!existingPost) {
      console.log('❌ Post no encontrado o no pertenece al usuario')
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
    }

    // Eliminar el post
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId)

    if (deleteError) {
      console.error('❌ Error eliminando post:', deleteError)
      return NextResponse.json({ error: 'Error eliminando post', details: deleteError.message }, { status: 500 })
    }

    console.log('✅ Post eliminado exitosamente')

    // Crear registro de actividad
    const { error: activityError } = await supabaseAdmin
      .from('registro_actividad')
      .insert({
        usuario_id: user.id,
        empresa_id: user.empresa_id,
        accion: 'eliminar_post',
        descripcion: `Post eliminado de ${existingPost.plataforma}`,
        metadata: {
          post_id: postId,
          plataforma: existingPost.plataforma,
          estado: existingPost.estado
        }
      })

    if (activityError) {
      console.error('⚠️ Error creando registro de actividad:', activityError)
      // No fallamos si no se puede crear el registro de actividad
    } else {
      console.log('✅ Registro de actividad creado')
    }

    return NextResponse.json({
      success: true,
      message: 'Post eliminado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en DELETE /api/posts/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

