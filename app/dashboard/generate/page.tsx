"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { ProductStep } from "@/components/generate/product-step"
import { PromotionStep } from "@/components/generate/promotion-step"
import { AudienceStep } from "@/components/generate/audience-step"
import { useRouter } from "next/navigation"

const steps = [
  { id: 1, title: "Producto", description: "Información básica del producto" },
  { id: 2, title: "Promoción y Formato", description: "Detalles de la oferta y formato visual" },
  { id: 3, title: "Audiencia y Estilo", description: "Público objetivo y tono de comunicación" },
]

export default function GeneratePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1: Product
    productName: "",
    communicationType: "",
    characteristics: [] as string[],
    // Step 2: Promotion
    promotion: "",
    imageFormat: "4:5" as "4:5" | "1:1" | "9:16",
    validity: "",
    // Step 3: Audience
    objective: "",
    communicationStyle: "",
  })
  const router = useRouter()

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsGenerating(false)
    router.push("/dashboard/generate/preview")
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.productName && formData.communicationType && formData.characteristics.length > 0
      case 2:
        return formData.promotion && formData.validity
      case 3:
        return formData.objective && formData.communicationStyle
      default:
        return false
    }
  }

  if (isGenerating) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Generando contenido con IA...</h3>
            <p className="text-muted-foreground mb-4">
              Estamos creando el copy perfecto y la imagen ideal para tu producto
            </p>
            <Progress value={66} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">Esto puede tomar unos segundos</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold">Generar Nuevo Post</h1>
        <p className="text-muted-foreground">Crea contenido profesional con IA en 3 simples pasos</p>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep ? "bg-gradient-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={`text-sm font-medium ${step.id <= currentStep ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <Progress value={(currentStep / 3) * 100} className="w-full" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            Paso {currentStep}: {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && <ProductStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <PromotionStep formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <AudienceStep formData={formData} updateFormData={updateFormData} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        {currentStep < 3 ? (
          <Button onClick={nextStep} disabled={!isStepValid()} className="bg-purple-600 hover:bg-purple-700 text-white">
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={!isStepValid()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generar Contenido
          </Button>
        )}
      </div>
    </div>
  )
}
