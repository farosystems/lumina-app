-- Agregar campo tipo a la tabla posts
ALTER TABLE posts 
ADD COLUMN tipo VARCHAR(20) DEFAULT 'publicacion' 
CHECK (tipo IN ('publicacion', 'historia'));

-- Actualizar posts existentes para que sean de tipo 'publicacion'
UPDATE posts SET tipo = 'publicacion' WHERE tipo IS NULL;

-- Hacer el campo NOT NULL después de la actualización
ALTER TABLE posts ALTER COLUMN tipo SET NOT NULL;









