# Configuración del Sistema de Programación de Posts

## Descripción

El sistema de programación permite publicar posts automáticamente en Instagram en fechas y horas específicas. Los posts se crean con estado "programado" y se publican automáticamente cuando llega su fecha y hora programada.

## Componentes del Sistema

### 1. API de Procesamiento (`/api/scheduler/process`)
- **Endpoint**: `POST /api/scheduler/process`
- **Función**: Procesa posts programados que deben publicarse
- **Frecuencia**: Se ejecuta cada minuto
- **Lógica**: Busca posts con estado "programado" cuya fecha de programación esté entre 5 minutos atrás y 5 minutos adelante

### 2. Script de Scheduler (`scripts/scheduler.js`)
- **Función**: Script que llama a la API de procesamiento
- **Ejecución**: Cada minuto mediante cron job
- **Logging**: Registra el resultado de cada ejecución

### 3. Página de Posts Programados (`/dashboard/scheduled`)
- **Función**: Interfaz para gestionar posts programados
- **Características**:
  - Ver todos los posts programados
  - Cancelar programaciones
  - Publicar posts inmediatamente
  - Estadísticas de programaciones

## Configuración del Cron Job

### Opción 1: Cron Job del Sistema

1. **Editar crontab**:
   ```bash
   crontab -e
   ```

2. **Agregar la línea**:
   ```bash
   # Ejecutar cada minuto
   * * * * * /usr/bin/node /ruta/completa/a/tu/app/scripts/scheduler.js >> /var/log/lumina-scheduler.log 2>&1
   ```

3. **Verificar que el script sea ejecutable**:
   ```bash
   chmod +x /ruta/completa/a/tu/app/scripts/scheduler.js
   ```

### Opción 2: Usando PM2 (Recomendado para producción)

1. **Instalar PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Crear archivo de configuración** `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'lumina-scheduler',
         script: './scripts/scheduler.js',
         cron_restart: '* * * * *',
         autorestart: false,
         watch: false,
         env: {
           NODE_ENV: 'production',
           NEXT_PUBLIC_APP_URL: 'https://tu-dominio.com'
         }
       }
     ]
   }
   ```

3. **Iniciar con PM2**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Opción 3: Usando Vercel Cron Jobs (Si usas Vercel)

1. **Crear archivo** `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/scheduler/process",
         "schedule": "* * * * *"
       }
     ]
   }
   ```

## Variables de Entorno Requeridas

```bash
# URL de tu aplicación
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Variables de Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Variables de OpenAI
OPENAI_API_KEY=tu_openai_api_key

# Variables de Instagram
INSTAGRAM_APP_ID=tu_instagram_app_id
INSTAGRAM_APP_SECRET=tu_instagram_app_secret
```

## Flujo de Programación

### 1. Crear Post Programado
1. Usuario va a "Generar Post"
2. Completa el formulario y llega a la página de preview
3. Hace clic en "Programar Publicación"
4. Selecciona fecha y hora
5. El post se guarda con estado "programado"

### 2. Procesamiento Automático
1. El cron job ejecuta `scripts/scheduler.js` cada minuto
2. El script llama a `/api/scheduler/process`
3. La API busca posts programados para publicar
4. Para cada post:
   - Verifica que llegó la hora de publicación
   - Obtiene la conexión de Instagram del usuario
   - Publica en Instagram
   - Actualiza el estado a "publicado"
   - Registra la actividad

### 3. Gestión de Posts Programados
1. Usuario va a "Programados" en el sidebar
2. Ve todos sus posts programados
3. Puede cancelar programaciones (vuelve a estado "borrador")
4. Puede publicar inmediatamente (cambia a estado "publicado")

## Estados de Posts

- **borrador**: Post creado pero no publicado
- **programado**: Post programado para publicación automática
- **publicado**: Post publicado exitosamente
- **error**: Error en la publicación

## Monitoreo y Logs

### Logs del Scheduler
```bash
# Ver logs del cron job
tail -f /var/log/lumina-scheduler.log

# Ver logs de PM2
pm2 logs lumina-scheduler
```

### Logs de la API
Los logs de la API se pueden ver en:
- **Desarrollo**: Consola del servidor
- **Producción**: Logs de Vercel, Railway, etc.

## Troubleshooting

### Problemas Comunes

1. **Posts no se publican automáticamente**:
   - Verificar que el cron job esté ejecutándose
   - Revisar logs del scheduler
   - Verificar conexiones de Instagram activas

2. **Error de permisos**:
   - Asegurar que el script sea ejecutable
   - Verificar permisos de escritura en logs

3. **Posts en estado "error"**:
   - Revisar logs de la API
   - Verificar tokens de Instagram válidos
   - Comprobar que las imágenes sean accesibles

### Comandos Útiles

```bash
# Verificar que el cron job esté activo
crontab -l

# Probar el script manualmente
node scripts/scheduler.js

# Ver logs en tiempo real
tail -f /var/log/lumina-scheduler.log

# Reiniciar PM2
pm2 restart lumina-scheduler
```

## Seguridad

- El endpoint `/api/scheduler/process` no requiere autenticación ya que se ejecuta internamente
- Los posts solo se publican en cuentas de Instagram conectadas por el usuario
- Se registra toda la actividad para auditoría
- Los errores se manejan graciosamente sin afectar otros posts

## Escalabilidad

- El sistema procesa posts en lotes de 5 minutos
- Cada post se procesa individualmente para evitar fallos en cascada
- Los errores se registran pero no detienen el procesamiento de otros posts
- El sistema puede manejar múltiples posts programados simultáneamente

