"use client"

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  fallback?: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  className,
  width,
  height,
  priority = false,
  onError
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (imageSrc !== fallback) {
      setImageSrc(fallback)
      setHasError(true)
      onError?.()
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const imageClasses = useMemo(() => {
    return cn(
      "transition-opacity duration-300",
      isLoading ? "opacity-0" : "opacity-100",
      hasError && "opacity-50",
      className
    )
  }, [isLoading, hasError, className])

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  )
}







