# Integración con Instagram - Lumina AI

## 📋 Descripción

Esta integración permite a los usuarios (no administradores) conectar sus cuentas de Instagram Business y publicar contenido directamente desde la plataforma Lumina AI.

## 🚀 Características

- ✅ Conexión segura con Instagram Business API
- ✅ Publicación de contenido con imágenes
- ✅ Programación de publicaciones
- ✅ Gestión de múltiples cuentas
- ✅ Seguimiento de estadísticas básicas
- ✅ Interfaz intuitiva y moderna

## 📋 Requisitos Previos

### 1. Aplicación de Facebook/Instagram

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva aplicación
3. Configura los permisos necesarios:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`

### 2. Configuración de la Aplicación

1. En la configuración de tu app, agrega la URL de redirección:
   ```
   https://tu-dominio.com/api/auth/instagram/callback
   ```

2. Para desarrollo local:
   ```
   http://localhost:3000/api/auth/instagram/callback
   ```

### 3. Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# Instagram/Facebook
INSTAGRAM_APP_ID=tu_app_id_de_facebook
INSTAGRAM_APP_SECRET=tu_app_secret_de_facebook
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Base de Datos

### Tablas Creadas

#### 1. `conexiones_sociales`
Almacena las conexiones de Instagram de los usuarios:

```sql
CREATE TABLE conexiones_sociales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  plataforma VARCHAR(50) NOT NULL CHECK (plataforma IN ('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok')),
  nombre_cuenta VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_id VARCHAR(255),
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, plataforma, account_id)
);
```

#### 2. `publicaciones_sociales`
Registra las publicaciones realizadas:

```sql
CREATE TABLE publicaciones_sociales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  conexion_social_id UUID NOT NULL REFERENCES conexiones_sociales(id) ON DELETE CASCADE,
  plataforma VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'publicando', 'publicado', 'fallido')),
  fecha_programada TIMESTAMP WITH TIME ZONE,
  fecha_publicacion TIMESTAMP WITH TIME ZONE,
  post_id_plataforma VARCHAR(255),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Instalación

### 1. Ejecutar Migraciones

Ejecuta las siguientes migraciones en tu base de datos Supabase:

```sql
-- Crear las tablas
-- (Ver database-schema.md para el SQL completo)

-- Crear índices
CREATE INDEX idx_conexiones_sociales_usuario_id ON conexiones_sociales(usuario_id);
CREATE INDEX idx_conexiones_sociales_empresa_id ON conexiones_sociales(empresa_id);
CREATE INDEX idx_conexiones_sociales_plataforma ON conexiones_sociales(plataforma);

-- Crear políticas RLS
CREATE POLICY "Usuarios ven conexiones de su empresa" ON conexiones_sociales
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );
```

### 2. Instalar Dependencias

```bash
npm install
# o
pnpm install
```

### 3. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env.local` y configura las variables:

```bash
cp env.example .env.local
```

## 🎯 Uso

### Para Usuarios

1. **Conectar Cuenta de Instagram**:
   - Ve a Configuración → Conexiones de Instagram
   - Haz clic en "Conectar"
   - Autoriza tu cuenta de Instagram Business

2. **Publicar Contenido**:
   - Usa el componente `InstagramPublisher` en cualquier página
   - Selecciona tu cuenta conectada
   - Escribe el contenido y agrega una imagen (opcional)
   - Publica inmediatamente o programa para más tarde

### Para Desarrolladores

#### Componentes Disponibles

1. **InstagramConnection**: Gestiona conexiones de Instagram
2. **InstagramPublisher**: Publica contenido en Instagram

#### API Endpoints

- `GET /api/instagram/auth-url`: Obtiene URL de autorización
- `GET /api/instagram/connections`: Lista conexiones del usuario
- `DELETE /api/instagram/connections`: Elimina una conexión
- `POST /api/instagram/publish`: Publica contenido

#### Servicios

- `InstagramService`: Clase principal para interactuar con Instagram API

## 🔒 Seguridad

- ✅ Autenticación requerida para todos los endpoints
- ✅ Verificación de propiedad de conexiones
- ✅ Tokens almacenados de forma segura
- ✅ Políticas RLS en Supabase
- ✅ Validación de entrada en todos los endpoints

## 🐛 Solución de Problemas

### Error: "No se encontró ninguna página conectada"

**Causa**: El usuario no tiene páginas de Facebook conectadas a su cuenta.

**Solución**:
1. Ve a [Facebook.com](https://www.facebook.com/pages/create) y crea una página de Facebook Business
2. Selecciona "Negocio o marca" como tipo de página
3. Completa la información básica de tu negocio
4. Asegúrate de que la página esté conectada a tu cuenta personal de Facebook

### Error: "No tienes una cuenta de Instagram Business conectada"

**Causa**: La cuenta de Instagram no está conectada a una página de Facebook Business o no es de tipo Business/Creator.

**Solución**:
1. Convierte tu cuenta de Instagram a Business:
   - Ve a Configuración de Instagram > Cuenta
   - Selecciona "Cambiar a cuenta profesional"
   - Elige "Negocio" como tipo de cuenta
2. Conecta Instagram a tu página de Facebook:
   - En Instagram, ve a Configuración > Cuenta
   - Selecciona "Cuentas vinculadas"
   - Conecta tu cuenta a la página de Facebook Business que creaste

### Error: "Error al intercambiar código por token"

**Causa**: Configuración incorrecta de la aplicación de Facebook.

**Solución**:
1. Verifica que `INSTAGRAM_APP_ID` y `INSTAGRAM_APP_SECRET` estén correctos
2. Asegúrate de que la URL de redirección esté configurada en Facebook Developers
3. Verifica que la aplicación esté en modo "Live" si es para producción

### Error: "Conexión no encontrada"

**Causa**: La conexión fue eliminada o el usuario no tiene permisos.

**Solución**:
1. Verifica que la conexión exista en la base de datos
2. Asegúrate de que el usuario sea dueño de la conexión
3. Revisa las políticas RLS en Supabase

## 📈 Próximos Pasos

- [ ] Integración con Facebook
- [ ] Programación avanzada de publicaciones
- [ ] Análisis de engagement
- [ ] Publicación de Stories
- [ ] Gestión de comentarios
- [ ] Integración con otras redes sociales

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
