import dbConnect from '@/lib/dbConnect';
import Tarea from '@/lib/models/Tarea';
import { NextRequest, NextResponse } from 'next/server';

// Crear nueva tarea

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Verificar si el cuerpo es un arreglo
    if (Array.isArray(body)) {
      const tareas = await Promise.all(
        body.map(async (tareaData) => {
          const nuevaTarea = new Tarea(tareaData);
          return nuevaTarea.save();
        })
      );
      return NextResponse.json(tareas, { status: 201 });
    }
    
    // Si no es un arreglo, procesamos una sola tarea
    const nuevaTarea = new Tarea(body);
    await nuevaTarea.save();
    
    return NextResponse.json(nuevaTarea, { status: 201 });
    
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return NextResponse.json({ 
      message: 'Error al crear tarea',
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}


// Obtener todas las tareas
export async function GET() {
  try {
    await dbConnect();
    const tareas = await Tarea.find({});
    return NextResponse.json(tareas);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return NextResponse.json({ 
      message: 'Error al obtener tareas',
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}
