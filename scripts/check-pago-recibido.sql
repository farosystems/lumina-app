-- Verificar si el campo pago_recibido existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' AND column_name = 'pago_recibido';

-- Mostrar los valores actuales de pago_recibido
SELECT id, nombre, pago_recibido, is_active
FROM empresas
ORDER BY created_at DESC;

-- Si el campo no existe, agregarlo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'pago_recibido'
    ) THEN
        ALTER TABLE empresas ADD COLUMN pago_recibido BOOLEAN DEFAULT false;
        RAISE NOTICE 'Campo pago_recibido agregado a la tabla empresas';
    ELSE
        RAISE NOTICE 'El campo pago_recibido ya existe';
    END IF;
END $$;

-- Actualizar empresas existentes para que tengan pago_recibido = true por defecto
UPDATE empresas 
SET pago_recibido = true 
WHERE pago_recibido IS NULL OR pago_recibido = false;

-- Verificar los valores después de la actualización
SELECT id, nombre, pago_recibido, is_active
FROM empresas
ORDER BY created_at DESC;
