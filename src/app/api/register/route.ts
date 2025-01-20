import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    console.log('1. Iniciando registro...');
    
    await dbConnect();
    console.log('2. Conexión a DB establecida');
    
    const data = await req.json();
    console.log('3. Datos recibidos:', data);
    
    const { nombre, correo, contraseña } = data;
    
    // Validar que tenemos todos los campos requeridos
    if (!nombre || !correo || !contraseña) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ correo });
    console.log('5. Búsqueda de usuario existente:', existingUser ? 'encontrado' : 'no encontrado');
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Crear usuario con los campos requeridos
    // El rol por defecto lo maneja el schema
    const user = await User.create({
      nombre,
      correo,
      contraseña
    });

    return NextResponse.json({
      user: {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        roles: user.roles
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error en registro:', error);
    
    // Mejorar el mensaje de error para el cliente
    const errorMessage = error.errors 
      ? Object.values(error.errors).map((err: any) => err.message).join(', ')
      : error.message;

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 } // Cambié a 400 para errores de validación
    );
  }
}
