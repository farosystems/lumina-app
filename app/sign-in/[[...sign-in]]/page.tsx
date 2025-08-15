"use client";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, User, Sparkles } from "lucide-react";

export default function CustomSignIn() {
  const { signIn, setActive } = useSignIn();
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('✅ Usuario ya autenticado, verificando rol...');
      checkUserRoleAndRedirect();
    }
  }, [isLoaded, isSignedIn]);

  const checkUserRoleAndRedirect = async () => {
    try {
      setIsRedirecting(true);
      console.log('🔍 Verificando rol del usuario...');
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Usuario encontrado:', userData);
        console.log('🔍 Campo rol:', userData.rol);
        
        if (userData.rol === 'admin') {
          console.log('🚀 Redirigiendo a /admin (usuario admin)');
          router.replace('/admin');
        } else if (userData.rol === 'cliente') {
          console.log('🚀 Redirigiendo a /dashboard (usuario cliente)');
          router.replace('/dashboard');
        } else {
          console.log('⚠️ Rol no reconocido, redirigiendo a dashboard por defecto');
          router.replace('/dashboard');
        }
      } else {
        console.log('❌ Usuario no encontrado en la base de datos');
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('❌ Error verificando rol:', error);
      router.replace('/dashboard');
    }
  };

  const validateIdentifier = (value: string) => {
    // Validar si es un username válido (al menos 3 caracteres, solo letras, números, guiones y guiones bajos)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,}$/;
    return usernameRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validar identifier antes de enviar
    if (!identifier.trim()) {
      setError("Por favor ingresa tu nombre de usuario");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Por favor ingresa tu contraseña");
      setLoading(false);
      return;
    }

    if (!validateIdentifier(identifier.trim())) {
      setError("Por favor ingresa un nombre de usuario válido (mínimo 3 caracteres, solo letras, números, guiones y guiones bajos)");
      setLoading(false);
      return;
    }

    try {
      if (!signIn) throw new Error("Clerk no está listo");

      console.log('🔍 Intentando login con identifier:', identifier.trim());

      const result = await signIn.create({
        identifier: identifier.trim(),
        password: password.trim(),
      });

      await setActive({ session: result.createdSessionId });

      // Verificar rol y redirigir correctamente
      console.log('✅ Login exitoso, verificando rol...');
      checkUserRoleAndRedirect();

    } catch (err: any) {
      console.error("Error de login:", err);

      if (err.errors?.[0]?.message === "You're already signed in.") {
        setError("Ya estás autenticado. Redirigiendo...");
        setTimeout(() => checkUserRoleAndRedirect(), 2000);
      } else if (err.errors?.[0]?.message === "Identifier is invalid.") {
        setError("Nombre de usuario inválido. Verifica que esté correctamente escrito.");
      } else if (err.errors?.[0]?.message?.includes("password")) {
        setError("Contraseña incorrecta. Verifica tu contraseña.");
      } else if (err.errors?.[0]?.message?.includes("not found")) {
        setError("Usuario no encontrado. Verifica tu nombre de usuario.");
      } else {
        setError("Error al iniciar sesión. Verifica tus credenciales.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Si ya está autenticado o está redirigiendo, mostrar mensaje de redirección
  if ((isLoaded && isSignedIn) || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-purple-200/20">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">¡Bienvenido de vuelta!</h1>
          <p className="text-purple-200 mb-6">Verificando tu perfil...</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel Izquierdo - Formulario de Login */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 flex items-center justify-center p-8 relative">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-violet-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Header con logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Image 
                    src="/logo.png" 
                    alt="LUMINA" 
                    width={48} 
                    height={48} 
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="hidden w-12 h-12 items-center justify-center">
                    <span className="text-white text-2xl font-bold">L</span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenido a LUMINA
            </h1>
            <p className="text-purple-200 text-lg">Inicia sesión en tu cuenta</p>
          </div>
          
          {/* Formulario */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {/* Campo Usuario */}
              <div className="space-y-2">
                <label htmlFor="identifier" className="block text-sm font-semibold text-white">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-purple-300" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    placeholder="tu_usuario"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-white placeholder-purple-300/70 backdrop-blur-sm"
                  />
                </div>
                <p className="text-xs text-purple-300/70">
                  Ingresa tu nombre de usuario registrado en Clerk
                </p>
              </div>
              
              {/* Campo Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-white">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-purple-300" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-8 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-white placeholder-purple-300/70 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-purple-300 hover:text-purple-200" />
                    ) : (
                      <Eye className="h-4 w-4 text-purple-300 hover:text-purple-200" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Botón de inicio de sesión */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <span className="font-semibold">Iniciar Sesión</span>
                )}
              </button>
            </form>
            

          </div>
        </div>
      </div>

      {/* Panel Derecho - Área Decorativa */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 relative overflow-hidden">
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0">
          {/* Onda 1 */}
          <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          
          {/* Onda 2 */}
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-400/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Onda 3 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Formas fluidas */}
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-cyan-300/40 to-blue-400/40 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-pink-300/40 to-purple-400/40 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Contenido central */}
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              Welcome Back.
            </h1>
            <p className="text-xl text-white/80 max-w-md mx-auto leading-relaxed">
              Accede a tu plataforma de gestión empresarial inteligente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
