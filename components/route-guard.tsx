"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
}

// Rutas públicas que no requieren autenticación
const publicRoutes = ["/sign-in", "/sign-up", "/debug", "/setup", "/test"];

export function RouteGuard({ children }: RouteGuardProps) {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);

  useEffect(() => {
    // Si es una ruta pública, permitir acceso inmediatamente
    if (publicRoutes.includes(pathname) || pathname.startsWith("/api/test-")) {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    // Si no está cargado, esperar
    if (!isLoaded) {
      return;
    }

    // Si no está autenticado, redirigir a sign-in
    if (!isSignedIn || !user) {
      setShouldRedirect("/sign-in");
      setLoading(false);
      return;
    }

    // Si está autenticado, verificar permisos
    checkPermissions();
  }, [isSignedIn, user, pathname, isLoaded]);

  // Manejar redirecciones
  useEffect(() => {
    if (shouldRedirect) {
      router.push(shouldRedirect);
      setShouldRedirect(null);
    }
  }, [shouldRedirect, router]);

  const checkPermissions = async () => {
    try {
      console.log('🔍 Verificando permisos para:', pathname);
      
      // Verificar si el usuario existe en nuestra base de datos
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const usuario = await response.json();
        console.log('✅ Usuario encontrado:', usuario);
        
        // Verificar permisos basados en el rol
        const esAdmin = usuario.rol === 'admin';
        const esCliente = usuario.rol === 'cliente';
        
        if (esAdmin && pathname.startsWith('/admin')) {
          setHasAccess(true);
        } else if (esCliente && pathname.startsWith('/dashboard')) {
          setHasAccess(true);
        } else if (esAdmin && pathname.startsWith('/dashboard')) {
          // Admin puede acceder a dashboard también
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } else {
        console.log('❌ Usuario no encontrado en la base de datos');
        setHasAccess(false);
      }
    } catch (error) {
      console.error("Error verificando permisos:", error);
      // En caso de error, permitir acceso temporalmente
      setHasAccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/test-")) {
    return <>{children}</>;
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
