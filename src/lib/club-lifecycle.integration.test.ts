import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { loadEnvConfig } from '@next/env'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

loadEnvConfig(process.cwd())
test('club lifecycle: family, season, trial and attention HTTP contracts on isolated local fixtures',async t=>{
 const url=new URL(process.env.DATABASE_URL||'');assert(['localhost','127.0.0.1'].includes(url.hostname)&&url.port==='5477'&&url.pathname==='/aidat_takip','Local demo only')
 const {prisma:db}=await import('./prisma'),family=await import('../app/api/families/route'),season=await import('../app/api/seasons/route'),prospect=await import('../app/api/prospects/route'),attention=await import('../app/api/attention/route'),catalog=await import('../app/api/club/options/route')
 const {attentionList}=await import('./attention-service'),{dateValue}=await import('./season-policy')
 const prefix='lifecycle-'+randomBytes(5).toString('hex'),origin='http://127.0.0.1:3077';process.env.APP_ORIGIN=origin
 const request=(method:string,userId?:string,body?:unknown,query='',source=origin)=>new NextRequest(origin+'/api/club'+query,{method,headers:{origin:source,'Content-Type':'application/json',cookie:userId?'auth-token='+jwt.sign({userId},process.env.JWT_SECRET!,{expiresIn:'1h'}):'push-recipient-session=parent'},...(body!==undefined?{body:JSON.stringify(body)}:{})})
 const branches:string[]=[],seasonIds:string[]=[]
 const before={notifications:await db.notification.count(),rules:await db.staffSummaryRule.count(),students:await db.student.count()}
 try{
  const a=await db.branch.create({data:{name:prefix+' A'}}),b=await db.branch.create({data:{name:prefix+' B'}});branches.push(a.id,b.id)
  const user=async(role:'ADMIN'|'ACCOUNTING'|'SECRETARY'|'TRAINER',branchId:string|null,label:string)=>db.user.create({data:{name:prefix+' '+label,email:prefix+'-'+label+'@example.invalid',password:'fixture',role,branchId}})
  const admin=await user('ADMIN',a.id,'admin'),global=await user('ADMIN',null,'global'),account=await user('ACCOUNTING',a.id,'account'),secretary=await user('SECRETARY',a.id,'secretary'),trainer=await user('TRAINER',a.id,'trainer'),foreign=await user('ADMIN',b.id,'foreign'),unassigned=await user('SECRETARY',null,'unassigned')
  const inactive=await db.user.create({data:{name:prefix,email:prefix+'-inactive@example.invalid',password:'fixture',role:'ADMIN',branchId:a.id,isActive:false}})
  const group=await db.group.create({data:{name:prefix+' current',branchId:a.id}}),target=await db.group.create({data:{name:prefix+' target',branchId:a.id}}),foreignGroup=await db.group.create({data:{name:prefix+' foreign',branchId:b.id}})
  await db.userGroupPermission.create({data:{userId:trainer.id,groupId:group.id}})
  const child=async(label:string,isActive=true,branchId=a.id,groupId:string|null=group.id)=>db.student.create({data:{firstName:prefix,lastName:label,isActive,branchId,groupId,createdById:admin.id,enrollmentDate:dateValue('2026-01-01')}})
  const s1=await child('One'),s2=await child('Two',false),outsider=await child('Foreign',true,b.id,foreignGroup.id),ungrouped=await child('Unassigned',true,a.id,null)
  const fee=await db.feeType.create({data:{name:prefix,amount:100,period:'MONTHLY'}})
  const groupFee=await db.feeType.create({data:{name:prefix,amount:100,period:'MONTHLY',groupId:target.id}})
  const globalOptions=await(await catalog.GET(request('GET',global.id))).json()
  assert(globalOptions.fees.some((f:{id:string})=>f.id===groupFee.id),'Global ADMIN must see group-specific fees')
  const parent=await db.parent.create({data:{firstName:prefix,lastName:'Parent',phone:'05000000000',relationship:'Veli',isPrimary:true,students:{connect:[{id:s1.id},{id:s2.id}]}}})
  await db.payment.createMany({data:[{studentId:s1.id,feeTypeId:fee.id,amount:100,paidAmount:40,status:'PARTIAL',dueDate:dateValue('2020-01-01'),createdById:admin.id},{studentId:s2.id,feeTypeId:fee.id,amount:200,paidAmount:0,status:'PENDING',dueDate:dateValue('2020-01-01'),createdById:admin.id},{studentId:s2.id,feeTypeId:fee.id,amount:999,paidAmount:0,status:'CANCELLED',dueDate:dateValue('2020-01-01'),createdById:admin.id}]})
  let familyId=''
  await t.test('new endpoints reject parent/inactive/unassigned roles, foreign origin and branch',async()=>{
   const body={name:prefix,branchId:a.id,studentIds:[s1.id]}
   for(const handler of [family.GET,season.GET,prospect.GET,attention.GET,catalog.GET])assert.equal((await handler(request('GET'))).status,401)
   assert.equal((await family.POST(request('POST',inactive.id,body))).status,401)
   assert.equal((await family.GET(request('GET',unassigned.id))).status,403)
   assert.equal((await family.GET(request('GET',trainer.id))).status,403)
   assert.equal((await family.POST(request('POST',account.id,body))).status,403)
   assert.equal((await family.POST(request('POST',admin.id,body,'','https://other.invalid'))).status,403)
   assert.equal((await family.POST(request('POST',foreign.id,body))).status,403)
   assert.equal((await family.POST(request('POST',admin.id,{...body,studentIds:[outsider.id]}))).status,409)
  })
  await t.test('family combined view retains parents, inactive/old balances and redacts financial JSON',async()=>{
   const r=await family.POST(request('POST',secretary.id,{name:prefix,branchId:a.id,studentIds:[s1.id,s2.id]}));assert.equal(r.status,201);familyId=(await r.json()).id
   const data=await(await family.GET(request('GET',account.id))).json(),f=data.families.find((f:{id:string})=>f.id===familyId)
   assert.deepEqual(f.totals,{charged:300,paid:40,remaining:260,overdue:260});assert.equal(f.students.length,2)
   const safe=await(await family.GET(request('GET',secretary.id))).json();assert(!JSON.stringify(safe).includes('totals'));assert(!JSON.stringify(safe).includes('paidAmount'));assert.equal(await db.parent.count({where:{id:parent.id}}),1)
   assert.equal((await family.POST(request('POST',admin.id,{name:prefix+' duplicate',branchId:a.id,studentIds:[s1.id]}))).status,409)
  })
  await t.test('family membership edit, archive and restore preserve payments and contact rows',async()=>{
   let f=await db.family.findUniqueOrThrow({where:{id:familyId}})
   assert.equal((await family.POST(request('POST',admin.id,{id:f.id,expected:f.updatedAt.toISOString(),name:f.name,branchId:a.id,studentIds:[s1.id]}))).status,201)
   assert.equal((await db.student.findUniqueOrThrow({where:{id:s2.id}})).familyId,null)
   f=await db.family.findUniqueOrThrow({where:{id:familyId}})
   assert.equal((await family.PATCH(request('PATCH',admin.id,{id:f.id,expected:f.updatedAt.toISOString(),action:'archive'}))).status,200)
   assert.equal((await(await family.GET(request('GET',admin.id))).json()).families.some((v:{id:string})=>v.id===f.id),false)
   f=await db.family.findUniqueOrThrow({where:{id:familyId}})
   assert.equal((await family.PATCH(request('PATCH',admin.id,{id:f.id,expected:f.updatedAt.toISOString(),action:'restore'}))).status,200)
   assert.equal(await db.payment.count({where:{studentId:{in:[s1.id,s2.id]}}}),3)
  })
  let seasonId='',enrollmentId=''
  await t.test('common season calendar only global admin; attach and renewal do not charge or move',async()=>{
   const body={name:prefix,startDate:'2026-01-01',endDate:'2026-12-31'}
   assert.equal((await season.POST(request('POST',admin.id,body))).status,403)
   const r=await season.POST(request('POST',global.id,body));assert.equal(r.status,201);seasonId=(await r.json()).id;seasonIds.push(seasonId)
   const attach={action:'attach',seasonId,studentIds:[s1.id]}
   assert.equal((await season.PATCH(request('PATCH',secretary.id,attach))).status,200)
   assert.equal((await season.PATCH(request('PATCH',secretary.id,attach))).status,200)
   assert.equal(await db.seasonEnrollment.count({where:{seasonId,studentId:s1.id}}),1)
   enrollmentId=(await db.seasonEnrollment.findUniqueOrThrow({where:{seasonId_studentId:{seasonId,studentId:s1.id}}})).id
   assert.equal((await season.PATCH(request('PATCH',secretary.id,{action:'renewal',ids:[enrollmentId],decision:'CONTINUING',targetGroupId:foreignGroup.id}))).status,400)
   assert.equal((await season.PATCH(request('PATCH',secretary.id,{action:'renewal',ids:[enrollmentId],decision:'CONTINUING',targetGroupId:target.id}))).status,200)
   assert.equal(await db.payment.count({where:{seasonEnrollmentId:enrollmentId}}),0);assert.equal((await db.student.findUniqueOrThrow({where:{id:s1.id}})).groupId,group.id)
  })
  await t.test('financial preview, stale rejection and concurrent approval create debt exactly once',async()=>{
   const plan={action:'plan',ids:[enrollmentId],feeTypeId:fee.id,amount:100,firstDueDate:'2026-10-31'}
   assert.equal((await season.PATCH(request('PATCH',secretary.id,plan))).status,403)
   assert.equal((await season.PATCH(request('PATCH',account.id,plan))).status,200)
   const read=()=>season.PATCH(request('PATCH',account.id,{action:'preview',ids:[enrollmentId]}))
   let preview=(await(await read()).json()).preview;assert.equal(preview[0].charges.length,3)
   assert.equal((await season.PATCH(request('PATCH',account.id,{...plan,amount:101}))).status,200)
   assert.equal((await season.PATCH(request('PATCH',account.id,{action:'approve',items:preview.map((p:{id:string;token:string})=>({id:p.id,token:p.token}))}))).status,409)
   preview=(await(await read()).json()).preview
   const approve={action:'approve',items:preview.map((p:{id:string;token:string})=>({id:p.id,token:p.token}))}
   const parallel=await Promise.all([season.PATCH(request('PATCH',account.id,approve)),season.PATCH(request('PATCH',account.id,approve))]);assert.deepEqual(parallel.map(r=>r.status),[200,200])
   assert.equal(await db.payment.count({where:{seasonEnrollmentId:enrollmentId}}),3)
   await assert.rejects(db.payment.create({data:{studentId:s1.id,feeTypeId:fee.id,amount:1,createdById:admin.id,dueDate:dateValue('2026-10-31'),seasonEnrollmentId:enrollmentId}}),'Source requires an installment number at DB level')
   const safe=await(await season.GET(request('GET',secretary.id,undefined,'?seasonId='+seasonId))).json();assert(!('plannedAmount'in safe.enrollments[0]));assert(!('feeType'in safe.enrollments[0]))
   await db.group.update({where:{id:target.id},data:{branchId:b.id}})
   const invalid=await(await season.GET(request('GET',secretary.id,undefined,'?seasonId='+seasonId))).json()
   assert(invalid.enrollments[0].correction);assert.equal(invalid.enrollments[0].targetGroup,null,'Foreign target group details must be redacted')
   await db.group.update({where:{id:target.id},data:{branchId:a.id}})
   assert.equal((await season.PATCH(request('PATCH',foreign.id,{action:'preview',ids:[enrollmentId]}))).status,404)
  })
  await t.test('group transition is separate, preserves history and does not activate inactive students',async()=>{
   await db.groupHistory.create({data:{studentId:s1.id,groupId:group.id,startDate:dateValue('2026-01-01')}})
   const r=await season.PATCH(request('PATCH',admin.id,{action:'activate',ids:[enrollmentId]}));assert.equal(r.status,200)
   assert.equal((await season.PATCH(request('PATCH',secretary.id,{action:'activate',ids:[enrollmentId]}))).status,403)
   assert.equal((await db.student.findUniqueOrThrow({where:{id:s1.id}})).groupId,target.id)
   assert.equal(await db.groupHistory.count({where:{studentId:s1.id}}),2)
   assert.equal((await season.PATCH(request('PATCH',admin.id,{action:'activate',ids:[enrollmentId]}))).status,200)
   assert.equal(await db.groupHistory.count({where:{studentId:s1.id}}),2)
   const e=await db.seasonEnrollment.create({data:{studentId:s2.id,seasonId,decision:'CONTINUING',targetGroupId:target.id}})
   assert.equal((await season.PATCH(request('PATCH',admin.id,{action:'activate',ids:[e.id]}))).status,400)
   assert.equal((await db.student.findUniqueOrThrow({where:{id:s2.id}})).isActive,false)
   const future=await db.season.create({data:{name:prefix+' future',startDate:dateValue('2090-01-01'),endDate:dateValue('2090-12-31')}});seasonIds.push(future.id)
   const fe=await db.seasonEnrollment.create({data:{studentId:ungrouped.id,seasonId:future.id,decision:'CONTINUING',targetGroupId:group.id}})
   assert.equal((await season.PATCH(request('PATCH',admin.id,{action:'activate',ids:[fe.id]}))).status,400)
  })
  let prospectId='',visitId=''
  const session=await db.trainingSession.create({data:{groupId:group.id,date:dateValue('2026-10-01'),startTime:'09:00',endTime:'10:00',status:'COMPLETED',attendanceTaken:true}})
  await t.test('staff candidate intake and trial roster do not expose contacts to trainer',async()=>{
   const r=await prospect.POST(request('POST',secretary.id,{firstName:prefix,lastName:'Candidate',birthDate:null,contactName:prefix+' Parent',contactPhone:'05000000000',branchId:a.id,groupId:group.id,notes:'fixture'}));assert.equal(r.status,201);prospectId=(await r.json()).id
   assert.equal((await prospect.PATCH(request('PATCH',secretary.id,{action:'invite',id:prospectId,sessionId:session.id}))).status,200)
   const roster=await(await prospect.GET(request('GET',trainer.id))).json();assert(roster.visits.some((v:{prospectId:string})=>v.prospectId===prospectId));assert(!JSON.stringify(roster).includes('contactPhone'));assert(!JSON.stringify(roster).includes('fixture'))
   visitId=roster.visits.find((v:{prospectId:string})=>v.prospectId===prospectId).id
   assert.equal((await prospect.PATCH(request('PATCH',trainer.id,{action:'result',visitId,result:'ATTENDED'}))).status,200)
   await db.trainingSession.update({where:{id:session.id},data:{status:'CANCELLED'}})
   assert.equal((await prospect.PATCH(request('PATCH',trainer.id,{action:'result',visitId,result:'NO_SHOW'}))).status,400)
   assert.equal((await prospect.PATCH(request('PATCH',foreign.id,{action:'result',visitId,result:'CANCELLED'}))).status,404)
   await db.trainingSession.update({where:{id:session.id},data:{status:'COMPLETED'}})
  })
  await t.test('candidate conversion requires primary parent and remains idempotent under concurrency',async()=>{
   const body={action:'convert',id:prospectId,firstName:prefix,lastName:'Converted',groupId:group.id,familyId,seasonId,parents:[{firstName:prefix,lastName:'Guardian',phone:'05000000000',relationship:'Veli',isPrimary:false}]}
   assert.equal((await prospect.PATCH(request('PATCH',secretary.id,body))).status,400)
   body.parents[0].isPrimary=true
   const responses=await Promise.all([prospect.PATCH(request('PATCH',secretary.id,body)),prospect.PATCH(request('PATCH',secretary.id,body))]);assert.deepEqual(responses.map(r=>r.status),[200,200])
   const converted=await db.prospect.findUniqueOrThrow({where:{id:prospectId}});assert(converted.convertedStudentId)
   assert.equal(await db.student.count({where:{branchId:a.id,lastName:'Converted'}}),1)
   assert.equal(await db.payment.count({where:{studentId:converted.convertedStudentId}}),0)
   assert.equal((await db.student.findUniqueOrThrow({where:{id:converted.convertedStudentId}})).familyId,familyId)
   const p=await db.prospect.create({data:{firstName:prefix,lastName:'LinkExisting',branchId:a.id,contactName:prefix,contactPhone:'05000000000'}})
   assert.equal((await prospect.PATCH(request('PATCH',secretary.id,{action:'convert',id:p.id,existingStudentId:s1.id,groupId:null,familyId:null,seasonId:null}))).status,200)
   assert.equal((await db.student.findUniqueOrThrow({where:{id:s1.id}})).groupId,target.id)
  })
  const absent=await child('Absent')
  await t.test('attention evaluates attendance, missing records, histories and private finance independently',async()=>{
   const now=new Date('2026-10-20T12:00:00Z')
   const ending=await db.season.create({data:{name:prefix+' ending',startDate:dateValue('2026-01-01'),endDate:dateValue('2026-11-01')}});seasonIds.push(ending.id)
   await db.seasonEnrollment.create({data:{seasonId:ending.id,studentId:absent.id,decision:'CONTINUING'}})
   for(const date of ['2026-10-17','2026-10-18','2026-10-19']){const s=await db.trainingSession.create({data:{groupId:group.id,date:dateValue(date),startTime:'09:00',endTime:'10:00',status:'COMPLETED',attendanceTaken:true}});await db.attendance.create({data:{studentId:absent.id,sessionId:s.id,status:'ABSENT'}})}
   assert((await attentionList(trainer,now)).find(r=>r.studentId===absent.id)?.signals.some(s=>s.kind==='ABSENCE'))
   const secretaryRows=await attentionList(secretary,now);assert(secretaryRows.find(r=>r.studentId===absent.id)?.signals.some(s=>s.kind==='SEASON'));assert(secretaryRows.every(r=>r.signals.every(s=>s.kind==='SEASON'&&s.amount===undefined)))
   const accountRows=await attentionList(account,now);assert(accountRows.some(r=>r.studentId===s2.id&&!r.active));assert(accountRows.every(r=>r.signals.every(s=>s.kind==='OVERDUE')))
   const missing=await db.trainingSession.create({data:{groupId:group.id,date:dateValue('2026-10-20'),startTime:'09:00',endTime:'10:00',status:'COMPLETED',attendanceTaken:true}})
   assert(!(await attentionList(trainer,now)).some(r=>r.studentId===absent.id))
   await db.attendance.create({data:{studentId:absent.id,sessionId:missing.id,status:'EXCUSED'}})
   assert(!(await attentionList(trainer,now)).some(r=>r.studentId===absent.id))
   const before=await db.followUp.count();await attention.GET(request('GET',admin.id));assert.equal(await db.followUp.count(),before)
  })
  await t.test('follow-up assignment is scoped, notes persist after reason resolves; policy admin-only',async()=>{
   const follow={studentId:s2.id,reason:'OVERDUE',assignedToId:account.id,nextContactDate:'2026-12-01',note:'fixture follow-up'}
   assert.equal((await attention.POST(request('POST',secretary.id,follow))).status,403)
   assert.equal((await attention.POST(request('POST',admin.id,{...follow,assignedToId:trainer.id}))).status,400)
   assert.equal((await attention.POST(request('POST',admin.id,{...follow,assignedToId:foreign.id}))).status,400)
   assert.equal((await attention.POST(request('POST',account.id,follow))).status,201)
   await db.payment.updateMany({where:{studentId:s2.id,status:'PENDING'},data:{status:'PAID',paidAmount:200}})
   const read=await(await attention.GET(request('GET',account.id))).json();assert(read.history.some((h:{studentId:string})=>h.studentId===s2.id));assert(!read.rows.some((r:{studentId:string})=>r.studentId===s2.id))
   const safe=await(await attention.GET(request('GET',secretary.id))).json();assert(!JSON.stringify(safe).includes('fixture follow-up'));assert(!JSON.stringify(safe).includes('OVERDUE'))
   const p={branchId:a.id,windowDays:30,absenceCount:4,overdueDays:7,endingDays:30}
   assert.equal((await attention.PUT(request('PUT',secretary.id,p))).status,403);assert.equal((await attention.PUT(request('PUT',foreign.id,p))).status,403);assert.equal((await attention.PUT(request('PUT',admin.id,p))).status,200)
  })
  await t.test('200 synthetic students produce one row each and zero push or summary mutations',async()=>{
   const ids=Array.from({length:200},(_,i)=>prefix+'-bulk-'+i)
   await db.student.createMany({data:ids.map((id,i)=>({id,firstName:prefix,lastName:'Bulk '+i,branchId:a.id,createdById:admin.id,isActive:i%2===0}))})
   await db.payment.createMany({data:ids.map(studentId=>({studentId,feeTypeId:fee.id,amount:100,paidAmount:20,status:'PARTIAL' as const,dueDate:dateValue('2020-01-01'),createdById:admin.id}))})
   const rows=await attentionList(account);assert.equal(rows.filter(r=>ids.includes(r.studentId)).length,200);assert.equal(new Set(rows.map(r=>r.studentId)).size,rows.length)
   assert.equal(await db.notification.count(),before.notifications);assert.equal(await db.staffSummaryRule.count(),before.rules)
  })
 }finally{
  // Only IDs owned by this fixture's two newly created branches; never touch demo records.
  const owned=await db.student.findMany({where:{branchId:{in:branches}},select:{id:true,parents:{select:{id:true}}}}),studentIds=owned.map(s=>s.id),parentIds=owned.flatMap(s=>s.parents.map(p=>p.id))
  await db.$transaction(async tx=>{
   await tx.followUpActivity.deleteMany({where:{followUp:{studentId:{in:studentIds}}}});await tx.followUp.deleteMany({where:{studentId:{in:studentIds}}});await tx.attentionPolicy.deleteMany({where:{branchId:{in:branches}}})
   await tx.prospectActivity.deleteMany({where:{prospect:{branchId:{in:branches}}}});await tx.trialVisit.deleteMany({where:{prospect:{branchId:{in:branches}}}});await tx.prospect.deleteMany({where:{branchId:{in:branches}}})
   await tx.payment.deleteMany({where:{studentId:{in:studentIds}}});await tx.seasonEnrollment.deleteMany({where:{studentId:{in:studentIds}}});await tx.season.deleteMany({where:{id:{in:seasonIds}}})
   await tx.attendance.deleteMany({where:{studentId:{in:studentIds}}});await tx.groupHistory.deleteMany({where:{studentId:{in:studentIds}}});await tx.student.deleteMany({where:{id:{in:studentIds}}});await tx.parent.deleteMany({where:{id:{in:parentIds},firstName:prefix}})
   await tx.family.deleteMany({where:{branchId:{in:branches}}});await tx.trainingSession.deleteMany({where:{group:{branchId:{in:branches}}}});await tx.feeType.deleteMany({where:{name:prefix}});await tx.userGroupPermission.deleteMany({where:{user:{email:{startsWith:prefix+'-'}}}})
   await tx.group.deleteMany({where:{branchId:{in:branches}}});await tx.user.deleteMany({where:{email:{startsWith:prefix+'-'}}});await tx.branch.deleteMany({where:{id:{in:branches}}})
  },{timeout:30000})
  assert.equal(await db.student.count(),before.students);assert.equal(await db.notification.count(),before.notifications);assert.equal(await db.staffSummaryRule.count(),before.rules)
  await db.$disconnect()
 }
})
