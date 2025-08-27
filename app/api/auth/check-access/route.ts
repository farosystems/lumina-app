import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PaymentCheckMiddleware } from '@/lib/middleware/payment-check'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar el acceso del usuario
    const accessCheck = await PaymentCheckMiddleware.checkUserAccess(userId)

    return NextResponse.json({
      hasAccess: accessCheck.hasAccess,
      reason: accessCheck.reason,
      empresa: accessCheck.empresa
    })

  } catch (error) {
    console.error('Error en endpoint check-access:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      hasAccess: false 
    }, { status: 500 })
  }
}
