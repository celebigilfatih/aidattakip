import test from 'node:test'
import assert from 'node:assert/strict'
import { istanbulDayStart, localDateTime, summarySlots, summaryRuleSchema } from './staff-summary-policy'

test('Istanbul overdue boundary is midnight after the due calendar day', () => {
  assert.equal(istanbulDayStart(new Date('2026-10-19T20:59:59Z')).toISOString(), '2026-10-18T21:00:00.000Z')
  assert.equal(istanbulDayStart(new Date('2026-10-19T21:00:00Z')).toISOString(), '2026-10-19T21:00:00.000Z')
  assert.equal(localDateTime('2026-10-19', '09:00').toISOString(), '2026-10-19T06:00:00.000Z')
})
test('weekly slots respect selected days and exact cursor independent of host timezone', () => {
  const slots = summarySlots([1, 5], '09:00', new Date('2026-10-18T20:00:00Z'), new Date('2026-10-24T00:00:00Z'))
  assert.deepEqual(slots.map(d => d.toISOString()), ['2026-10-19T06:00:00.000Z', '2026-10-23T06:00:00.000Z'])
  assert.equal(summarySlots([1], '09:00', slots[0], slots[0]).length, 0)
})
test('weekly config requires recipients, valid weekdays and local clock', () => {
  const base = { name: 'Özet', weekdays: [1, 1, 5], time: '09:00', recipientIds: ['r'] }
  assert.deepEqual(summaryRuleSchema.parse(base).weekdays, [1, 5])
  assert.equal(summaryRuleSchema.parse(base).enabled, false)
  for (const bad of [{ weekdays: [] }, { weekdays: [0] }, { weekdays: [8] }, { time: '24:00' }, { time: '9:00' }, { recipientIds: [] }]) assert.throws(() => summaryRuleSchema.parse({ ...base, ...bad }))
})
