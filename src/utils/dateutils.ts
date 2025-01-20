import moment from 'moment';

// Función para obtener el último día de un mes
export function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// Función para calcular las semanas de un mes usando moment.js
export function getWeeksInMonth(year: number, month: number): number[] {
  const firstDay = moment(new Date(year, month, 1))
  const lastDay = moment(new Date(year, month, getLastDayOfMonth(year, month)))
  const weeks: number[] = []

  const currentDate = firstDay.clone()

  // Ajustar al lunes de la semana que contiene el primer día del mes
  currentDate.startOf("week")

  while (currentDate <= lastDay) {
    let weekNum = currentDate.isoWeek()

    // Manejar el caso especial de la semana 1 en diciembre
    if (weekNum === 1 && currentDate.month() === 11) {
      weekNum = 53
    }

    // Solo añadir la semana si el día actual está en el mes que nos interesa
    if (currentDate.month() === month) {
      if (!weeks.includes(weekNum)) {
        weeks.push(weekNum)
      }
    }

    currentDate.add(7, "days")
  }

  return weeks
}

console.log("Octubre 2024:", getWeeksInMonth(2024, 10))
