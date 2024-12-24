"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  addMonths,
  format,
  eachMonthOfInterval,
  eachWeekOfInterval,
  startOfMonth,
  endOfMonth,
  getWeek,
  eachWeekendOfInterval,
  getYear,
  getMonth,
  startOfWeek,
  endOfWeek,
  areIntervalsOverlapping,
  addWeeks,
  isSameMonth,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { Tarea, TareaService } from "@/services/tareaService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import TaskModal from "@/components/inputs/crearTarea";
import { intlFormatDistanceWithOptions } from "date-fns/fp";

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
  function getLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Función para calcular las semanas de un mes
  function getWeeksInMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month, getLastDayOfMonth(year, month));
    const weeks = [];

    // Ajustar al lunes anterior si el mes no empieza en lunes
    let currentDate = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek !== 1) {
      // Si no es lunes
      currentDate.setDate(
        currentDate.getDate() -
          (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1),
      );
    }

    let weekCounter = 1;
    if (month === 0) {
      // Enero siempre empieza en semana 1
      weekCounter = 1;
    } else {
      // Calcular el número de semana basado en el mes
      const daysFromYearStart = Math.floor(
        (new Date(year, month, 1) - new Date(year, 0, 1)) /
          (24 * 60 * 60 * 1000),
      );
      weekCounter = Math.floor(daysFromYearStart / 7) + 1;
    }

    // Iterar por semanas hasta el fin del mes
    while (currentDate <= lastDay) {
      const endOfWeek = new Date(currentDate);
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
  function generateWeekNumbers(year) {

    const months = eachMonthOfInterval({
      start: startDate,
      end: addMonths(startDate, MONTHS_TO_SHOW - 1),
    });

    const result = {};

    // Generar semanas para cada mes
    months.forEach((monthName, index) => {
      result[monthName] = getWeeksInMonth(year, index);
    });

    // Reorganizar para que octubre sea el primer mes
    const finalResult = {};
    const octubreToDeciembre = ["OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    const eneroToSeptiembre = months.slice(0, 9);

    const mesesSiguientes = eachMonthOfInterval({
        start: startDate,
        end: addMonths(startDate, 2)
    });

    const mesesAnteriores = eachMonthOfInterval({
        start: subMonths(startDate, 9),
        end: subMonths(startDate, 1)
    });
    const allMonths = [...mesesSiguientes, ...mesesAnteriores];

    // console.log(mesesinicio)
    // console.log(restoMeses)
    // console.log(allMonths)
    
    // console.log(months)


    // months.forEach((month) => {
    //   console.log(finalResult)
    //   finalResult[month] = result[month];
    // });
    
    allMonths.forEach((month) => {
      // console.log(result)
        finalResult[month] = getWeeksInMonth(month.getFullYear(), month.getMonth());
    });

    return finalResult;
  }

  const monthWeeks = generateWeekNumbers(getYear(startDate));
  // console.log(monthWeeks)
  // const informacion = generateWeekNumbers(2025);
  // console.log(informacion)
  // Object.entries(informacion).forEach(([month, weeks]) => {
  //   console.log(`${month}: ${weeks.join(", ")}`);
  // });

  const getTaskPosition = (tarea: Tarea) => {
    let cells = [];

    tarea.meses.forEach((mes) => {
      mes.semanas.forEach((semana) => {
        if (semana.estado) {
          const weekIndex = allWeeks.findIndex(
            (week) => format(week, "yyyy-MM") === mes.mes,
          );

          if (weekIndex !== -1) {
            cells.push({
              month: mes.mes,
              week: semana.numero,
              weekIndex,
            });
          }
        }
      });
    });

    // console.log(cells);

    return cells;
  };

  const allWeeks = months.flatMap((month) =>
    eachWeekOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }),
  );

  console.log(allWeeks)

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      tareas.map((tarea) => ({
        Pos: tarea.pos,
        Equipo: tarea.equipo,
        Area: tarea.area,
        Servicios: tarea.servicios,
        FechaInicio: format(
          allWeeks[getTaskPosition(tarea).start],
          "dd/MM/yyyy",
        ),
        FechaFin: format(allWeeks[getTaskPosition(tarea).end], "dd/MM/yyyy"),
      })),
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, "Cronograma");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "cronograma_proyecto.xlsx");
  };

  if (loading) {
    return <div className="p-6 text-center">Cargando tareas...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Cronograma </h2>
        <input type="date" onChange={handleDateChange} />
        <div>
          <button onClick={() => setModalOpen(true)}>Nueva tarea</button>

          <TaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
        <button
          onClick={exportToExcel}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Exportar a Excel
        </button>
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
                      {format(new Date(date), "MMMM yyyy", { locale: es })}
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
              {tareas.map((tarea, tareaIndex) => {
                const cells = getTaskPosition(tarea);
                console.log();
                return (
                  <div
                    key={tareaIndex}
                    style={{
                      height: `${ROW_HEIGHT}px`,
                      position: "relative",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    {allWeeks.map((_, weekIndex) => (
                      
                      <div
                        key={weekIndex}
                        style={{
                          position: "absolute",
                          left: `${weekIndex * CELL_WIDTH}px`,
                          width: `${CELL_WIDTH}px`,
                          height: "100%",
                          borderRight: "1px solid #e2e8f0",
                          borderBottom: "1px solid #e2e8f0",
                          backgroundColor:
                            weekIndex % 2 === 0 ? "#f9fafb" : "white",
                        }}
                      />
                    ))}

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
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
