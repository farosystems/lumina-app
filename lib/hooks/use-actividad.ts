import { useState, useEffect } from 'react'
import { Actividad } from '@/lib/types'

interface UseActividadReturn {
  actividades: Actividad[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useActividad(limit: number = 10): UseActividadReturn {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActividades = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/actividad')
      
      if (response.ok) {
        const data = await response.json()
        setActividades(data.actividades || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error obteniendo actividades')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActividades()
  }, [])

  return {
    actividades: actividades.slice(0, limit),
    isLoading,
    error,
    refetch: fetchActividades
  }
}
