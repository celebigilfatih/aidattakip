import { z } from 'zod'
import type { User } from '@prisma/client'
import { prisma } from './prisma'
import { branchScope, checkBranch, checkGroup, liveActor, type ClubDB } from './club-access'
import { NotificationError } from './notification-policy'
import { dateOnly, dateValue } from './season-policy'

export const prospectSchema=z.object({id:z.string().optional(),expected:z.string().optional(),firstName:z.string().trim().min(1).max(100),lastName:z.string().trim().min(1).max(100),birthDate:dateOnly.nullable().optional(),contactName:z.string().trim().min(1).max(150),contactPhone:z.string().trim().min(5).max(40),branchId:z.string().min(1),groupId:z.string().nullable(),notes:z.string().trim().max(4000).default('')}).strict()
const parent=z.object({firstName:z.string().trim().min(1).max(100),lastName:z.string().trim().min(1).max(100),phone:z.string().trim().min(5).max(40),relationship:z.string().trim().min(1).max(50),isPrimary:z.boolean()}).strict()
export const conversionSchema=z.object({action:z.literal('convert'),id:z.string(),existingStudentId:z.string().optional(),firstName:z.string().trim().min(1).max(100).optional(),lastName:z.string().trim().min(1).max(100).optional(),parents:z.array(parent).min(1).max(5).optional(),groupId:z.string().nullable(),familyId:z.string().nullable(),seasonId:z.string().nullable()}).strict()
export async function lockProspect(tx:ClubDB,user:User,id:string){
 await tx.$queryRaw`SELECT id FROM prospects WHERE id = ${id} FOR UPDATE`
 const p=await tx.prospect.findFirst({where:{id,...branchScope(user)}})
 if(!p)throw new NotificationError(404,'Aday bulunamadı.')
 await checkBranch(tx,user,p.branchId)
 return p
}
export async function convertProspect(user:User,input:z.infer<typeof conversionSchema>){
 return prisma.$transaction(async tx=>{
  await liveActor(tx,user)
  const p=await lockProspect(tx,user,input.id)
  if(p.convertedStudentId)return {studentId:p.convertedStudentId,alreadyConverted:true}
  if(p.stage==='LOST')throw new NotificationError(409,'Önce vazgeçilen adayı yeniden açın.')
  if(!input.existingStudentId&&input.groupId)await checkGroup(tx,user,input.groupId,p.branchId)
  let student
  if(input.existingStudentId){
   await tx.$queryRaw`SELECT id FROM students WHERE id = ${input.existingStudentId} FOR UPDATE`
   student=await tx.student.findFirst({where:{id:input.existingStudentId,branchId:p.branchId}})
   if(!student)throw new NotificationError(404,'Aynı şubede sporcu bulunamadı.')
  }else{
   if(!input.firstName||!input.lastName||!input.parents?.some(v=>v.isPrimary))throw new NotificationError(400,'Ad, soyad ve en az bir birincil veli gerekir.')
   student=await tx.student.create({data:{firstName:input.firstName,lastName:input.lastName,birthDate:p.birthDate,groupId:input.groupId,branchId:p.branchId,createdById:user.id,parents:{create:input.parents}}})
   if(input.groupId)await tx.groupHistory.create({data:{studentId:student.id,groupId:input.groupId,reason:'Adaydan kesin kayıt'}})
  }
  if(input.familyId){
   await tx.$queryRaw`SELECT id FROM families WHERE id = ${input.familyId} FOR UPDATE`
   const f=await tx.family.findFirst({where:{id:input.familyId,branchId:p.branchId,archivedAt:null}})
   if(!f||student.familyId&&student.familyId!==f.id)throw new NotificationError(409,'Aile aynı şubede, arşivsiz ve sporcu için uygun olmalıdır.')
   await tx.student.update({where:{id:student.id},data:{familyId:f.id}})
   await tx.family.update({where:{id:f.id},data:{updatedAt:new Date()}})
  }
  if(input.seasonId){
   if(!await tx.season.findUnique({where:{id:input.seasonId}}))throw new NotificationError(404,'Sezon bulunamadı.')
   await tx.seasonEnrollment.upsert({where:{seasonId_studentId:{seasonId:input.seasonId,studentId:student.id}},create:{seasonId:input.seasonId,studentId:student.id},update:{}})
  }
  await tx.prospect.update({where:{id:p.id},data:{stage:'CONVERTED',convertedStudentId:student.id}})
  await tx.prospectActivity.create({data:{prospectId:p.id,actorId:user.id,message:input.existingStudentId?'Açık seçimle mevcut sporcuya bağlandı.':'Kesin sporcu kaydı oluşturuldu.'}})
  return {studentId:student.id,alreadyConverted:false}
 },{timeout:20000})
}
