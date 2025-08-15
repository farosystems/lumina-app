# Configuración de Clerk para Lumina

## Variables de Entorno Requeridas

Crear archivo `.env.local` con las siguientes variables:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key (for Server Actions - KEEP SECRET)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Pasos para Configurar Clerk

### 1. Crear cuenta en Clerk
- Ve a [clerk.com](https://clerk.com)
- Crea una cuenta y un nuevo proyecto

### 2. Obtener las claves
- En el dashboard de Clerk, ve a "API Keys"
- Copia `Publishable Key` y `Secret Key`

### 3. Configurar autenticación
- En Clerk, ve a "User & Authentication"
- Configura los métodos de autenticación que desees (email/password, username/password)

### 4. Crear usuarios
- Ve a "Users" en Clerk
- Crea usuarios con email o username
- Asegúrate de que coincidan con los usuarios en tu base de datos Supabase

### 5. Configurar webhook (opcional)
- Ve a "Webhooks" en Clerk
- Crea un webhook que apunte a `https://tu-dominio.com/api/webhooks/clerk`
- Selecciona los eventos: `user.created`, `user.updated`, `user.deleted`

## Flujo de Autenticación

1. **Usuario accede** a la aplicación
2. **Middleware de Clerk** verifica si está autenticado
3. **Si no está autenticado** → redirige a `/sign-in`
4. **Usuario ingresa** credenciales en Clerk
5. **Clerk autentica** y crea sesión
6. **RouteGuard verifica** permisos en base de datos
7. **Redirige** según el rol del usuario

## Estructura de Usuarios

Los usuarios deben existir tanto en Clerk como en Supabase:

### En Clerk:
- Email o username
- Contraseña

### En Supabase (tabla `usuarios`):
- `clerk_id`: ID del usuario en Clerk
- `email`: Email del usuario
- `rol`: 'admin' o 'cliente'
- `empresa_id`: ID de la empresa (para clientes)

## Notas Importantes

- **Solo usuarios registrados** en Clerk pueden acceder al sistema
- **Los usuarios deben existir** en Supabase con el `clerk_id` correcto
- **El middleware protege** todas las rutas automáticamente
- **RouteGuard verifica** permisos específicos por rol
