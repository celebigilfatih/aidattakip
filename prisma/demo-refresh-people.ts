import { Prisma } from '@prisma/client'
import { buildDemo } from './demo-data'
import { connectDemo, prepare, safeFailure } from './demo-store'

type PersonRow = { id: string; firstName: string; lastName: string }
type TrainerRow = { id: string; name: string }

function hasLegacyDemoName(person: PersonRow) {
  return /demo/i.test(`${person.firstName} ${person.lastName}`)
}

function hasLegacyDemoTrainerName(trainer: TrainerRow) {
  return /demo/i.test(trainer.name)
}

async function main() {
  const args = process.argv.slice(2)
  if (args.some(arg => arg !== '--dry-run') || args.length > 1) {
    throw new Error('Kullanım: npm run demo:refresh-people -- [--dry-run]')
  }

  const dryRun = args.includes('--dry-run')
  const db = connectDemo()

  try {
    const result = await db.$transaction(async tx => {
      if (dryRun) await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY')
      else await tx.$executeRaw`SELECT pg_advisory_xact_lock(54773077)`

      const { rows, anchor } = await prepare(tx)
      const admin = rows.user.find(user => user.role === 'ADMIN' && user.isActive && !user.id.startsWith('demo-v1-'))
      if (!admin) throw new Error('Mevcut etkin yönetici bulunamadı.')

      const expected = buildDemo(anchor, admin.id)
      const students = new Map(rows.student.map(row => [row.id, row as unknown as PersonRow]))
      const parents = new Map(rows.parent.map(row => [row.id, row as unknown as PersonRow]))
      const trainers = new Map(rows.trainer.map(row => [row.id, row as unknown as TrainerRow]))
      const missingPeople = [
        ...expected.student.filter(person => !students.has(person.id)).map(person => `sporcu:${person.id}`),
        ...expected.parent.filter(person => !parents.has(person.id)).map(person => `veli:${person.id}`),
        ...expected.trainer.filter(person => !trainers.has(person.id)).map(person => `antrenör:${person.id}`),
      ]
      if (missingPeople.length) throw new Error(`Eksik demo kişi kaydı: ${missingPeople.slice(0, 10).join(', ')}`)
      const studentUpdates = expected.student.filter(person => hasLegacyDemoName(students.get(person.id)!))
      const parentUpdates = expected.parent.filter(person => hasLegacyDemoName(parents.get(person.id)!))
      const trainerUpdates = expected.trainer.filter(person => hasLegacyDemoTrainerName(trainers.get(person.id)!))

      if (!dryRun) {
        for (const person of studentUpdates) {
          await tx.student.update({ where: { id: person.id }, data: { firstName: person.firstName, lastName: person.lastName } })
        }
        for (const person of parentUpdates) {
          await tx.parent.update({ where: { id: person.id }, data: { firstName: person.firstName, lastName: person.lastName } })
        }
        for (const trainer of trainerUpdates) {
          await tx.trainer.update({ where: { id: trainer.id }, data: { name: trainer.name } })
        }
      }

      return {
        mode: dryRun ? 'DRY_RUN' : 'COMMITTED',
        target: 'loopback:5477/aidat_takip',
        students: { scanned: expected.student.length, renamed: studentUpdates.length },
        guardians: { scanned: expected.parent.length, renamed: parentUpdates.length },
        technicalStaff: { scanned: expected.trainer.length, renamed: trainerUpdates.length },
        alreadyPersonalizedOrCustomized: expected.student.length - studentUpdates.length
          + expected.parent.length - parentUpdates.length + expected.trainer.length - trainerUpdates.length,
      }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000, maxWait: 10000 })
    console.log(JSON.stringify(result, null, 2))
  } finally {
    await db.$disconnect()
  }
}

main().catch(safeFailure)
