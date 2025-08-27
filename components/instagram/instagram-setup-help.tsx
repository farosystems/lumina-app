"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Instagram, Facebook, ExternalLink, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function InstagramSetupHelp() {
  const [isOpen, setIsOpen] = useState(false)

  const steps = [
    {
      id: 1,
      title: "Crear una Página de Facebook Business",
      description: "Necesitas una página de Facebook Business para conectar Instagram",
      icon: <Facebook className="w-5 h-5" />,
      link: "https://www.facebook.com/pages/create",
      linkText: "Crear Página de Facebook",
      details: [
        "Ve a Facebook.com y crea una nueva página",
        "Selecciona 'Negocio o marca' como tipo de página",
        "Completa la información básica de tu negocio"
      ]
    },
    {
      id: 2,
      title: "Convertir tu Instagram a Business",
      description: "Tu cuenta de Instagram debe ser de tipo Business o Creator",
      icon: <Instagram className="w-5 h-5" />,
      link: "https://www.facebook.com/business/help/898752960195806",
      linkText: "Convertir a Instagram Business",
      details: [
        "Ve a Configuración de tu cuenta de Instagram",
        "Selecciona 'Cuenta' y luego 'Cambiar a cuenta profesional'",
        "Elige 'Negocio' como tipo de cuenta",
        "Conecta tu cuenta a la página de Facebook que creaste"
      ]
    },
    {
      id: 3,
      title: "Conectar Instagram a Facebook",
      description: "Vincula tu cuenta de Instagram Business con tu página de Facebook",
      icon: <CheckCircle className="w-5 h-5" />,
      link: "https://www.facebook.com/business/help/1148234465576583",
      linkText: "Conectar Instagram a Facebook",
      details: [
        "En Instagram, ve a Configuración > Cuenta",
        "Selecciona 'Cuentas vinculadas'",
        "Conecta tu cuenta de Instagram a tu página de Facebook",
        "Asegúrate de que la conexión esté activa"
      ]
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="w-4 h-4 mr-2" />
          ¿Cómo configurar Instagram?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            Configurar Instagram Business
          </DialogTitle>
          <DialogDescription>
            Sigue estos pasos para conectar tu cuenta de Instagram Business
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Requisitos previos */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Requisitos Previos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Una cuenta de Facebook personal
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Una página de Facebook Business
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Una cuenta de Instagram Business o Creator
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Instagram conectado a tu página de Facebook
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pasos */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card key={step.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {step.id}
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {step.icon}
                          {step.title}
                        </CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Paso {step.id}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(step.link, '_blank')}
                      className="w-full sm:w-auto"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {step.linkText}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notas importantes */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Notas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• Solo cuentas de Instagram Business o Creator pueden usar la API</li>
                <li>• Tu cuenta de Instagram debe estar conectada a una página de Facebook Business</li>
                <li>• La página de Facebook debe ser de tipo "Negocio o marca"</li>
                <li>• Necesitas permisos de administrador en la página de Facebook</li>
                <li>• Si tienes problemas, verifica que tu cuenta esté verificada</li>
              </ul>
            </CardContent>
          </Card>

          {/* Botón de cerrar */}
          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>
              Entendido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
