import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.log('❌ No hay usuario autenticado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🔍 Obteniendo posts del usuario...')

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

    // Obtener posts del usuario
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        usuarios:usuario_id (
          nombre,
          apellido,
          email
        )
      `)
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })

    if (postsError) {
      console.error('❌ Error obteniendo posts:', postsError)
      return NextResponse.json({ error: 'Error obteniendo posts' }, { status: 500 })
    }

    console.log('✅ Posts obtenidos exitosamente:', posts.length)

    return NextResponse.json({
      success: true,
      posts: posts
    })

  } catch (error) {
    console.error('❌ Error en GET /api/posts:', error)
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

    console.log('🔍 Creando nuevo post...')

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
    const { titulo, contenido, plataforma, hashtags, imagen_url, prompt_utilizado } = body

    console.log('🔍 Datos del post:', { titulo, contenido, plataforma, hashtags, imagen_url, prompt_utilizado })

    // Validar datos requeridos
    if (!contenido || !plataforma) {
      return NextResponse.json({ error: 'Contenido y plataforma son requeridos' }, { status: 400 })
    }

    // Validar plataforma
    const plataformasValidas = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok']
    if (!plataformasValidas.includes(plataforma)) {
      return NextResponse.json({ error: 'Plataforma no válida' }, { status: 400 })
    }

    // Crear el post en Supabase
    const { data: newPost, error: postError } = await supabaseAdmin
      .from('posts')
      .insert({
        empresa_id: user.empresa_id,
        usuario_id: user.id,
        titulo: titulo?.trim() || null,
        contenido: contenido.trim(),
        plataforma: plataforma,
        estado: 'borrador',
        imagen_url: imagen_url?.trim() || null,
        hashtags: hashtags || [],
        prompt_utilizado: prompt_utilizado?.trim() || null,
        metadata: {
          created_via: 'web_interface',
          user_agent: request.headers.get('user-agent') || null
        }
      })
      .select()
      .single()

    if (postError) {
      console.error('❌ Error creando post en Supabase:', postError)
      return NextResponse.json({ error: 'Error creando post', details: postError.message }, { status: 500 })
    }

    console.log('✅ Post creado exitosamente:', newPost)

    // Crear registro de actividad
    const { error: activityError } = await supabaseAdmin
      .from('registro_actividad')
      .insert({
        usuario_id: user.id,
        empresa_id: user.empresa_id,
        accion: 'crear_post',
        descripcion: `Nuevo post creado en ${plataforma}`,
        metadata: {
          post_id: newPost.id,
          plataforma: plataforma,
          contenido_length: contenido.length,
          hashtags_count: hashtags?.length || 0
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
      post: newPost,
      message: 'Post creado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en POST /api/posts:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
