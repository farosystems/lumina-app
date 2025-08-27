import { Empresa } from '@/lib/types'

export interface GenerationFormData {
  // Step 1: Product
  productName: string
  communicationType: string
  characteristics: string[]
  productImage?: string
  imageSource?: "file" | "url" | "camera"
  
  // Step 2: Promotion
  promotion: string
  imageFormat: "4:5" | "1:1" | "9:16"
  validity: string
  
  // Step 3: Audience
  objective: string
  communicationStyle: string
}

export interface EmpresaData {
  nombre: string
  rubro: string
  fuentes: string
  colores: string
  imagen_que_transmite: string
  publico_objetivo: {
    edad_minima: number
    edad_maxima: number
    zona_alcance: string
    intereses: string[]
  }
}

export function buildContentPrompt(formData: GenerationFormData, empresaData: EmpresaData): string {
  // Mapear objetivos a texto descriptivo
  const objectiveMap: Record<string, string> = {
    'conversations': 'generar conversaciones',
    'store_visits': 'atraer visitas al local',
    'website_visits': 'dirigir tráfico al sitio web',
    'whatsapp': 'generar contacto por WhatsApp',
    'profile_visits': 'aumentar visitas al perfil'
  }

  // Mapear estilos a texto descriptivo
  const styleMap: Record<string, string> = {
    'casual': 'casual y cercano',
    'professional': 'profesional y formal',
    'fun': 'divertido y dinámico',
    'elegant': 'elegante y sofisticado',
    'youthful': 'juvenil y moderno'
  }

  // Mapear formato a descripción
  const formatMap: Record<string, string> = {
    '4:5': 'publicación vertical para feed de Instagram',
    '1:1': 'publicación cuadrada para múltiples plataformas',
    '9:16': 'historia/story vertical'
  }

  const prompt = `Tengo una empresa de ${empresaData.rubro} llamada ${empresaData.nombre}. En nuestras piezas creativas,
utilizamos principalmente las fuentes ${empresaData.fuentes} y los colores de código: ${empresaData.colores}. Nos
caracterizamos por transmitir una imagen ${empresaData.imagen_que_transmite}.

Sabiendo eso, crea un copy para una ${formatMap[formData.imageFormat]} para subir a Instagram y Facebook en
simultáneo, con el objetivo de ${objectiveMap[formData.objective] || formData.objective}.

El producto es ${formData.productName}, y deseo ${formData.communicationType}. Este producto se caracteriza por
${formData.characteristics.join(', ')}. El público al que apuntamos son personas de ${empresaData.publico_objetivo.edad_minima} a ${empresaData.publico_objetivo.edad_maxima} años,
que se encuentren dentro de ${empresaData.publico_objetivo.zona_alcance} y tengan intereses en ${empresaData.publico_objetivo.intereses.join(', ')}. El tono de la
comunicación debe ser ${styleMap[formData.communicationStyle] || formData.communicationStyle}.

La publicación debe destacar ${formData.promotion}. El tiempo de vigencia es ${formData.validity}. La llamada a la acción debe ser para ${objectiveMap[formData.objective] || formData.objective}.

Sugiere hasta 6 hashtags específicos para maximizar el alcance a mi público ideal.

IMPORTANTE: 
- Responde SOLO con el texto del copy, sin hashtags incluidos en el texto
- NO incluyas formato JSON
- NO incluyas los hashtags en el copy
- El copy debe ser texto limpio y directo para redes sociales`

  return prompt
}

export function buildImagePrompt(formData: GenerationFormData, empresaData: EmpresaData): string {
  // Mapear formato a especificaciones técnicas
  const formatSpecs: Record<string, string> = {
    '4:5': 'vertical rectangle format for Instagram feed (crop to 4:5 aspect ratio)',
    '1:1': 'perfect square format for social media',
    '9:16': 'vertical story format for Instagram Stories'
  }

  // Construir prompt base
  let imagePrompt = `${formData.productImage ? 
    'Modifica y mejora la imagen de producto proporcionada para crear una publicidad profesional de redes sociales con las siguientes especificaciones:' : 
    'Crea una imagen publicitaria profesional para redes sociales con las siguientes especificaciones:'}

FORMAT: ${formatSpecs[formData.imageFormat]}
PRODUCT: ${formData.productName}
BUSINESS TYPE: ${empresaData.rubro}
BRAND COLORS: ${empresaData.colores}
PROMOTION: ${formData.promotion}

VISUAL STYLE: ${empresaData.imagen_que_transmite}, ${formData.communicationStyle}, modern and eye-catching
PRODUCT CHARACTERISTICS: ${formData.characteristics.join(', ')}`

  // Si hay imagen del producto, agregar instrucciones específicas
  if (formData.productImage) {
    imagePrompt += `

IMAGEN DE REFERENCIA DEL PRODUCTO: El usuario ha proporcionado una imagen de referencia del producto. Úsala como base principal para modificar y mejorar, manteniendo la identidad visual del producto mientras creas un diseño publicitario profesional.`
  }

  imagePrompt += `

REQUIREMENTS:
- High-quality, professional photography style
- Product should be prominently featured
- Include promotional text "${formData.promotion}" in an attractive way
- Use brand colors: ${empresaData.colores}
- Modern, clean design suitable for social media
- Eye-catching and visually appealing
- Professional lighting and composition
- Clear, readable text elements`

  if (formData.productImage) {
    imagePrompt += `
- Basa la apariencia del producto en la imagen de referencia proporcionada
- Mantén las características visuales del producto de la referencia
- MODIFICA y MEJORA la imagen existente, no crees una completamente nueva
- Agrega elementos publicitarios profesionales a la imagen base`
  }

  imagePrompt += `

The image should look like a premium advertisement that would perform well on Instagram and Facebook.`

  return imagePrompt
}

export function buildHashtagsPrompt(formData: GenerationFormData, empresaData: EmpresaData): string {
  const hashtagPrompt = `Basándote en esta información, genera EXACTAMENTE 6 hashtags específicos y relevantes:

EMPRESA: ${empresaData.nombre} - ${empresaData.rubro}
PRODUCTO: ${formData.productName}
CARACTERÍSTICAS: ${formData.characteristics.join(', ')}
PÚBLICO OBJETIVO: ${empresaData.publico_objetivo.edad_minima}-${empresaData.publico_objetivo.edad_maxima} años, ${empresaData.publico_objetivo.zona_alcance}
INTERESES: ${empresaData.publico_objetivo.intereses.join(', ')}
PROMOCIÓN: ${formData.promotion}

INSTRUCCIONES:
- Genera EXACTAMENTE 6 hashtags
- Cada hashtag debe empezar con #
- Deben ser específicos para maximizar el alcance
- Incluye hashtags del rubro, producto, promoción y ubicación
- Responde SOLO con los hashtags separados por comas
- Ejemplo: #hashtag1, #hashtag2, #hashtag3, #hashtag4, #hashtag5, #hashtag6`

  return hashtagPrompt
}
