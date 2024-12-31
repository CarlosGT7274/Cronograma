import { useEffect, useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { TareaService, Tarea } from "@/services/tareaService";
import { IoTrashOutline } from "react-icons/io5";

// Helper function to get status color
const getStatusColor = (status: Tarea["status"]) => {
  switch (status) {
    case "completado":
      return "bg-green-500";
    case "en-progreso":
      return "bg-blue-500";
    case "pendiente":
      return "bg-yellow-500";
    case "no-iniciado":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

export const MonthTab = ({ month }: { month: string }) => {
  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [filterStatus, setFilterStatus] = useState<Tarea["status"] | "all">(
    "all",
  );
  const [sortBy, setSortBy] = useState<"startDate" | "endDate" | "status">(
    "startDate",
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize filtered tasks to avoid unnecessary re-renders
  // const monthTasks = useMemo(() => {
  //   return tasks
  //     .filter(task =>
  //       // console.log(task.meses.some(m => {
  //       //   console.log(new Date(`${m.mes}`).toLocaleString("default", { month: "long" }));
  //       //   console.log(month.toLowerCase())
  //       // })) &&
  //       // console.log(task.meses.some(m => new Date(`${m.mes}`).toLocaleString("default", { month: "long" }) === month.toLowerCase())) &&
  //       // console.log(task) &&
  //       task.meses.some(m => new Date(`${m.mes}`).toLocaleString("default", { month: "long" }) === month.toLowerCase()) &&
  //        (filterStatus === 'all' || task.status === filterStatus) &&
  //       (task.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //        task.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //        task.servicios.toLowerCase().includes(searchTerm.toLowerCase()))
  //     )
  //   .sort((a, b) => {
  //     if (sortBy === 'status') {
  //       return a.status.localeCompare(b.status)
  //     }
  //     return a[sortBy].localeCompare(b[sortBy])
  //   })
  // }, [tasks, month, filterStatus, sortBy, searchTerm])

  // const monthTasks = useMemo(() => {
  //   return tasks
  //     .filter(task => {
  //       return task.meses.some(m => {
  //         // Extraer solo el mes del formato "YYYY-MM" (ej: "2025-03" -> "03")
  //         const monthFromTask = m.mes.split('-')[1];
  //
  //         // Convertir el nombre del mes de la pestaña a su número correspondiente
  //         const monthNumbers = {
  //           'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
  //           'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
  //           'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
  //         };
  //
  //         // Comparar solo el mes, ignorando el año
  //         return monthFromTask === monthNumbers[month.toLowerCase()];
  //       }) &&
  //       (filterStatus === 'all' || task.status === filterStatus) &&
  //       (task.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //        task.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //        task.servicios.toLowerCase().includes(searchTerm.toLowerCase()));
  //     })
  //     .sort((a, b) => {
  //       if (sortBy === 'status') {
  //         return a.status.localeCompare(b.status);
  //       }
  //       return a[sortBy].localeCompare(b[sortBy]);
  //     });
  // }, [tasks, month, filterStatus, sortBy, searchTerm]);

  const monthTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        return task.meses.some((m) => {
          const [year, monthNumber] = m.mes.split("-");
          const monthNumbers = {
            enero: "01",
            febrero: "02",
            marzo: "03",
            abril: "04",
            mayo: "05",
            junio: "06",
            julio: "07",
            agosto: "08",
            septiembre: "09",
            octubre: "10",
            noviembre: "11",
            diciembre: "12",
          };
          return (
            monthNumber === monthNumbers[month.toLowerCase()] &&
            (filterStatus === "all" || task.status === filterStatus) &&
            (task.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
              task.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              task.servicios.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        });
      })
      .sort((a, b) => {
        // Validar que las propiedades existen y son strings
        if (sortBy === "status") {
          if (!a.status || !b.status) return 0;
          return a.status.localeCompare(b.status);
        }

        const aValue = a[sortBy];
        const bValue = b[sortBy];

        // Si alguno de los valores no existe o no es string
        if (typeof aValue !== "string" || typeof bValue !== "string") {
          if (!aValue) return 1; // Mover valores undefined/null al final
          if (!bValue) return -1; // Mover valores undefined/null al final
          return 0;
        }

        return aValue.localeCompare(bValue);
      });
  }, [tasks, month, filterStatus, sortBy, searchTerm]);

  console.log(monthTasks);

  const tasksByCategory = useMemo(() => {
    return monthTasks.reduce(
      (acc, task) => {
        if (!acc[task.categoria]) {
          acc[task.categoria] = [];
        }
        acc[task.categoria].push(task);
        return acc;
      },
      {} as Record<string, Tarea[]>,
    );
  }, [monthTasks]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const allTasks = await TareaService.getTareas();
        setTasks(allTasks);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las tareas. Por favor, intenta nuevamente.");
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
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task._id === taskId ? updatedTask : task)),
        );

        // Clear comment input
        setNewComments((prev) => ({ ...prev, [taskId]: "" }));
      }
    } catch (err) {
      console.error("Error adding comment", err);
      setError("No se pudo agregar el comentario. Intente nuevamente.");
    }
  };

  const deleteComment = async (taskId: string, commentId: string) => {
    try {
      const deletedTask = await TareaService.deleteComment(taskId, commentId);

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? deletedTask : task)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentChange = (taskId: string, text: string) => {
    setNewComments((prev) => ({
      ...prev,
      [taskId]: text,
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
      <h2 className="text-2xl font-bold mb-6">
        Tareas de {month.charAt(0).toUpperCase() + month.slice(1)}
      </h2>
      {Object.entries(tasksByCategory).map(([categoria, tasks]) => (
        <div key={categoria} className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{categoria}</h3>
          {tasks.map((task: Tarea) => (
            <div
              key={task._id}
              className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-xs text-gray-500 mt-1">
                    Año: {task.meses[0].mes.split("-")[0]}
                  </p>
                  <h4 className="text-lg font-semibold">
                    {task.pos} - {task.equipo} - {task.area}
                  </h4>
                  <p className="text-md">Servicios: {task.servicios}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${getStatusColor(task.status)}`}
                >
                  {task.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">Description: {task.description}</p>
              <div className="mt-4">
                <h5 className="font-medium mb-2">Comentarios</h5>
                {task.comments && task.comments.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {task.comments.map((comment, index) => (
                      <div key={index} className=" flex space-x-2" >
                        <button onClick={ () => deleteComment(task._id, comment._id) } >
                          <IoTrashOutline />
                        </button>
                      <div
                        key={index}
                        className="bg-gray-100 p-2 rounded text-sm"
                      >
                        <span className="font-semibold">Usuario: </span>
                        <span className="text-gray-600">
                          (
                          {format(
                            new Date(comment.createdAt || new Date()),
                            "dd MMM HH:mm",
                            { locale: es },
                          )}
                          )
                        </span>
                        <p className="mt-1">{comment.text}</p>
                      </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">
                    No hay comentarios
                  </p>
                )}
                <div className="flex mt-2">
                  <input
                    type="text"
                    placeholder="Añadir comentario..."
                    className="flex-grow border rounded-l p-2 text-sm"
                    value={newComments[task._id || ""] || ""}
                    onChange={(e) =>
                      handleCommentChange(task._id || "", e.target.value)
                    }
                  />
                  <button
                    className="bg-blue-500 text-white px-4 rounded-r text-sm hover:bg-blue-600 transition-colors duration-200"
                    onClick={() => task._id && addComment(task._id)}
                    disabled={
                      !newComments[task._id || ""] ||
                      !newComments[task._id || ""].trim()
                    }
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
