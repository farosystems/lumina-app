// Validaciones para formularios

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const validateWebsite = (website: string): boolean => {
  try {
    new URL(website)
    return true
  } catch {
    return false
  }
}

export const validateColors = (colors: string[]): boolean => {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return colors.every(color => colorRegex.test(color))
}

export const validatePublicoIdeal = (publicoIdeal: any): boolean => {
  if (!publicoIdeal || typeof publicoIdeal !== 'object') return false
  
  const { edad_minima, edad_maxima, zona, intereses } = publicoIdeal
  
  if (typeof edad_minima !== 'number' || edad_minima < 0 || edad_minima > 120) return false
  if (typeof edad_maxima !== 'number' || edad_maxima < 0 || edad_maxima > 120) return false
  if (edad_minima > edad_maxima) return false
  if (typeof zona !== 'string' || zona.trim().length === 0) return false
  if (!Array.isArray(intereses) || intereses.length === 0) return false
  
  return true
}

// Mensajes de error
export const getValidationError = (field: string, value: any): string | null => {
  switch (field) {
    case 'email':
      return !validateEmail(value) ? 'Email inválido' : null
    case 'slug':
      return !validateSlug(value) ? 'Slug inválido (solo letras minúsculas, números y guiones)' : null
    case 'phone':
      return !validatePhone(value) ? 'Teléfono inválido' : null
    case 'website':
      return !validateWebsite(value) ? 'URL inválida' : null
    case 'colors':
      return !validateColors(value) ? 'Colores inválidos (formato hexadecimal)' : null
    case 'publico_ideal':
      return !validatePublicoIdeal(value) ? 'Datos del público objetivo inválidos' : null
    default:
      return null
  }
}

// Sanitización de datos
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ')
}

export const sanitizeSlug = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const sanitizeColors = (colors: string[]): string[] => {
  return colors
    .map(color => color.trim().toUpperCase())
    .filter(color => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color))
}

export const sanitizeIntereses = (intereses: string[]): string[] => {
  return intereses
    .map(interes => sanitizeString(interes))
    .filter(interes => interes.length > 0)
    .slice(0, 10) // Máximo 10 intereses
}


















