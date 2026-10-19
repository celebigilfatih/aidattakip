import { z } from 'zod'

export const staffDeviceLifetime = 30 * 24 * 60 * 60 * 1000
export const summaryGraceMs = 60 * 60 * 1000
export const financialRole = (role: string) => role === 'ADMIN' || role === 'ACCOUNTING'
export const summaryRuleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  weekdays: z.array(z.number().int().min(1).max(7)).min(1).max(7).transform(days => Array.from(new Set(days)).sort()),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  enabled: z.boolean().default(false),
  recipientIds: z.array(z.string().min(1).max(100)).min(1).max(500).transform(ids => Array.from(new Set(ids))),
})
const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
export function istanbulParts(date: Date) {
  return Object.fromEntries(formatter.formatToParts(date).filter(p => p.type !== 'literal').map(p => [p.type, p.value]))
}
export function localDateTime(day: string, time: string) {
  const anchor = new Date(day + 'T12:00:00Z'), p = istanbulParts(anchor)
  const offset = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - anchor.getTime()
  return new Date(new Date(day + 'T' + time + ':00Z').getTime() - offset)
}
export function istanbulDayStart(now: Date) {
  const p = istanbulParts(now)
  return localDateTime(`${p.year}-${p.month}-${p.day}`, '00:00')
}
export function summarySlots(weekdays: number[], time: string, after: Date, now: Date) {
  const a = istanbulParts(after), b = istanbulParts(now)
  const start = new Date(`${a.year}-${a.month}-${a.day}T12:00:00Z`)
  const end = new Date(`${b.year}-${b.month}-${b.day}T12:00:00Z`)
  const slots: Date[] = []
  for (let date = start; date <= end; date = new Date(date.getTime() + 86400000)) {
    if (!weekdays.includes(date.getUTCDay() || 7)) continue
    const slot = localDateTime(date.toISOString().slice(0, 10), time)
    if (slot > after && slot <= now) slots.push(slot)
  }
  return slots
}
