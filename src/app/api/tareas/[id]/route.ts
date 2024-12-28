import dbConnect from '@/lib/dbConnect';
import Tarea from '@/lib/models/Tarea';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await dbConnect();
    const tarea = await Tarea.findById(params.id);
    
    if (!tarea) {
      return NextResponse.json({ message: 'Tarea no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(tarea);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    return NextResponse.json({ 
      message: 'Error al obtener tarea',
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await dbConnect();
    const body = await request.json();
    
    const tareaActualizada = await Tarea.findByIdAndUpdate(
      params.id, 
      body, 
      { new: true, runValidators: true }
    );
    
    if (!tareaActualizada) {
      return NextResponse.json({ message: 'Tarea no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(tareaActualizada);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return NextResponse.json({ 
      message: 'Error al actualizar tarea',
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await dbConnect();
    const tareaEliminada = await Tarea.findByIdAndDelete(params.id);
    
    if (!tareaEliminada) {
      return NextResponse.json({ message: 'Tarea no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    return NextResponse.json({ 
      message: 'Error al eliminar tarea',
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}
