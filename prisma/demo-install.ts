import { Prisma } from '@prisma/client'
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { MODELS } from './demo-data'
import { prepare, table } from './demo-store'

export async function installDemo(tx: Prisma.TransactionClient, dryRun = false) {
      const { missing, rows, anchor, settings } = await prepare(tx)
      const counts = Object.fromEntries(MODELS.map(m => [m, { existing: rows[m].length, create: missing[m].length }]))
      const credentials: { email: string; password: string }[] = []
      if (!dryRun) {
        for (const model of MODELS) for (const row of missing[model]) {
          let payload: object = row
          if (model === 'user') {
            const password = randomBytes(18).toString('base64url')
            payload = { ...row, password: await bcrypt.hash(password, 12) }
            credentials.push({ email: (row as { email: string }).email, password })
          }
          await table(tx, model).create({ data: payload })
        }
        if (settings[0]) {
          const settingChanges: { schoolName?: string; schoolEmail?: string } = {}
          if (settings[0].schoolName === 'Futbol Okulu') settingChanges.schoolName = 'SporManage'
          if (settings[0].schoolEmail === 'info@futbolokulu.com') settingChanges.schoolEmail = 'info@spormanage.example'
          if (Object.keys(settingChanges).length) await tx.systemSetting.update({ where: { id: settings[0].id }, data: settingChanges })
        } else {
          await tx.systemSetting.create({ data: { id: 'demo-v1-settings', schoolName: 'SporManage', schoolEmail: 'info@spormanage.example' } })
        }
      }
      const defaultNameChanges = settings[0]?.schoolName === 'Futbol Okulu'
      const defaultEmailChanges = settings[0]?.schoolEmail === 'info@futbolokulu.com'
      return { mode: dryRun ? 'DRY_RUN' : 'COMMITTED', target: 'loopback:5477/aidat_takip', referenceDate: anchor.toISOString(), counts, settings: defaultNameChanges || defaultEmailChanges ? 'Varsayılan SporManage ayarları uygulanacak' : 'Mevcut ayarlar korunur', credentials }
}
