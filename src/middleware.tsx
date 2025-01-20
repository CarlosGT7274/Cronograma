
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Lista de rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
    console.log('Middleware intercepting:', request.nextUrl.pathname);

  // Si la ruta es pública, no aplicamos redirecciones
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    // Si hay sesión y está en login/register, redirigir a home
    const session = request.cookies.get("session")
    if (session) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Para rutas protegidas, verificar sesión
  const session = request.cookies.get("session")
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (robots.txt, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)'
  ]
}
