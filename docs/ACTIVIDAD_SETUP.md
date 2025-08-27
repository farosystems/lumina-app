# Configuración del Sistema de Registro de Actividad

Este documento explica cómo configurar y usar el sistema de registro de actividad en Lumina.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
- [Estructura de la Tabla](#estructura-de-la-tabla)
- [Uso del Servicio](#uso-del-servicio)
- [Componentes](#componentes)
- [Endpoints](#endpoints)

## 📝 Descripción

El sistema de registro de actividad permite rastrear todas las acciones importantes que realizan los usuarios en la plataforma. Esto incluye:

- Creación de posts
- Publicación de contenido
- Conexión de cuentas sociales
- Configuraciones de usuario
- Inicios de sesión
- Y más...

## 🗄️ Configuración de la Base de Datos

### 1. Ejecutar el Script SQL

Ejecuta el siguiente script en tu base de datos Supabase:

```sql
-- Crear tabla de registro de actividad
CREATE TABLE IF NOT EXISTS registro_actividad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  accion VARCHAR(100) NOT NULL,
  descripcion TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_registro_actividad_usuario_id ON registro_actividad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_registro_actividad_empresa_id ON registro_actividad(empresa_id);
CREATE INDEX IF NOT EXISTS idx_registro_actividad_fecha ON registro_actividad(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE registro_actividad ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: solo ven su propia actividad
CREATE POLICY "Usuarios ven su propia actividad" ON registro_actividad
  FOR SELECT USING (
    usuario_id IN (
      SELECT id FROM usuarios WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Política para admins: ven toda la actividad
CREATE POLICY "Admins ven toda la actividad" ON registro_actividad
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND rol = 'admin'
    )
  );
```

### 2. Usar el Script Automático

También puedes ejecutar el script automático ubicado en:

```bash
# Ejecutar el script SQL
psql -h your-supabase-host -U postgres -d postgres -f scripts/create-registro-actividad.sql
```

## 🏗️ Estructura de la Tabla

### Campos Principales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del registro |
| `usuario_id` | UUID | ID del usuario que realizó la acción |
| `empresa_id` | UUID | ID de la empresa (opcional) |
| `accion` | VARCHAR(100) | Tipo de acción realizada |
| `descripcion` | TEXT | Descripción legible de la acción |
| `metadata` | JSONB | Datos adicionales en formato JSON |
| `created_at` | TIMESTAMP | Fecha y hora de la acción |

### Acciones Predefinidas

- `crear_post` - Creación de un nuevo post
- `publicar_post` - Publicación de contenido
- `programar_post` - Programación de publicación
- `conectar_instagram` - Conexión de cuenta de Instagram
- `conectar_facebook` - Conexión de cuenta de Facebook
- `desconectar_instagram` - Desconexión de cuenta de Instagram
- `desconectar_facebook` - Desconexión de cuenta de Facebook
- `crear_empresa` - Creación de una empresa
- `crear_usuario` - Creación de un usuario
- `actualizar_configuracion` - Actualización de configuración
- `inicio_sesion` - Inicio de sesión
- `cierre_sesion` - Cierre de sesión

## 🔧 Uso del Servicio

### Importar el Servicio

```typescript
import { ActividadService } from '@/lib/services/actividad.service'
```

### Registrar Actividades Básicas

```typescript
// Registrar actividad personalizada
await ActividadService.registrarActividad({
  usuario_id: 'user-uuid',
  empresa_id: 'empresa-uuid',
  accion: 'mi_accion_personalizada',
  descripcion: 'Descripción de la acción',
  metadata: {
    dato_adicional: 'valor'
  }
})
```

### Registrar Actividades Específicas

```typescript
// Creación de post
await ActividadService.registrarCreacionPost(
  usuarioId,
  empresaId,
  postId,
  'instagram'
)

// Publicación de post
await ActividadService.registrarPublicacionPost(
  usuarioId,
  empresaId,
  postId,
  'instagram'
)

// Conexión de cuenta social
await ActividadService.registrarConexionSocial(
  usuarioId,
  empresaId,
  'Instagram'
)
```

## 🧩 Componentes

### RecentActivity

Componente para mostrar la actividad reciente del usuario:

```tsx
import { RecentActivity } from '@/components/client/recent-activity'

// En tu componente
<RecentActivity limit={5} />
```

### Hook useActividad

Hook personalizado para manejar la actividad:

```tsx
import { useActividad } from '@/lib/hooks/use-actividad'

// En tu componente
const { actividades, isLoading, error, refetch } = useActividad(10)
```

## 🌐 Endpoints

### GET /api/actividad

Obtiene la actividad reciente del usuario logueado.

**Respuesta:**
```json
{
  "actividades": [
    {
      "id": "uuid",
      "usuario_id": "uuid",
      "empresa_id": "uuid",
      "accion": "crear_post",
      "descripcion": "Creó un nuevo post para Instagram",
      "metadata": {
        "post_id": "uuid",
        "plataforma": "instagram"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "usuarios": {
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@example.com"
      },
      "empresas": {
        "nombre": "Mi Empresa"
      }
    }
  ]
}
```

## 🔒 Seguridad

### Row Level Security (RLS)

La tabla tiene políticas de seguridad que aseguran que:

1. **Usuarios normales** solo pueden ver su propia actividad
2. **Administradores** pueden ver toda la actividad del sistema
3. Solo los **administradores** pueden insertar, actualizar o eliminar registros

### Políticas de Acceso

```sql
-- Usuarios ven solo su actividad
CREATE POLICY "Usuarios ven su propia actividad" ON registro_actividad
  FOR SELECT USING (
    usuario_id IN (
      SELECT id FROM usuarios WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Admins ven toda la actividad
CREATE POLICY "Admins ven toda la actividad" ON registro_actividad
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND rol = 'admin'
    )
  );
```

## 📊 Monitoreo y Mantenimiento

### Índices de Rendimiento

La tabla incluye índices optimizados para:

- Búsquedas por usuario (`usuario_id`)
- Búsquedas por empresa (`empresa_id`)
- Ordenamiento por fecha (`created_at`)

### Limpieza de Datos

Considera implementar una limpieza periódica de registros antiguos:

```sql
-- Eliminar registros de más de 1 año
DELETE FROM registro_actividad 
WHERE created_at < NOW() - INTERVAL '1 year';
```

## 🚀 Próximos Pasos

1. **Ejecutar el script SQL** para crear la tabla
2. **Integrar el servicio** en los endpoints existentes
3. **Usar el componente** `RecentActivity` en el dashboard
4. **Configurar políticas de limpieza** si es necesario
5. **Monitorear el rendimiento** de las consultas

## 📞 Soporte

Si tienes problemas con la configuración:

1. Verifica que la tabla se haya creado correctamente
2. Confirma que las políticas RLS estén activas
3. Revisa los logs del servidor para errores
4. Verifica que el usuario tenga los permisos correctos
