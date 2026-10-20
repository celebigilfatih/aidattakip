import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { branchScope, checkBranch, checkGroup, clubActor, clubFailure, clubResponse, liveActor, requireRole } from '@/lib/club-access'
import { seasonSchema, dateValue, dateOnly } from '@/lib/season-policy'
import { activateSeason, approveSeason, listEnrollments, previewSeason } from '@/lib/season-service'
import { NotificationError } from '@/lib/notification-policy'

const ids=z.array(z.string().min(1)).min(1).max(500).refine(v=>new Set(v).size===v.length)
const actionSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('attach'),seasonId:z.string(),studentIds:ids}).strict(),
 z.object({action:z.literal('renewal'),ids,decision:z.enum(['UNDECIDED','CONTACT','CONTINUING','LEFT']),targetGroupId:z.string().nullable()}).strict(),
 z.object({action:z.literal('plan'),ids,feeTypeId:z.string(),amount:z.number().positive().finite().max(100000000),firstDueDate:dateOnly}).strict(),
 z.object({action:z.literal('preview'),ids}).strict(),
 z.object({action:z.literal('approve'),items:z.array(z.object({id:z.string(),token:z.string()}).strict()).min(1).max(500).refine(v=>new Set(v.map(i=>i.id)).size===v.length)}).strict(),
 z.object({action:z.literal('activate'),ids}).strict(),
])
export async function GET(request:NextRequest) {
 try {const u=await clubActor(request,['ADMIN','ACCOUNTING','SECRETARY']);const seasons=await prisma.season.findMany({orderBy:[{startDate:'desc'},{id:'asc'}]});const id=request.nextUrl.searchParams.get('seasonId');return clubResponse({seasons,enrollments:id?await listEnrollments(u,id):[]})}catch(e){return clubFailure(e)}
}
export async function POST(request:NextRequest) {
 try {
  const u=await clubActor(request,['ADMIN']);if(u.branchId)throw new NotificationError(403,'Ortak sezon takvimi için kulüp genelinde ADMIN yetkisi gerekir.')
  const input=seasonSchema.parse(await request.json())
  const season=await prisma.$transaction(async tx=>{
   await liveActor(tx,u)
   const data={name:input.name,startDate:dateValue(input.startDate),endDate:dateValue(input.endDate)}
   if(!input.id)return tx.season.create({data})
   await tx.$queryRaw`SELECT id FROM seasons WHERE id = ${input.id} FOR UPDATE`
   const current=await tx.season.findUnique({where:{id:input.id}})
   if(!current)throw new NotificationError(404,'Sezon bulunamadı.')
   if(current.updatedAt.toISOString()!==input.expected)throw new NotificationError(409,'Sezon değişti. Yeniden açın.')
   if((current.startDate.getTime()!==data.startDate.getTime()||current.endDate.getTime()!==data.endDate.getTime())&&await tx.seasonEnrollment.count({where:{seasonId:current.id,OR:[{approvedAt:{not:null}},{activatedAt:{not:null}}]}}))throw new NotificationError(409,'Mali onayı veya grup geçişi bulunan sezonun tarihleri değiştirilemez.')
   return tx.season.update({where:{id:current.id},data})
  });return clubResponse(season,201)
 }catch(e){return clubFailure(e)}
}
export async function PATCH(request:NextRequest) {
 try {
  const u=await clubActor(request,['ADMIN','ACCOUNTING','SECRETARY']),input=actionSchema.parse(await request.json())
  if(['plan','preview','approve'].includes(input.action))requireRole(u,['ADMIN','ACCOUNTING']);else requireRole(u,['ADMIN','SECRETARY'])
  if(input.action==='activate')requireRole(u,['ADMIN'])
  if(input.action==='preview')return clubResponse({preview:await previewSeason(u,input.ids)})
  if(input.action==='approve')return clubResponse({result:await approveSeason(u,input.items)})
  if(input.action==='activate')return clubResponse({result:await activateSeason(u,input.ids)})
  const result=await prisma.$transaction(async tx=>{
   await liveActor(tx,u)
   if(input.action==='attach') {
    await tx.$queryRaw`SELECT id FROM seasons WHERE id = ${input.seasonId} FOR SHARE`
    if(!await tx.season.findUnique({where:{id:input.seasonId}}))throw new NotificationError(404,'Sezon bulunamadı.')
    for(const id of [...input.studentIds].sort()) {
     await tx.$queryRaw`SELECT id FROM students WHERE id = ${id} FOR UPDATE`
     const student=await tx.student.findFirst({where:{id,...branchScope(u)}})
     if(!student)throw new NotificationError(404,'Sporcu bulunamadı.')
     await checkBranch(tx,u,student.branchId)
     await tx.seasonEnrollment.upsert({where:{seasonId_studentId:{seasonId:input.seasonId,studentId:id}},create:{seasonId:input.seasonId,studentId:id},update:{}})
    }
    return {attached:input.studentIds.length}
   }
   for(const id of [...input.ids].sort()) {
    await tx.$queryRaw`SELECT id FROM season_enrollments WHERE id = ${id} FOR UPDATE`
    const e=await tx.seasonEnrollment.findFirst({where:{id,student:branchScope(u)},include:{student:true,season:true}})
    if(!e)throw new NotificationError(404,'Sezon kaydı bulunamadı.')
    await checkBranch(tx,u,e.student.branchId)
    if(input.action==='renewal') {
     if(e.activatedAt)throw new NotificationError(409,'Grup geçişi tamamlanan kaydın hazırlığı değiştirilemez.')
     if(e.approvedAt&&(input.decision!=='CONTINUING'||input.targetGroupId!==e.targetGroupId))throw new NotificationError(409,'Mali onaylı kaydın karar/grup değişikliği önce mevcut borçların ayrıca değerlendirilmesini gerektirir.')
     if(input.targetGroupId)await checkGroup(tx,u,input.targetGroupId,e.student.branchId!)
     await tx.seasonEnrollment.update({where:{id},data:{decision:input.decision,targetGroupId:input.targetGroupId}})
    }else {
     if(e.approvedAt)throw new NotificationError(409,'Onaylı borçlar taslaktan değiştirilemez.')
     const fee=await tx.feeType.findFirst({where:{id:input.feeTypeId,isActive:true}})
     if(!fee||(fee.groupId&&fee.groupId!==e.targetGroupId))throw new NotificationError(400,'Hedef gruba uygun ücret türü seçin.')
     const due=dateValue(input.firstDueDate)
     if(due<e.season.startDate||due>e.season.endDate)throw new NotificationError(400,'Vade sezon aralığında olmalıdır.')
     await tx.seasonEnrollment.update({where:{id},data:{feeTypeId:fee.id,plannedAmount:input.amount,firstDueDate:due}})
    }
   }
   return {updated:input.ids.length}
  },{timeout:30000})
  return clubResponse(result)
 }catch(e){return clubFailure(e)}
}
