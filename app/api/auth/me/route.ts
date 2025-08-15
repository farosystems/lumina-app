import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener datos del usuario desde Supabase
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: 'Error obteniendo usuario' }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener datos adicionales de Clerk
    try {
      const clerk = await clerkClient()
      const clerkUser = await clerk.users.getUser(userId)
      
      // Combinar datos de Supabase con datos de Clerk
      const userData = {
        ...user,
        avatar_url: clerkUser.imageUrl || user.avatar_url
      }

      return NextResponse.json(userData)
    } catch (clerkError) {
      // Si no se puede obtener datos de Clerk, devolver solo datos de Supabase
      return NextResponse.json(user)
    }

  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
