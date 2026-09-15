import { Prisma } from '@prisma/client'
import { Model, MODELS, PREFIX } from './demo-data'
import { connectDemo, prepare, Row, safeFailure } from './demo-store'

const fieldsByModel: Partial<Record<Model, string[]>> = {
  branch: ['name', 'address'],
  field: ['name', 'location'],
  location: ['name', 'address'],
  trainer: ['biography'],
  user: ['email', 'name'],
  group: ['name', 'description'],
  parent: ['email'],
  groupHistory: ['reason'],
  feeType: ['name'],
  payment: ['referenceNumber', 'notes'],
  training: ['description'],
  trainingException: ['reason'],
  attendance: ['excuseReason'],
  note: ['title', 'content'],
  notification: ['title', 'message'],
}

const legacyExactValues = new Set(['Temsili antrenman sahası'])
const isLegacyValue = (value: unknown) => typeof value === 'string'
  && (/demo|futbol okulu|futbolokulu/i.test(value) || legacyExactValues.has(value))

function delegate(tx: Prisma.TransactionClient, model: Model) {
  return tx[model] as unknown as {
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>
  }
}

function assertNoNaturalKeyCollision(rows: Record<Model, Row[]>, model: Model, id: string, data: Record<string, unknown>) {
  const current = rows[model].find(row => row.id === id)
  if (!current) return
  const merged = { ...current, ...data }
  const keys: Partial<Record<Model, string[][]>> = {
    branch: [['name']],
    group: [['name']],
    user: [['email']],
    field: [['branchId', 'name']],
    location: [['branchId', 'name']],
    feeType: [['name', 'groupId']],
  }
  for (const naturalKey of keys[model] ?? []) {
    if (rows[model].some(row => row.id !== id && naturalKey.every(key => (row[key] ?? null) === (merged[key] ?? null)))) {
      throw new Error(`${model}: ${naturalKey.join('+')} hedef değeri başka kayıtla çakışıyor (${id})`)
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  if (args.some(arg => arg !== '--dry-run') || args.length > 1) {
    throw new Error('Kullanım: npm run demo:refresh-presentation -- [--dry-run]')
  }

  const dryRun = args.includes('--dry-run')
  const db = connectDemo()

  try {
    const result = await db.$transaction(async tx => {
      if (dryRun) await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY')
      else await tx.$executeRaw`SELECT pg_advisory_xact_lock(54773077)`

      const { data, rows, settings } = await prepare(tx)
      const updates: { model: Model; id: string; data: Record<string, unknown> }[] = []
      const customized: string[] = []

      for (const model of MODELS) {
        const fields = fieldsByModel[model]
        if (!fields) continue
        for (const expected of data[model] as unknown as Row[]) {
          const current = rows[model].find(row => row.id === expected.id)
          if (!current) throw new Error(`Eksik demo kaydı: ${model}:${expected.id}`)
          const changed: Record<string, unknown> = {}
          for (const field of fields) {
            const currentValue = current[field] ?? null
            const expectedValue = expected[field] ?? null
            if (currentValue === expectedValue) continue
            if (isLegacyValue(currentValue)) changed[field] = expected[field]
            else customized.push(`${model}:${expected.id}.${field}`)
          }
          if (Object.keys(changed).length) {
            assertNoNaturalKeyCollision(rows, model, expected.id, changed)
            updates.push({ model, id: expected.id, data: changed })
          }
        }
      }

      const activeAdmin = rows.user.find(user => user.role === 'ADMIN' && user.isActive && !user.id.startsWith(PREFIX))
      if (!activeAdmin) throw new Error('Mevcut etkin yönetici bulunamadı.')
      const targetAdminEmail = 'admin@spormanage.example'
      const adminEmail = String(activeAdmin.email ?? '')
      let adminEmailChange: { id: string; email: string } | null = null
      if (adminEmail === 'admin@futbolokulu.com') {
        if (rows.user.some(user => user.id !== activeAdmin.id && user.email === targetAdminEmail)) {
          throw new Error('Yönetici hedef e-postası başka kullanıcıyla çakışıyor.')
        }
        adminEmailChange = { id: activeAdmin.id, email: targetAdminEmail }
      } else if (adminEmail !== targetAdminEmail) {
        customized.push(`user:${activeAdmin.id}.email`)
      }

      if (settings.length !== 1) throw new Error('Tek bir SystemSetting kaydı bekleniyordu.')
      const settingChanges: Record<string, unknown> = {}
      if (settings[0].schoolName === 'Futbol Okulu' || settings[0].schoolName === 'Demo Futbol Kulübü') settingChanges.schoolName = 'SporManage'
      else if (settings[0].schoolName !== 'SporManage') customized.push(`systemSetting:${settings[0].id}.schoolName`)
      if (settings[0].schoolEmail === 'info@futbolokulu.com') settingChanges.schoolEmail = 'info@spormanage.example'
      else if (settings[0].schoolEmail !== 'info@spormanage.example') customized.push(`systemSetting:${settings[0].id}.schoolEmail`)

      if (!dryRun) {
        for (const update of updates) await delegate(tx, update.model).update({ where: { id: update.id }, data: update.data })
        if (adminEmailChange) await tx.user.update({ where: { id: adminEmailChange.id }, data: { email: adminEmailChange.email } })
        if (Object.keys(settingChanges).length) await tx.systemSetting.update({ where: { id: settings[0].id }, data: settingChanges })
      }

      const passwordHashesPreserved = dryRun || (await tx.user.findMany({ select: { id: true, password: true } })).every(user => {
        const before = rows.user.find(row => row.id === user.id)
        return before?.password === user.password
      })
      if (!passwordHashesPreserved) throw new Error('Parola hash bütünlüğü doğrulanamadı; transaction geri alındı.')

      const counts = Object.fromEntries(MODELS.map(model => [model, updates.filter(update => update.model === model).length]))
      return {
        mode: dryRun ? 'DRY_RUN' : 'COMMITTED',
        target: 'loopback:5477/aidat_takip',
        recordsToUpdate: updates.length + Number(Boolean(adminEmailChange)) + Number(Boolean(Object.keys(settingChanges).length)),
        counts,
        adminEmailChanged: Boolean(adminEmailChange),
        settingsChanged: Object.keys(settingChanges),
        passwordHashesPreserved,
        customizedFieldsPreserved: customized,
      }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000, maxWait: 10000 })
    console.log(JSON.stringify(result, null, 2))
  } finally {
    await db.$disconnect()
  }
}

main().catch(safeFailure)
