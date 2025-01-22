"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  addMonths,
  format,
  eachMonthOfInterval,
  eachWeekOfInterval,
  getYear,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { Tarea, TareaService } from "@/services/tareaService";
import TaskModal from "@/components/inputs/crearTarea";
import { getWeeksInMonth } from "@/utils/dateutils";
import { MdOutlineEditCalendar } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import { useAuth } from "@/contexts/AuthContext";

const MONTHS_TO_SHOW = 12;
const CELL_WIDTH = 40;
const HEADER_HEIGHT = 80;
const ROW_HEIGHT = 75;

export const CalendarioTab: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Tarea | null>(null);

  const { user } = useAuth();

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(event.target.value));
  };

  const handleSuccess = async () => {
    try {
      setLoading(true);
      const data = await TareaService.getTareas();
      setTareas(data);
      setModalOpen(false);
      setCurrentTask(null);
    } catch (err) {
      setError("Error al actualizar las tareas. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTareas = async () => {
      try {
        setLoading(true);
        const data = await TareaService.getTareas();
        setTareas(data);
      } catch (err) {
        setError("Error al cargar las tareas. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchTareas();
  }, []);

  function generateWeekNumbers(year: number): { [key: string]: number[] } {
    const finalResult: { [key: string]: number[] } = {};
    const adjustedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    const meses = eachMonthOfInterval({
      start: adjustedStartDate,
      end: addMonths(adjustedStartDate, 11),
    });

    meses.forEach((month) => {
      const key = month.toISOString().slice(0, 10);
      finalResult[key] = getWeeksInMonth(month.getFullYear(), month.getMonth());
    });

    return finalResult;
  }

  const monthWeeks = generateWeekNumbers(getYear(startDate));

  const allWeeks = useMemo(() => {
    const weeks: Date[] = [];
    eachWeekOfInterval({
      start: new Date(startDate).setDate(1),
      end: addMonths(new Date(startDate).setDate(1), MONTHS_TO_SHOW),
    }).forEach((weekStart) => {
      weeks.push(weekStart);
    });
    return weeks;
  }, [startDate]);

  const getTaskPosition = (tarea: Tarea) => {
    const cells: Array<{ month: string; week: number; weekIndex: number }> = [];

    tarea.meses.forEach((mes) => {
      mes.semanas.forEach((semana) => {
        if (semana.estado) {
          const weekIndex = allWeeks.findIndex(
            (week) => format(week, "yyyy-MM") === mes.mes
          );

          if (weekIndex !== -1) {
            cells.push({
              month: mes.mes,
              week: semana.numero,
              weekIndex: weekIndex + semana.numero - 1,
            });
          }
        }
      });
    });

    return cells;
  };

  const tasksByCategory = useMemo(() => {
    const grouped: { [categoria: string]: Tarea[] } = {};
    tareas.forEach((tarea) => {
      if (!grouped[tarea.categoria]) {
        grouped[tarea.categoria] = [];
      }
      grouped[tarea.categoria].push(tarea);
    });
    return grouped;
  }, [tareas]);

  const deleteTarea = async (taskId: string) => {
    try {
      await TareaService.deleteTarea(taskId);
      setTareas((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6 text-center">Cargando tareas...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Cronograma</h2>
        <div className="flex items-center gap-4">
          <input
            type="date"
            onChange={handleDateChange}
            className="px-3 py-2 border rounded-md"
          />
          <button
            className="bg-lime-400 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              setCurrentTask(null);
              setModalOpen(true);
            }}
          >
            Nueva tarea
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div style={{ height: "calc(80vh - 100px)" }} className="relative">
          {/* Contenedor principal con scroll */}
          <div className="overflow-x-auto overflow-y-auto h-full">
            <div style={{ width: `${allWeeks.length * CELL_WIDTH + 500}px` }}>
              {/* Headers fijos */}
              <div className="sticky top-0 z-50 bg-white">
                <div style={{ height: `${HEADER_HEIGHT}px`, display: "flex" }}>
                  {/* Headers de columnas fijas */}
                  <div style={{ width: "500px", display: "flex" }} className="border-b border-gray-200" >
                    {["Pos", "Equipo", "Área", "Servicios"].map((header) => (
                      <div
                        key={header}
                        className="font-bold p-2 flex items-center justify-center border-r border-gray-200"
                        style={{ width: "125px" }}
                      >
                        {header}
                      </div>
                    ))}
                  </div>
                  
                  {/* Headers de meses y semanas */}
                  <div style={{ display: "flex" }} className="border-b border-gray-200" >
                    {Object.entries(monthWeeks).map(([date, weeks]) => (
                      <div
                        key={date}
                        style={{ width: `${CELL_WIDTH * weeks.length}px` }}
                        className="border-r border-gray-200"
                      >
                        <div className="font-bold text-center py-2">
                          {format(parseISO(date), "MMMM yyyy", { locale: es })}
                        </div>
                        <div style={{ display: "flex" }}>
                          {weeks.map((sn) => (
                            <div
                              key={sn}
                              style={{ width: `${CELL_WIDTH}px` }}
                              className="text-center border-r border-gray-200"
                            >
                              S{sn}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contenido de tareas */}
              <div>
                {Object.entries(tasksByCategory).map(([categoria, categoriaTareas], categoryIndex) => (
                  <div key={categoria} className="relative">
                    {/* Categoría sticky */}
                    <div 
                      className="sticky z-40 bg-gray-100 py-2 px-4 font-semibold border-b border-gray-300 shadow-sm" 
                      style={{ top: `${HEADER_HEIGHT}px` }}
                    >
                      {categoria}
                    </div>
                    {/* Tareas de la categoría */}
                    {categoriaTareas.map((tarea, tareaIndex) => (
                      <div
                        key={tarea._id}
                        className="flex border-b border-gray-200"
                        style={{ height: `${ROW_HEIGHT}px` }}
                      >
                        {/* Columnas fijas */}
                        <div style={{ width: "500px", display: "flex" }} className="bg-white">
                          <div className="w-[125px] border-r border-gray-200 p-2 flex items-center justify-between relative">
                            <span>{tarea.pos}</span>
                            <div className="absolute right-2 transition-all flex bg-white shadow-sm rounded-md">
                              {user?.roles.some(role => role.nombre === "admin") && (
                                <>
                                  <button
                                    className="p-1.5 hover:bg-gray-100 rounded-l-md transition-colors"
                                    onClick={() => {
                                      setCurrentTask(tarea);
                                      setModalOpen(true);
                                    }}
                                    title="Editar tarea"
                                  >
                                    <MdOutlineEditCalendar className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-r-md transition-colors border-l border-gray-100"
                                    onClick={() => {
                                      if (window.confirm("¿Seguro que quieres eliminar esta tarea?")) {
                                        deleteTarea(tarea._id);
                                      }
                                    }}
                                    title="Eliminar tarea"
                                  >
                                    <IoTrashOutline className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="w-[125px] border-r border-gray-200 p-2 flex items-center justify-center">
                            {tarea.equipo}
                          </div>
                          <div className="w-[125px] border-r border-gray-200 p-2 flex items-center justify-center">
                            {tarea.area}
                          </div>
                          <div className="w-[125px] border-r border-gray-200 p-2 flex items-center justify-center">
                            {tarea.servicios}
                          </div>
                        </div>

                        {/* Grid de semanas */}
                        <div className="relative flex-1 border-b border-gray-200" style={{ height: `${ROW_HEIGHT}px` }}>
                          {allWeeks.map((_, weekIndex) => (
                            <div
                              key={weekIndex}
                              style={{
                                position: "absolute",
                                left: `${weekIndex * CELL_WIDTH}px`,
                                width: `${CELL_WIDTH}px`,
                                height: "100%",
                                borderRight: "1px solid #e2e8f0",
                                backgroundColor: weekIndex % 2 === 0 ? "#f9fafb" : "white",
                              }}
                            />
                          ))}
                          
                          {getTaskPosition(tarea).map((cell, cellIndex) => {
                            const mes = tarea.meses.find((m) => m.mes === cell.month);
                            const semana = mes?.semanas.find((s) => s.numero === cell.week);

                            return (
                              <div
                                key={`${cell.month}-${cell.week}-${cellIndex}`}
                                style={{
                                  position: "absolute",
                                  left: `${cell.weekIndex * CELL_WIDTH}px`,
                                  width: `${CELL_WIDTH}px`,
                                  height: "80%",
                                  top: "10%",
                                  backgroundColor: semana?.color || "#3b82f6",
                                  borderRadius: "4px",
                                  zIndex: 10,
                                }}
                                className="hover:opacity-80 transition-opacity duration-200"
                                title={`${tarea.servicios}: ${cell.month} - Semana ${cell.week}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentTask(null);
        }}
        initialData={currentTask}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
