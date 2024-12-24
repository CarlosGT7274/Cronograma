import { useEffect, useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { TareaService, Tarea } from '@/services/tareaService';

// Helper function to get status color
const getStatusColor = (status: Tarea['status']) => {
  switch (status) {
    case 'completado': return 'bg-green-500';
    case 'en-progreso': return 'bg-blue-500';
    case 'pendiente': return 'bg-yellow-500';
    case 'no-iniciado': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

export const MonthTab = ({ month }: { month: string }) => {
  const [tasks, setTasks] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({})
  const [filterStatus, setFilterStatus] = useState<Tarea['status'] | 'all'>('all')
  const [sortBy, setSortBy] = useState<'startDate' | 'endDate' | 'status'>('startDate')
  const [searchTerm, setSearchTerm] = useState('')

  // Memoize filtered tasks to avoid unnecessary re-renders
  const monthTasks = useMemo(() => {
    return tasks
      .filter(task =>
        // console.log(task.meses.some(m => {
        //   console.log(new Date(`${m.mes}`).toLocaleString("default", { month: "long" }));
        //   console.log(month.toLowerCase())
        // })) &&
        // console.log(task.meses.some(m => new Date(`${m.mes}`).toLocaleString("default", { month: "long" }) === month.toLowerCase())) &&
        // console.log(task) &&
        task.meses.some(m => new Date(`${m.mes}`).toLocaleString("default", { month: "long" }) === month.toLowerCase())
        // (filterStatus === 'all' || task.status === filterStatus) &&
        // (task.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        //  task.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        //  task.servicios.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    // .sort((a, b) => {
    //   if (sortBy === 'status') {
    //     return a.status.localeCompare(b.status)
    //   }
    //   return a[sortBy].localeCompare(b[sortBy])
    // })
  }, [tasks, month, filterStatus, sortBy, searchTerm])

  console.log(monthTasks)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const allTasks = await TareaService.getTareas();
        setTasks(allTasks);
      } catch (err) {
        console.error(err);
        setError('Error al cargar las tareas. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [month]);

  const addComment = async (taskId: string) => {
    try {
      const commentText = newComments[taskId];
      if (commentText && commentText.trim()) {
        // Call service to add comment
        const updatedTask = await TareaService.addComment(taskId, commentText);

        // Update local state
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === taskId ? updatedTask : task
          )
        );

        // Clear comment input
        setNewComments(prev => ({ ...prev, [taskId]: '' }));
      }
    } catch (err) {
      console.error('Error adding comment', err);
      setError('No se pudo agregar el comentario. Intente nuevamente.');
    }
  };

  const handleCommentChange = (taskId: string, text: string) => {
    setNewComments(prev => ({
      ...prev,
      [taskId]: text
    }));
  };

  if (loading) {
    return <div className="p-6 text-center">Cargando tareas...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!monthTasks.length) {
    return <div className="p-6 text-center">No hay tareas para {month}.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Tareas de {month.charAt(0).toUpperCase() + month.slice(1)}</h2>
      {monthTasks.map((task) => (
        <div key={task._id} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-semibold">{task.area} - {task.equipo}</h3>
              <p className="text-sm text-gray-600">{task.description}</p>
            </div>
            <span
              className={`px-2 py-1 rounded text-white text-xs ${getStatusColor(task.status)}`}
            >
              {task.status}
            </span>
          </div>
          <div className="mb-2">
            <div className="text-sm text-gray-500 mt-1">

            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-medium mb-2">Comentarios</h4>
            {task.comments && task.comments.length > 0 ? (
              task.comments.map((comment, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded mb-2">
                  <strong>Usuario: </strong>
                  <span className="text-sm text-gray-600">
                    ({format(new Date(comment.createdAt || new Date()), 'dd MMM HH:mm', { locale: es })})
                  </span>
                  <p>{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No hay comentarios</p>
            )}
            <div className="flex mt-2">
              <input
                type="text"
                placeholder="Añadir comentario..."
                className="flex-grow border rounded-l p-2"
                value={newComments[task._id || ''] || ''}
                onChange={(e) => handleCommentChange(task._id || '', e.target.value)}
              />
              <button
                className="bg-blue-500 text-white px-4 rounded-r"
                onClick={() => task._id && addComment(task._id)}
                disabled={!newComments[task._id || ''] || !newComments[task._id || ''].trim()}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
