import { Prisma } from '@prisma/client'
import { checkDemo, connectDemo, safeFailure } from './demo-store'
async function main() {
  const db = connectDemo()
  try {
    const result = await db.$transaction(async tx => {
      await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY')
      return checkDemo(tx)
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 30000 })
    console.log(JSON.stringify(result, null, 2))
  } finally { await db.$disconnect() }
}
main().catch(safeFailure)
