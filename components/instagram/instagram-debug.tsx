"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, RefreshCw, Copy, CheckCircle } from 'lucide-react'

interface InstagramDebugProps {
  debugToken?: string
}

export function InstagramDebug({ debugToken }: InstagramDebugProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const runDebug = async () => {
    if (!debugToken) return

    setLoading(true)
    try {
      const response = await fetch(`/api/instagram/debug?token=${encodeURIComponent(debugToken)}`)
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error('Error en debug:', error)
      setDebugInfo({ error: 'Error al ejecutar debug' })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (debugToken) {
      runDebug()
    }
  }, [debugToken])

  if (!debugToken) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <AlertCircle className="w-5 h-5" />
          Debug de Instagram
        </CardTitle>
        <CardDescription>
          Información de debug para diagnosticar problemas de conexión
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDebug} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Ejecutando...' : 'Ejecutar Debug'}
          </Button>
          <Button 
            onClick={() => copyToClipboard(debugToken)}
            variant="outline"
            size="sm"
          >
            {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copiado' : 'Copiar Token'}
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-4">
            {/* Información del Token */}
            {debugInfo.token_info && (
              <div>
                <h4 className="font-medium mb-2">Información del Token</h4>
                <div className="bg-white p-3 rounded border text-sm">
                  <p><strong>Usuario:</strong> {debugInfo.token_info.name}</p>
                  <p><strong>ID:</strong> {debugInfo.token_info.id}</p>
                </div>
              </div>
            )}

            {/* Permisos */}
            {debugInfo.permissions && (
              <div>
                <h4 className="font-medium mb-2">Permisos</h4>
                <div className="bg-white p-3 rounded border text-sm">
                  {debugInfo.permissions.data?.map((perm: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                      <Badge variant={perm.status === 'granted' ? 'default' : 'secondary'}>
                        {perm.status}
                      </Badge>
                      <span>{perm.permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Páginas */}
            {debugInfo.pages && (
              <div>
                <h4 className="font-medium mb-2">Páginas de Facebook</h4>
                <div className="bg-white p-3 rounded border text-sm">
                  {debugInfo.pages.data?.length > 0 ? (
                    debugInfo.pages.data.map((page: any, index: number) => (
                      <div key={index} className="mb-2 p-2 border rounded">
                        <p><strong>Nombre:</strong> {page.name}</p>
                        <p><strong>ID:</strong> {page.id}</p>
                        <p><strong>Categoría:</strong> {page.category}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-red-600">No se encontraron páginas</p>
                  )}
                </div>
              </div>
            )}

                         {/* Páginas con Instagram */}
             {debugInfo.pages_with_instagram && (
               <div>
                 <h4 className="font-medium mb-2">Páginas con Instagram</h4>
                 <div className="bg-white p-3 rounded border text-sm">
                   {debugInfo.pages_with_instagram.map((page: any, index: number) => (
                     <div key={index} className="mb-2 p-2 border rounded">
                       <p><strong>Página:</strong> {page.page_name}</p>
                       <p><strong>ID:</strong> {page.page_id}</p>
                       {page.has_instagram ? (
                         <div className="mt-1">
                           <Badge variant="default" className="text-xs">✅ Tiene Instagram</Badge>
                           {page.instagram_data?.instagram_business_account && (
                             <p className="text-xs mt-1">
                               <strong>Instagram ID:</strong> {page.instagram_data.instagram_business_account.id}
                             </p>
                           )}
                         </div>
                       ) : (
                         <div className="mt-1">
                           <Badge variant="secondary" className="text-xs">❌ Sin Instagram</Badge>
                           {page.error && (
                             <p className="text-xs text-red-600 mt-1">Error: {page.error}</p>
                           )}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Páginas Directas */}
             {debugInfo.pages_direct && (
               <div>
                 <h4 className="font-medium mb-2">Páginas (Método Directo)</h4>
                 <div className="bg-white p-3 rounded border text-sm">
                   {debugInfo.pages_direct.accounts?.data?.length > 0 ? (
                     debugInfo.pages_direct.accounts.data.map((page: any, index: number) => (
                       <div key={index} className="mb-2 p-2 border rounded">
                         <p><strong>Nombre:</strong> {page.name}</p>
                         <p><strong>ID:</strong> {page.id}</p>
                         <p><strong>Categoría:</strong> {page.category}</p>
                         {page.instagram_business_account && (
                           <div className="mt-1">
                             <Badge variant="default" className="text-xs">✅ Tiene Instagram</Badge>
                             <p className="text-xs mt-1">
                               <strong>Instagram ID:</strong> {page.instagram_business_account.id}
                             </p>
                           </div>
                         )}
                       </div>
                     ))
                   ) : (
                     <p className="text-red-600">No se encontraron páginas (método directo)</p>
                   )}
                 </div>
               </div>
             )}

                           {/* Páginas como Administrador */}
              {debugInfo.admin_pages && (
                <div>
                  <h4 className="font-medium mb-2">Páginas como Administrador</h4>
                  <div className="bg-white p-3 rounded border text-sm">
                    {debugInfo.admin_pages.accounts?.data?.length > 0 ? (
                      debugInfo.admin_pages.accounts.data.map((page: any, index: number) => (
                        <div key={index} className="mb-2 p-2 border rounded">
                          <p><strong>Nombre:</strong> {page.name}</p>
                          <p><strong>ID:</strong> {page.id}</p>
                          <p><strong>Categoría:</strong> {page.category}</p>
                          {page.roles && (
                            <p><strong>Roles:</strong> {page.roles.join(', ')}</p>
                          )}
                          {page.instagram_business_account && (
                            <div className="mt-1">
                              <Badge variant="default" className="text-xs">✅ Tiene Instagram</Badge>
                              <p className="text-xs mt-1">
                                <strong>Instagram ID:</strong> {page.instagram_business_account.id}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-red-600">No se encontraron páginas como administrador</p>
                    )}
                  </div>
                </div>
              )}

              {/* Datos de Business Manager */}
              {debugInfo.business_data && (
                <div>
                  <h4 className="font-medium mb-2">Datos de Business Manager</h4>
                  <div className="bg-white p-3 rounded border text-sm">
                    {debugInfo.business_data.business_users?.data?.length > 0 ? (
                      debugInfo.business_data.business_users.data.map((business: any, index: number) => (
                        <div key={index} className="mb-2 p-2 border rounded">
                          <p><strong>Business:</strong> {business.business?.name}</p>
                          <p><strong>ID:</strong> {business.business?.id}</p>
                          {business.business?.owned_pages?.data?.length > 0 ? (
                            <div className="mt-2">
                              <p><strong>Páginas:</strong></p>
                              {business.business.owned_pages.data.map((page: any, pageIndex: number) => (
                                <div key={pageIndex} className="ml-4 mt-1 p-1 bg-gray-50 rounded">
                                  <p><strong>Nombre:</strong> {page.name}</p>
                                  <p><strong>ID:</strong> {page.id}</p>
                                  {page.instagram_business_account && (
                                    <Badge variant="default" className="text-xs">✅ Tiene Instagram</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No hay páginas en este business</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-red-600">No se encontraron datos de business</p>
                    )}
                  </div>
                </div>
              )}

              {/* Búsqueda de Página */}
              {debugInfo.page_search && (
                <div>
                  <h4 className="font-medium mb-2">Búsqueda de Página "Faro.AI"</h4>
                  <div className="bg-white p-3 rounded border text-sm">
                    {debugInfo.page_search.data?.length > 0 ? (
                      debugInfo.page_search.data.map((page: any, index: number) => (
                        <div key={index} className="mb-2 p-2 border rounded">
                          <p><strong>Nombre:</strong> {page.name}</p>
                          <p><strong>ID:</strong> {page.id}</p>
                          <p><strong>Categoría:</strong> {page.category}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-red-600">No se encontró la página "Faro.AI" en la búsqueda</p>
                    )}
                  </div>
                </div>
              )}

            {/* Errores */}
            {debugInfo.errors && debugInfo.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Errores</h4>
                <div className="bg-red-50 p-3 rounded border border-red-200 text-sm">
                  {debugInfo.errors.map((error: string, index: number) => (
                    <p key={index} className="text-red-600">• {error}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Información completa */}
            <div>
              <h4 className="font-medium mb-2">Información Completa</h4>
              <div className="bg-gray-50 p-3 rounded border text-xs overflow-auto max-h-40">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
