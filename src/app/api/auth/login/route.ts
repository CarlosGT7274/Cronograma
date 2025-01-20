import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'


export async function POST(req: Request) {
  try {
    await dbConnect();
    const { correo, contraseña } = await req.json();
    const user = await User.findOne({ correo });
    console.log(user)

    if (!user || !(await bcrypt.compare(contraseña, user.contraseña))) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Crear respuesta y establecer cookie de sesión simple
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        correo: user.correo,
        roles: user.roles
      }
    });

    // Establecer una cookie simple de sesión
    response.cookies.set({
      name: 'session',
      value: user._id.toString(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 día
    });

    return response;

  } catch (error) {
    console.error('Error de login:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

