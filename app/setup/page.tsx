export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">🚀 Configuración de Lumina</h1>
        
        <div className="space-y-8">
          {/* Paso 1: Clerk */}
          <div className="border-l-4 border-blue-500 pl-6">
            <h2 className="text-xl font-semibold mb-4">1. Configurar Clerk (Autenticación)</h2>
            <div className="space-y-3 text-sm">
              <p>✅ Ve a <a href="https://clerk.com" target="_blank" className="text-blue-600 hover:underline">clerk.com</a> y crea una cuenta</p>
              <p>✅ Crea una nueva aplicación</p>
              <p>✅ Ve a "API Keys" en el dashboard</p>
              <p>✅ Copia las siguientes claves:</p>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs">
                <div>• <strong>Publishable Key:</strong> pk_test_...</div>
                <div>• <strong>Secret Key:</strong> sk_test_...</div>
              </div>
            </div>
          </div>

          {/* Paso 1.5: Crear Usuarios */}
          <div className="border-l-4 border-indigo-500 pl-6">
            <h2 className="text-xl font-semibold mb-4">1.5. Crear Usuarios en Clerk</h2>
            <div className="space-y-3 text-sm">
              <p>✅ En el dashboard de Clerk, ve a "Users"</p>
              <p>✅ Haz clic en "Add user"</p>
              <p>✅ Crea usuarios con:</p>
              <div className="bg-gray-100 p-3 rounded">
                <div>• <strong>Username:</strong> (ej: admin, cliente1, cliente2)</div>
                <div>• <strong>Email:</strong> (ej: admin@empresa.com)</div>
                <div>• <strong>Password:</strong> (contraseña segura)</div>
              </div>
              <p>✅ <strong>Importante:</strong> Anota los usernames, los necesitarás para hacer login</p>
            </div>
          </div>

          {/* Paso 2: Variables de Entorno */}
          <div className="border-l-4 border-green-500 pl-6">
            <h2 className="text-xl font-semibold mb-4">2. Configurar Variables de Entorno</h2>
            <div className="space-y-3 text-sm">
              <p>✅ Crea un archivo <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code> en la raíz del proyecto</p>
              <p>✅ Agrega las siguientes variables:</p>
              <div className="bg-gray-100 p-4 rounded font-mono text-xs">
                <div>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_clave_aqui</div>
                <div>CLERK_SECRET_KEY=sk_test_tu_clave_aqui</div>
                <div>CLERK_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui</div>
              </div>
            </div>
          </div>

          {/* Paso 3: Webhook */}
          <div className="border-l-4 border-purple-500 pl-6">
            <h2 className="text-xl font-semibold mb-4">3. Configurar Webhook de Clerk</h2>
            <div className="space-y-3 text-sm">
              <p>✅ En el dashboard de Clerk, ve a "Webhooks"</p>
              <p>✅ Crea un nuevo webhook con:</p>
              <div className="bg-gray-100 p-3 rounded">
                <div>• <strong>Endpoint URL:</strong> https://tu-dominio.com/api/webhooks/clerk</div>
                <div>• <strong>Events:</strong> user.created, user.updated, user.deleted</div>
              </div>
              <p>✅ Copia el "Signing Secret" y agrégalo a <code className="bg-gray-200 px-2 py-1 rounded">CLERK_WEBHOOK_SECRET</code></p>
            </div>
          </div>

          {/* Paso 4: Reiniciar */}
          <div className="border-l-4 border-orange-500 pl-6">
            <h2 className="text-xl font-semibold mb-4">4. Reiniciar Servidor</h2>
            <div className="space-y-3 text-sm">
              <p>✅ Detén el servidor (Ctrl+C)</p>
              <p>✅ Ejecuta: <code className="bg-gray-200 px-2 py-1 rounded">npm run dev</code></p>
              <p>✅ Ve a <a href="/debug" className="text-blue-600 hover:underline">/debug</a> para verificar</p>
            </div>
          </div>

          {/* Paso 5: Probar Login */}
          <div className="border-l-4 border-red-500 pl-6">
            <h2 className="text-xl font-semibold mb-4">5. Probar Login</h2>
            <div className="space-y-3 text-sm">
              <p>✅ Ve a <a href="/sign-in" className="text-blue-600 hover:underline">/sign-in</a></p>
              <p>✅ Usa el <strong>username</strong> que creaste en Clerk</p>
              <p>✅ Ingresa la contraseña que configuraste</p>
              <p>✅ Deberías ser redirigido al dashboard</p>
            </div>
          </div>

          {/* Enlaces útiles */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">🔗 Enlaces Útiles:</h3>
            <div className="space-y-1 text-sm">
              <div>• <a href="/debug" className="text-blue-600 hover:underline">Página de Debug</a></div>
              <div>• <a href="/sign-in" className="text-blue-600 hover:underline">Página de Login</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
