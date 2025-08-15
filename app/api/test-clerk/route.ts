import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    console.log('🔍 Probando configuración de Clerk...')
    
    // Verificar si las variables de entorno están configuradas
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const clerkSecretKey = process.env.CLERK_SECRET_KEY
    
    if (!clerkPublishableKey || !clerkSecretKey) {
      return NextResponse.json({ 
        error: 'Clerk no está configurado',
        clerkPublishableKey: !!clerkPublishableKey,
        clerkSecretKey: !!clerkSecretKey
      }, { status: 500 })
    }

    // Intentar obtener el usuario autenticado
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ 
        message: 'No hay usuario autenticado',
        clerkConfigured: true
      })
    }

    return NextResponse.json({ 
      message: 'Clerk configurado correctamente',
      userId,
      clerkConfigured: true
    })
  } catch (error) {
    console.error('❌ Error probando Clerk:', error)
    return NextResponse.json({ 
      error: 'Error en Clerk',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}





