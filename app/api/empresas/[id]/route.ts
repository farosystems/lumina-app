import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: empresa, error } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching empresa:', error)
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }

    return NextResponse.json(empresa)
  } catch (error) {
    console.error('Error in /api/empresas/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
