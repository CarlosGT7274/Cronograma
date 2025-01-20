import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Eliminar la cookie de sesión
    response.cookies.set({
      name: 'session',
      value: '',
      expires: new Date(0), // Fecha en el pasado para eliminar la cookie
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
