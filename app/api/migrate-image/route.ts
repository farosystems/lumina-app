import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { downloadAndStoreImage, generateFileName } from '@/lib/image-storage'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { postId, imageUrl } = body

    if (!postId || !imageUrl) {
      return NextResponse.json({ error: 'Post ID e imagen URL son requeridos' }, { status: 400 })
    }

    console.log('🔄 Migrando imagen para post:', postId)

    // Verificar que el post existe y pertenece al usuario
    const { data: user, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('usuario_id', user.id)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
    }

    // Verificar si la imagen ya es permanente
    if (post.is_permanent_image) {
      return NextResponse.json({ 
        message: 'La imagen ya es permanente',
        url: post.imagen_url 
      })
    }

    try {
      // Descargar y almacenar la imagen
      const timestamp = Date.now()
      const fileName = generateFileName(userId, timestamp)
      
      console.log('💾 Descargando y almacenando imagen...')
      const permanentUrl = await downloadAndStoreImage(imageUrl, fileName)
      
      // Actualizar el post con la nueva URL y información del storage
      const { error: updateError } = await supabaseAdmin
        .from('posts')
        .update({
          imagen_url: permanentUrl,
          storage_file_name: fileName,
          storage_bucket: 'post-images',
          is_permanent_image: true
        })
        .eq('id', postId)

      if (updateError) {
        console.error('❌ Error actualizando post:', updateError)
        return NextResponse.json({ error: 'Error actualizando post' }, { status: 500 })
      }

      console.log('✅ Imagen migrada exitosamente')
      
      return NextResponse.json({
        success: true,
        message: 'Imagen migrada exitosamente',
        newUrl: permanentUrl,
        fileName: fileName
      })

    } catch (storageError) {
      console.error('❌ Error almacenando imagen:', storageError)
      return NextResponse.json({ 
        error: 'Error almacenando imagen',
        details: storageError instanceof Error ? storageError.message : 'Error desconocido'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error en migración de imagen:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}









