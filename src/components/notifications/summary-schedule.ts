export const summaryDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

export function summarySchedule(rule: { weekdays: number[]; time: string }) {
  return `${rule.weekdays.map(day => summaryDays[day - 1]).join(', ')} · ${rule.time}`
}
