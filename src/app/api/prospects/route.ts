import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { branchScope, checkBranch, checkGroup, clubActor, clubFailure, clubResponse, liveActor, requireRole } from '@/lib/club-access'
import { conversionSchema, convertProspect, lockProspect, prospectSchema } from '@/lib/prospect-service'
import { dateValue } from '@/lib/season-policy'
import { NotificationError } from '@/lib/notification-policy'

export async function GET(request:NextRequest){try{
 const u=await clubActor(request,['ADMIN','SECRETARY','TRAINER'])
 if(u.role==='TRAINER'){
  const groups=(await prisma.userGroupPermission.findMany({where:{userId:u.id}})).map(g=>g.groupId)
  const visits=await prisma.trialVisit.findMany({where:{session:{groupId:{in:groups},group:branchScope(u)},prospect:branchScope(u)},select:{id:true,result:true,prospectId:true,prospect:{select:{firstName:true,lastName:true}},session:{select:{date:true,startTime:true,status:true,group:{select:{name:true}}}}},orderBy:{session:{date:'desc'}}})
  return clubResponse({visits})
 }
 const duplicateId=request.nextUrl.searchParams.get('duplicates')
 if(duplicateId){const p=await prisma.prospect.findFirst({where:{id:duplicateId,...branchScope(u)}});if(!p)throw new NotificationError(404,'Aday bulunamadı.');return clubResponse({students:await prisma.student.findMany({where:{branchId:p.branchId,OR:[{firstName:{equals:p.firstName,mode:'insensitive'},lastName:{equals:p.lastName,mode:'insensitive'}},{parents:{some:{phone:p.contactPhone}}}]},select:{id:true,firstName:true,lastName:true,isActive:true},take:20})})}
 const prospects=await prisma.prospect.findMany({where:branchScope(u),include:{visits:{include:{session:{select:{date:true,startTime:true,status:true,group:{select:{name:true}}}}},orderBy:{createdAt:'desc'}},activities:{orderBy:{createdAt:'desc'}}},orderBy:[{createdAt:'desc'},{id:'asc'}]})
 return clubResponse({prospects})
}catch(e){return clubFailure(e)}}
export async function POST(request:NextRequest){try{
 const u=await clubActor(request,['ADMIN','SECRETARY']),input=prospectSchema.parse(await request.json())
 const result=await prisma.$transaction(async tx=>{
  await liveActor(tx,u);await checkBranch(tx,u,input.branchId);if(input.groupId)await checkGroup(tx,u,input.groupId,input.branchId)
  const {id,expected,...values}=input,data={...values,birthDate:input.birthDate?dateValue(input.birthDate):null}
  if(id){const p=await lockProspect(tx,u,id);if(p.stage==='CONVERTED')throw new NotificationError(409,'Kesin kayıt sonrası sporcu ekranından düzenleyin.');if(p.branchId!==input.branchId||p.updatedAt.toISOString()!==expected)throw new NotificationError(409,'Aday değişti veya şube değiştirilemez.');const saved=await tx.prospect.update({where:{id},data});await tx.prospectActivity.create({data:{prospectId:id,actorId:u.id,message:'Aday bilgileri güncellendi.'}});return saved}
  return tx.prospect.create({data:{...data,activities:{create:{actorId:u.id,message:'Aday kaydı açıldı.'}}}})
 });return clubResponse(result,201)
}catch(e){return clubFailure(e)}}
const actions=z.discriminatedUnion('action',[
 conversionSchema,
 z.object({action:z.literal('invite'),id:z.string(),sessionId:z.string()}).strict(),
 z.object({action:z.literal('result'),visitId:z.string(),result:z.enum(['ATTENDED','NO_SHOW','CANCELLED'])}).strict(),
 z.object({action:z.literal('stage'),id:z.string(),stage:z.enum(['NEW','LOST'])}).strict(),
])
export async function PATCH(request:NextRequest){try{
 const u=await clubActor(request,['ADMIN','SECRETARY','TRAINER']),input=actions.parse(await request.json())
 if(input.action!=='result')requireRole(u,['ADMIN','SECRETARY'])
 if(input.action==='convert')return clubResponse(await convertProspect(u,input))
 const result=await prisma.$transaction(async tx=>{
  await liveActor(tx,u)
  if(input.action==='result'){
   const visit=await tx.trialVisit.findUnique({where:{id:input.visitId},include:{session:true}})
   if(!visit)throw new NotificationError(404,'Deneme bulunamadı.')
   const p=await lockProspect(tx,u,visit.prospectId)
   await tx.$queryRaw`SELECT id FROM training_sessions WHERE id = ${visit.sessionId} FOR SHARE`
   const liveSession=await tx.trainingSession.findUniqueOrThrow({where:{id:visit.sessionId}})
   await checkGroup(tx,u,liveSession.groupId,p.branchId)
   if(liveSession.status==='CANCELLED'&&input.result!=='CANCELLED')throw new NotificationError(400,'İptal edilmiş antrenman katıldı veya gelmedi işaretlenemez.')
   if(liveSession.date>new Date()&&input.result!=='CANCELLED')throw new NotificationError(400,'Gelecek antrenmanda katılım işaretlenemez.')
   await tx.trialVisit.update({where:{id:visit.id},data:{result:input.result}})
   if(input.result==='ATTENDED'&&!['CONVERTED','LOST'].includes(p.stage))await tx.prospect.update({where:{id:p.id},data:{stage:'ATTENDED'}})
   await tx.prospectActivity.create({data:{prospectId:p.id,actorId:u.id,message:`Deneme sonucu: ${input.result==='ATTENDED'?'Katıldı':input.result==='NO_SHOW'?'Gelmedi':'İptal'}`}})
   return {updated:true}
  }
  const p=await lockProspect(tx,u,input.id)
  if(p.convertedStudentId)throw new NotificationError(409,'Aday zaten kesin kayda dönüştü.')
  if(input.action==='stage'){
   await tx.prospectActivity.create({data:{prospectId:p.id,actorId:u.id,message:input.stage==='LOST'?'Aday vazgeçti olarak işaretlendi.':'Aday yeniden açıldı.'}})
   return tx.prospect.update({where:{id:p.id},data:{stage:input.stage}})
  }
  if(p.stage==='LOST')throw new NotificationError(409,'Önce adayı yeniden açın.')
  await tx.$queryRaw`SELECT id FROM training_sessions WHERE id = ${input.sessionId} FOR SHARE`
  const session=await tx.trainingSession.findUnique({where:{id:input.sessionId}})
  if(!session||session.status==='CANCELLED')throw new NotificationError(400,'Kullanılabilir antrenman seçin.')
  await checkGroup(tx,u,session.groupId,p.branchId)
  const visit=await tx.trialVisit.upsert({where:{prospectId_sessionId:{prospectId:p.id,sessionId:session.id}},create:{prospectId:p.id,sessionId:session.id},update:{}})
  if(p.stage!=='ATTENDED')await tx.prospect.update({where:{id:p.id},data:{stage:'INVITED'}})
  await tx.prospectActivity.create({data:{prospectId:p.id,actorId:u.id,message:'Deneme antrenmanına davet kaydedildi; dış mesaj gönderilmedi.'}})
  return visit
 });return clubResponse(result)
}catch(e){return clubFailure(e)}}
