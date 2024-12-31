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

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(event.target.value));
    console.log(startDate);
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

  // Función para obtener el último día de un mes
  function getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  // Función para calcular las semanas de un mes
  function getWeeksInMonth(year: number, month: number): number[] {
    const firstDay: Date = new Date(year, month, 1);
    const lastDay: Date = new Date(year, month, getLastDayOfMonth(year, month));
    const weeks: number[] = [];

    // Ajustar al lunes anterior si el mes no empieza en lunes
    let currentDate: Date = new Date(firstDay);
    const firstDayOfWeek: number = firstDay.getDay();
    if (firstDayOfWeek !== 1) {
      // Si no es lunes
      currentDate.setDate(
        currentDate.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1),
      );
    }

    let weekCounter: number = 1;
    if (month === 0) {
      // Enero siempre empieza en semana 1
      weekCounter = 1;
    } else {
      // Calcular el número de semana basado en el mes
      const daysFromYearStart: number = Math.floor(
        (new Date(year, month, 1).getTime() - new Date(year, 0, 1).getTime()) /
          (24 * 60 * 60 * 1000),
      );
      weekCounter = Math.floor(daysFromYearStart / 7) + 1;
    }

    // Iterar por semanas hasta el fin del mes
    while (currentDate <= lastDay) {
      const endOfWeek: Date = new Date(currentDate);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      // Si la semana termina en este mes, agregarla
      if (endOfWeek.getMonth() === month) {
        weeks.push(weekCounter);
      }

      weekCounter++;
      currentDate.setDate(currentDate.getDate() + 7);

      // Reiniciar contador en la semana 53
      if (weekCounter > 52) weekCounter = 1;
    }

    return weeks;
  }

  type WeekNumbersResult = {
    [key: string]: number[];
  };

  function generateWeekNumbers(year: number): WeekNumbersResult {
    // const months = eachMonthOfInterval({
    //   start: startDate,
    //   end: addMonths(startDate, MONTHS_TO_SHOW - 1),
    // });
    //
    // const result = {};
    //
    // // Generar semanas para cada mes
    // months.forEach((monthName, index) => {
    //   result[monthName] = getWeeksInMonth(year, index);
    // });
    //
    // Reorganizar para que octubre sea el primer mes
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
    });

    return finalResult;
  }

  const monthWeeks = generateWeekNumbers(getYear(startDate));

  // const informacion = generateWeekNumbers(2025);
  // console.log(informacion)
  // Object.entries(informacion).forEach(([month, weeks]) => {
  //   console.log(`${month}: ${weeks.join(", ")}`);
  // });
  //
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

  // const allWeeks = months.flatMap((month) =>
  //   eachWeekOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }),
  // );
  //
  // const allWeeks = []
  //
  // months.forEach((monthName, index) => {
  //   const weeksNumber = getWeeksInMonth(getYear(startDate), index);
  //   [...weeksNumber].forEach((index) => {
  //     allWeeks[index] = eachWeekOfInterval( {start: startDate, end: addMonths(startDate, MONTHS_TO_SHOW - 1) })[index]
  //   })
  // })

type Comment = {
  text: string;
  createdAt: string;
  _id: string;
};

type Semana = {
  numero: number;
  estado: boolean;
  _id: string;
};

type Mes = {
  mes: string; // "YYYY-MM"
  semanas: Semana[];
  _id: string;
};

// type Tarea = {
//   _id: string;
//   pos: string;
//   equipo: string;
//   area: string;
//   servicios: string;
//   categoria: string;
//   meses: {
//     mes: string;
//     semanas: {
//       numero: number;
//       estado: boolean;
//       _id: string;
//     }[];
//     _id: string;
//   }[];
//   status: string;
//   description: string;
//   comments: {
//     text: string;
//     createdAt: string;
//     _id: string;
//   }[];
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
// };

type TasksByCategory = {
  [categoria: string]: Tarea[];
};
  const allWeeks: Date[] = [];
  eachWeekOfInterval({
    start: new Date(startDate).setDate(1),
    end: addMonths(new Date(startDate).setDate(1), MONTHS_TO_SHOW),
  }).forEach((weekStart) => {
    allWeeks.push(weekStart); // Simplemente agrega los valores al arreglo
  });

  const tasksByCategory = useMemo<TasksByCategory>(() => {
    const grouped: TasksByCategory = {};
    tareas.forEach((tarea) => {
      if (!grouped[tarea.categoria]) {
        grouped[tarea.categoria] = [];
      }
      grouped[tarea.categoria].push(tarea);
    });
    console.log(grouped)
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
        <input type="date" onChange={handleDateChange} />
        <div>
          <button
            className="bg-lime-400 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded"
            onClick={() => setModalOpen(true)}
          >
            Nueva tarea
          </button>

          <TaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
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
                  {tareas.map((tarea, index) => (
                    <div
                      key={index}
                      style={{
                        height: `${ROW_HEIGHT}px`,
                        display: "flex",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          width: "125px",
                          borderRight: "1px solid #e2e8f0",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {tarea.pos}
                      </div>
                      <div
                        style={{
                          width: "125px",
                          borderRight: "1px solid #e2e8f0",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {tarea.equipo}
                      </div>
                      <div
                        style={{
                          width: "125px",
                          borderRight: "1px solid #e2e8f0",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {tarea.area}
                      </div>
                      <div
                        style={{
                          width: "125px",
                          borderRight: "1px solid #e2e8f0",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
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
                          {cells.map((cell, cellIndex) => (
                            <div
                              key={cellIndex}
                              style={{
                                position: "absolute",
                                left: `${cell.weekIndex * CELL_WIDTH}px`,
                                width: `${CELL_WIDTH}px`,
                                height: "80%",
                                top: "10%",
                                backgroundColor: "#3b82f6",
                                borderRadius: "4px",
                                zIndex: 10,
                              }}
                              title={`${tarea.servicios}: ${cell.month} - Semana ${cell.week}`}
                              className="hover:opacity-80 transition-opacity duration-200"
                            />
                          ))}
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
    </div>
  );
};
