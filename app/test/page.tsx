export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-4">Página de Prueba</h1>
        <p className="text-center text-gray-600">
          Si puedes ver esto, los componentes básicos funcionan.
        </p>
        <div className="mt-4 text-center">
          <a 
            href="/sign-in" 
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ir a Sign In
          </a>
        </div>
      </div>
    </div>
  )
}








