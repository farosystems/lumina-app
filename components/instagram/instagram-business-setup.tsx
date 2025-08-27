"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ExternalLink, CheckCircle, ArrowRight } from 'lucide-react'

export function InstagramBusinessSetup() {
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    {
      id: 1,
      title: "Verificar que tu cuenta de Instagram sea Business",
      description: "Asegúrate de que tu cuenta de Instagram esté configurada como cuenta de negocio",
      actions: [
        "Ve a Instagram.com y inicia sesión",
        "Ve a Configuración > Cuenta",
        "Si no ves 'Cambiar a cuenta profesional', ya tienes una cuenta Business",
        "Si ves esa opción, selecciónala y elige 'Negocio'"
      ],
      link: "https://www.instagram.com/accounts/edit/"
    },
    {
      id: 2,
      title: "Conectar Instagram a tu página de Facebook",
      description: "Vincula tu cuenta de Instagram Business con tu página de Facebook",
      actions: [
        "Ve a tu página de Facebook 'Faro.AI'",
        "Ve a Configuración de la página",
        "Busca la sección 'Instagram'",
        "Haz clic en 'Conectar cuenta'",
        "Inicia sesión con tu cuenta de Instagram Business"
      ],
      link: "https://www.facebook.com/pages/manage"
    },
    {
      id: 3,
      title: "Verificar la conexión",
      description: "Confirma que la conexión se realizó correctamente",
      actions: [
        "En tu página de Facebook, ve a Configuración",
        "Verifica que aparezca tu cuenta de Instagram conectada",
        "Asegúrate de que diga 'Cuenta de Instagram Business'"
      ],
      link: "https://www.facebook.com/pages/manage"
    }
  ]

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <AlertCircle className="w-5 h-5" />
          Configurar Instagram Business
        </CardTitle>
        <CardDescription>
          Tu página "Faro.AI" existe pero necesita tener Instagram Business conectado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progreso */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 mx-2 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Paso actual */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold text-lg mb-2">{steps[currentStep - 1].title}</h3>
          <p className="text-gray-600 mb-4">{steps[currentStep - 1].description}</p>
          
          <div className="space-y-2 mb-4">
            {steps[currentStep - 1].actions.map((action, index) => (
              <div key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs mt-0.5">{index + 1}</Badge>
                <span className="text-sm">{action}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => window.open(steps[currentStep - 1].link, '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir en nueva pestaña
            </Button>
            
            {currentStep < steps.length && (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                size="sm"
              >
                Siguiente paso
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            {currentStep > 1 && (
              <Button 
                onClick={() => setCurrentStep(currentStep - 1)}
                variant="outline"
                size="sm"
              >
                Paso anterior
              </Button>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-900 mb-2">⚠️ Importante</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Tu cuenta de Instagram debe ser de tipo <strong>Business</strong>, no Personal o Creator</li>
            <li>• La página de Facebook debe ser administrada por tu cuenta</li>
            <li>• Después de conectar, espera unos minutos antes de intentar la conexión nuevamente</li>
            <li>• Si tienes problemas, verifica que tu cuenta de Instagram no esté conectada a otra página</li>
          </ul>
        </div>

        {/* Botón para intentar de nuevo */}
        <div className="text-center">
          <Button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Intentar conexión nuevamente
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
