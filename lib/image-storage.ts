import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function downloadAndStoreImage(dalleUrl: string, fileName: string): Promise<string> {
  try {
    console.log('📥 Descargando imagen de DALL-E:', dalleUrl)
    
    // Descargar la imagen de DALL-E
    const response = await fetch(dalleUrl)
    if (!response.ok) {
      throw new Error(`Error descargando imagen: ${response.status}`)
    }
    
    const imageBuffer = await response.arrayBuffer()
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' })
    
    console.log('📤 Subiendo imagen a Supabase Storage...')
    
    // Subir a Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('post-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('❌ Error subiendo imagen:', error)
      throw new Error(`Error subiendo imagen: ${error.message}`)
    }
    
    // Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('post-images')
      .getPublicUrl(fileName)
    
    const permanentUrl = urlData.publicUrl
    console.log('✅ Imagen subida exitosamente:', permanentUrl)
    
    return permanentUrl
    
  } catch (error) {
    console.error('❌ Error en downloadAndStoreImage:', error)
    throw error
  }
}

export function generateFileName(userId: string, timestamp: number): string {
  return `${userId}/${timestamp}-${Math.random().toString(36).substring(2, 15)}.png`
}

export async function deleteImageFromStorage(fileName: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.storage
      .from('post-images')
      .remove([fileName])
    
    if (error) {
      console.error('❌ Error eliminando imagen:', error)
      throw error
    }
    
    console.log('✅ Imagen eliminada exitosamente:', fileName)
  } catch (error) {
    console.error('❌ Error en deleteImageFromStorage:', error)
    throw error
  }
}









