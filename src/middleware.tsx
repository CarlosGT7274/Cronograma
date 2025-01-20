
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define las rutas públicas
const publicRoutes = ['/login', '/register', '/api/auth/login'];

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Si es una ruta pública, permitir acceso sin verificación
  if (publicRoutes.includes(pathname) || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/api/auth/login') || // Permitir acceso sin verificación a esta ruta
      pathname.includes('.') // Para archivos estáticos
  ) {
    return NextResponse.next();
  }

  // Si no hay sesión y no es una ruta pública, redirigir a login
  if (!session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Si hay sesión, permitir el acceso
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

