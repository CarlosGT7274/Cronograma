import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')

  // Rutas públicas que no requieren autenticación
  if (request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // Si no hay sesión, redirigir a login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
