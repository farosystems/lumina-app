import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const accessToken = searchParams.get('token')

    if (!accessToken) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    const debugInfo: any = {
      token_info: null,
      pages: null,
      permissions: null,
      errors: []
    }

    // 1. Verificar información del token
    try {
      const meResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
      )
      
      if (meResponse.ok) {
        debugInfo.token_info = await meResponse.json()
      } else {
        const errorData = await meResponse.json()
        debugInfo.errors.push(`Error verificando token: ${errorData.error?.message}`)
      }
    } catch (error) {
      debugInfo.errors.push(`Error en verificación de token: ${error}`)
    }

    // 2. Verificar permisos
    try {
      const permissionsResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`
      )
      
      if (permissionsResponse.ok) {
        debugInfo.permissions = await permissionsResponse.json()
      } else {
        const errorData = await permissionsResponse.json()
        debugInfo.errors.push(`Error obteniendo permisos: ${errorData.error?.message}`)
      }
    } catch (error) {
      debugInfo.errors.push(`Error en permisos: ${error}`)
    }

    // 3. Verificar páginas
    try {
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
      )
      
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json()
        debugInfo.pages = pagesData
        
        // Verificar Instagram en cada página
        if (pagesData.data && pagesData.data.length > 0) {
          debugInfo.pages_with_instagram = []
          
          for (const page of pagesData.data) {
            try {
              const instagramResponse = await fetch(
                `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
              )
              
              if (instagramResponse.ok) {
                const instagramData = await instagramResponse.json()
                debugInfo.pages_with_instagram.push({
                  page_name: page.name,
                  page_id: page.id,
                  has_instagram: !!instagramData.instagram_business_account,
                  instagram_data: instagramData
                })
              } else {
                const errorData = await instagramResponse.json()
                debugInfo.pages_with_instagram.push({
                  page_name: page.name,
                  page_id: page.id,
                  error: errorData.error?.message
                })
              }
            } catch (error) {
              debugInfo.pages_with_instagram.push({
                page_name: page.name,
                page_id: page.id,
                error: `Error: ${error}`
              })
            }
          }
        }
      } else {
        const errorData = await pagesResponse.json()
        debugInfo.errors.push(`Error obteniendo páginas: ${errorData.error?.message}`)
      }
    } catch (error) {
      debugInfo.errors.push(`Error en páginas: ${error}`)
    }

    // 4. Verificar páginas directamente (método alternativo)
    try {
      const pagesDirectResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=accounts{id,name,category,access_token,instagram_business_account}&access_token=${accessToken}`
      )
      
      if (pagesDirectResponse.ok) {
        const pagesDirectData = await pagesDirectResponse.json()
        debugInfo.pages_direct = pagesDirectData
      } else {
        const errorData = await pagesDirectResponse.json()
        debugInfo.errors.push(`Error obteniendo páginas directo: ${errorData.error?.message}`)
      }
    } catch (error) {
      debugInfo.errors.push(`Error en páginas directo: ${error}`)
    }

    // 5. Verificar si hay páginas como administrador
    try {
      const adminPagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=accounts{id,name,category,access_token,instagram_business_account,roles}&access_token=${accessToken}`
      )
      
      if (adminPagesResponse.ok) {
        const adminPagesData = await adminPagesResponse.json()
        debugInfo.admin_pages = adminPagesData
      } else {
        const errorData = await adminPagesResponse.json()
        debugInfo.errors.push(`Error obteniendo páginas como admin: ${errorData.error?.message}`)
      }
    } catch (error) {
      debugInfo.errors.push(`Error en páginas como admin: ${error}`)
    }

    // 6. Verificar Business Manager (método alternativo)
    try {
      const businessResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=business_users{id,name,email,business{id,name,owned_pages{id,name,category,access_token,instagram_business_account}}}&access_token=${accessToken}`
      )
      
      if (businessResponse.ok) {
        const businessData = await businessResponse.json()
        debugInfo.business_data = businessData
      } else {
        const errorData = await businessResponse.json()
        debugInfo.errors.push(`Error obteniendo datos de business: ${errorData.error?.message}`)
      }
    } catch (error) {
      debugInfo.errors.push(`Error en business data: ${error}`)
    }

    // 7. Verificar si la página existe directamente por nombre
    try {
      const searchResponse = await fetch(
        `https://graph.facebook.com/v18.0/search?q=Faro.AI&type=page&access_token=${accessToken}`
      )
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        debugInfo.page_search = searchData
      } else {
        const errorData = await searchResponse.json()
        debugInfo.errors.push(`Error buscando página: ${errorData.error?.message}`)
      }
    } catch (error) {
      debugInfo.errors.push(`Error en búsqueda de página: ${error}`)
    }

    return NextResponse.json(debugInfo)

  } catch (error) {
    console.error('Error en debug:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
