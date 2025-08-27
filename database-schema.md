# Estructura de Base de Datos - Lumina AI

## 🗄️ Tablas Principales

### 1. Tabla de Empresas (empresas)

```sql
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  rubro VARCHAR(100) NOT NULL,
  imagen_transmitir TEXT,
  colores JSONB,
  fuentes JSONB,
  publico_ideal JSONB,
  logo_url TEXT,
  sitio_web VARCHAR(255),
  telefono VARCHAR(50),
  email VARCHAR(255),
  direccion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

**Campos del público ideal:**
- `edad_minima`: Edad mínima del público objetivo
- `edad_maxima`: Edad máxima del público objetivo  
- `zona`: Zona geográfica del público objetivo
- `intereses`: Array de intereses del público objetivo

### 2. Tabla de Usuarios (usuarios)

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  avatar_url TEXT,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'cliente')),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  cargo VARCHAR(100),
  telefono VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

### 3. Tabla de Posts (posts)

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(255),
  contenido TEXT NOT NULL,
  plataforma VARCHAR(50) NOT NULL CHECK (plataforma IN ('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok')),
  estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'programado', 'publicado', 'fallido')),
  fecha_programada TIMESTAMP WITH TIME ZONE,
  fecha_publicacion TIMESTAMP WITH TIME ZONE,
  imagen_url TEXT,
  hashtags TEXT[],
  metadata JSONB,
  prompt_utilizado TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Tabla de Plantillas de Posts (plantillas_posts)

```sql
CREATE TABLE plantillas_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_contenido VARCHAR(50),
  estructura_prompt TEXT,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Tabla de Actividad (registro_actividad)

```sql
CREATE TABLE registro_actividad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  accion VARCHAR(100) NOT NULL,
  descripcion TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Tabla de Conexiones Sociales (conexiones_sociales)

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
  account_id VARCHAR(255), -- ID de la cuenta en la plataforma
  metadata JSONB, -- Datos adicionales como followers, tipo de cuenta, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, plataforma, account_id)
);
```

### 7. Tabla de Publicaciones Sociales (publicaciones_sociales)

```sql
CREATE TABLE publicaciones_sociales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  conexion_social_id UUID NOT NULL REFERENCES conexiones_sociales(id) ON DELETE CASCADE,
  plataforma VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'publicando', 'publicado', 'fallido')),
  fecha_programada TIMESTAMP WITH TIME ZONE,
  fecha_publicacion TIMESTAMP WITH TIME ZONE,
  post_id_plataforma VARCHAR(255), -- ID del post en la plataforma social
  error_message TEXT,
  metadata JSONB, -- Datos adicionales como engagement, likes, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Políticas de Seguridad (RLS)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_actividad ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: solo ven datos de su empresa
CREATE POLICY "Usuarios solo ven datos de su empresa" ON posts
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Usuarios solo ven su empresa" ON empresas
  FOR SELECT USING (
    id IN (
      SELECT empresa_id FROM usuarios WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Usuarios solo ven plantillas de su empresa" ON plantillas_posts
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Política para admins: ven todo
CREATE POLICY "Admins ven todos los datos" ON posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND rol = 'admin'
    )
  );

CREATE POLICY "Admins ven todas las empresas" ON empresas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND rol = 'admin'
    )
  );

CREATE POLICY "Admins ven todas las plantillas" ON plantillas_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND rol = 'admin'
    )
  );

-- Políticas para registro de actividad
CREATE POLICY "Usuarios ven actividad de su empresa" ON registro_actividad
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Admins ven toda la actividad" ON registro_actividad
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND rol = 'admin'
    )
  );

-- Políticas para conexiones sociales
CREATE POLICY "Usuarios ven conexiones de su empresa" ON conexiones_sociales
  FOR ALL USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Admins ven todas las conexiones" ON conexiones_sociales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND rol = 'admin'
    )
  );

-- Políticas para publicaciones sociales
CREATE POLICY "Usuarios ven publicaciones de su empresa" ON publicaciones_sociales
  FOR ALL USING (
    post_id IN (
      SELECT p.id FROM posts p 
      JOIN usuarios u ON p.empresa_id = u.empresa_id 
      WHERE u.clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Admins ven todas las publicaciones" ON publicaciones_sociales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND rol = 'admin'
    )
  );
```

## 📊 Índices Recomendados

```sql
-- Índices para mejorar performance
CREATE INDEX idx_empresas_slug ON empresas(slug);
CREATE INDEX idx_usuarios_clerk_id ON usuarios(clerk_id);
CREATE INDEX idx_usuarios_empresa_id ON usuarios(empresa_id);
CREATE INDEX idx_posts_empresa_id ON posts(empresa_id);
CREATE INDEX idx_posts_estado ON posts(estado);
CREATE INDEX idx_posts_fecha_programada ON posts(fecha_programada);
CREATE INDEX idx_posts_plataforma ON posts(plataforma);
CREATE INDEX idx_plantillas_posts_empresa_id ON plantillas_posts(empresa_id);
CREATE INDEX idx_registro_actividad_empresa_id ON registro_actividad(empresa_id);
CREATE INDEX idx_registro_actividad_fecha ON registro_actividad(created_at);
CREATE INDEX idx_conexiones_sociales_usuario_id ON conexiones_sociales(usuario_id);
CREATE INDEX idx_conexiones_sociales_empresa_id ON conexiones_sociales(empresa_id);
CREATE INDEX idx_conexiones_sociales_plataforma ON conexiones_sociales(plataforma);
CREATE INDEX idx_publicaciones_sociales_post_id ON publicaciones_sociales(post_id);
CREATE INDEX idx_publicaciones_sociales_estado ON publicaciones_sociales(estado);
CREATE INDEX idx_publicaciones_sociales_fecha_programada ON publicaciones_sociales(fecha_programada);
```

## 🔄 Triggers para Auditoría

```sql
-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas que tienen updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plantillas_posts_updated_at BEFORE UPDATE ON plantillas_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conexiones_sociales_updated_at BEFORE UPDATE ON conexiones_sociales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publicaciones_sociales_updated_at BEFORE UPDATE ON publicaciones_sociales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 📝 Ejemplo de Datos

### Ejemplo de inserción de empresa:

```sql
INSERT INTO empresas (
  nombre,
  slug,
  rubro,
  imagen_transmitir,
  colores,
  fuentes,
  publico_ideal,
  logo_url,
  sitio_web,
  email
) VALUES (
  'Café del Sol',
  'cafe-del-sol',
  'Gastronomía',
  'Una cafetería acogedora y moderna que transmite calidez, calidad y momentos especiales. Ambiente relajado y profesional.',
  '["#8B4513", "#D2691E", "#F4A460", "#FFFFFF"]',
  '["Poppins", "Playfair Display"]',
  '{"edad_minima": 25, "edad_maxima": 45, "zona": "Zona Norte de Buenos Aires", "intereses": ["café", "gastronomía", "trabajo remoto", "networking", "calidad de vida"]}',
  'https://ejemplo.com/logo.png',
  'https://cafedelsol.com',
  'info@cafedelsol.com'
);
```

### Ejemplo de inserción de usuario:

```sql
INSERT INTO usuarios (
  clerk_id,
  email,
  nombre,
  apellido,
  rol,
  empresa_id
) VALUES (
  'user_2abc123def456',
  'juan@cafedelsol.com',
  'Juan',
  'Pérez',
  'cliente',
  'uuid-de-la-empresa'
);
```

## ✅ Características de esta estructura:

1. **Multi-tenancy**: Cada empresa tiene sus datos aislados
2. **Seguridad**: RLS garantiza que los usuarios solo vean sus datos
3. **Escalabilidad**: Fácil agregar nuevas empresas y funcionalidades
4. **Auditoría**: Log completo de actividades
5. **Performance**: Índices optimizados para consultas frecuentes
6. **Flexibilidad**: JSONB permite almacenar datos dinámicos
7. **Integración**: Compatible con Clerk para autenticación

## 🚀 Próximos pasos:

1. Crear las tablas en Supabase
2. Configurar las políticas RLS
3. Crear los índices
4. Configurar los triggers
5. Probar con datos de ejemplo




