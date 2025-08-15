"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface PromotionStepProps {
  formData: {
    promotion: string
    imageFormat: "4:5" | "1:1" | "9:16"
    validity: string
  }
  updateFormData: (data: any) => void
}

export function PromotionStep({ formData, updateFormData }: PromotionStepProps) {
  const formatOptions = [
    {
      value: "4:5",
      title: "Publicación Vertical",
      subtitle: "4:5 - Recomendado",
      description: "Ideal para feed de Instagram",
    },
    {
      value: "1:1",
      title: "Publicación Cuadrada",
      subtitle: "1:1 - Clásico",
      description: "Funciona en todas las plataformas",
    },
    {
      value: "9:16",
      title: "Historia/Story",
      subtitle: "9:16 - Vertical",
      description: "Para Instagram y Facebook Stories",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Promotion */}
      <div className="space-y-2">
        <Label htmlFor="promotion">Precio/Promoción *</Label>
        <Input
          id="promotion"
          placeholder="Ej: 50% OFF, 2x1, Precio especial $999, Oferta limitada..."
          value={formData.promotion}
          onChange={(e) => updateFormData({ promotion: e.target.value })}
        />
      </div>

      {/* Image Format */}
      <div className="space-y-4">
        <Label>Formato de Imagen *</Label>
        <RadioGroup
          value={formData.imageFormat}
          onValueChange={(value) => updateFormData({ imageFormat: value })}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {formatOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
              <Label
                htmlFor={option.value}
                className={`cursor-pointer block ${formData.imageFormat === option.value ? "ring-2 ring-primary" : ""}`}
              >
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="w-full max-w-[120px] mx-auto">
                        <AspectRatio
                          ratio={option.value === "4:5" ? 4 / 5 : option.value === "1:1" ? 1 : 9 / 16}
                          className="bg-muted rounded border-2 border-dashed border-muted-foreground/25"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{option.title}</p>
                        <p className="text-sm text-primary">{option.subtitle}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Validity */}
      <div className="space-y-2">
        <Label htmlFor="validity">Tiempo de Vigencia *</Label>
        <Input
          id="validity"
          placeholder="Ej: Hasta agotar stock, Solo hoy, Todo el mes, Válido hasta el 31/12..."
          value={formData.validity}
          onChange={(e) => updateFormData({ validity: e.target.value })}
        />
      </div>
    </div>
  )
}
