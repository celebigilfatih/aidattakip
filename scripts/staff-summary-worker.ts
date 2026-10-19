import { runStaffSummaryWorker } from '../src/lib/staff-summary-service'
import { prisma } from '../src/lib/prisma'

runStaffSummaryWorker().then(result => console.log(JSON.stringify(result))).catch(() => {
  console.error('Personel özet işleyicisi başarısız. Çalışma geçmişini inceleyin; otomatik tekrar gönderilmedi.')
  process.exitCode = 1
}).finally(() => prisma.$disconnect())
