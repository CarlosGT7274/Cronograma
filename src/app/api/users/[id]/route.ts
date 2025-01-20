import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const userData = await req.json();
    await dbConnect();
    const { id } = await params;

    
    // Evitar cambiar la contraseña desde aquí
    delete userData.contraseña;
    
    const user = await User.findByIdAndUpdate(
      id, // Usar el ID de los parámetros de la URL
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await dbConnect();
    const { id } = await params;
    const tareaEliminada = await User.findByIdAndDelete(id);
    
    if (!tareaEliminada) {
      return NextResponse.json({ message: 'usuario no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar user:', error);
    return NextResponse.json({ 
      message: 'Error al eliminar user',
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}


