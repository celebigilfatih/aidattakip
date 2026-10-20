import { Prisma, type User } from '@prisma/client'
import { prisma } from './prisma'
import { branchScope, checkBranch, checkGroup, finance, liveActor, type ClubDB } from './club-access'
import { NotificationError } from './notification-policy'
import { fingerprint, seasonCharges } from './season-policy'

export const enrollmentInclude = { student: { select: { id: true, firstName: true, lastName: true, branchId: true, groupId: true, isActive: true, updatedAt: true } }, season: true, targetGroup: true, feeType: true } satisfies Prisma.SeasonEnrollmentInclude
export async function listEnrollments(user: User, seasonId: string) {
  const rows = await prisma.seasonEnrollment.findMany({ where: { seasonId, student: branchScope(user) }, include: enrollmentInclude, orderBy: [{ student: { lastName: 'asc' } },{ id:'asc' }] })
  return rows.map(row => { const { feeType,feeTypeId,plannedAmount,firstDueDate,approvedAt,...safe } = row; return { ...safe, ...(finance(user) ? { feeType,feeTypeId,plannedAmount,firstDueDate,approvedAt } : {}) } })
}
async function lockedEnrollment(db: ClubDB, user: User, id: string) {
  await db.$queryRaw`SELECT id FROM season_enrollments WHERE id = ${id} FOR UPDATE`
  const e = await db.seasonEnrollment.findFirst({ where: { id, student: branchScope(user) }, include: enrollmentInclude })
  if(!e)throw new NotificationError(404,'Sezon kaydı bulunamadı.')
  await checkBranch(db,user,e.student.branchId)
  return e
}
async function buildPreview(db: ClubDB,user: User,id: string) {
  let e = await lockedEnrollment(db,user,id)
  await db.$queryRaw`SELECT id FROM seasons WHERE id = ${e.seasonId} FOR SHARE`
  if(e.targetGroupId)await db.$queryRaw`SELECT id FROM groups WHERE id = ${e.targetGroupId} FOR SHARE`
  if(e.feeTypeId)await db.$queryRaw`SELECT id FROM fee_types WHERE id = ${e.feeTypeId} FOR SHARE`
  await db.$queryRaw`SELECT id FROM students WHERE id = ${e.studentId} FOR SHARE`
  e = await lockedEnrollment(db,user,id)
  if(e.approvedAt) return { id:e.id, studentName:`${e.student.firstName} ${e.student.lastName}`, approved:true, token:'', charges:await db.payment.findMany({ where:{seasonEnrollmentId:e.id},select:{amount:true,dueDate:true,seasonInstallment:true} }) }
  if(e.decision!=='CONTINUING'||!e.student.isActive||!e.feeType||!e.plannedAmount||!e.firstDueDate||!e.targetGroupId)throw new NotificationError(400,`${e.student.firstName}: Aktif sporcu, Devam edecek kararı, hedef grup ve ücret planı gerekir.`)
  await checkGroup(db,user,e.targetGroupId,e.student.branchId!)
  if(!e.feeType.isActive || (e.feeType.groupId&&e.feeType.groupId!==e.targetGroupId))throw new NotificationError(400,'Ücret türü hedef gruba uygun değil.')
  if(e.firstDueDate<e.season.startDate||e.firstDueDate>e.season.endDate)throw new NotificationError(400,'İlk vade sezon aralığında olmalıdır.')
  const charges=seasonCharges(e.firstDueDate,e.season.endDate,e.feeType.period,e.plannedAmount)
  return {id:e.id,studentName:`${e.student.firstName} ${e.student.lastName}`,approved:false,token:fingerprint({enrollment:e.updatedAt,student:e.student,season:e.season,group:e.targetGroup,fee:e.feeType,charges}),charges}
}
export async function previewSeason(user: User,ids: string[]) {
  return prisma.$transaction(async tx=>{ await liveActor(tx,user); const result=[];for(const id of [...ids].sort())result.push(await buildPreview(tx,user,id));return result },{timeout:30000})
}
export async function approveSeason(user: User,items: {id:string;token:string}[]) {
  return prisma.$transaction(async tx=>{
    await liveActor(tx,user)
    const result=[]
    for(const item of [...items].sort((a,b)=>a.id.localeCompare(b.id))) {
      const preview=await buildPreview(tx,user,item.id)
      if(preview.approved){result.push({id:item.id,alreadyApproved:true});continue}
      if(preview.token!==item.token)throw new NotificationError(409,'Önizleme değişti. Güncel önizlemeyi açıp yeniden onaylayın.')
      const e=await tx.seasonEnrollment.findUniqueOrThrow({where:{id:item.id}})
      await tx.payment.createMany({data:preview.charges.map((c,i)=>({studentId:e.studentId,feeTypeId:e.feeTypeId!,amount:c.amount,dueDate:c.dueDate,paidAmount:0,createdById:user.id,seasonEnrollmentId:e.id,seasonInstallment:i+1,notes:'Sezon aidatı',referenceNumber:`SEASON_${e.id}`}))})
      await tx.seasonEnrollment.update({where:{id:e.id},data:{approvedAt:new Date()}})
      result.push({id:e.id,created:preview.charges.length})
    }
    return result
  },{timeout:30000})
}
export async function activateSeason(user: User,ids: string[],now=new Date()) {
  return prisma.$transaction(async tx=>{
    await liveActor(tx,user)
    const results=[]
    for(const id of [...ids].sort()) {
      const e=await lockedEnrollment(tx,user,id)
      await tx.$queryRaw`SELECT id FROM seasons WHERE id = ${e.seasonId} FOR SHARE`
      e.season=await tx.season.findUniqueOrThrow({where:{id:e.seasonId}})
      if(e.activatedAt){results.push({id,alreadyActivated:true});continue}
      if(e.season.startDate>now)throw new NotificationError(400,'Grup geçişi sezon başlangıcından önce yapılamaz.')
      if(e.decision!=='CONTINUING'||!e.student.isActive||!e.targetGroupId)throw new NotificationError(400,'Aktif, Devam edecek ve hedef grubu seçilmiş kayıt gerekir.')
      await tx.$queryRaw`SELECT id FROM groups WHERE id = ${e.targetGroupId} FOR SHARE`
      await checkGroup(tx,user,e.targetGroupId,e.student.branchId!)
      await tx.$queryRaw`SELECT id FROM students WHERE id = ${e.studentId} FOR UPDATE`
      const student=await tx.student.findUniqueOrThrow({where:{id:e.studentId}})
      if(await tx.seasonEnrollment.count({where:{studentId:e.studentId,activatedAt:{not:null},season:{startDate:{gt:e.season.startDate}}}}))throw new NotificationError(409,'Daha yeni bir sezona geçmiş sporcu eski sezona taşınamaz.')
      if(!student.isActive||student.branchId!==e.student.branchId)throw new NotificationError(409,'Sporcu bilgileri değişti. Listeyi yenileyin.')
      if(student.groupId!==e.targetGroupId) {
        await tx.groupHistory.updateMany({where:{studentId:student.id,endDate:null},data:{endDate:now}})
        await tx.student.update({where:{id:student.id},data:{groupId:e.targetGroupId}})
        await tx.groupHistory.create({data:{studentId:student.id,groupId:e.targetGroupId,startDate:now,reason:`Sezon geçişi: ${e.season.name}`}})
      }
      await tx.seasonEnrollment.update({where:{id},data:{activatedAt:now}})
      results.push({id,activated:true})
    }
    return results
  },{timeout:30000})
}
