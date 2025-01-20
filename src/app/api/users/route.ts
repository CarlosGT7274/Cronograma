import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}).select('-contraseña');
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...userData } = await req.json();
    await dbConnect();
    
    // Evitar cambiar la contraseña desde aquí
    delete userData.contraseña;
    
    const user = await User.findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true }
    ).select('-contraseña');

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}
