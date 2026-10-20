import test from 'node:test'
import assert from 'node:assert/strict'
import { seasonCharges,dateValue,isoDay,dateOnly } from './season-policy'
import { absenceStreak,lateDays,attentionWindowStart } from './attention-service'
import { familyTotals } from './family-service'

test('season intervals clamp each month from original anchor, including semiannual',()=>{
 assert.deepEqual(seasonCharges(dateValue('2027-01-31'),dateValue('2027-04-30'),'MONTHLY',100).map(c=>isoDay(c.dueDate)),['2027-01-31','2027-02-28','2027-03-31','2027-04-30'])
 assert.deepEqual(seasonCharges(dateValue('2026-08-31'),dateValue('2027-08-31'),'SEMI_ANNUAL',100).map(c=>isoDay(c.dueDate)),['2026-08-31','2027-02-28','2027-08-31'])
 for(const [period,n] of [['QUARTERLY',5],['YEARLY',2],['ONE_TIME',1]] as const)assert.equal(seasonCharges(dateValue('2026-01-01'),dateValue('2027-01-01'),period,100).length,n)
 assert.equal(dateOnly.safeParse('2026-02-30').success,false)
})
test('absence unknown, late, present and excused break a consecutive streak',()=>{
 assert.equal(absenceStreak(['ABSENT','ABSENT','ABSENT']),3)
 for(const status of [null,'PRESENT','LATE','EXCUSED'])assert.equal(absenceStreak(['ABSENT',status,'ABSENT','ABSENT']),1)
 assert.equal(isoDay(attentionWindowStart(new Date('2026-10-20T12:00:00Z'),30)),'2026-09-21')
})
test('family balances include old and partial obligations; cancellation and paid debt excluded',()=>{
 const due=dateValue('2020-01-01'),totals=familyTotals([{status:'PARTIAL',amount:100,paidAmount:40,dueDate:due},{status:'PAID',amount:50,paidAmount:50,dueDate:due},{status:'CANCELLED',amount:999,paidAmount:0,dueDate:due}],dateValue('2026-10-20'))
 assert.deepEqual(totals,{charged:150,paid:90,remaining:60,overdue:60})
})
test('Istanbul midnight controls overdue eligibility and seven calendar days',()=>{
 const due=dateValue('2026-10-12')
 assert.equal(lateDays(due,new Date('2026-10-18T20:59:59Z')),6)
 assert.equal(lateDays(due,new Date('2026-10-18T21:00:00Z')),7)
 assert.equal(familyTotals([{status:'PENDING',amount:100,paidAmount:null,dueDate:due}],new Date('2026-10-12T20:59:59Z')).overdue,0)
 assert.equal(familyTotals([{status:'PENDING',amount:100,paidAmount:null,dueDate:due}],new Date('2026-10-12T21:00:00Z')).overdue,100)
})
