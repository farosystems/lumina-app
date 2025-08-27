// Script de prueba para verificar el manejo de historias en el API
const testStoryAPI = async () => {
  console.log('🧪 Probando API de historias...')
  
  const testCases = [
    {
      name: 'Historia con imagen (debería funcionar)',
      data: {
        titulo: 'Test Historia',
        contenido: '', // Contenido vacío para historia
        plataforma: 'instagram',
        tipo: 'historia',
        imagen_url: 'https://example.com/test-image.jpg',
        hashtags: []
      }
    },
    {
      name: 'Historia sin imagen (debería fallar)',
      data: {
        titulo: 'Test Historia Sin Imagen',
        contenido: '',
        plataforma: 'instagram',
        tipo: 'historia',
        imagen_url: null,
        hashtags: []
      }
    },
    {
      name: 'Publicación sin contenido (debería fallar)',
      data: {
        titulo: 'Test Publicación Sin Contenido',
        contenido: '',
        plataforma: 'instagram',
        tipo: 'publicacion',
        imagen_url: 'https://example.com/test-image.jpg',
        hashtags: []
      }
    }
  ]
  
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`)
    console.log('📤 Enviando datos:', testCase.data)
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        console.log('✅ Éxito:', result.message)
      } else {
        console.log('❌ Error:', result.error)
      }
    } catch (error) {
      console.log('❌ Error de red:', error.message)
    }
  }
}

// Ejecutar la prueba
testStoryAPI()

