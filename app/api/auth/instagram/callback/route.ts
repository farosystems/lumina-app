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
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('Error en autenticación de Instagram:', error)
      return NextResponse.redirect(new URL('/dashboard/settings?error=instagram_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url))
    }

    // Intercambiar código por token
    const tokenData = await InstagramService.exchangeCodeForToken(code)
    
    if (!tokenData.access_token) {
      console.error('❌ No se obtuvo token de acceso')
      return NextResponse.redirect(new URL('/dashboard/settings?error=no_token&message=No se pudo obtener el token de acceso de Instagram.', request.url))
    }
    
    console.log('✅ Token obtenido:', tokenData.access_token.substring(0, 20) + '...')

    // Obtener información de la cuenta de Instagram
    let accountInfo
    try {
      accountInfo = await InstagramService.getAccountInfo(tokenData.access_token)
    } catch (error) {
      console.error('Error al obtener información de Instagram:', error)
      
             if (error instanceof Error) {
         if (error.message === 'NO_PAGE_FOUND') {
           // Redirigir a una página de debug con el token
           const debugToken = tokenData.access_token ? tokenData.access_token : ''
           const debugUrl = `/dashboard/settings?error=debug_needed&debug_token=${encodeURIComponent(debugToken)}&message=Se necesita debug. Revisa la consola del servidor para más información.`
           return NextResponse.redirect(new URL(debugUrl, request.url))
         } else if (error.message === 'NO_INSTAGRAM_BUSINESS') {
           return NextResponse.redirect(new URL('/dashboard/settings?error=no_instagram_business&message=Tu página "Faro.AI" existe pero no tiene Instagram Business conectado. Sigue los pasos para configurarlo correctamente.', request.url))
         } else if (error.message.includes('Error al obtener detalles de la cuenta de Instagram')) {
           return NextResponse.redirect(new URL('/dashboard/settings?error=instagram_details_failed&message=Se encontró Instagram Business pero no se pueden obtener los detalles. Esto puede ser por permisos insuficientes o configuración incompleta.', request.url))
         }
       }
      
      return NextResponse.redirect(new URL('/dashboard/settings?error=instagram_setup_failed&message=Error al configurar Instagram. Verifica que tu cuenta esté configurada correctamente.', request.url))
    }

    // Obtener información del usuario y su empresa
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, empresa_id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !userData) {
      console.error('Error al obtener usuario:', userError)
      return NextResponse.redirect(new URL('/dashboard/settings?error=user_not_found', request.url))
    }

    // Guardar la conexión en la base de datos
    await InstagramService.saveConnection(
      userData.id,
      userData.empresa_id,
      accountInfo,
      tokenData.access_token,
      accountInfo.page_access_token || ''
    )

    // Registrar actividad
    await supabase
      .from('registro_actividad')
      .insert({
        usuario_id: userData.id,
        empresa_id: userData.empresa_id,
        accion: 'conectar_instagram',
        descripcion: `Conectó cuenta de Instagram: ${accountInfo.username}`,
        metadata: {
          plataforma: 'instagram',
          username: accountInfo.username,
          followers: accountInfo.followers_count
        }
      })

    return NextResponse.redirect(new URL('/dashboard/settings?success=instagram_connected', request.url))

  } catch (error) {
    console.error('Error en callback de Instagram:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=callback_failed', request.url))
  }
}
