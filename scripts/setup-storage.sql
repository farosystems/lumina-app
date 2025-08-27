-- Script para configurar el bucket de storage para imágenes de posts
-- Ejecutar en el SQL Editor de Supabase

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

-- Verificar que el bucket se creó correctamente
SELECT * FROM storage.buckets WHERE id = 'post-images';

