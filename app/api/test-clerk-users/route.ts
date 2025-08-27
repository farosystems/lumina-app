import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  try {
    console.log('🔍 Listando usuarios de Clerk...')
    
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

    // Obtener lista de usuarios de Clerk
    const users = await clerkClient.users.getUserList({
      limit: 10,
    });

    // Mapear información relevante de los usuarios
    const userList = users.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({ 
      message: 'Usuarios de Clerk obtenidos correctamente',
      users: userList,
      total: userList.length
    })
  } catch (error) {
    console.error('❌ Error listando usuarios de Clerk:', error)
    return NextResponse.json({ 
      error: 'Error obteniendo usuarios de Clerk',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}







