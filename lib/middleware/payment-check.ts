import { supabaseAdmin } from '@/lib/supabase'

export interface PaymentCheckResult {
  hasAccess: boolean
  reason?: string
  empresa?: {
    id: string
    nombre: string
    pago_recibido: boolean
  }
}

export class PaymentCheckMiddleware {
  /**
   * Verifica si el usuario tiene acceso basado en el pago de licencia de su empresa
   */
  static async checkUserAccess(clerkUserId: string): Promise<PaymentCheckResult> {
    try {
      // Obtener el usuario de la base de datos
      const { data: usuario, error: usuarioError } = await supabaseAdmin
        .from('usuarios')
        .select('id, empresa_id, rol')
        .eq('clerk_id', clerkUserId)
        .single()

      if (usuarioError || !usuario) {
        return {
          hasAccess: false,
          reason: 'Usuario no encontrado en la base de datos'
        }
      }

      // Los administradores siempre tienen acceso
      if (usuario.rol === 'admin') {
        return {
          hasAccess: true,
          empresa: {
            id: 'admin',
            nombre: 'Administrador',
            pago_recibido: true
          }
        }
      }

      // Si el usuario no tiene empresa asignada, no tiene acceso
      if (!usuario.empresa_id) {
        return {
          hasAccess: false,
          reason: 'Usuario no tiene empresa asignada'
        }
      }

      // Verificar el estado de pago de la empresa
      const { data: empresa, error: empresaError } = await supabaseAdmin
        .from('empresas')
        .select('id, nombre, pago_recibido, is_active')
        .eq('id', usuario.empresa_id)
        .single()

      if (empresaError || !empresa) {
        return {
          hasAccess: false,
          reason: 'Empresa no encontrada'
        }
      }

      // Verificar si la empresa está activa
      if (!empresa.is_active) {
        return {
          hasAccess: false,
          reason: 'La empresa está inactiva',
          empresa: {
            id: empresa.id,
            nombre: empresa.nombre,
            pago_recibido: empresa.pago_recibido
          }
        }
      }

      // Verificar si la empresa ha realizado el pago
      if (!empresa.pago_recibido) {
        return {
          hasAccess: false,
          reason: 'Pago de licencia pendiente',
          empresa: {
            id: empresa.id,
            nombre: empresa.nombre,
            pago_recibido: empresa.pago_recibido
          }
        }
      }

      // Si todo está bien, el usuario tiene acceso
      return {
        hasAccess: true,
        empresa: {
          id: empresa.id,
          nombre: empresa.nombre,
          pago_recibido: empresa.pago_recibido
        }
      }

    } catch (error) {
      console.error('Error en PaymentCheckMiddleware:', error)
      return {
        hasAccess: false,
        reason: 'Error interno del servidor'
      }
    }
  }

  /**
   * Verifica si una empresa específica tiene acceso
   */
  static async checkCompanyAccess(empresaId: string): Promise<PaymentCheckResult> {
    try {
      const { data: empresa, error: empresaError } = await supabaseAdmin
        .from('empresas')
        .select('id, nombre, pago_recibido, is_active')
        .eq('id', empresaId)
        .single()

      if (empresaError || !empresa) {
        return {
          hasAccess: false,
          reason: 'Empresa no encontrada'
        }
      }

      if (!empresa.is_active) {
        return {
          hasAccess: false,
          reason: 'La empresa está inactiva',
          empresa: {
            id: empresa.id,
            nombre: empresa.nombre,
            pago_recibido: empresa.pago_recibido
          }
        }
      }

      if (!empresa.pago_recibido) {
        return {
          hasAccess: false,
          reason: 'Pago de licencia pendiente',
          empresa: {
            id: empresa.id,
            nombre: empresa.nombre,
            pago_recibido: empresa.pago_recibido
          }
        }
      }

      return {
        hasAccess: true,
        empresa: {
          id: empresa.id,
          nombre: empresa.nombre,
          pago_recibido: empresa.pago_recibido
        }
      }

    } catch (error) {
      console.error('Error en PaymentCheckMiddleware.checkCompanyAccess:', error)
      return {
        hasAccess: false,
        reason: 'Error interno del servidor'
      }
    }
  }
}
