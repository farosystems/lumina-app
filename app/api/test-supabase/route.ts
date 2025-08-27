import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Probando conexión con Supabase...')
    
    // Verificar si podemos conectarnos a Supabase
    const { data: users, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .limit(5)

    if (error) {
      console.error('❌ Error en Supabase:', error)
      return NextResponse.json({ 
        error: 'Error en Supabase', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    console.log('✅ Conexión exitosa. Usuarios encontrados:', users?.length || 0)
    
    return NextResponse.json({ 
      success: true, 
      usersCount: users?.length || 0,
      users: users 
    })
  } catch (error) {
    console.error('❌ Error en /api/test-supabase:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}








