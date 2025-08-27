import { supabaseAdmin } from '@/lib/supabase'

export interface ActividadData {
  usuario_id: string
  empresa_id?: string
  accion: string
  descripcion: string
  metadata?: Record<string, any>
}

export class ActividadService {
  /**
   * Registra una nueva actividad en el sistema
   */
  static async registrarActividad(data: ActividadData): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('registro_actividad')
        .insert({
          usuario_id: data.usuario_id,
          empresa_id: data.empresa_id,
          accion: data.accion,
          descripcion: data.descripcion,
          metadata: data.metadata || null
        })

      if (error) {
        console.error('Error registrando actividad:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error en ActividadService.registrarActividad:', error)
      return false
    }
  }

  /**
   * Registra la creación de un post
   */
  static async registrarCreacionPost(usuarioId: string, empresaId: string, postId: string, plataforma: string): Promise<boolean> {
    return this.registrarActividad({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      accion: 'crear_post',
      descripcion: `Creó un nuevo post para ${plataforma}`,
      metadata: {
        post_id: postId,
        plataforma: plataforma
      }
    })
  }

  /**
   * Registra la publicación de un post
   */
  static async registrarPublicacionPost(usuarioId: string, empresaId: string, postId: string, plataforma: string): Promise<boolean> {
    return this.registrarActividad({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      accion: 'publicar_post',
      descripcion: `Publicó contenido en ${plataforma}`,
      metadata: {
        post_id: postId,
        plataforma: plataforma
      }
    })
  }

  /**
   * Registra la programación de un post
   */
  static async registrarProgramacionPost(usuarioId: string, empresaId: string, postId: string, plataforma: string, fechaProgramada: string): Promise<boolean> {
    return this.registrarActividad({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      accion: 'programar_post',
      descripcion: `Programó publicación en ${plataforma} para ${new Date(fechaProgramada).toLocaleDateString()}`,
      metadata: {
        post_id: postId,
        plataforma: plataforma,
        fecha_programada: fechaProgramada
      }
    })
  }

  /**
   * Registra la conexión de una cuenta social
   */
  static async registrarConexionSocial(usuarioId: string, empresaId: string, plataforma: string): Promise<boolean> {
    return this.registrarActividad({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      accion: `conectar_${plataforma.toLowerCase()}`,
      descripcion: `Conectó cuenta de ${plataforma} Business`,
      metadata: {
        plataforma: plataforma
      }
    })
  }

  /**
   * Registra la desconexión de una cuenta social
   */
  static async registrarDesconexionSocial(usuarioId: string, empresaId: string, plataforma: string): Promise<boolean> {
    return this.registrarActividad({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      accion: `desconectar_${plataforma.toLowerCase()}`,
      descripcion: `Desconectó cuenta de ${plataforma}`,
      metadata: {
        plataforma: plataforma
      }
    })
  }

  /**
   * Registra la creación de una empresa
   */
  static async registrarCreacionEmpresa(usuarioId: string, empresaId: string, nombreEmpresa: string): Promise<boolean> {
    return this.registrarActividad({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      accion: 'crear_empresa',
      descripcion: `Creó la empresa ${nombreEmpresa}`,
      metadata: {
        empresa_id: empresaId,
        nombre_empresa: nombreEmpresa
      }
    })
  }

  /**
   * Registra la creación de un usuario
   */
  static async registrarCreacionUsuario(usuarioId: string, empresaId: string, nombreUsuario: string): Promise<boolean> {
    return this.registrarActividad({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      accion: 'crear_usuario',
      descripcion: `Creó el usuario ${nombreUsuario}`,
      metadata: {
        nombre_usuario: nombreUsuario
      }
    })
  }

  /**
   * Registra la actualización de configuración
   */
  static async registrarActualizacionConfiguracion(usuarioId: string, empresaId: string, tipo: string): Promise<boolean> {
    return this.registrarActividad({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      accion: 'actualizar_configuracion',
      descripcion: `Actualizó configuración de ${tipo}`,
      metadata: {
        tipo_configuracion: tipo
      }
    })
  }

  /**
   * Registra el inicio de sesión
   */
  static async registrarInicioSesion(usuarioId: string, empresaId?: string): Promise<boolean> {
    return this.registrarActividad({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      accion: 'inicio_sesion',
      descripcion: 'Inició sesión en la plataforma'
    })
  }

  /**
   * Registra el cierre de sesión
   */
  static async registrarCierreSesion(usuarioId: string, empresaId?: string): Promise<boolean> {
    return this.registrarActividad({
      usuario_id: usuarioId,
      empresa_id: empresaId,
      accion: 'cierre_sesion',
      descripcion: 'Cerró sesión en la plataforma'
    })
  }
}
