import { Prisma } from '@prisma/client'
import { connectDemo, safeFailure } from './demo-store'

const targetName = 'SporManage'
const replaceableNames = new Set(['Futbol Okulu', 'Demo Futbol Kulübü'])

async function main() {
  const args = process.argv.slice(2)
  if (args.some(arg => arg !== '--dry-run') || args.length > 1) {
    throw new Error('Kullanım: npm run demo:refresh-brand -- [--dry-run]')
  }

  const dryRun = args.includes('--dry-run')
  const db = connectDemo()

  try {
    const result = await db.$transaction(async tx => {
      if (dryRun) await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY')
      else await tx.$executeRaw`SELECT pg_advisory_xact_lock(54773077)`

      const target = await tx.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`
      if (target[0]?.name !== 'aidat_takip') throw new Error('Bağlı veritabanı adı uygun değil.')
      const settings = await tx.systemSetting.findMany()
      if (settings.length !== 1) throw new Error('Tek bir SystemSetting kaydı bekleniyordu.')

      const currentName = settings[0].schoolName
      if (currentName !== targetName && !replaceableNames.has(currentName)) {
        throw new Error(`Özel kulüp adı korunuyor: ${currentName}`)
      }
      const changed = currentName !== targetName
      if (changed && !dryRun) {
        await tx.systemSetting.update({ where: { id: settings[0].id }, data: { schoolName: targetName } })
      }

      return { mode: dryRun ? 'DRY_RUN' : 'COMMITTED', target: 'loopback:5477/aidat_takip', from: currentName, to: targetName, changed }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000, maxWait: 10000 })
    console.log(JSON.stringify(result, null, 2))
  } finally {
    await db.$disconnect()
  }
}

main().catch(safeFailure)
