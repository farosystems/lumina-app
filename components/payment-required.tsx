import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CreditCard, Building2, Mail, Phone } from "lucide-react"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

interface PaymentRequiredProps {
  empresaNombre: string
  reason?: string
}

export function PaymentRequired({ empresaNombre, reason }: PaymentRequiredProps) {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/sign-in')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Fallback: redirigir directamente
      router.push('/sign-in')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-red-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Acceso Restringido
          </CardTitle>
          <CardDescription className="text-lg text-red-600">
            Pago de licencia pendiente
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información de la empresa */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Empresa:</span>
            </div>
            <p className="text-lg font-medium text-gray-900">{empresaNombre}</p>
          </div>

          {/* Mensaje principal */}
          <div className="text-center space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Su empresa tiene un pago de licencia pendiente. Para continuar utilizando 
              Lumina y acceder a todas las funcionalidades, es necesario regularizar 
              la situación de pago.
            </p>
            
            {reason && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Motivo:</strong> {reason}
                </p>
              </div>
            )}
          </div>

          {/* Beneficios */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Beneficios de la Licencia
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Generación ilimitada de contenido para redes sociales</li>
              <li>• Publicación automática en Instagram y Facebook</li>
              <li>• Programación de campañas</li>
              <li>• Análisis de rendimiento</li>
              <li>• Soporte técnico prioritario</li>
              <li>• Actualizaciones y nuevas funcionalidades</li>
            </ul>
          </div>

          {/* Acciones */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open('mailto:soporte@lumina.com?subject=Pago de Licencia', '_blank')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contactar Soporte
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('tel:+1234567890', '_blank')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Llamar Ahora
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full text-gray-600"
              onClick={handleSignOut}
            >
              Cerrar Sesión
            </Button>
          </div>

          {/* Información de contacto */}
          <div className="border-t pt-4">
            <div className="text-center text-sm text-gray-600 space-y-1">
              <p><strong>Soporte:</strong> soporte@lumina.com</p>
              <p><strong>Teléfono:</strong> +1 (234) 567-890</p>
              <p><strong>Horario:</strong> Lunes a Viernes 9:00 - 18:00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
