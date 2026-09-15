import { Prisma, PrismaClient } from '@prisma/client'
import { loadEnvConfig } from '@next/env'
import { ANCHOR_ID, buildDemo, Dataset, Model, MODELS, PREFIX } from './demo-data'

export type Row = { id: string; createdAt: Date; [key: string]: unknown }
// Only this adapter erases delegate-specific types; fixture create inputs remain Prisma-checked.
export function table(tx: Prisma.TransactionClient, model: Model) {
  return tx[model] as unknown as {
    findMany(args?: object): Promise<Row[]>
    create(args: { data: object }): Promise<Row>
  }
}
export function validateTarget(raw: string | undefined): string {
  if (!raw) throw new Error('DATABASE_URL eksik.')
  let url: URL
  try { url = new URL(raw) } catch { throw new Error('DATABASE_URL geçersiz.') }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.port !== '5477' || url.pathname !== '/aidat_takip') {
    throw new Error('Demo yalnızca localhost/127.0.0.1/::1:5477/aidat_takip hedefini kabul eder.')
  }
  for (const [key, value] of Array.from(url.searchParams)) {
    if (key === 'schema' && value === 'public') continue
    if (['connection_limit', 'pool_timeout', 'connect_timeout'].includes(key) && /^\d+$/.test(value)) continue
    throw new Error('Demo bağlantısında izin verilmeyen URL parametresi var.')
  }
  return raw
}
export function connectDemo() {
  loadEnvConfig(process.cwd())
  const url = validateTarget(process.env.DATABASE_URL)
  return new PrismaClient({ datasources: { db: { url } } })
}
export async function inventory(tx: Prisma.TransactionClient) {
  const result = {} as Record<Model, Row[]>
  for (const model of MODELS) result[model] = await table(tx, model).findMany()
  return result
}
export async function prepare(tx: Prisma.TransactionClient, now = new Date()) {
  const target = await tx.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`
  if (target[0]?.name !== 'aidat_takip') throw new Error('Bağlı veritabanı adı uygun değil.')
  const rows = await inventory(tx)
  const admin = rows.user.find(u => u.role === 'ADMIN' && u.isActive && !u.id.startsWith(PREFIX))
  if (!admin) throw new Error('Mevcut etkin yönetici bulunamadı; demo yönetici oluşturmaz.')
  const first = rows.branch.find(b => b.id === ANCHOR_ID)
  if (!first && MODELS.some(m => rows[m].some(r => r.id.startsWith(PREFIX)))) throw new Error('Demo referans şubesi eksik; tarih güvenle belirlenemiyor.')
  const anchor = first?.createdAt ?? now
  const data = buildDemo(anchor, admin.id)
  const conflicts: string[] = []
  const natural: Partial<Record<Model, string[][]>> = {
    branch: [['name']], group: [['name']], user: [['email']], trainer: [['name']], field: [['branchId', 'name']], location: [['branchId', 'name']], feeType: [['name', 'groupId']],
    userGroupPermission: [['userId', 'groupId']], attendance: [['sessionId', 'studentId']],
    attendanceAnalytics: [['studentId', 'month', 'year']], trainingException: [['groupId', 'date']], trainingSession: [['groupId', 'date']]
  }
  const same = (a: unknown, b: unknown) => a instanceof Date ? a.toISOString() === (b instanceof Date ? b.toISOString() : b) : (a ?? null) === (b ?? null)
  for (const model of MODELS) {
    const expected = data[model] as unknown as Row[]
    for (const row of rows[model].filter(r => r.id.startsWith(PREFIX))) {
      if (!expected.some(e => e.id === row.id) || +row.createdAt !== +anchor) conflicts.push(`${model}: kimlik/köken çakışması ${row.id}`)
    }
    for (const item of expected) for (const keys of natural[model] ?? []) {
      if (rows[model].some(r => r.id !== item.id && keys.every(k => same(r[k], item[k])))) conflicts.push(`${model}: ${keys.join('+')} çakışması (${item.id})`)
    }
  }
  if (conflicts.length) throw new Error(conflicts.join('\n'))
  const missing = {} as Dataset
  for (const model of MODELS) {
    const ids = new Set(rows[model].map(r => r.id))
    ;(missing[model] as object[]) = data[model].filter(r => !ids.has(r.id))
  }
  const settings = await tx.systemSetting.findMany()
  if (settings.length > 1) throw new Error('Birden fazla SystemSetting var; varsayılan okul adı belirsiz.')
  return { data, rows, missing, anchor, settings }
}

export async function checkDemo(tx: Prisma.TransactionClient) {
  const { data, rows, anchor } = await prepare(tx)
  const errors: string[] = []
  for (const model of MODELS) {
    const actual = rows[model].filter(r => r.id.startsWith(PREFIX))
    for (const expected of data[model] as unknown as Row[]) {
      const found = actual.find(r => r.id === expected.id)
      if (!found) { errors.push(`${model}: eksik ${expected.id}`); continue }
      for (const [key, value] of Object.entries(expected)) {
        if (key === 'password' || key === 'parents') continue
        if (JSON.stringify(found[key] ?? null) !== JSON.stringify(value ?? null)) errors.push(`${model}: demo senaryosundan farklı ${expected.id}.${key}`)
      }
      if (model === 'user' && !/^\$2[aby]\$12\$/.test(String(found.password))) errors.push(`user: bcrypt biçimi uygun değil ${found.id}`)
    }
  }
  const students = await tx.student.findMany({ where: { id: { startsWith: PREFIX } }, include: { parents: true } })
  for (const student of students) {
    if (student.parents.length !== 1 || !student.parents[0].isPrimary || student.parents[0].id !== student.id.replace('student-', 'parent-')) errors.push(`student: iletişim ilişkisi ${student.id}`)
  }
  // Recompute analytics independently from persisted attendance and session records.
  const sessions = rows.trainingSession.filter(s => s.id.startsWith(PREFIX))
  for (const stats of rows.attendanceAnalytics.filter(a => a.id.startsWith(PREFIX))) {
    const student = students.find(s => s.id === stats.studentId)!
    const completed = sessions.filter(s => s.groupId === student?.groupId && s.status === 'COMPLETED')
    const monthSessions = completed.filter(s => { const d = s.date as Date; return d.getUTCMonth() + 1 === stats.month && d.getUTCFullYear() === stats.year })
    const records = rows.attendance.filter(a => a.studentId === stats.studentId && monthSessions.some(s => s.id === a.sessionId))
    const counts = { presentCount: 0, absentCount: 0, lateCount: 0, excusedCount: 0 }
    for (const record of records) {
      const field = ({ PRESENT: 'presentCount', ABSENT: 'absentCount', LATE: 'lateCount', EXCUSED: 'excusedCount' } as const)[record.status as 'PRESENT']
      if (field) counts[field]++
    }
    const latest = Math.max(...monthSessions.map(s => +(s.date as Date)))
    let consecutive = 0
    for (const session of completed.filter(s => +(s.date as Date) <= latest).sort((a, b) => +(b.date as Date) - +(a.date as Date)).slice(0, 10)) {
      const record = records.find(a => a.sessionId === session.id)
      if (record?.status === 'ABSENT') consecutive++
      else if (record) break
    }
    const percentage = records.length ? (counts.presentCount + counts.excusedCount) / records.length * 100 : 0
    if (stats.totalSessions !== records.length || Object.entries(counts).some(([k, v]) => stats[k] !== v) || Math.abs(Number(stats.attendancePercentage) - percentage) > 0.000001 || stats.consecutiveAbsences !== consecutive || stats.hasWarning !== (consecutive >= 3)) errors.push(`analytics: hesap uyumsuzluğu ${stats.id}`)
  }
  if (errors.length) throw new Error(errors.slice(0, 40).join('\n') + (errors.length > 40 ? `\n... toplam ${errors.length} fark` : ''))
  return { referenceDate: anchor.toISOString(), counts: Object.fromEntries(MODELS.map(m => [m, data[m].length])), result: 'PASS' }
}
export function safeFailure(error: unknown) {
  // Prisma connection errors can contain connection details; never print them.
  console.error(error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientInitializationError ? 'Veritabanı işlemi başarısız; demo transaction geri alındı veya bağlantı kurulamadı.' : error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/\S+/g, '[REDACTED]') : 'Demo işlemi başarısız.')
  process.exitCode = 1
}
