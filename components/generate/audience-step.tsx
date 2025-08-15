"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AudienceStepProps {
  formData: {
    objective: string
    communicationStyle: string
  }
  updateFormData: (data: any) => void
}

export function AudienceStep({ formData, updateFormData }: AudienceStepProps) {
  const objectives = [
    { value: "conversations", label: "Generar conversaciones" },
    { value: "store_visits", label: "Visitas al local" },
    { value: "website_visits", label: "Visita web" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "profile_visits", label: "Visitar perfil" },
  ]

  const styles = [
    { value: "casual", label: "Casual" },
    { value: "professional", label: "Profesional" },
    { value: "fun", label: "Divertido" },
    { value: "elegant", label: "Elegante" },
    { value: "youthful", label: "Juvenil" },
  ]

  return (
    <div className="space-y-6">
      {/* Objective */}
      <div className="space-y-2">
        <Label>Objetivo de la Publicación *</Label>
        <Select value={formData.objective} onValueChange={(value) => updateFormData({ objective: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el objetivo principal" />
          </SelectTrigger>
          <SelectContent>
            {objectives.map((objective) => (
              <SelectItem key={objective.value} value={objective.value}>
                {objective.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Communication Style */}
      <div className="space-y-2">
        <Label>Estilo de Comunicación *</Label>
        <Select
          value={formData.communicationStyle}
          onValueChange={(value) => updateFormData({ communicationStyle: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tono de comunicación" />
          </SelectTrigger>
          <SelectContent>
            {styles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Preview of Selection */}
      {formData.objective && formData.communicationStyle && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Resumen de tu selección:</h4>
          <p className="text-sm text-muted-foreground">
            Crearemos contenido con un estilo{" "}
            <strong>{styles.find((s) => s.value === formData.communicationStyle)?.label.toLowerCase()}</strong> enfocado
            en <strong>{objectives.find((o) => o.value === formData.objective)?.label.toLowerCase()}</strong>.
          </p>
        </div>
      )}
    </div>
  )
}
