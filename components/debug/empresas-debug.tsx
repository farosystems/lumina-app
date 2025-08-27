import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface EmpresaDebug {
  id: string
  nombre: string
  pago_recibido: boolean
  pago_recibido_tipo: string
  is_active: boolean
  created_at: string
}

export function EmpresasDebug() {
  const [empresas, setEmpresas] = useState<EmpresaDebug[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmpresas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug/empresas')
      
      if (response.ok) {
        const data = await response.json()
        setEmpresas(data.empresas || [])
        console.log('🔍 Datos de debug:', data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error obteniendo datos')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresas()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando datos de debug...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug - Datos de Empresas</CardTitle>
        <CardDescription>Información detallada de las empresas para debugging</CardDescription>
        <Button onClick={fetchEmpresas} variant="outline" size="sm">
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {empresas.map((empresa) => (
            <div key={empresa.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{empresa.nombre}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant={empresa.is_active ? "default" : "secondary"}>
                    {empresa.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                  <Badge variant={empresa.pago_recibido ? "default" : "destructive"}>
                    {empresa.pago_recibido ? "Pagado" : "Pendiente"}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>ID:</strong> {empresa.id}</p>
                <p><strong>pago_recibido:</strong> {empresa.pago_recibido.toString()}</p>
                <p><strong>Tipo de pago_recibido:</strong> {empresa.pago_recibido_tipo}</p>
                <p><strong>is_active:</strong> {empresa.is_active.toString()}</p>
                <p><strong>Fecha creación:</strong> {empresa.created_at}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
