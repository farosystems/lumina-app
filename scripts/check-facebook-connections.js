const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkFacebookConnections() {
  try {
    console.log('🔍 Verificando conexiones de Facebook...')
    
    const { data: connections, error } = await supabase
      .from('conexiones_sociales')
      .select('*')
      .eq('plataforma', 'facebook')
      .eq('is_active', true)

    if (error) {
      console.error('❌ Error al obtener conexiones:', error)
      return
    }

    console.log(`📊 Total conexiones de Facebook encontradas: ${connections.length}`)
    
    if (connections.length > 0) {
      connections.forEach((conn, index) => {
        console.log(`\n📘 Conexión ${index + 1}:`)
        console.log(`   ID: ${conn.id}`)
        console.log(`   Usuario ID: ${conn.usuario_id}`)
        console.log(`   Nombre: ${conn.nombre_cuenta}`)
        console.log(`   Plataforma: ${conn.plataforma}`)
        console.log(`   Activa: ${conn.is_active}`)
        console.log(`   Metadata:`, JSON.stringify(conn.metadata, null, 2))
        console.log(`   Creada: ${conn.created_at}`)
      })
    } else {
      console.log('❌ No se encontraron conexiones de Facebook')
    }

    // También verificar todas las conexiones
    const { data: allConnections, error: allError } = await supabase
      .from('conexiones_sociales')
      .select('plataforma, is_active')
      .eq('is_active', true)

    if (!allError) {
      console.log('\n📊 Resumen de todas las conexiones:')
      const platforms = allConnections.reduce((acc, conn) => {
        acc[conn.plataforma] = (acc[conn.plataforma] || 0) + 1
        return acc
      }, {})
      
      Object.entries(platforms).forEach(([platform, count]) => {
        console.log(`   ${platform}: ${count}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkFacebookConnections()









