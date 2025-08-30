import { EmpresaForm } from "@/components/forms/empresa-form"
import { createEmpresa } from "@/lib/actions/empresas.actions"
import { redirect } from "next/navigation"

export default function NewEmpresaPage() {
  async function handleCreateEmpresa(formData: FormData) {
    "use server"
    
    const result = await createEmpresa(formData)
    
    if (result.success) {
      redirect('/admin/companies')
    } else {
      // Manejar error
      console.error('Error al crear empresa:', result.error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Crear Nueva Empresa</h1>
          <p className="text-muted-foreground">
            Completa la información de la empresa para generar contenido personalizado
          </p>
        </div>
        
        <EmpresaForm onSubmit={handleCreateEmpresa} />
      </div>
    </div>
  )
}


















