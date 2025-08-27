-- Crear tabla de registro de actividad
CREATE TABLE IF NOT EXISTS registro_actividad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  accion VARCHAR(100) NOT NULL,
  descripcion TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_registro_actividad_usuario_id ON registro_actividad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_registro_actividad_empresa_id ON registro_actividad(empresa_id);
CREATE INDEX IF NOT EXISTS idx_registro_actividad_fecha ON registro_actividad(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE registro_actividad ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: solo ven su propia actividad
CREATE POLICY "Usuarios ven su propia actividad" ON registro_actividad
  FOR SELECT USING (
    usuario_id IN (
      SELECT id FROM usuarios WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Política para admins: ven toda la actividad
CREATE POLICY "Admins ven toda la actividad" ON registro_actividad
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND rol = 'admin'
    )
  );

-- Insertar algunos datos de ejemplo (opcional)
INSERT INTO registro_actividad (usuario_id, empresa_id, accion, descripcion) 
SELECT 
  u.id,
  u.empresa_id,
  'conectar_instagram',
  'Conectó cuenta de Instagram Business'
FROM usuarios u 
WHERE u.rol = 'cliente' 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO registro_actividad (usuario_id, empresa_id, accion, descripcion) 
SELECT 
  u.id,
  u.empresa_id,
  'crear_post',
  'Creó un nuevo post para redes sociales'
FROM usuarios u 
WHERE u.rol = 'cliente' 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO registro_actividad (usuario_id, empresa_id, accion, descripcion) 
SELECT 
  u.id,
  u.empresa_id,
  'publicar_post',
  'Publicó contenido en Instagram'
FROM usuarios u 
WHERE u.rol = 'cliente' 
LIMIT 1
ON CONFLICT DO NOTHING;
