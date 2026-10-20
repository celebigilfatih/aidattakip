import type { AttentionReason, User } from '@prisma/client'
import { prisma } from './prisma'
import { branchScope, scopedStudents, type ClubDB } from './club-access'
import { getStaffOverdue } from './staff-overdue'
import { istanbulDayStart, localDateTime } from './staff-summary-policy'
import { isoDay } from './season-policy'

export const defaultAttentionPolicy={windowDays:30,absenceCount:3,overdueDays:7,endingDays:30}
export function allowedReasons(user: Pick<User,'role'>): AttentionReason[] { return user.role==='ADMIN'?['ABSENCE','OVERDUE','SEASON']:user.role==='ACCOUNTING'?['OVERDUE']:user.role==='SECRETARY'?['SEASON']:['ABSENCE'] }
export function absenceStreak(statuses:(string|null)[]){let n=0;for(const s of statuses){if(s!=='ABSENT')break;n++}return n}
export function lateDays(due:Date,now:Date){return Math.floor((istanbulDayStart(now).getTime()-istanbulDayStart(due).getTime())/86400000)}
export function attentionWindowStart(now:Date,days:number){return new Date(istanbulDayStart(now).getTime()-(days-1)*86400000)}
export type AttentionSignal={kind:AttentionReason;description:string;count?:number;amount?:number;seasonId?:string}
export async function attentionList(user:User,now=new Date()){
 const studentWhere=await scopedStudents(user),reasons=allowedReasons(user)
 const [students,policies,overdue]=await Promise.all([
  prisma.student.findMany({where:studentWhere,select:{id:true,firstName:true,lastName:true,isActive:true,branchId:true,groupId:true,enrollmentDate:true,group:{select:{name:true}},groupHistories:true,seasonEnrollments:{select:{seasonId:true,decision:true,season:true}}}}),
  prisma.attentionPolicy.findMany({where:branchScope(user)}),
  reasons.includes('OVERDUE')?getStaffOverdue(prisma,user.branchId,now):null,
 ])
 const trainerGroups=user.role==='TRAINER'?(await prisma.userGroupPermission.findMany({where:{userId:user.id}})).map(g=>g.groupId):null
 const maxWindow=Math.max(30,...policies.map(p=>p.windowDays))
 const sessions=reasons.includes('ABSENCE')?await prisma.trainingSession.findMany({where:{group:{...branchScope(user),...(trainerGroups?{id:{in:trainerGroups}}:{})},status:'COMPLETED',attendanceTaken:true,date:{gte:attentionWindowStart(now,maxWindow),lte:now}},include:{attendances:{where:{student:studentWhere},select:{studentId:true,status:true}}},orderBy:[{date:'desc'},{startTime:'desc'},{id:'asc'}]}):[]
 const rows=[]
 for(const s of students){
  const p=policies.find(v=>v.branchId===s.branchId)??defaultAttentionPolicy,signals:AttentionSignal[]=[]
  if(reasons.includes('ABSENCE')&&s.isActive){
   const statuses:(string|null)[]=[]
   for(const session of sessions){
    const at=localDateTime(isoDay(session.date),session.startTime),ends=localDateTime(isoDay(session.date),session.endTime)
    if(at<attentionWindowStart(now,p.windowDays)||ends>now)continue
    const member=s.groupHistories.length?s.groupHistories.some(h=>h.groupId===session.groupId&&h.startDate<=at&&(!h.endDate||h.endDate>at)):s.groupId===session.groupId&&s.enrollmentDate<=at
    if(!member)continue
    statuses.push(session.attendances.find(a=>a.studentId===s.id)?.status??null)
   }
   const count=absenceStreak(statuses)
   if(count>=p.absenceCount)signals.push({kind:'ABSENCE',count,description:`Son ${p.windowDays} günde art arda ${count} mazeretsiz devamsızlık`})
  }
  if(overdue){const debts=overdue.rows.filter(r=>r.studentId===s.id&&lateDays(r.dueDate,now)>=p.overdueDays);if(debts.length)signals.push({kind:'OVERDUE',count:debts.length,amount:debts.reduce((sum,r)=>sum+r.outstanding,0),description:`En az ${p.overdueDays} gündür geciken ${debts.length} açık aidat`})}
  if(reasons.includes('SEASON')&&s.isActive){
   const ending=s.seasonEnrollments.filter(e=>e.decision!=='LEFT'&&e.season.endDate>=istanbulDayStart(now)&&e.season.endDate.getTime()-istanbulDayStart(now).getTime()<=p.endingDays*86400000).sort((a,b)=>a.season.endDate.getTime()-b.season.endDate.getTime())
   for(const e of ending){const next=s.seasonEnrollments.filter(n=>n.season.startDate>e.season.startDate).sort((a,b)=>a.season.startDate.getTime()-b.season.startDate.getTime())[0];if(!next||['UNDECIDED','CONTACT'].includes(next.decision)){signals.push({kind:'SEASON',seasonId:e.seasonId,description:`${e.season.name} ${isoDay(e.season.endDate)} tarihinde bitiyor; ${next?'yenileme görüşmesi bekliyor':'sonraki sezon kararı yok'}`});break}}
  }
  if(signals.length)rows.push({studentId:s.id,studentName:`${s.firstName} ${s.lastName}`,active:s.isActive,branchId:s.branchId,group:s.group?.name??'Grupsuz',signals})
 }
 return rows.sort((a,b)=>b.signals.length-a.signals.length||a.studentName.localeCompare(b.studentName,'tr')||a.studentId.localeCompare(b.studentId))
}
export async function followUpHistory(user:User,db:ClubDB=prisma){return db.followUp.findMany({where:{student:await scopedStudents(user,db),reason:{in:allowedReasons(user)}},include:{student:{select:{firstName:true,lastName:true,branchId:true}},assignedTo:{select:{id:true,name:true}},activities:{include:{actor:{select:{name:true}}},orderBy:{createdAt:'desc'}}},orderBy:{updatedAt:'desc'}})}
export async function attentionAssignees(user:User){
 const people=await prisma.user.findMany({where:{isActive:true,...(user.branchId?{OR:[{branchId:user.branchId},{role:'ADMIN',branchId:null}]}:{})},select:{id:true,name:true,role:true,branchId:true,groupPermissions:{select:{groupId:true}}}})
 return people.map(p=>({id:p.id,name:p.name,role:p.role,branchId:p.branchId,groupIds:p.groupPermissions.map(g=>g.groupId)}))
}
