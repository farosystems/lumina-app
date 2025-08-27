-- Script para agregar campos relacionados con el storage a la tabla posts
-- Ejecutar en el SQL Editor de Supabase

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

-- Verificar la estructura actualizada
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('storage_file_name', 'storage_bucket', 'is_permanent_image')
ORDER BY column_name;

