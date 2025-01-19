import axios from 'axios';

const API_URL = '/api/tareas';

export interface Comentario {
  author: string;
  text: string;
  createdAt?: Date;
}

// export interface Tarea {
//   _id?: string;
//   id?: string;
//   name: string;
//   month: string;
//   startDate: string;
//   endDate: string;
//   status: 'completado' | 'en-progreso' | 'pendiente' | 'no-iniciado';
//   categoria:
//     | "EQUIPOS FORJA"
//     | "EQUIPOS MAQUINADO"
//     | "EQUIPO AREAS ADMINISTRATIVAS";
//   description: string;
//   comments: Comentario[];
// }

interface Week {
  numero: number;
  estado: boolean;
  avance: string;
  color: string;
}

interface Month {
  mes: string;
  semanas: Week[];
}

// export interface Tarea {
//   _id?: string,
//   id?: string,
//   pos: string;
//   equipo: string;
//   area: string;
//   servicios: string;
//   meses: Month[];
//   status: "completado" | "en-progreso" | "pendiente" | "no-iniciado";
//   categoria: "EQUIPOS FORJA" | "EQUIPOS MAQUINADO" | "EQUIPO AREAS ADMINISTRATIVAS";
//   description?: string;
//   comments: Array<{
//     text: string;
//     createdAt: Date;
//   }>;
// }
//
// export interface Tarea {
//   _id?: string;
//   pos: string;
//   equipo: string;
//   area: string;
//   servicios: string;
//   categoria: string;
//   meses: {
//     mes: string;      // "YYYY-MM"
//     semanas: {
//       numero: number;
//       estado: boolean;
//       _id?: string;
//     }[];
//     _id?: string;
//   }[];
//   status: string;
//   description: string;
//   comments: {
//     text: string;
//     createdAt?: string | Date;
//     _id?: string;
//   }[];
//   createdAt?: string;
//   updatedAt?: string;
//   __v?: number;
// }


export interface Tarea {
  _id: string;  // Remove the optional '?' to make it required
  pos: string;
  equipo: string;
  area: string;
  servicios: string;
  categoria: string;
  meses: {
    mes: string;      // "YYYY-MM"
    semanas: {
      numero: number;
      estado: boolean;
      avance: string;
      color: string;
    }[];
  }[];
  status: string;
  description: string;
  comments: {
    text: string;
    createdAt?: string | Date;
    _id: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export const TareaService = {
  // Obtener todas las tareas
  getTareas: async (): Promise<Tarea[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // Crear nueva tarea
  createTarea: async (tarea: Omit<Tarea, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Promise<Tarea> => {
    const response = await axios.post(API_URL, tarea);
    return response.data;
  },

  // Actualizar tarea
  updateTarea: async (id: string, tarea: Partial<Tarea>): Promise<Tarea> => {
    const response = await axios.put(`${API_URL}/${id}`, tarea);
    return response.data;
  },

  // Añadir comentario
  addComment: async (id: string, comment: string): Promise<Tarea> => {
    const response = await axios.put(`${API_URL}/${id}`, {
      $push: {
        comments: {
          text: comment,
          author: 'Usuario',
          createdAt: new Date()
        }
      }
    });
    return response.data;
  },

  deleteComment: async (id: string, commentId: string): Promise<Tarea> => {
    const response = await axios.put(`${API_URL}/${id}`, {
      $pull: {
        comments: { _id: commentId }
      }
    })
    return response.data
  },

  // Eliminar tarea
  deleteTarea: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};
