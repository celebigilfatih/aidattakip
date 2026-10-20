import { createHash } from 'node:crypto'
import { z } from 'zod'
import { localDateTime, istanbulParts } from './staff-summary-policy'
import { NotificationError } from './notification-policy'

export const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(v+'T12:00:00Z'); return !isNaN(d.getTime()) && d.toISOString().slice(0,10)===v }, 'Geçerli tarih girin.')
export const dateValue = (v: string) => localDateTime(v, '00:00')
export function isoDay(date: Date) { const p = istanbulParts(date); return `${p.year}-${p.month}-${p.day}` }
export const seasonSchema = z.object({ id: z.string().optional(), expected: z.string().optional(), name: z.string().trim().min(1).max(100), startDate: dateOnly, endDate: dateOnly }).strict().refine(v=>v.startDate<=v.endDate, 'Bitiş başlangıçtan önce olamaz.')
export function seasonCharges(first: Date, end: Date, period: string, amount: number) {
  const startDay = isoDay(first), endDay = isoDay(end), [y,m,d] = startDay.split('-').map(Number)
  const intervals: Record<string,number> = { MONTHLY:1, QUARTERLY:3, SEMI_ANNUAL:6, YEARLY:12, ONE_TIME:0 }
  if (!(period in intervals) || !Number.isFinite(amount) || amount<=0 || startDay>endDay) throw new NotificationError(400, 'Ücret, dönem ve ilk vadeyi kontrol edin.')
  const rows: { installment: number; amount: number; dueDate: Date }[] = []
  for(let i=0; i<120; i++) {
    const anchor = new Date(Date.UTC(y,m-1+i*intervals[period],1)), last = new Date(Date.UTC(anchor.getUTCFullYear(),anchor.getUTCMonth()+1,0)).getUTCDate()
    const day = `${anchor.getUTCFullYear()}-${String(anchor.getUTCMonth()+1).padStart(2,'0')}-${String(Math.min(d,last)).padStart(2,'0')}`
    if(day>endDay) break
    rows.push({ installment:i+1,amount,dueDate:dateValue(day) })
    if(!intervals[period])break
    if(i===119)throw new NotificationError(400,'Sezon en fazla 120 aidat içerebilir.')
  }
  return rows
}
export const fingerprint = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
