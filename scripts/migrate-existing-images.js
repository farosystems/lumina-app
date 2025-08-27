// Script para migrar imágenes existentes de DALL-E a Supabase Storage
// Ejecutar en el navegador con la consola abierta

const migrateExistingImages = async () => {
  console.log('🔄 Iniciando migración de imágenes existentes...')
  
  try {
    // Obtener todos los posts con imágenes
    const response = await fetch('/api/posts')
    if (!response.ok) {
      throw new Error('Error obteniendo posts')
    }
    
    const data = await response.json()
    const posts = data.posts.filter(post => post.imagen_url && !post.is_permanent_image)
    
    console.log(`📊 Encontrados ${posts.length} posts con imágenes temporales`)
    
    for (const post of posts) {
      console.log(`\n🔄 Procesando post ${post.id}:`, post.titulo)
      
      try {
        // Intentar descargar y almacenar la imagen
        const migrateResponse = await fetch('/api/migrate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: post.id,
            imageUrl: post.imagen_url
          })
        })
        
        if (migrateResponse.ok) {
          const result = await migrateResponse.json()
          console.log('✅ Migrado exitosamente:', result.newUrl)
        } else {
          const error = await migrateResponse.json()
          console.log('❌ Error migrando:', error.error)
        }
      } catch (error) {
        console.log('❌ Error procesando post:', error.message)
      }
    }
    
    console.log('\n🎉 Migración completada')
  } catch (error) {
    console.error('❌ Error en migración:', error)
  }
}

// Ejecutar migración
migrateExistingImages()

