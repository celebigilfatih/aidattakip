import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { connectDemo, inventory, checkDemo } from './demo-store'
import { installDemo } from './demo-install'

// Read-only integration test. PostgreSQL rejects any attempted INSERT/UPDATE/DELETE.
// Missing-record repair and customized-value preservation are covered by demo.test.ts.
test('local demo: installed data passes and rerun attempts no writes or password changes', async () => {
  const db = connectDemo()
  try {
    await db.$transaction(async tx => {
      await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY')
      await checkDemo(tx)
      const snapshot = async () => {
        const rows = await inventory(tx)
        const sorted = Object.fromEntries(Object.entries(rows).map(([k, values]) => [k, values.sort((a, b) => a.id.localeCompare(b.id))]))
        return createHash('sha256').update(JSON.stringify({ rows: sorted, settings: await tx.systemSetting.findMany({ orderBy: { id: 'asc' } }) })).digest('hex')
      }
      const before = await snapshot()
      const result = await installDemo(tx)
      assert.ok(Object.values(result.counts).every(c => c.create === 0))
      assert.equal(result.credentials.length, 0)
      assert.equal(await snapshot(), before, 'all rows, timestamps and password hashes must stay unchanged')
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 30000 })
  } finally { await db.$disconnect() }
})
