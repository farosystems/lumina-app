import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Verificando conexiones de Facebook...')
    
    // Obtener todas las conexiones de Facebook
    const { data: connections, error } = await supabaseAdmin
      .from('conexiones_sociales')
      .select('*')
      .eq('plataforma', 'facebook')
      .eq('is_active', true)

    if (error) {
      console.error('❌ Error obteniendo conexiones:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`📘 Conexiones de Facebook encontradas: ${connections?.length || 0}`)
    
    const debugInfo = {
      total: connections?.length || 0,
      connections: connections?.map(conn => ({
        id: conn.id,
        nombre_cuenta: conn.nombre_cuenta,
        is_active: conn.is_active,
        page_id: conn.metadata?.page_id,
        usuario_id: conn.usuario_id,
        empresa_id: conn.empresa_id,
        has_token: !!conn.access_token,
        token_preview: conn.access_token ? conn.access_token.substring(0, 20) + '...' : null,
        created_at: conn.created_at
      })) || []
    }
    
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
    
    return NextResponse.json(debugInfo)
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}