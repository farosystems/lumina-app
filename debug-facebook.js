import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkFacebookConnections() {
  try {
    console.log('🔍 Verificando conexiones de Facebook...')
    
    // Obtener todas las conexiones de Facebook
    const { data: connections, error } = await supabase
      .from('conexiones_sociales')
      .select('*')
      .eq('plataforma', 'facebook')
      .eq('is_active', true)

    if (error) {
      console.error('❌ Error obteniendo conexiones:', error)
      return
    }

    console.log(`📘 Conexiones de Facebook encontradas: ${connections?.length || 0}`)
    
    if (connections && connections.length > 0) {
      connections.forEach((conn, index) => {
        console.log(`\n📘 Conexión ${index + 1}:`)
        console.log(`  - ID: ${conn.id}`)
        console.log(`  - Nombre: ${conn.nombre_cuenta}`)
        console.log(`  - Activa: ${conn.is_active}`)
        console.log(`  - Página ID: ${conn.metadata?.page_id}`)
        console.log(`  - Usuario: ${conn.usuario_id}`)
        console.log(`  - Empresa: ${conn.empresa_id}`)
        console.log(`  - Token disponible: ${!!conn.access_token}`)
      })
    } else {
      console.log('⚠️ No hay conexiones de Facebook activas')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkFacebookConnections()