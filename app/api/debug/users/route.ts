import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Debug: Obteniendo todos los usuarios...')
    
    const { data: users, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error en Supabase:', error)
      return NextResponse.json({ error: 'Error en Supabase', details: error.message }, { status: 500 })
    }

    console.log('✅ Usuarios encontrados:', users)
    return NextResponse.json({ 
      count: users?.length || 0,
      users: users || []
    })
  } catch (error) {
    console.error('❌ Error en /api/debug/users:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}





