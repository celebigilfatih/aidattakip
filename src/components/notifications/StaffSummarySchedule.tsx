'use client'

import { Button } from '@/components/ui/button'
import type { MembershipRule } from './StaffSummaryMembership'
import StaffSummaryRuleDialog from './StaffSummaryRuleDialog'
import { summarySchedule } from './summary-schedule'

export default function StaffSummarySchedule({ rule, disabled, onSaved, onEnabledChange }: {
  rule: MembershipRule; disabled: boolean; onSaved: (rule: Pick<MembershipRule, 'id' | 'name' | 'weekdays' | 'time'>) => void
  onEnabledChange: (enabled: boolean) => void
}) {
  return <article className="space-y-3 rounded-md border bg-white p-3">
    <div className="min-w-0 space-y-1 break-words"><p className="text-sm font-semibold">{rule.name}</p><p className="text-sm">{summarySchedule(rule)}</p><p className="text-xs text-slate-600">{rule.enabled ? 'Kural etkin' : 'Kural kapalı; özet gönderilmez'} · {rule.recipientIds.length} seçili personel</p></div>
    <p className="text-xs text-slate-600">{rule.enabled ? 'Durdur, bu kurala bağlı tüm personel için yeni otomatik gönderimleri durdurur.' : !rule.recipientIds.length ? 'Etkinleştirmek için aşağıdaki personel kartlarından en az bir özet alıcısı seçin.' : 'Etkinleştir, bu kurala bağlı tüm personel için gelecek planlanan saatleri açar. Geçmiş saatler için bildirim gönderilmez.'}</p>
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant={rule.enabled ? 'outline' : 'default'} className="min-h-11" disabled={disabled || (!rule.enabled && !rule.recipientIds.length)} aria-label={`${rule.name}: ${rule.enabled ? 'kuralı durdur' : 'kuralı etkinleştir'}`} onClick={() => onEnabledChange(!rule.enabled)}>{rule.enabled ? 'Durdur' : 'Etkinleştir'}</Button>
      <StaffSummaryRuleDialog disabled={disabled} rule={rule} onSaved={onSaved}/>
    </div>
  </article>
}
