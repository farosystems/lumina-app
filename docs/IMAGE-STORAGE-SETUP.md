# Configuración del Sistema de Almacenamiento de Imágenes

Este documento explica cómo configurar el sistema para almacenar permanentemente las imágenes generadas por DALL-E en Supabase Storage.

## 🎯 Objetivo

Resolver el problema de las URLs temporales de DALL-E que expiran, almacenando las imágenes en Supabase Storage con URLs permanentes.

## 📋 Pasos de Configuración

### 1. Configurar Supabase Storage

Ejecuta el siguiente script en el **SQL Editor** de Supabase:

```sql
-- Crear el bucket para imágenes de posts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Crear política para permitir subida de imágenes (solo usuarios autenticados)
CREATE POLICY "Users can upload post images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'post-images' AND
  auth.role() = 'authenticated'
);

-- Crear política para permitir lectura pública de imágenes
CREATE POLICY "Public can view post images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'post-images'
);

-- Crear política para permitir eliminación de imágenes (solo propietarios)
CREATE POLICY "Users can delete their own post images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2. Actualizar la Tabla de Posts

Ejecuta el siguiente script para agregar los campos necesarios:

```sql
-- Agregar campo para almacenar el nombre del archivo en storage
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS storage_file_name VARCHAR(255);

-- Agregar campo para almacenar el bucket de storage
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS storage_bucket VARCHAR(50) DEFAULT 'post-images';

-- Agregar campo para indicar si la imagen es permanente (no expira)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_permanent_image BOOLEAN DEFAULT false;

-- Crear índice para búsquedas por archivo de storage
CREATE INDEX IF NOT EXISTS idx_posts_storage_file_name ON posts(storage_file_name);

-- Actualizar posts existentes para marcar que no son permanentes
UPDATE posts 
SET is_permanent_image = false 
WHERE is_permanent_image IS NULL;
```

### 3. Verificar Variables de Entorno

Asegúrate de que tienes las siguientes variables de entorno configuradas:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# OpenAI
OPENAI_API_KEY=tu_openai_api_key
```

## 🔄 Migración de Imágenes Existentes

### Opción 1: Migración Automática

1. Abre la consola del navegador en tu aplicación
2. Ejecuta el script de migración:

```javascript
// Copiar y pegar en la consola del navegador
const migrateExistingImages = async () => {
  console.log('🔄 Iniciando migración de imágenes existentes...')
  
  try {
    const response = await fetch('/api/posts')
    if (!response.ok) throw new Error('Error obteniendo posts')
    
    const data = await response.json()
    const posts = data.posts.filter(post => post.imagen_url && !post.is_permanent_image)
    
    console.log(`📊 Encontrados ${posts.length} posts con imágenes temporales`)
    
    for (const post of posts) {
      console.log(`🔄 Procesando post ${post.id}:`, post.titulo)
      
      try {
        const migrateResponse = await fetch('/api/migrate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: post.id,
            imageUrl: post.imagen_url
          })
        })
        
        if (migrateResponse.ok) {
          const result = await migrateResponse.json()
          console.log('✅ Migrado:', result.newUrl)
        } else {
          const error = await migrateResponse.json()
          console.log('❌ Error:', error.error)
        }
      } catch (error) {
        console.log('❌ Error procesando post:', error.message)
      }
    }
    
    console.log('🎉 Migración completada')
  } catch (error) {
    console.error('❌ Error en migración:', error)
  }
}

migrateExistingImages()
```

### Opción 2: Migración Manual

Para migrar imágenes específicas, puedes usar el API directamente:

```bash
curl -X POST /api/migrate-image \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "tu_post_id",
    "imageUrl": "url_de_dalle"
  }'
```

## ✅ Verificación

### 1. Verificar Bucket Creado

En Supabase Dashboard > Storage, deberías ver el bucket `post-images`.

### 2. Verificar Campos en la Tabla

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('storage_file_name', 'storage_bucket', 'is_permanent_image')
ORDER BY column_name;
```

### 3. Probar Generación de Nueva Imagen

1. Ve a "Generar Post"
2. Crea una nueva imagen
3. Verifica que se guarde con `is_permanent_image = true`

## 🚀 Beneficios

- ✅ **URLs Permanentes**: Las imágenes nunca expiran
- ✅ **Mejor Rendimiento**: Imágenes servidas desde CDN de Supabase
- ✅ **Control Total**: Puedes eliminar imágenes cuando quieras
- ✅ **Organización**: Imágenes organizadas por usuario y fecha
- ✅ **Escalabilidad**: Soporte para miles de imágenes

## 🔧 Solución de Problemas

### Error: "Bucket not found"
- Verifica que ejecutaste el script de creación del bucket
- Asegúrate de que el nombre del bucket sea exactamente `post-images`

### Error: "Permission denied"
- Verifica que las políticas de storage estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado

### Error: "Service role key not found"
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
- Asegúrate de que la key tenga permisos de storage

### Imágenes no se migran
- Verifica que las URLs de DALL-E no hayan expirado
- Revisa los logs del servidor para errores específicos

## 📞 Soporte

Si encuentras problemas, revisa:
1. Los logs del servidor en la consola
2. Los logs del navegador en la consola de desarrollador
3. El estado del bucket en Supabase Dashboard

