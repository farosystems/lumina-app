import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=unauthorized&message=No autorizado', request.url))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Verificar si hay error en la autorización
    if (error) {
      const errorMessage = searchParams.get('error_description') || 'Error en la autorización de Facebook'
      return NextResponse.redirect(new URL(`/dashboard/settings?error=facebook_auth&message=${encodeURIComponent(errorMessage)}`, request.url))
    }

    // Verificar que el state coincida con el userId
    if (state !== userId) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=invalid_state&message=Estado de autorización inválido', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=no_code&message=Código de autorización no recibido', request.url))
    }

    // Obtener información del usuario y su empresa
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, empresa_id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=user_not_found&message=Usuario no encontrado', request.url))
    }

    // Intercambiar código por access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Error obteniendo token de Facebook:', await tokenResponse.text())
      return NextResponse.redirect(new URL('/dashboard/settings?error=token_error&message=Error al obtener token de acceso', request.url))
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Obtener información del usuario de Facebook
    const userInfoResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`)
    
    if (!userInfoResponse.ok) {
      console.error('Error obteniendo información del usuario de Facebook:', await userInfoResponse.text())
      return NextResponse.redirect(new URL('/dashboard/settings?error=user_info_error&message=Error al obtener información del usuario', request.url))
    }

    const userInfo = await userInfoResponse.json()

         // Obtener páginas del usuario
     const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`)
     
     if (!pagesResponse.ok) {
       console.error('Error obteniendo páginas de Facebook:', await pagesResponse.text())
       return NextResponse.redirect(new URL('/dashboard/settings?error=pages_error&message=Error al obtener páginas de Facebook', request.url))
     }

     console.log('📘 Respuesta de páginas de Facebook:', await pagesResponse.clone().text())

         const pagesData = await pagesResponse.json()
     const pages = pagesData.data || []

     console.log('📘 Páginas de Facebook encontradas:', pages.length)
     console.log('📘 Páginas:', pages.map(p => ({ name: p.name, id: p.id, category: p.category })))

     if (pages.length === 0) {
       console.log('⚠️ El usuario no tiene páginas de Facebook')
       return NextResponse.redirect(new URL('/dashboard/settings?error=no_pages&message=No tienes páginas de Facebook. Necesitas crear una página de Facebook primero. Ve a facebook.com/pages/create para crear una página.', request.url))
     }

     // Guardar cada página como una conexión separada
     for (const page of pages) {
       console.log('📘 Procesando página:', page.name)
       
       // Verificar si la página ya existe
       const { data: existingConnection } = await supabase
         .from('conexiones_sociales')
         .select('id')
         .eq('usuario_id', userData.id)
         .eq('plataforma', 'facebook')
         .eq('nombre_cuenta', page.name)
         .single()

       if (!existingConnection) {
         console.log('📘 Creando nueva conexión para:', page.name)
         
         // Crear nueva conexión
         const { data: newConnection, error: insertError } = await supabase
           .from('conexiones_sociales')
           .insert({
             usuario_id: userData.id,
             empresa_id: userData.empresa_id,
             plataforma: 'facebook',
             nombre_cuenta: page.name,
             access_token: page.access_token,
             metadata: {
               page_id: page.id,
               page_name: page.name,
               page_category: page.category,
               page_tasks: page.tasks || [],
               user_id: userInfo.id,
               user_name: userInfo.name,
               user_email: userInfo.email
             },
             is_active: true,
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString()
           })
           .select()

         if (insertError) {
           console.error('❌ Error al insertar conexión:', insertError)
         } else {
           console.log('✅ Conexión creada exitosamente:', newConnection)
         }
       } else {
         console.log('📘 Página ya existe:', page.name)
       }
     }

    return NextResponse.redirect(new URL('/dashboard/settings?success=facebook_connected&message=Páginas de Facebook conectadas exitosamente', request.url))

  } catch (error) {
    console.error('Error en callback de Facebook:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=callback_error&message=Error en el proceso de autorización', request.url))
  }
}
