import { createClient } from '@supabase/supabase-js'
import { ConexionSocial, InstagramAccountInfo } from '../types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class InstagramService {
  // Obtener URL de autorización de Instagram
  static getAuthUrl(): string {
    const clientId = process.env.INSTAGRAM_APP_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`
    const scope = 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts,business_management'
    
    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=instagram_auth`
  }

  // Intercambiar código por token de acceso
  static async exchangeCodeForToken(code: string): Promise<{
    access_token: string
    token_type: string
    expires_in: number
  }> {
    const clientId = process.env.INSTAGRAM_APP_ID
    const clientSecret = process.env.INSTAGRAM_APP_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`

    const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        code: code,
      }),
    })

    if (!response.ok) {
      throw new Error('Error al intercambiar código por token')
    }

    const data = await response.json()
    return data as {
      access_token: string
      token_type: string
      expires_in: number
    }
  }

  // Obtener información de la cuenta de Instagram
  static async getAccountInfo(accessToken: string): Promise<InstagramAccountInfo> {
    console.log('🔍 Verificando token de acceso...')
    
    // Primero verificamos que el token sea válido
    const meResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
    )
    
    if (!meResponse.ok) {
      const errorData = await meResponse.json()
      console.error('❌ Error verificando token:', errorData)
      throw new Error(`Token inválido: ${errorData.error?.message || 'Error desconocido'}`)
    }
    
    const meData = await meResponse.json()
    console.log('✅ Token válido para usuario:', meData.name)
    
    // Intentar obtener páginas con diferentes métodos
    let pagesData = null
    
    // Método 1: /me/accounts (método estándar)
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
      )

      if (response.ok) {
        pagesData = await response.json()
        console.log('📄 Páginas encontradas (método 1):', pagesData.data?.length || 0)
      } else {
        const errorData = await response.json()
        console.error('❌ Error obteniendo páginas (método 1):', errorData)
      }
    } catch (error) {
      console.error('❌ Error en método 1:', error)
    }
    
    // Método 2: /me con fields (método alternativo)
    if (!pagesData || !pagesData.data || pagesData.data.length === 0) {
      try {
        const response2 = await fetch(
          `https://graph.facebook.com/v18.0/me?fields=accounts{id,name,category,access_token,instagram_business_account}&access_token=${accessToken}`
        )

        if (response2.ok) {
          const meWithPages = await response2.json()
          if (meWithPages.accounts && meWithPages.accounts.data) {
            pagesData = meWithPages.accounts
            console.log('📄 Páginas encontradas (método 2):', pagesData.data?.length || 0)
          }
        } else {
          const errorData = await response2.json()
          console.error('❌ Error obteniendo páginas (método 2):', errorData)
        }
      } catch (error) {
        console.error('❌ Error en método 2:', error)
      }
    }

    // Método 3: Buscar en Business Manager
    if (!pagesData || !pagesData.data || pagesData.data.length === 0) {
      try {
        const response3 = await fetch(
          `https://graph.facebook.com/v18.0/me?fields=business_users{id,name,email,business{id,name,owned_pages{id,name,category,access_token,instagram_business_account}}}&access_token=${accessToken}`
        )

        if (response3.ok) {
          const businessData = await response3.json()
          console.log('🏢 Datos de Business Manager:', businessData)
          
          if (businessData.business_users && businessData.business_users.data) {
            for (const businessUser of businessData.business_users.data) {
              if (businessUser.business && businessUser.business.owned_pages && businessUser.business.owned_pages.data) {
                pagesData = businessUser.business.owned_pages
                console.log('📄 Páginas encontradas (método 3 - Business Manager):', pagesData.data?.length || 0)
                break
              }
            }
          }
        } else {
          const errorData = await response3.json()
          console.error('❌ Error obteniendo datos de business (método 3):', errorData)
        }
      } catch (error) {
        console.error('❌ Error en método 3:', error)
      }
    }
    
    // Verificar si hay páginas conectadas
    if (!pagesData || !pagesData.data || pagesData.data.length === 0) {
      console.error('❌ No se encontraron páginas con ningún método')
      throw new Error('NO_PAGE_FOUND')
    }
    
         // Buscar una página que tenga Instagram Business conectado
     let pageWithInstagram = null
     console.log('🔍 Verificando páginas para Instagram Business...')
     
     for (const page of pagesData.data) {
       console.log(`📄 Verificando página: ${page.name} (ID: ${page.id})`)
       console.log(`📄 Datos completos de la página:`, JSON.stringify(page, null, 2))
       
       // Verificar si ya tenemos la información de Instagram en los datos
       if (page.instagram_business_account) {
         console.log(`✅ Página ${page.name} ya tiene Instagram en los datos`)
         console.log(`📸 Instagram data:`, page.instagram_business_account)
         pageWithInstagram = page
         break
       }
       
       // Si no, hacer la llamada adicional
       try {
         const instagramResponse = await fetch(
           `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
         )
         
         if (instagramResponse.ok) {
           const instagramData = await instagramResponse.json()
           console.log(`📸 Datos de Instagram para ${page.name}:`, instagramData)
           
           if (instagramData.instagram_business_account) {
             console.log(`✅ Encontrada página con Instagram: ${page.name}`)
             console.log(`📸 Instagram data:`, instagramData.instagram_business_account)
             // Agregar la información de Instagram a la página
             page.instagram_business_account = instagramData.instagram_business_account
             pageWithInstagram = page
             break
           } else {
             console.log(`❌ Página ${page.name} no tiene Instagram Business conectado`)
           }
         } else {
           const errorData = await instagramResponse.json()
           console.error(`❌ Error verificando Instagram en ${page.name}:`, errorData)
         }
       } catch (error) {
         console.error(`❌ Error verificando página ${page.id}:`, error)
         continue
       }
     }
    
         if (!pageWithInstagram) {
       throw new Error('NO_INSTAGRAM_BUSINESS')
     }
 
     // Verificar que tenemos la información de Instagram
     if (!pageWithInstagram.instagram_business_account) {
       console.error('❌ Página encontrada pero sin Instagram Business:', pageWithInstagram)
       throw new Error('NO_INSTAGRAM_BUSINESS')
     }
 
     console.log('📸 Instagram Business Account encontrado:', pageWithInstagram.instagram_business_account)
 
               // Obtener detalles de la cuenta de Instagram
     const instagramAccountId = pageWithInstagram.instagram_business_account.id
     const pageAccessToken = pageWithInstagram.access_token
     
     console.log('📸 Intentando obtener detalles de Instagram...')
     console.log('📸 Instagram Account ID:', instagramAccountId)
     console.log('📸 Page Access Token:', pageAccessToken.substring(0, 20) + '...')
     
     let accountInfo = null
     let errorMessage = ''
     
     // Método 1: Obtener información completa
     try {
       const accountResponse = await fetch(
         `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=id,username,name,profile_picture_url,followers_count,media_count,account_type&access_token=${pageAccessToken}`
       )

       console.log('📸 Response status (método 1):', accountResponse.status)

       if (accountResponse.ok) {
         accountInfo = await accountResponse.json()
         console.log('📸 Account info obtenida (método 1):', accountInfo)
       } else {
         const errorData = await accountResponse.json()
         console.error('❌ Error método 1:', errorData)
         errorMessage = errorData.error?.message || 'Error desconocido'
       }
     } catch (error) {
       console.error('❌ Error en método 1:', error)
       errorMessage = error instanceof Error ? error.message : 'Error desconocido'
     }
     
     // Método 2: Obtener información básica
     if (!accountInfo) {
       try {
         console.log('📸 Intentando método 2: información básica...')
         const basicResponse = await fetch(
           `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=id,username&access_token=${pageAccessToken}`
         )

         console.log('📸 Response status (método 2):', basicResponse.status)

         if (basicResponse.ok) {
           const basicInfo = await basicResponse.json()
           console.log('📸 Basic info obtenida (método 2):', basicInfo)
           
           // Crear información mínima
           accountInfo = {
             id: basicInfo.id,
             username: basicInfo.username,
             name: basicInfo.username,
             account_type: 'BUSINESS',
             followers_count: 0,
             media_count: 0
           }
         } else {
           const errorData = await basicResponse.json()
           console.error('❌ Error método 2:', errorData)
           errorMessage = errorData.error?.message || 'Error desconocido'
         }
       } catch (error) {
         console.error('❌ Error en método 2:', error)
         errorMessage = error instanceof Error ? error.message : 'Error desconocido'
       }
     }
     
     // Si no pudimos obtener información, lanzar error
     if (!accountInfo) {
       console.error('❌ No se pudo obtener información de Instagram con ningún método')
       throw new Error(`Error al obtener detalles de la cuenta de Instagram: ${errorMessage}`)
     }
     
     // Verificar que tenemos la información mínima necesaria
     if (!accountInfo.id || !accountInfo.username) {
       console.error('❌ Información de Instagram incompleta:', accountInfo)
       throw new Error('La información de Instagram está incompleta. Verifica que tu cuenta de Instagram Business esté completamente configurada.')
     }
     
     // Agregar información de la página para uso posterior
     return {
       ...accountInfo,
       page_id: pageWithInstagram.id,
       page_name: pageWithInstagram.name,
       page_access_token: pageWithInstagram.access_token
     }
  }

  // Guardar conexión social en la base de datos
  static async saveConnection(
    userId: string,
    empresaId: string,
    accountInfo: InstagramAccountInfo,
    accessToken: string,
    pageAccessToken: string
  ): Promise<ConexionSocial> {
    const { data, error } = await supabase
      .from('conexiones_sociales')
      .insert({
        usuario_id: userId,
        empresa_id: empresaId,
        plataforma: 'instagram',
        nombre_cuenta: accountInfo.username,
        access_token: pageAccessToken, // Usamos el token de la página
        account_id: accountInfo.id,
        metadata: {
          followers: accountInfo.followers_count,
          tipo_cuenta: accountInfo.account_type,
          profile_picture: accountInfo.profile_picture_url,
          username: accountInfo.username,
          name: accountInfo.name,
          media_count: accountInfo.media_count,
          page_id: accountInfo.page_id,
          page_name: accountInfo.page_name
        }
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al guardar conexión: ${error.message}`)
    }

    return data
  }

  // Obtener conexiones sociales de un usuario
  static async getConnections(userId: string): Promise<ConexionSocial[]> {
    const { data, error } = await supabase
      .from('conexiones_sociales')
      .select('*')
      .eq('usuario_id', userId)
      .eq('plataforma', 'instagram')
      .eq('is_active', true)

    if (error) {
      throw new Error(`Error al obtener conexiones: ${error.message}`)
    }

    return data || []
  }

  // Publicar contenido en Instagram
  static async publishContent(
    connectionId: string,
    caption: string,
    imageUrl?: string,
    scheduledTime?: string
  ): Promise<{ id: string; status: string }> {
    // Primero obtenemos la conexión
    const { data: connection, error: connectionError } = await supabase
      .from('conexiones_sociales')
      .select('*')
      .eq('id', connectionId)
      .single()

    if (connectionError || !connection) {
      throw new Error('Conexión no encontrada')
    }

    // Si hay una imagen, primero la subimos
    let mediaId: string | undefined

    if (imageUrl) {
      const mediaResponse = await fetch(
        `https://graph.facebook.com/v18.0/${connection.account_id}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: caption,
            access_token: connection.access_token,
          }),
        }
      )

      if (!mediaResponse.ok) {
        throw new Error('Error al subir imagen')
      }

      const mediaData = await mediaResponse.json()
      mediaId = mediaData.id
    }

    // Publicar el contenido
    const publishUrl = mediaId 
      ? `https://graph.facebook.com/v18.0/${connection.account_id}/media_publish`
      : `https://graph.facebook.com/v18.0/${connection.account_id}/media`

    const publishBody = mediaId 
      ? {
          creation_id: mediaId,
          access_token: connection.access_token,
        }
      : {
          image_url: imageUrl,
          caption: caption,
          access_token: connection.access_token,
        }

    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(publishBody),
    })

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      throw new Error(`Error al publicar: ${errorData.error?.message || 'Error desconocido'}`)
    }

    const publishData = await publishResponse.json()

    return {
      id: publishData.id,
      status: 'published'
    }
  }

  // Eliminar conexión social
  static async deleteConnection(connectionId: string): Promise<void> {
    const { error } = await supabase
      .from('conexiones_sociales')
      .update({ is_active: false })
      .eq('id', connectionId)

    if (error) {
      throw new Error(`Error al eliminar conexión: ${error.message}`)
    }
  }
}
