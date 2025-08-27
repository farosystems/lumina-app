-- Agregar campo pago_recibido a la tabla empresas
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS pago_recibido BOOLEAN DEFAULT false;

-- Actualizar empresas existentes para que tengan pago_recibido = true por defecto
-- (esto es temporal, en producción deberías verificar el estado real de pago)
UPDATE empresas 
SET pago_recibido = true 
WHERE pago_recibido IS NULL;

-- Crear índice para mejorar el rendimiento de consultas por estado de pago
CREATE INDEX IF NOT EXISTS idx_empresas_pago_recibido ON empresas(pago_recibido);

-- Crear índice compuesto para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_empresas_activa_pago ON empresas(is_active, pago_recibido);

-- Comentario en la tabla para documentar el campo
COMMENT ON COLUMN empresas.pago_recibido IS 'Indica si la empresa ha realizado el pago de la licencia. Si es FALSE, los usuarios no pueden acceder al sistema.';
