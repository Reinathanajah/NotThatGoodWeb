export interface MonthCell {
  dateKey: string
  dayNumber: number
  isCurrentMonth: boolean
}

export function toDateKey(year: number, month1to12: number, day: number): string {
  return `${year}-${String(month1to12).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Build a Monday-first month grid covering all weeks of the target calendar month. */
export function buildMondayFirstMonthGrid(year: number, month1to12: number): MonthCell[] {
  const firstDay = new Date(Date.UTC(year, month1to12 - 1, 1))
  const mondayBasedOffset = (firstDay.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(year, month1to12, 0)).getUTCDate()

  const prevMonthDate = new Date(Date.UTC(year, month1to12 - 1, 0))
  const prevYear = prevMonthDate.getUTCFullYear()
  const prevMonth = prevMonthDate.getUTCMonth() + 1
  const prevDays = prevMonthDate.getUTCDate()

  const cells: MonthCell[] = []
  for (let i = mondayBasedOffset - 1; i >= 0; i--) {
    const day = prevDays - i
    cells.push({
      dateKey: toDateKey(prevYear, prevMonth, day),
      dayNumber: day,
      isCurrentMonth: false,
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      dateKey: toDateKey(year, month1to12, d),
      dayNumber: d,
      isCurrentMonth: true,
    })
  }

  const nextMonthDate = new Date(Date.UTC(year, month1to12, 1))
  const nextYear = nextMonthDate.getUTCFullYear()
  const nextMonth = nextMonthDate.getUTCMonth() + 1
  let trailingDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({
      dateKey: toDateKey(nextYear, nextMonth, trailingDay),
      dayNumber: trailingDay,
      isCurrentMonth: false,
    })
    trailingDay += 1
  }

  return cells
}
