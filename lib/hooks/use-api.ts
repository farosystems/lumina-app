import { useState, useEffect, useCallback, useRef } from 'react'

interface UseApiOptions<T> {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  cacheTime?: number
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  mutate: (newData: T) => void
}

// Cache simple para almacenar respuestas
const cache = new Map<string, { data: any; timestamp: number }>()

export function useApi<T>({
  url,
  method = 'GET',
  body,
  headers = {},
  cacheTime = 5 * 60 * 1000, // 5 minutos por defecto
  enabled = true,
  onSuccess,
  onError
}: UseApiOptions<T>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const cacheKey = `${method}:${url}:${JSON.stringify(body)}`

  const fetchData = useCallback(async () => {
    // Verificar cache
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data)
      setError(null)
      onSuccess?.(cached.data)
      return
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Crear nuevo controller
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()

      // Guardar en cache
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      })

      setData(result)
      onSuccess?.(result)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request cancelado
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [url, method, body, headers, cacheTime, cacheKey, onSuccess, onError])

  const refetch = useCallback(async () => {
    // Limpiar cache para forzar nueva llamada
    cache.delete(cacheKey)
    await fetchData()
  }, [fetchData, cacheKey])

  const mutate = useCallback((newData: T) => {
    setData(newData)
    // Actualizar cache
    cache.set(cacheKey, {
      data: newData,
      timestamp: Date.now(),
    })
  }, [cacheKey])

  useEffect(() => {
    if (enabled) {
      fetchData()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [enabled, fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
  }
}

// Hook especializado para datos del usuario
export function useUserData() {
  return useApi({
    url: '/api/auth/me',
    cacheTime: 10 * 60 * 1000, // 10 minutos para datos de usuario
  })
}

// Hook especializado para estadísticas del dashboard
export function useDashboardStats() {
  return useApi({
    url: '/api/admin/dashboard',
    cacheTime: 2 * 60 * 1000, // 2 minutos para estadísticas
  })
}

// Hook especializado para empresas
export function useEmpresas() {
  return useApi({
    url: '/api/admin/empresas',
    cacheTime: 5 * 60 * 1000, // 5 minutos para empresas
  })
}

// Hook especializado para usuarios
export function useUsuarios() {
  return useApi({
    url: '/api/admin/usuarios',
    cacheTime: 5 * 60 * 1000, // 5 minutos para usuarios
  })
}





