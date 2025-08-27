import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const facebookAppId = process.env.FACEBOOK_APP_ID
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`

    if (!facebookAppId) {
      return NextResponse.json({ error: 'Configuración de Facebook no encontrada' }, { status: 500 })
    }

    // Construir URL de autorización de Facebook
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
    authUrl.searchParams.set('client_id', facebookAppId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
         authUrl.searchParams.set('scope', 'pages_manage_posts,pages_read_engagement,pages_show_list,pages_manage_metadata,pages_read_user_content')
    authUrl.searchParams.set('state', userId) // Usar userId como state para seguridad

    return NextResponse.json({ authUrl: authUrl.toString() })

  } catch (error) {
    console.error('Error al generar URL de autorización de Facebook:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
