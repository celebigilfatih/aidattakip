// Run only inside the existing demo container. Emits digests, never credentials or contacts.
const { PrismaClient } = require('@prisma/client')
const { createHash } = require('node:crypto')
const db = new PrismaClient()
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
;(async () => {
  const [{ name }] = await db.$queryRaw`SELECT current_database() AS name`
  if (name !== 'spormanage_aidat_demo') throw Error('SporManage demo DB only')
  const tables = [
    ['users', () => db.user.findMany({ select: { id:true,name:true,role:true,isActive:true,branchId:true },orderBy:{id:'asc'} })],
    ['students', () => db.student.findMany({ select: { id:true,firstName:true,lastName:true,branchId:true,groupId:true,isActive:true,enrollmentDate:true },orderBy:{id:'asc'} })],
    ['parents', () => db.parent.findMany({ select: { id:true,firstName:true,lastName:true,phone:true,students:{select:{id:true},orderBy:{id:'asc'}} },orderBy:{id:'asc'} })],
    ['payments', () => db.payment.findMany({ select: { id:true,studentId:true,amount:true,paidAmount:true,dueDate:true,status:true },orderBy:{id:'asc'} })],
    ['groups', () => db.group.findMany({ select:{id:true,name:true,branchId:true,isActive:true},orderBy:{id:'asc'} })],
    ['notifications', () => db.notification.findMany({ select:{id:true,status:true,recipientId:true,summaryRunId:true},orderBy:{id:'asc'} })],
    ['rules', () => db.staffSummaryRule.findMany({ select:{id:true,name:true,enabled:true,archivedAt:true,time:true,weekdays:true,branchId:true,createdById:true,recipients:{select:{recipientId:true},orderBy:{recipientId:'asc'}}},orderBy:{id:'asc'} })],
    ['devices', () => db.pushDevice.findMany({ select:{id:true,recipientId:true,isActive:true,expiresAt:true},orderBy:{id:'asc'} })],
    ['recipients', () => db.notificationRecipient.findMany({ select:{id:true,isActive:true,staffPushEnabled:true,primaryDeviceId:true},orderBy:{id:'asc'} })],
    ['runs', () => db.staffSummaryRun.findMany({ select:{id:true,ruleId:true,status:true,accepted:true,failed:true,skipped:true},orderBy:{id:'asc'} })],
  ]
  const result = { database:name }
  for (const [label, read] of tables) { const rows=await read(); result[label]={count:rows.length,sha256:digest(rows)} }
  console.log(JSON.stringify(result))
})().catch(()=>{console.error('Demo guard failed');process.exitCode=1}).finally(()=>db.$disconnect())
