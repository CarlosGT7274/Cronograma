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

const MONTHS_TO_SHOW = 12;
const CELL_WIDTH = 40;
const HEADER_HEIGHT = 80;
const ROW_HEIGHT = 50;

export const CalendarioTab: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Tarea | null>(null);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(event.target.value));
  };

  const handleSuccess = async () => {
    try {
      setLoading(true);
      const data = await TareaService.getTareas(); // Fetch fresh data
      setTareas(data);
      setModalOpen(false);
      setCurrentTask(null);
    } catch (err) {
      setError(
        "Error al actualizar las tareas. Por favor, intenta nuevamente.",
      );
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

  const months = eachMonthOfInterval({
    start: startDate,
    end: addMonths(startDate, MONTHS_TO_SHOW - 1),
  });

  type WeekNumbersResult = {
    [key: string]: number[];
  };

  function generateWeekNumbers(year: number): WeekNumbersResult {
    const finalResult: WeekNumbersResult = {};

    const adjustedStartDate: Date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1,
    );

    // Intervalo de 11 meses
    const meses = eachMonthOfInterval({
      start: adjustedStartDate,
      end: addMonths(adjustedStartDate, 11), // 11 meses en total
    });

    const allMonths = meses;

    allMonths.forEach((month) => {
      const key: string = month.toISOString().slice(0, 10); // Solo año y mes
      finalResult[key] = getWeeksInMonth(month.getFullYear(), month.getMonth());
      /* console.log(getWeeksInMonth(2025, 2)) */
      /* console.log(getWeeksInMonth(2025, 3)) */

    });


    return finalResult;
  }

  const monthWeeks = generateWeekNumbers(getYear(startDate));

  const allWeeks: Date[] = [];
  eachWeekOfInterval({
    start: new Date(startDate).setDate(1),
    end: addMonths(new Date(startDate).setDate(1), MONTHS_TO_SHOW),
  }).forEach((weekStart) => {
    allWeeks.push(weekStart); // Simplemente agrega los valores al arreglo
  });

  const getTaskPosition = (tarea: Tarea) => {
    let cells: Array<{ month: string; week: number; weekIndex: number }> = [];

    tarea.meses.forEach((mes) => {
      mes.semanas.forEach((semana) => {
        if (semana.estado) {
          // Encuentra el índice del mes en allWeeks
          let weekIndex = allWeeks.findIndex(
            (week) => format(week, "yyyy-MM") === mes.mes,
          );

          if (weekIndex !== -1) {
            weekIndex += semana.numero - 1;

            cells.push({
              month: mes.mes,
              week: semana.numero,
              weekIndex,
            });
          }
        }
      });
    });

    return cells;
  };

  type Comment = {
    text: string;
    createdAt: string;
    _id: string;
  };

  type Semana = {
    numero: number;
    estado: boolean;
    avance: string;
    color: string;
    _id: string;
  };

  type Mes = {
    mes: string; // "YYYY-MM"
    semanas: Semana[];
    _id: string;
  };

  type TasksByCategory = {
    [categoria: string]: Tarea[];
  };

  const deleteTarea = async (taskId: string) => {
    try {
      await TareaService.deleteTarea(taskId);

      setTareas((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };


  const tasksByCategory = useMemo<TasksByCategory>(() => {
    const grouped: TasksByCategory = {};
    tareas.forEach((tarea) => {
      if (!grouped[tarea.categoria]) {
        grouped[tarea.categoria] = [];
      }
      grouped[tarea.categoria].push(tarea);
    });
    return grouped;
  }, [tareas]);

  if (loading) {
    return <div className="p-6 text-center">Cargando tareas...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 ">
        <h2 className="text-2xl font-bold">Cronograma </h2>
        <div className="flex items-center gap-4">
          <input
            type="date"
            onChange={handleDateChange}
            className="px-3 py-2 border rounded-md"
          />
          <button
            className="bg-lime-400 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              setCurrentTask(null); // Aseguramos que no hay tarea seleccionada
              setModalOpen(true);
            }}
          >
            Nueva tarea
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div
          style={{
            width: `${allWeeks.length * CELL_WIDTH + 500}px`,
            overflowY: "auto",
            height: "80vh",
          }}
        >
          <div style={{ display: "flex" }}>
            <div style={{ width: "500px", flexShrink: 0 }}>
              <div
                style={{
                  height: `${HEADER_HEIGHT}px`,
                  display: "flex",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                {["Pos", "Equipo", "Área", "Servicios"].map((header, index) => (
                  <div
                    key={index}
                    className="font-bold p-2 flex items-center justify-center"
                    style={{ width: "125px", borderRight: "1px solid #e2e8f0" }}
                  >
                    {header}
                  </div>
                ))}
              </div>
              {Object.entries(tasksByCategory).map(([categoria, tareas]) => (
                <div key={categoria}>
                  <div className="bg-gray-100 py-2 px-4 font-semibold border-b border-gray-300">
                    {categoria}
                  </div>
                  {tareas.map((tarea) => (
                    <div
                      key={tarea._id}
                      className="flex h-[50px] border-b border-gray-200 group"
                    >
                      <div className="w-[125px] border-r border-gray-200 p-2 flex items-center justify-between relative">
                        <span>{tarea.pos}</span>
                        <div className="absolute right-2 transition-all flex bg-white shadow-sm rounded-md">
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
                              if (
                                window.confirm(
                                  "¿Seguro que quieres eliminar esta tarea?",
                                )
                              ) {
                                deleteTarea(tarea._id);
                              }
                            }}
                            title="Eliminar tarea"
                          >
                            <IoTrashOutline className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Otras columnas */}
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
                  ))}
                </div>
              ))}
            </div>
            <div>
              <div
                style={{
                  height: `${HEADER_HEIGHT}px`,
                  display: "flex",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
              
                {Object.entries(monthWeeks).map(([date, weeks]) => (
                  <div
                    key={date}
                    style={{
                      width: `${CELL_WIDTH * weeks.length}px`,
                      borderRight: "1px solid #e2e8f0",
                    }}
                  >
                    <div className="font-bold text-center py-2">
                      {/* {date} */}
                      {format(parseISO(date), "MMMM yyyy", { locale: es })}
                    </div>
                    
                    <div style={{ display: "flex" }}>
                      {weeks.map((sn) => (
                        <div
                          key={sn}
                          style={{
                            width: `${CELL_WIDTH}px`,
                            textAlign: "center",
                            borderRight: "1px solid #e2e8f0",
                          }}
                        >
                          <div>S{sn}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {Object.entries(tasksByCategory).map(
                ([categoria, categoriaTareas]) => (
                  <React.Fragment key={categoria}>
                    {/* Category Header Space */}
                    <div
                      className="bg-gray-100 border-b border-gray-300"
                      style={{ height: "40px" }}
                    />

                    {/* Category Tasks */}
                    {categoriaTareas.map((tarea, tareaIndex) => {
                      const cells = getTaskPosition(tarea);
                      return (
                        <div
                          key={tareaIndex}
                          style={{
                            height: `${ROW_HEIGHT}px`,
                            position: "relative",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          {/* Background cells */}
                          {allWeeks.map((_, weekIndex) => (
                            <div
                              key={weekIndex}
                              style={{
                                position: "absolute",
                                left: `${weekIndex * CELL_WIDTH}px`,
                                width: `${CELL_WIDTH}px`,
                                height: "100%",
                                borderRight: "1px solid #e2e8f0",
                                backgroundColor:
                                  weekIndex % 2 === 0 ? "#f9fafb" : "white",
                              }}
                            />
                          ))}

                          {/* Task cells */}
                          {cells.map((cell, cellIndex) => {
                            
                            const mes = tarea.meses.find(
                              (m) => m.mes === cell.month,
                            );
                            const semana = mes?.semanas.find(
                              (s) => s.numero === cell.week,
                            );

                              // console.log(semana?.color)

                            return (
                              <div
                                key={cellIndex}
                                style={{
                                  position: "absolute",
                                  left: `${cell.weekIndex * CELL_WIDTH}px`,
                                  width: `${CELL_WIDTH}px`,
                                  height: "80%",
                                  top: "10%",
                                  backgroundColor: semana?.color || "#3b82f6", // Usa el color de la semana o un color por defecto
                                  borderRadius: "4px",
                                  zIndex: 10,
                                }}
                                title={`${tarea.servicios}: ${cell.month} - Semana ${cell.week}`}
                                className="hover:opacity-80 transition-opacity duration-200"
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ),
              )}
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
