# 🔧 Configuración de Clerk - Paso a Paso

## ✅ Estado Actual
- ✅ Aplicación funcionando con login temporal
- ✅ Middleware básico configurado
- ✅ Estructura preparada para Clerk

## 🚀 Pasos para configurar Clerk

### 1. Crear cuenta en Clerk
1. Ve a [clerk.com](https://clerk.com)
2. Crea una cuenta gratuita
3. Crea una nueva aplicación
4. Selecciona "Next.js" como framework

### 2. Obtener las claves
1. En el dashboard de Clerk, ve a **API Keys**
2. Copia la **Publishable Key** (empieza con `pk_test_`)
3. Copia la **Secret Key** (empieza con `sk_test_`)

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
CLERK_SECRET_KEY=sk_test_tu_clave_aqui

# Supabase (cuando lo configures)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Configurar el webhook (opcional)
1. En Clerk, ve a **Webhooks**
2. Crea un nuevo endpoint:
   - URL: `https://tu-dominio.com/api/webhooks/clerk`
   - Eventos: `user.created`, `user.updated`, `user.deleted`
3. Copia el **Webhook Secret** y agrégalo a `.env.local`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_tu_webhook_secret
   ```

### 5. Habilitar Clerk en la aplicación

Una vez que tengas las claves configuradas, ejecuta estos comandos:

```bash
# 1. Actualizar el layout para incluir ClerkProvider
# Edita app/layout.tsx y descomenta las líneas de Clerk

# 2. Actualizar el middleware para usar authMiddleware
# Edita middleware.ts y reemplaza con el código de Clerk

# 3. Actualizar las páginas de login/signup
# Edita app/login/page.tsx y app/sign-up/page.tsx

# 4. Reiniciar el servidor
npm run dev
```

## 🔄 Código para habilitar Clerk

### 1. Layout (app/layout.tsx)
```tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

### 2. Middleware (middleware.ts)
```tsx
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/login", "/sign-up"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### 3. Login (app/login/page.tsx)
```tsx
import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return <SignIn />
}
```

## 🎯 Próximos pasos

1. **Configurar Clerk** siguiendo los pasos arriba
2. **Probar el login** con usuarios reales
3. **Configurar Supabase** para la base de datos
4. **Implementar roles** y permisos
5. **Configurar el webhook** para sincronización

## 🔍 Troubleshooting

### Error: "authMiddleware is not a function"
- Asegúrate de que `@clerk/nextjs` esté instalado correctamente
- Verifica que las variables de entorno estén configuradas
- Reinicia el servidor después de configurar las variables

### Error: "ClerkProvider not found"
- Verifica que `ClerkProvider` esté importado correctamente
- Asegúrate de que las claves de Clerk estén configuradas

### Error: "Invalid API key"
- Verifica que las claves de Clerk sean correctas
- Asegúrate de que estés usando las claves de test, no de producción

## 📝 Notas importantes

- **Desarrollo**: Usa las claves de test (`pk_test_`, `sk_test_`)
- **Producción**: Cambia a las claves de producción cuando despliegues
- **Webhook**: Solo es necesario si quieres sincronizar con Supabase
- **Variables**: Nunca subas `.env.local` a Git

## 🎉 ¡Listo!

Una vez configurado Clerk, tendrás:
- ✅ Autenticación profesional
- ✅ Registro de usuarios
- ✅ Recuperación de contraseñas
- ✅ Autenticación social (opcional)
- ✅ Dashboard de usuarios
- ✅ Seguridad enterprise








