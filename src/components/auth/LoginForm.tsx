
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthService } from "@/services/authService"
import { useAuth } from "@/contexts/AuthContext"

interface LoginCredentials {
  correo: string
  contraseña: string
}

export default function LoginForm() {
  const router = useRouter()
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    correo: "",
    contraseña: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const user = await AuthService.checkSession()
        if (user) {
          // Solo redirigir si realmente hay un usuario autenticado
          router.replace("/") // Usar replace en lugar de push para evitar entradas en el historial
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkExistingSession()
  }, []) // Remover router de las dependencias para evitar re-renders innecesarios


  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await AuthService.login(formData);
      if (user) {
        login(user);
        router.push("/");
      }
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      setError("Credenciales inválidas o error de conexión");
    } finally {
      setIsLoading(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }
  // Mostrar un estado de carga mientras se verifica la sesión
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Iniciar Sesión</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="correo"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={formData.correo}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                name="contraseña"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={formData.contraseña}
                onChange={handleChange}
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/register" className="text-indigo-600 hover:text-indigo-500">
                ¿No tienes cuenta? Regístrate
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}


