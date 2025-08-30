  const handlePublishNow = async () => {
    setIsPublishing(true)
    
    // Verificar que tenemos al menos una plataforma seleccionada
    if (selectedPlatforms.length === 0) {
      toast.error('Selecciona al menos una red social para publicar')
      setIsPublishing(false)
      return
    }

    // Verificar que tenemos contenido para publicar
    if (isStory) {
      if (!imageUrl) {
        toast.error('Necesitas una imagen para publicar la historia.')
        setIsPublishing(false)
        return
      }
    } else {
      if (!copy || !imageUrl) {
        toast.error('Necesitas contenido (copy) e imagen para publicar.')
        setIsPublishing(false)
        return
      }
    }

    const loadingToast = toast.loading(`Publicando en ${selectedPlatforms.map(p => getPlatformName(p)).join(', ')}...`, {
      duration: Infinity,
    })
    
    try {
      const results = []
      
      // Crear el post en la base de datos para cada plataforma
      for (const platform of selectedPlatforms) {
        try {
          console.log(`🚀 Iniciando publicación en ${platform}...`)
          
          // Verificar que tenemos conexión para esta plataforma
          const platformConnection = connections.find(c => c.plataforma === platform)
          if (!platformConnection) {
            results.push({ 
              platform, 
              success: false, 
              error: `No hay cuenta de ${getPlatformName(platform)} conectada` 
            })
            continue
          }

          // Crear el post en la base de datos
          const postData = {
            titulo: `${isStory ? 'Historia' : 'Post'} en ${getPlatformName(platform)} - ${new Date().toLocaleDateString()}`,
            contenido: copy,
            plataforma: platform,
            tipo: isStory ? 'historia' : 'publicacion',
            hashtags: hashtags,
            imagen_url: imageUrl,
            prompt_utilizado: "Generado con IA desde la interfaz web",
            storage_file_name: storageInfo?.storage_file_name || null,
            is_permanent_image: storageInfo?.is_permanent_image || false,
            estado: 'publicado'
          }

          const postResponse = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
          })

          if (!postResponse.ok) {
            const errorData = await postResponse.json()
            results.push({ 
              platform, 
              success: false, 
              error: `Error guardando post: ${errorData.error || 'Error desconocido'}` 
            })
            continue
          }

          const postResult = await postResponse.json()

          // Publicar en la plataforma específica
          const publishEndpoint = platform === 'instagram' ? '/api/instagram/publish' : '/api/facebook/publish'
          const publishResponse = await fetch(publishEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              connectionId: platformConnection.id,
              caption: copy,
              imageUrl: imageUrl,
              postId: postResult.id,
              contentType: isStory ? 'story' : 'post'
            })
          })

          if (!publishResponse.ok) {
            const errorData = await publishResponse.json()
            console.error(`❌ Error publicando en ${platform}:`, errorData)
            results.push({ 
              platform, 
              success: false, 
              error: errorData.error || 'Error desconocido' 
            })
          } else {
            const publishResult = await publishResponse.json()
            console.log(`✅ Publicado exitosamente en ${platform}:`, publishResult)
            results.push({ 
              platform, 
              success: true, 
              account: publishResult.account || platformConnection.nombre_cuenta 
            })
          }

        } catch (error) {
          console.error(`❌ Error con ${platform}:`, error)
          results.push({ 
            platform, 
            success: false, 
            error: error instanceof Error ? error.message : 'Error desconocido' 
          })
        }
      }
      
      toast.dismiss(loadingToast)
      
      // Mostrar resultados
      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)
      
      console.log('📊 Resultados de publicación:', { successful, failed })
      
      if (successful.length > 0) {
        const platforms = successful.map(r => `${getPlatformName(r.platform)} (${r.account})`).join(', ')
        toast.success(`¡${isStory ? 'Historia' : 'Post'} publicado exitosamente en: ${platforms}! 🎉`, {
          duration: 5000,
        })
      }
      
      if (failed.length > 0) {
        const errors = failed.map(r => `${getPlatformName(r.platform)}: ${r.error}`).join('\\n')
        toast.error(`Errores en:\\n${errors}`, {
          duration: 8000,
        })
      }
      
      if (successful.length > 0) {
        setTimeout(() => {
          window.location.href = '/dashboard/history'
        }, 2000)
      }

    } catch (error) {
      console.error('❌ Error general publicando:', error)
      toast.dismiss(loadingToast)
      toast.error(`Error publicando el post: ${error instanceof Error ? error.message : 'Error desconocido'}`, {
        duration: 6000,
      })
    } finally {
      setIsPublishing(false)
    }
  }