"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"

interface FontPickerProps {
  value: string[]
  onChange: (fonts: string[]) => void
  maxFonts?: number
}

const fuentesPredefinidas = [
  "Inter",
  "Poppins", 
  "Roboto",
  "Montserrat",
  "Playfair Display",
  "SF Pro Display",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Open Sans",
  "Lato",
  "Source Sans Pro",
  "Nunito",
  "Ubuntu"
]

export function FontPicker({ value = [], onChange, maxFonts = 3 }: FontPickerProps) {
  const [newFont, setNewFont] = useState("")

  const addFont = () => {
    if (newFont && value.length < maxFonts && !value.includes(newFont)) {
      onChange([...value, newFont])
      setNewFont("")
    }
  }

  const removeFont = (fontToRemove: string) => {
    onChange(value.filter(font => font !== fontToRemove))
  }

  const addPredefinedFont = (font: string) => {
    if (value.length < maxFonts && !value.includes(font)) {
      onChange([...value, font])
    }
  }

  return (
    <div className="space-y-4">
      <Label>Fuentes de la marca ({value.length}/{maxFonts})</Label>
      
      {/* Fuentes seleccionadas */}
      <div className="space-y-2">
        {value.map((font, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <span 
                className="text-lg font-medium"
                style={{ fontFamily: font }}
              >
                {font}
              </span>
              <span className="text-sm text-muted-foreground">
                Ejemplo de texto
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeFont(font)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Agregar nueva fuente */}
      {value.length < maxFonts && (
        <div className="flex gap-2">
          <Select value={newFont} onValueChange={setNewFont}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Seleccionar fuente" />
            </SelectTrigger>
            <SelectContent>
              {fuentesPredefinidas.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            value={newFont}
            onChange={(e) => setNewFont(e.target.value)}
            placeholder="O escribir manualmente"
            className="flex-1"
          />
          <Button type="button" onClick={addFont} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Fuentes predefinidas */}
      <div>
        <Label className="text-sm text-muted-foreground">Fuentes populares:</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {fuentesPredefinidas.slice(0, 8).map((font) => (
            <button
              key={font}
              type="button"
              onClick={() => addPredefinedFont(font)}
              disabled={value.includes(font) || value.length >= maxFonts}
              className="p-2 text-sm border rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-left"
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {value.length >= maxFonts && (
        <p className="text-sm text-muted-foreground">
          Máximo {maxFonts} fuentes permitidas
        </p>
      )}
    </div>
  )
}


















