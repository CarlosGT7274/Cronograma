  // Función para obtener el último día de un mes
export function getLastDayOfMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  // Función para calcular las semanas de un mes

export function getWeeksInMonth(year: number, month: number): number[] {
    const firstDay: Date = new Date(year, month, 1);
    const lastDay: Date = new Date(year, month, getLastDayOfMonth(year, month));
    const weeks: number[] = [];

    let currentDate: Date = new Date(firstDay);
    const firstDayOfWeek: number = firstDay.getDay();
    
    // Adjust to the Monday of the week containing the 1st of the month
    currentDate.setDate(currentDate.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1));

    let weekCounter: number = getWeekNumber(currentDate, year);

    while (currentDate <= lastDay) {
        const endOfWeek: Date = new Date(currentDate);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        if (currentDate <= lastDay && currentDate.getMonth() === month) {
            weeks.push(weekCounter);
        }

        weekCounter++;
        if (weekCounter > 52) weekCounter = 1; // Reset to 1 if we go beyond week 52
        currentDate.setDate(currentDate.getDate() + 7);
    }

    // Ensure continuity between months
    if (month === 0) { // January
        if (weeks[0] > 1) {
            weeks.unshift(1); // Add week 1 at the beginning for January
        }
    } else if (weeks[0] === 1) {
        const lastWeekOfPrevMonth = getWeeksInMonth(year, month - 1).pop() || 52;
        weeks[0] = lastWeekOfPrevMonth === 52 ? 1 : lastWeekOfPrevMonth + 1;
    }

    return weeks;
}

function getWeekNumber(date: Date, year: number): number {
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    let weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay()) / 7);
    
    // Adjust for the fact that the first week might belong to the previous year
    if (weekNumber === 0) {
        weekNumber = getWeeksInYear(year - 1);
    }
    if (weekNumber > 52) weekNumber = 1;
    
    return weekNumber;
}

function getWeeksInYear(year: number): number {
    const lastDayOfYear = new Date(year, 11, 31);
    const lastWeekNumber = getWeekNumber(lastDayOfYear, year);
    return lastWeekNumber === 1 ? 52 : lastWeekNumber;
}



// function getLastDayOfMonth(year: number, month: number): number {
//     return new Date(year, month + 1, 0).getDate();
// }

