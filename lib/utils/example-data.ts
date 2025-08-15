// Ejemplos de datos para los campos JSONB de empresas

export const ejemploColores = [
  "#8B4513", // Marrón café
  "#D2691E", // Naranja chocolate
  "#F4A460", // Arena
  "#FFFFFF", // Blanco
  "#000000"  // Negro
]

export const ejemploFuentes = [
  "Poppins",
  "Playfair Display",
  "Inter",
  "Montserrat",
  "Roboto"
]

export const ejemploPublicoIdeal = {
  edad_minima: 25,
  edad_maxima: 45,
  zona: "Zona Norte de Buenos Aires",
  intereses: [
    "café",
    "gastronomía",
    "trabajo remoto",
    "networking",
    "calidad de vida",
    "coworking",
    "emprendimiento"
  ]
}

// Ejemplos por rubro
export const ejemplosPorRubro = {
  gastronomia: {
    colores: ["#8B4513", "#D2691E", "#F4A460", "#FFFFFF", "#000000"],
    fuentes: ["Poppins", "Playfair Display", "Inter"],
    publico_ideal: {
      edad_minima: 25,
      edad_maxima: 55,
      zona: "Zona Norte de Buenos Aires",
      intereses: ["gastronomía", "café", "restaurantes", "comida", "experiencias culinarias"]
    }
  },
  tecnologia: {
    colores: ["#2563EB", "#1E40AF", "#3B82F6", "#FFFFFF", "#000000"],
    fuentes: ["Inter", "Roboto", "SF Pro Display"],
    publico_ideal: {
      edad_minima: 20,
      edad_maxima: 40,
      zona: "Buenos Aires",
      intereses: ["tecnología", "startups", "programación", "innovación", "emprendimiento"]
    }
  },
  moda: {
    colores: ["#EC4899", "#F472B6", "#F9A8D4", "#FFFFFF", "#000000"],
    fuentes: ["Poppins", "Montserrat", "Inter"],
    publico_ideal: {
      edad_minima: 18,
      edad_maxima: 35,
      zona: "Buenos Aires",
      intereses: ["moda", "tendencias", "estilo", "shopping", "belleza"]
    }
  },
  fitness: {
    colores: ["#10B981", "#059669", "#34D399", "#FFFFFF", "#000000"],
    fuentes: ["Inter", "Roboto", "Poppins"],
    publico_ideal: {
      edad_minima: 20,
      edad_maxima: 45,
      zona: "Buenos Aires",
      intereses: ["fitness", "salud", "deportes", "bienestar", "nutrición"]
    }
  }
}

// Función para obtener ejemplo por rubro
export function getEjemploPorRubro(rubro: string) {
  const rubroLower = rubro.toLowerCase()
  
  if (rubroLower.includes('gastronomía') || rubroLower.includes('restaurante') || rubroLower.includes('café')) {
    return ejemplosPorRubro.gastronomia
  }
  if (rubroLower.includes('tecnología') || rubroLower.includes('software') || rubroLower.includes('app')) {
    return ejemplosPorRubro.tecnologia
  }
  if (rubroLower.includes('moda') || rubroLower.includes('ropa') || rubroLower.includes('vestimenta')) {
    return ejemplosPorRubro.moda
  }
  if (rubroLower.includes('fitness') || rubroLower.includes('gimnasio') || rubroLower.includes('deporte')) {
    return ejemplosPorRubro.fitness
  }
  
  // Ejemplo genérico
  return {
    colores: ["#6B7280", "#9CA3AF", "#D1D5DB", "#FFFFFF", "#000000"],
    fuentes: ["Inter", "Poppins", "Roboto"],
    publico_ideal: {
      edad_minima: 25,
      edad_maxima: 45,
      zona: "Buenos Aires",
      intereses: ["servicios", "calidad", "profesionalismo"]
    }
  }
}





