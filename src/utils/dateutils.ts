  // Función para obtener el último día de un mes
export function getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  // Función para calcular las semanas de un mes
export function getWeeksInMonth(year: number, month: number): number[] {
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
