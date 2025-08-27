"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ExternalLink, CheckCircle, RefreshCw } from 'lucide-react'

export function InstagramPermissionsHelp() {
  const steps = [
    {
      id: 1,
      title: "Verificar permisos de la aplicación",
      description: "Asegúrate de que la aplicación tenga todos los permisos necesarios",
      actions: [
        "Ve a Facebook.com y inicia sesión",
        "Ve a Configuración > Aplicaciones y sitios web",
        "Busca tu aplicación 'LUMINA' o similar",
        "Verifica que tenga permisos de Instagram y páginas"
      ],
      link: "https://www.facebook.com/settings?tab=applications"
    },
    {
      id: 2,
      title: "Verificar permisos de la página",
      description: "Confirma que tu página tenga permisos para Instagram",
      actions: [
        "Ve a tu página de Facebook 'Faro.AI'",
        "Ve a Configuración de la página",
        "Busca la sección 'Permisos' o 'Roles'",
        "Verifica que tengas rol de 'Administrador'"
      ],
      link: "https://www.facebook.com/pages/manage"
    },
    {
      id: 3,
      title: "Verificar configuración de Instagram Business",
      description: "Asegúrate de que tu cuenta de Instagram Business esté completamente configurada",
      actions: [
        "Ve a Instagram.com y inicia sesión",
        "Ve a Configuración > Cuenta",
        "Verifica que sea cuenta 'Business'",
        "Completa cualquier configuración pendiente"
      ],
      link: "https://www.instagram.com/accounts/edit/"
    },
    {
      id: 4,
      title: "Reconectar la aplicación",
      description: "Intenta reconectar la aplicación para obtener nuevos permisos",
      actions: [
        "Cierra sesión de la aplicación",
        "Elimina los permisos de la aplicación en Facebook",
        "Intenta conectar Instagram nuevamente",
        "Acepta todos los permisos solicitados"
      ]
    }
  ]

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <AlertCircle className="w-5 h-5" />
          Problema de Permisos de Instagram
        </CardTitle>
        <CardDescription>
          Se encontró Instagram Business pero no se pueden obtener los detalles. Esto indica un problema de permisos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información del problema */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold text-lg mb-2">¿Qué está pasando?</h3>
          <p className="text-gray-600 mb-3">
            ✅ <strong>Instagram Business encontrado</strong> - Tu cuenta está conectada<br/>
            ❌ <strong>Permisos insuficientes</strong> - La aplicación no puede leer los detalles
          </p>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Solución:</strong> Necesitas otorgar permisos adicionales a la aplicación o verificar la configuración de tu cuenta de Instagram Business.
            </p>
          </div>
        </div>

        {/* Pasos de solución */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Pasos para resolver:</h3>
          
          {steps.map((step, index) => (
            <div key={step.id} className="bg-white p-4 rounded-lg border">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="text-sm mt-0.5">{step.id}</Badge>
                <div className="flex-1">
                  <h4 className="font-medium mb-2">{step.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                  
                  <div className="space-y-2 mb-3">
                    {step.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{action}</span>
                      </div>
                    ))}
                  </div>
                  
                  {step.link && (
                    <Button 
                      onClick={() => window.open(step.link, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir en nueva pestaña
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-900 mb-2">⚠️ Posibles causas</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• <strong>Permisos denegados:</strong> No aceptaste todos los permisos durante la conexión</li>
            <li>• <strong>Configuración incompleta:</strong> Tu cuenta de Instagram Business no está completamente configurada</li>
            <li>• <strong>Rol insuficiente:</strong> No tienes permisos de administrador en la página</li>
            <li>• <strong>Token expirado:</strong> Los permisos pueden haber expirado</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar conexión nuevamente
          </Button>
          
          <Button 
            onClick={() => window.open('https://developers.facebook.com/docs/instagram-basic-display-api/getting-started', '_blank')}
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Documentación de Instagram API
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
