import { Prisma } from '@prisma/client'
import { connectDemo, safeFailure } from './demo-store'
import { installDemo } from './demo-install'

async function main() {
  const args = process.argv.slice(2)
  if (args.some(a => a !== '--dry-run') || args.length > 1) throw new Error('Kullanım: npm run demo:seed -- [--dry-run]')
  const dryRun = args.includes('--dry-run')
  const db = connectDemo()
  try {
    const result = await db.$transaction(async tx => {
      if (dryRun) await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY')
      else await tx.$executeRaw`SELECT pg_advisory_xact_lock(54773077)`
      return installDemo(tx, dryRun)
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 120000, maxWait: 10000 })
    console.log(JSON.stringify(result, null, 2))
    if (result.credentials.length) console.log('Yeni parolalar yalnızca bu kurulumda gösterilir. Güvenli saklayın; repository’ye kaydetmeyin.')
  } finally { await db.$disconnect() }
}
main().catch(safeFailure)
