"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"

interface PublicoIdealPickerProps {
  value: {
    edad_minima: number
    edad_maxima: number
    zona: string
    intereses: string[]
  }
  onChange: (publicoIdeal: {
    edad_minima: number
    edad_maxima: number
    zona: string
    intereses: string[]
  }) => void
}

const interesesPredefinidos = [
  "tecnología", "gastronomía", "moda", "fitness", "viajes", "música",
  "arte", "deportes", "cocina", "fotografía", "lectura", "cine",
  "emprendimiento", "marketing", "diseño", "salud", "belleza", "hogar",
  "automóviles", "mascotas", "jardinería", "manualidades", "videojuegos",
  "networking", "coworking", "trabajo remoto", "calidad de vida"
]

export function PublicoIdealPicker({ value, onChange }: PublicoIdealPickerProps) {
  const [nuevoInteres, setNuevoInteres] = useState("")

  const addInteres = () => {
    if (nuevoInteres && !value.intereses.includes(nuevoInteres)) {
      onChange({
        ...value,
        intereses: [...value.intereses, nuevoInteres]
      })
      setNuevoInteres("")
    }
  }

  const removeInteres = (interesToRemove: string) => {
    onChange({
      ...value,
      intereses: value.intereses.filter(interes => interes !== interesToRemove)
    })
  }

  const addPredefinedInteres = (interes: string) => {
    if (!value.intereses.includes(interes)) {
      onChange({
        ...value,
        intereses: [...value.intereses, interes]
      })
    }
  }

  return (
    <div className="space-y-6">
      <Label className="text-lg font-semibold">Público Ideal</Label>
      
      {/* Rango de edad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edad_minima">Edad mínima</Label>
          <Input
            id="edad_minima"
            type="number"
            min="0"
            max="120"
            value={value.edad_minima}
            onChange={(e) => onChange({
              ...value,
              edad_minima: parseInt(e.target.value) || 0
            })}
            placeholder="25"
          />
        </div>
        <div>
          <Label htmlFor="edad_maxima">Edad máxima</Label>
          <Input
            id="edad_maxima"
            type="number"
            min="0"
            max="120"
            value={value.edad_maxima}
            onChange={(e) => onChange({
              ...value,
              edad_maxima: parseInt(e.target.value) || 0
            })}
            placeholder="45"
          />
        </div>
      </div>

      {/* Zona geográfica */}
      <div>
        <Label htmlFor="zona">Zona geográfica</Label>
        <Input
          id="zona"
          type="text"
          value={value.zona}
          onChange={(e) => onChange({
            ...value,
            zona: e.target.value
          })}
          placeholder="Ej: Zona Norte de Buenos Aires"
        />
      </div>

      {/* Intereses */}
      <div className="space-y-4">
        <Label>Intereses del público objetivo ({value.intereses.length}/10)</Label>
        
        {/* Intereses seleccionados */}
        <div className="flex flex-wrap gap-2">
          {value.intereses.map((interes, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
              <span className="text-sm">{interes}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeInteres(interes)}
                className="h-5 w-5 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Agregar nuevo interés */}
        {value.intereses.length < 10 && (
          <div className="flex gap-2">
            <Input
              type="text"
              value={nuevoInteres}
              onChange={(e) => setNuevoInteres(e.target.value)}
              placeholder="Agregar interés..."
              className="flex-1"
            />
            <Button type="button" onClick={addInteres} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Intereses predefinidos */}
        <div>
          <Label className="text-sm text-muted-foreground">Intereses populares:</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {interesesPredefinidos.map((interes) => (
              <button
                key={interes}
                type="button"
                onClick={() => addPredefinedInteres(interes)}
                disabled={value.intereses.includes(interes) || value.intereses.length >= 10}
                className="p-2 text-sm border rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-left capitalize"
              >
                {interes}
              </button>
            ))}
          </div>
        </div>

        {value.intereses.length >= 10 && (
          <p className="text-sm text-muted-foreground">
            Máximo 10 intereses permitidos
          </p>
        )}
      </div>

      {/* Resumen */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">Resumen del público ideal:</h4>
        <p className="text-sm text-muted-foreground">
          Personas de {value.edad_minima} a {value.edad_maxima} años, 
          ubicadas en {value.zona || "zona no especificada"}, 
          interesadas en: {value.intereses.length > 0 ? value.intereses.join(", ") : "intereses no especificados"}
        </p>
      </div>
    </div>
  )
}










