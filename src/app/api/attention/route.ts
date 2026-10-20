import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { allowedReasons, attentionAssignees, attentionList, defaultAttentionPolicy, followUpHistory } from '@/lib/attention-service'
import { branchScope, checkBranch, clubActor, clubFailure, clubResponse, liveActor, scopedStudents } from '@/lib/club-access'
import { NotificationError } from '@/lib/notification-policy'
import { dateOnly,dateValue } from '@/lib/season-policy'
export async function GET(request:NextRequest){try{const u=await clubActor(request);const [rows,history,policies,assignees]=await Promise.all([attentionList(u),followUpHistory(u),prisma.attentionPolicy.findMany({where:branchScope(u)}),attentionAssignees(u)]);return clubResponse({rows,history,policies:u.role==='ADMIN'?policies:[],defaults:u.role==='ADMIN'?defaultAttentionPolicy:undefined,assignees})}catch(e){return clubFailure(e)}}
const policy=z.object({branchId:z.string(),windowDays:z.number().int().min(1).max(365),absenceCount:z.number().int().min(1).max(30),overdueDays:z.number().int().min(1).max(365),endingDays:z.number().int().min(1).max(365)}).strict()
export async function PUT(request:NextRequest){try{const u=await clubActor(request,['ADMIN']),input=policy.parse(await request.json());const result=await prisma.$transaction(async tx=>{await liveActor(tx,u);await checkBranch(tx,u,input.branchId);return tx.attentionPolicy.upsert({where:{branchId:input.branchId},create:input,update:input})});return clubResponse(result)}catch(e){return clubFailure(e)}}
const followup=z.object({studentId:z.string(),reason:z.enum(['ABSENCE','OVERDUE','SEASON']),assignedToId:z.string().nullable(),nextContactDate:dateOnly.nullable(),note:z.string().trim().min(1).max(4000)}).strict()
export async function POST(request:NextRequest){try{
 const u=await clubActor(request),input=followup.parse(await request.json())
 if(!allowedReasons(u).includes(input.reason))throw new NotificationError(403,'Bu takip nedenine erişiminiz yok.')
 const result=await prisma.$transaction(async tx=>{
  await liveActor(tx,u)
  const student=await tx.student.findFirst({where:{id:input.studentId,...await scopedStudents(u,tx)}})
  if(!student)throw new NotificationError(404,'Sporcu bulunamadı.')
  await checkBranch(tx,u,student.branchId)
  if(input.assignedToId){
   const target=await tx.user.findFirst({where:{id:input.assignedToId,isActive:true}})
   if(!target||!allowedReasons(target).includes(input.reason)||target.branchId!==student.branchId&&!(target.role==='ADMIN'&&!target.branchId)||!target.branchId&&target.role!=='ADMIN')throw new NotificationError(400,'Sorumlu, aynı kapsamda ve bu takip nedenine yetkili olmalıdır.')
   if(target.role==='TRAINER'&&(!student.groupId||!await tx.userGroupPermission.findUnique({where:{userId_groupId:{userId:target.id,groupId:student.groupId}}})))throw new NotificationError(400,'Antrenörün bu gruba erişimi yok.')
  }
  return tx.followUp.upsert({where:{studentId_reason:{studentId:student.id,reason:input.reason}},create:{studentId:student.id,reason:input.reason,assignedToId:input.assignedToId,nextContactAt:input.nextContactDate?dateValue(input.nextContactDate):null,activities:{create:{actorId:u.id,note:input.note}}},update:{assignedToId:input.assignedToId,nextContactAt:input.nextContactDate?dateValue(input.nextContactDate):null,activities:{create:{actorId:u.id,note:input.note}}}})
 });return clubResponse(result,201)
}catch(e){return clubFailure(e)}}
