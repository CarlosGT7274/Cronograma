import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { correo, contraseña, roles } = await req.json();

    const existingUser = await User.findOne({ correo });
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    const user = await User.create({
      correo,
      contraseña,
      roles: roles || [{ nombre: 'usuario', estado: true }]
    });

    return NextResponse.json({
      user: {
        id: user._id,
        correo: user.correo,
        roles: user.roles
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
