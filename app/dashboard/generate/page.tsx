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
    productImage: undefined as string | undefined,
    imageSource: undefined as "file" | "url" | "camera" | undefined,
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
    console.log('🔄 updateFormData llamado con:', data)
    setFormData((prev) => {
      const newData = { ...prev, ...data }
      console.log('📝 Nuevo formData después de update:', newData)
      return newData
    })
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
    
    try {
      console.log('🚀 Iniciando generación de contenido...')
      console.log('📝 Form data completo:', formData)
      console.log('🖼️ Imagen del producto en cliente:', !!formData.productImage)
      console.log('🔗 URL/Data de imagen en cliente:', formData.productImage ? formData.productImage.substring(0, 100) + '...' : 'No hay imagen')
      
      // Asegurar que todos los campos se envíen, incluso si son undefined
      const completeFormData = {
        ...formData,
        productImage: formData.productImage || null,
        imageSource: formData.imageSource || null,
        isStory: isStory, // Agregar información sobre si es historia
      }
      
      console.log('📦 Form data que se enviará al API:', Object.keys(completeFormData))
      console.log('🖼️ productImage en payload:', !!completeFormData.productImage)
      
      const response = await fetch('/api/generate/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData: completeFormData }),
      })

      if (response.ok) {
        const generatedContent = await response.json()
        console.log('✅ Contenido generado:', generatedContent)
        
        // Guardar el contenido generado en localStorage para la página de preview
        localStorage.setItem('generatedContent', JSON.stringify(generatedContent))
        
        // Redirigir a preview
        router.push("/dashboard/generate/preview")
      } else {
        const errorData = await response.json()
        console.error('❌ Error en generación:', errorData)
        alert('Error al generar contenido: ' + (errorData.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('❌ Error en handleGenerate:', error)
      alert('Error al generar contenido. Por favor intenta nuevamente.')
    } finally {
      setIsGenerating(false)
    }
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

  // Determinar si es una historia basada en el formato de imagen
  const isStory = formData.imageFormat === "9:16"

  if (isGenerating) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {isStory ? "Generando historia con IA..." : "Generando contenido con IA..."}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isStory 
                ? "Estamos creando la imagen perfecta para tu historia"
                : "Estamos creando el copy perfecto y la imagen ideal para tu producto"
              }
            </p>
            <Progress value={66} className="w-full" />
            <div className="mt-4 space-y-2">
              {!isStory && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Generando copy con GPT-3.5-turbo
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                Analizando imagen de producto con GPT-4 Vision
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                Generando imagen con DALL-E 3
              </div>
              {!isStory && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Generando hashtags optimizados
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">Esto puede tomar 30-60 segundos</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold">
          {isStory ? "Generar Nueva Historia" : "Generar Nuevo Post"}
        </h1>
        <p className="text-muted-foreground">
          {isStory 
            ? "Crea historias impactantes con IA en 3 simples pasos" 
            : "Crea contenido profesional con IA en 3 simples pasos"
          }
        </p>
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
            {isStory ? "Generar Historia" : "Generar Contenido"}
          </Button>
        )}
      </div>
    </div>
  )
}
