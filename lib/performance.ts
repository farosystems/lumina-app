import React, { useState } from 'react'
import ReactDOM from 'react-dom'

// Utilidades para optimizar el rendimiento

// Debounce function para evitar llamadas excesivas
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function para limitar la frecuencia de ejecución
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Lazy loading para componentes
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFunc)
  
  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={fallback ? <fallback /> : <div>Cargando...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  )
}

// Preload de recursos críticos
export function preloadResource(url: string, type: 'image' | 'script' | 'style' = 'image') {
  return new Promise((resolve, reject) => {
    if (type === 'image') {
      const img = new Image()
      img.onload = () => resolve(url)
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    } else if (type === 'script') {
      const script = document.createElement('script')
      script.onload = () => resolve(url)
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`))
      script.src = url
      document.head.appendChild(script)
    } else if (type === 'style') {
      const link = document.createElement('link')
      link.onload = () => resolve(url)
      link.onerror = () => reject(new Error(`Failed to load style: ${url}`))
      link.rel = 'stylesheet'
      link.href = url
      document.head.appendChild(link)
    }
  })
}

// Intersection Observer para lazy loading de imágenes
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  if (typeof window === 'undefined') return null
  
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  })
}

// Memoización de funciones costosas
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Optimización de listas virtuales
export interface VirtualListOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options
  
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor(scrollTop / itemHeight) + visibleCount + overscan
  )
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight
  
  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    },
  }
}

// Optimización de re-renders con React.memo
export function createOptimizedComponent<T extends React.ComponentType<any>>(
  Component: T,
  propsAreEqual?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean
) {
  return React.memo(Component, propsAreEqual)
}

// Batch updates para evitar re-renders innecesarios
export function batchUpdates<T extends (...args: any[]) => void>(
  updates: T[]
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    ReactDOM.flushSync(() => {
      updates.forEach(update => update(...args))
    })
  }
}

// Optimización de imágenes con WebP
export function getOptimizedImageUrl(
  originalUrl: string,
  width?: number,
  height?: number,
  format: 'webp' | 'jpeg' | 'png' = 'webp'
): string {
  if (!originalUrl) return originalUrl
  
  // Si es una URL externa, devolver la original
  if (originalUrl.startsWith('http')) {
    return originalUrl
  }
  
  // Para imágenes locales, podrías implementar un servicio de optimización
  // Por ahora, devolvemos la URL original
  return originalUrl
}

// Prefetch de rutas
export function prefetchRoute(route: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = route
    document.head.appendChild(link)
  }
}

// Optimización de fuentes
export function preloadFont(fontFamily: string, fontWeight: string = '400') {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.href = `/fonts/${fontFamily}-${fontWeight}.woff2`
    document.head.appendChild(link)
  }
}

// Cleanup de recursos
export function cleanupResources() {
  // Limpiar timeouts
  const highestTimeoutId = setTimeout(() => {}, 0)
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i)
  }
  
  // Limpiar intervals
  const highestIntervalId = setInterval(() => {}, 0)
  for (let i = 0; i < highestIntervalId; i++) {
    clearInterval(i)
  }
}

// Performance monitoring
export function measurePerformance<T extends (...args: any[]) => any>(
  name: string,
  func: T
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now()
    const result = func(...args)
    const end = performance.now()
    
    console.log(`${name} took ${end - start}ms`)
    return result
  }) as T
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100,
      total: Math.round(memory.totalJSHeapSize / 1048576 * 100) / 100,
      limit: Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100,
    }
  }
  return null
}
