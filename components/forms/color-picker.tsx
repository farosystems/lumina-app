"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface ColorPickerProps {
  value: string[]
  onChange: (colors: string[]) => void
  maxColors?: number
}

const coloresPredefinidos = [
  "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#FFA500", "#800080", "#008000", "#FFC0CB", "#A52A2A", "#808080",
  "#000000", "#FFFFFF", "#8B4513", "#D2691E", "#F4A460", "#2563EB",
  "#10B981", "#EC4899", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"
]

export function ColorPicker({ value = [], onChange, maxColors = 5 }: ColorPickerProps) {
  const [newColor, setNewColor] = useState("#000000")

  const addColor = () => {
    if (value.length < maxColors && !value.includes(newColor)) {
      onChange([...value, newColor])
      setNewColor("#000000")
    }
  }

  const removeColor = (colorToRemove: string) => {
    onChange(value.filter(color => color !== colorToRemove))
  }

  const addPredefinedColor = (color: string) => {
    if (value.length < maxColors && !value.includes(color)) {
      onChange([...value, color])
    }
  }

  return (
    <div className="space-y-4">
      <Label>Colores de la marca ({value.length}/{maxColors})</Label>
      
      {/* Colores seleccionados */}
      <div className="flex flex-wrap gap-2">
        {value.map((color, index) => (
          <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
            <div 
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-mono">{color}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeColor(color)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Agregar nuevo color */}
      {value.length < maxColors && (
        <div className="flex gap-2">
          <Input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-16 h-10"
          />
          <Input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
          <Button type="button" onClick={addColor} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Colores predefinidos */}
      <div>
        <Label className="text-sm text-muted-foreground">Colores sugeridos:</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {coloresPredefinidos.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => addPredefinedColor(color)}
              disabled={value.includes(color) || value.length >= maxColors}
              className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {value.length >= maxColors && (
        <p className="text-sm text-muted-foreground">
          Máximo {maxColors} colores permitidos
        </p>
      )}
    </div>
  )
}










