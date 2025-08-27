import { NextRequest, NextResponse } from 'next/server'
import { InstagramService } from '@/lib/services/instagram.service'

export async function GET(request: NextRequest) {
  try {
    const authUrl = InstagramService.getAuthUrl()
    
    return NextResponse.json({ 
      authUrl,
      message: 'URL de autorización generada exitosamente'
    })
  } catch (error) {
    console.error('Error al generar URL de autorización:', error)
    return NextResponse.json({ 
      error: 'Error al generar URL de autorización',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
