-- Actualizar posts existentes para asignar el campo tipo
-- Por defecto, todos los posts existentes serán de tipo 'publicacion'

-- Primero, verificar si el campo tipo existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'tipo'
    ) THEN
        -- Si no existe, agregarlo
        ALTER TABLE posts 
        ADD COLUMN tipo VARCHAR(20) DEFAULT 'publicacion' 
        CHECK (tipo IN ('publicacion', 'historia'));
    END IF;
END $$;

-- Actualizar todos los posts existentes que no tengan tipo asignado
UPDATE posts 
SET tipo = 'publicacion' 
WHERE tipo IS NULL;

-- Hacer el campo NOT NULL después de la actualización
ALTER TABLE posts ALTER COLUMN tipo SET NOT NULL;

-- Verificar los resultados
SELECT 
    COUNT(*) as total_posts,
    COUNT(CASE WHEN tipo = 'publicacion' THEN 1 END) as publicaciones,
    COUNT(CASE WHEN tipo = 'historia' THEN 1 END) as historias
FROM posts;









