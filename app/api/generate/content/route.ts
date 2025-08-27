import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { buildContentPrompt, buildImagePrompt, buildHashtagsPrompt, GenerationFormData, EmpresaData } from '@/lib/utils/prompt-builder'
import { downloadAndStoreImage, generateFileName } from '@/lib/image-storage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const formData: GenerationFormData = body.formData
    const regenerationCount = body.regenerationCount || 0

    console.log('🤖 Iniciando generación de contenido para usuario:', userId)
    console.log('📝 Body completo recibido:', JSON.stringify(body, null, 2))
    console.log('📝 Form data recibido:', JSON.stringify(formData, null, 2))
    console.log('🖼️ Imagen del producto presente:', !!formData.productImage)
    console.log('🔗 URL/Data de imagen:', formData.productImage ? formData.productImage.substring(0, 100) + '...' : 'No hay imagen')
    console.log('🔍 Todas las propiedades de formData:', Object.keys(formData))

    // Obtener datos del usuario y empresa
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, empresa_id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !userData) {
      console.error('❌ Error obteniendo usuario:', userError)
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener datos de la empresa
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .select('nombre, rubro, descripcion')
      .eq('id', userData.empresa_id)
      .single()

    if (empresaError || !empresaData) {
      console.error('❌ Error obteniendo empresa:', empresaError)
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }

    // Para este ejemplo, vamos a usar datos mock de la empresa
    // En una implementación real, estos datos vendrían de la base de datos
    const mockEmpresaData: EmpresaData = {
      nombre: empresaData.nombre,
      rubro: empresaData.rubro,
      fuentes: 'Montserrat, Roboto',
      colores: '#6366f1, #8b5cf6, #ffffff',
      imagen_que_transmite: 'moderna, confiable y profesional',
      publico_objetivo: {
        edad_minima: 25,
        edad_maxima: 45,
        zona_alcance: 'CABA y GBA',
        intereses: ['tecnología', 'innovación', 'calidad']
      }
    }

    console.log('🏢 Datos de empresa preparados:', mockEmpresaData)

    // Determinar si es una historia basada en el formato de imagen
    const isStory = formData.imageFormat === "9:16"
    
    let generatedContent: {
      copy: string;
      hashtags: string[];
    } = {
      copy: "",
      hashtags: []
    }

    // Solo generar copy y hashtags si NO es una historia
    if (!isStory) {
      // Verificar límite de regeneraciones para copy
      if (regenerationCount >= 3) {
        return NextResponse.json(
          { error: 'Límite de regeneraciones alcanzado (máximo 3 regeneraciones por sesión)' },
          { status: 400 }
        )
      }

      // Construir el prompt para el copy
      const contentPrompt = buildContentPrompt(formData, mockEmpresaData)
      console.log('📝 Prompt de copy construido:', contentPrompt.substring(0, 200) + '...')

      // Generar el copy con IA
      console.log('🤖 Generando copy con OpenAI...')
      const { text: copyText } = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt: contentPrompt,
        temperature: 0.7,
      })

      console.log('✅ Copy generado:', copyText.substring(0, 200) + '...')

      // Construir el prompt para hashtags
      const hashtagsPrompt = buildHashtagsPrompt(formData, mockEmpresaData)
      console.log('🏷️ Prompt de hashtags construido')

      // Generar hashtags con IA
      console.log('🤖 Generando hashtags con OpenAI...')
      const { text: hashtagsText } = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt: hashtagsPrompt,
        temperature: 0.5,
      })

      console.log('✅ Hashtags generados:', hashtagsText)

      // Procesar hashtags
      const hashtags = hashtagsText
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.startsWith('#'))
        .slice(0, 6) // Asegurar máximo 6 hashtags

      generatedContent = {
        copy: copyText.trim(),
        hashtags: hashtags
      }
    } else {
      console.log('📱 Es una historia - saltando generación de copy y hashtags')
    }

    // Construir prompt para imagen
    const imagePrompt = buildImagePrompt(formData, mockEmpresaData)
    console.log('🎨 Prompt de imagen construido:', imagePrompt.substring(0, 150) + '...')

    // Para la generación de imágenes, usar DALL-E
    console.log('🎨 Generando imagen con DALL-E...')
    
    let imageUrl = null
    let storageInfo: {
      storage_file_name: string | null;
      is_permanent_image: boolean;
    } = {
      storage_file_name: null,
      is_permanent_image: false
    }
    try {
      // Determinar el tamaño basado en el formato (DALL-E 3 solo soporta estos tamaños)
      const imageSize = formData.imageFormat === '9:16' ? '1024x1792' : 
                       formData.imageFormat === '4:5' ? '1024x1792' : '1024x1024'
      
      console.log('🖼️ Configuración de imagen:', {
        modelo: 'dall-e-3',
        formato: formData.imageFormat,
        tamaño: imageSize,
        tieneImagenReferencia: !!formData.productImage
      })

      // Si hay imagen del producto, analizarla primero con GPT-4 Vision
      let finalImagePrompt = imagePrompt
      if (formData.productImage) {
        console.log('📸 Analizando imagen de producto con GPT-4 Vision...')
        
        try {
          // Verificar que la imagen sea accesible
          let imageUrl = formData.productImage
          if (imageUrl.startsWith('data:')) {
            console.log('📸 Imagen en formato base64 detectada')
            // Para imágenes base64, las enviamos directamente
          } else {
            console.log('📸 Imagen por URL detectada:', imageUrl.substring(0, 50) + '...')
            
            // Para URLs externas, descargar y convertir a base64
            try {
              console.log('🔄 Descargando imagen externa para Vision API...')
              const imageResponse = await fetch(imageUrl)
              if (!imageResponse.ok) {
                throw new Error(`HTTP error! status: ${imageResponse.status}`)
              }
              const imageBuffer = await imageResponse.arrayBuffer()
              const base64Image = Buffer.from(imageBuffer).toString('base64')
              const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'
              imageUrl = `data:${mimeType};base64,${base64Image}`
              console.log('✅ Imagen convertida a base64 para Vision API')
            } catch (downloadError) {
              console.error('❌ Error descargando imagen:', downloadError)
              throw new Error('No se pudo descargar la imagen externa')
            }
          }

          // Analizar la imagen del producto con GPT-4 Vision
          console.log('🔍 Llamando a GPT-4 Vision API...')
          const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "Describe briefly in English: colors, style, composition, and key visual elements of this product image. Keep it concise for DALL-E prompt."
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: imageUrl
                      }
                    }
                  ]
                }
              ],
              max_tokens: 200
            })
          })

          console.log('📊 Vision API status:', visionResponse.status)
          console.log('📊 Vision API headers:', Object.fromEntries(visionResponse.headers.entries()))

          if (visionResponse.ok) {
            const visionData = await visionResponse.json()
            console.log('📋 Vision API response completa:', JSON.stringify(visionData, null, 2))
            
            const productDescription = visionData.choices?.[0]?.message?.content
            if (productDescription) {
              console.log('✅ Descripción del producto generada:', productDescription.substring(0, 150) + '...')
              
              // Acortar la descripción si es muy larga
              const shortDescription = productDescription.length > 200 ? 
                productDescription.substring(0, 200) + '...' : 
                productDescription
              
              finalImagePrompt += `\n\nPRODUCT REFERENCE: ${shortDescription}\n\nIMPORTANTE: Use the provided product image as base. Modify and enhance it with professional advertising elements. Do not create a completely new image.`
            } else {
              console.error('❌ No se encontró descripción en la respuesta de Vision')
              console.log('⚠️ No se pudo analizar la imagen, usando prompt básico')
              finalImagePrompt += `\n\nIMPORTANTE: Use the provided product image as base. Modify and enhance it with professional advertising elements.`
            }
          } else {
            const errorData = await visionResponse.json()
            console.error('❌ Error en Vision API:', visionResponse.status)
            console.error('❌ Error data:', errorData)
            console.log('⚠️ No se pudo analizar la imagen, usando prompt básico')
            finalImagePrompt += `\n\nIMPORTANTE: Toma como base la imagen de producto proporcionada y modifícala agregando elementos publicitarios profesionales. NO crees una imagen completamente nueva, sino mejora la existente con elementos de marketing y diseño publicitario para redes sociales.`
          }
        } catch (visionError) {
          console.error('❌ Error analizando imagen:', visionError)
          finalImagePrompt += `\n\nIMPORTANTE: Toma como base la imagen de producto proporcionada y modifícala agregando elementos publicitarios profesionales. NO crees una imagen completamente nueva, sino mejora la existente con elementos de marketing y diseño publicitario para redes sociales.`
        }
      }

      console.log('📝 Prompt final para imagen:', finalImagePrompt.substring(0, 200) + '...')
      console.log('📏 Longitud del prompt:', finalImagePrompt.length, 'caracteres')

      // Verificar que el prompt no exceda el límite de DALL-E (4000 caracteres)
      if (finalImagePrompt.length > 4000) {
        console.warn('⚠️ Prompt demasiado largo, truncando...')
        finalImagePrompt = finalImagePrompt.substring(0, 3900) + '...'
        console.log('📏 Longitud del prompt truncado:', finalImagePrompt.length, 'caracteres')
      }

      // Usar la API directa de OpenAI para DALL-E
      const requestBody = {
        model: "dall-e-3",
        prompt: finalImagePrompt,
        n: 1,
        size: imageSize,
        quality: "standard",
      }

      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('🎨 Respuesta de DALL-E:', imageResponse.status, imageResponse.statusText)

      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        const dalleUrl = imageData.data[0].url
        console.log('✅ Imagen generada exitosamente por DALL-E:', dalleUrl.substring(0, 50) + '...')
        
        // Descargar y almacenar la imagen en Supabase Storage
        try {
          const timestamp = Date.now()
          const fileName = generateFileName(userId, timestamp)
          console.log('💾 Descargando y almacenando imagen...')
          
          const permanentUrl = await downloadAndStoreImage(dalleUrl, fileName)
          imageUrl = permanentUrl
          
          console.log('✅ Imagen almacenada permanentemente:', imageUrl)
          
          // Agregar información del storage a la respuesta
          storageInfo = {
            storage_file_name: fileName,
            is_permanent_image: true
          }
        } catch (storageError) {
          console.error('❌ Error almacenando imagen:', storageError)
          // Si falla el almacenamiento, usar la URL temporal de DALL-E
          imageUrl = dalleUrl
          console.log('⚠️ Usando URL temporal de DALL-E como fallback')
          
          storageInfo = {
            storage_file_name: null,
            is_permanent_image: false
          }
        }
      } else {
        const errorData = await imageResponse.json()
        console.error('❌ Error generando imagen:', errorData)
        console.error('❌ Status:', imageResponse.status)
        console.error('❌ Headers:', Object.fromEntries(imageResponse.headers.entries()))
      }
    } catch (imageError) {
      console.error('❌ Error en generación de imagen:', imageError)
      console.error('❌ Stack trace:', (imageError as Error).stack)
    }

    // Preparar respuesta
    const response = {
      copy: generatedContent.copy,
      hashtags: generatedContent.hashtags || [],
      imageUrl: imageUrl,
      storageInfo: storageInfo,
      formData: formData,
      empresaData: mockEmpresaData,
      regenerationCount: regenerationCount + 1
    }

    console.log('🎉 Generación completada exitosamente')
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error en generación de contenido:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
