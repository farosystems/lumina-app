# Sistema de Control de Acceso por Pago de Licencias

Este documento explica cómo funciona el sistema de control de acceso basado en el pago de licencias en Lumina.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
- [Flujo de Verificación](#flujo-de-verificación)
- [Componentes](#componentes)
- [Endpoints](#endpoints)
- [Gestión Administrativa](#gestión-administrativa)

## 📝 Descripción

El sistema de control de acceso por pago de licencias permite:

- **Controlar el acceso** de usuarios basado en el estado de pago de su empresa
- **Restringir funcionalidades** cuando el pago está pendiente
- **Gestionar licencias** desde el panel de administración
- **Registrar actividades** de cambios de estado de pago

## 🗄️ Configuración de la Base de Datos

### 1. Agregar Campo pago_recibido

Ejecuta el siguiente script en tu base de datos Supabase:

```sql
-- Agregar campo pago_recibido a la tabla empresas
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS pago_recibido BOOLEAN DEFAULT false;

-- Actualizar empresas existentes para que tengan pago_recibido = true por defecto
UPDATE empresas 
SET pago_recibido = true 
WHERE pago_recibido IS NULL;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_empresas_pago_recibido ON empresas(pago_recibido);
CREATE INDEX IF NOT EXISTS idx_empresas_activa_pago ON empresas(is_active, pago_recibido);

-- Comentario en la tabla para documentar el campo
COMMENT ON COLUMN empresas.pago_recibido IS 'Indica si la empresa ha realizado el pago de la licencia. Si es FALSE, los usuarios no pueden acceder al sistema.';
```

### 2. Usar el Script Automático

```bash
# Ejecutar el script SQL
psql -h your-supabase-host -U postgres -d postgres -f scripts/add-pago-recibido-field.sql
```

## 🔄 Flujo de Verificación

### 1. Verificación de Acceso

Cuando un usuario intenta acceder al dashboard:

1. **Autenticación**: Se verifica que el usuario esté autenticado con Clerk
2. **Verificación de Rol**: Se obtiene el rol del usuario desde la base de datos
3. **Verificación de Empresa**: Se obtiene la empresa asociada al usuario
4. **Verificación de Pago**: Se verifica el estado de `pago_recibido` de la empresa
5. **Control de Acceso**: Se permite o deniega el acceso según el resultado

### 2. Reglas de Acceso

- **Administradores**: Siempre tienen acceso completo
- **Usuarios con empresa pagada**: Acceso completo al dashboard
- **Usuarios con empresa pendiente**: Se muestra pantalla de pago requerido
- **Usuarios sin empresa**: Acceso denegado

## 🧩 Componentes

### PaymentRequired

Componente que se muestra cuando el pago está pendiente:

```tsx
import { PaymentRequired } from '@/components/payment-required'

// Se muestra automáticamente cuando accessCheck.hasAccess = false
<PaymentRequired 
  empresaNombre="Mi Empresa"
  reason="Pago de licencia pendiente"
/>
```

**Características:**
- Diseño profesional y atractivo
- Información clara sobre el problema
- Botones de contacto con soporte
- Lista de beneficios de la licencia
- Opción de cerrar sesión

### PaymentCheckMiddleware

Clase utilitaria para verificar el acceso:

```typescript
import { PaymentCheckMiddleware } from '@/lib/middleware/payment-check'

// Verificar acceso de un usuario
const accessCheck = await PaymentCheckMiddleware.checkUserAccess(clerkUserId)

// Verificar acceso de una empresa específica
const companyAccess = await PaymentCheckMiddleware.checkCompanyAccess(empresaId)
```

## 🌐 Endpoints

### GET /api/auth/check-access

Verifica el acceso del usuario logueado.

**Respuesta:**
```json
{
  "hasAccess": true,
  "reason": null,
  "empresa": {
    "id": "uuid",
    "nombre": "Mi Empresa",
    "pago_recibido": true
  }
}
```

### PATCH /api/admin/empresas/[id]

Actualiza el estado de pago de una empresa (solo administradores).

**Body:**
```json
{
  "pago_recibido": true
}
```

**Respuesta:**
```json
{
  "success": true,
  "empresa": {
    "id": "uuid",
    "nombre": "Mi Empresa",
    "pago_recibido": true
  },
  "message": "Empresa marcada como pagada exitosamente"
}
```

## 👨‍💼 Gestión Administrativa

### Panel de Empresas

En el dashboard del administrador, la tabla de empresas incluye:

1. **Columna de Pago**: Muestra el estado actual (Pagado/Pendiente)
2. **Botón de Toggle**: Permite cambiar el estado de pago
3. **Estadísticas**: Contadores de empresas pagadas vs pendientes

### Funcionalidades

- **Ver Estado**: Badge visual que indica el estado de pago
- **Cambiar Estado**: Botón para alternar entre pagado/pendiente
- **Confirmación**: Diálogo de confirmación antes de cambiar
- **Registro de Actividad**: Se registra cada cambio en `registro_actividad`

### Estadísticas del Dashboard

El dashboard muestra:

- **Total de Empresas**: Número total de empresas registradas
- **Empresas Activas**: Empresas con `is_active = true`
- **Licencias Pagadas**: Empresas con `pago_recibido = true`
- **Pagos Pendientes**: Empresas con `pago_recibido = false`

## 🔒 Seguridad

### Verificaciones Implementadas

1. **Autenticación**: Verificación de sesión con Clerk
2. **Autorización**: Solo administradores pueden cambiar estados de pago
3. **Validación**: Verificación de tipos de datos en endpoints
4. **Auditoría**: Registro de todas las actividades de cambio de estado

### Políticas de Acceso

```typescript
// Verificación en middleware
if (user.rol !== 'admin') {
  return { hasAccess: false, reason: 'Acceso denegado' }
}

// Verificación de pago
if (!empresa.pago_recibido) {
  return { 
    hasAccess: false, 
    reason: 'Pago de licencia pendiente',
    empresa: empresa 
  }
}
```

## 📊 Monitoreo

### Métricas Importantes

- **Tasa de Conversión**: Empresas que pagan vs total registradas
- **Tiempo de Pago**: Tiempo promedio desde registro hasta pago
- **Empresas Pendientes**: Lista de empresas con pago pendiente
- **Actividad de Cambios**: Registro de cambios de estado

### Alertas Recomendadas

- Empresas con pago pendiente por más de 30 días
- Cambios frecuentes de estado de pago
- Empresas inactivas con pago pendiente

## 🚀 Implementación

### 1. Ejecutar Scripts SQL

```bash
# Agregar campo pago_recibido
psql -f scripts/add-pago-recibido-field.sql

# Crear tabla de registro de actividad (si no existe)
psql -f scripts/create-registro-actividad.sql
```

### 2. Verificar Configuración

- Confirmar que el campo `pago_recibido` existe en la tabla `empresas`
- Verificar que los índices se crearon correctamente
- Probar el endpoint `/api/auth/check-access`

### 3. Probar Funcionalidad

- Crear una empresa con `pago_recibido = false`
- Intentar acceder con un usuario de esa empresa
- Verificar que se muestra la pantalla de pago requerido
- Cambiar el estado desde el panel de administración
- Verificar que el usuario puede acceder después del cambio

## 📞 Soporte

### Problemas Comunes

1. **Usuario no puede acceder**:
   - Verificar que la empresa tiene `pago_recibido = true`
   - Confirmar que el usuario está asociado a una empresa
   - Revisar logs del endpoint `/api/auth/check-access`

2. **Error al cambiar estado de pago**:
   - Verificar que el usuario es administrador
   - Confirmar que la empresa existe
   - Revisar logs del endpoint PATCH

3. **Estadísticas incorrectas**:
   - Verificar que el campo `pago_recibido` tiene valores correctos
   - Confirmar que las consultas incluyen el nuevo campo

### Contacto

Para soporte técnico:
- **Email**: soporte@lumina.com
- **Teléfono**: +1 (234) 567-890
- **Horario**: Lunes a Viernes 9:00 - 18:00
