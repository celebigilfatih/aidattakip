'use client'

import { summarySchedule } from './summary-schedule'

export type MembershipRule = { id: string; name: string; enabled: boolean; branchId: string | null; weekdays: number[]; time: string; recipientIds: string[] }
type Person = { id: string; role: string; isActive: boolean; branchId: string | null }
type Recipient = { id: string; isActive: boolean; staffPushEnabled: boolean }

export default function StaffSummaryMembership({ person, recipient, rules, busy, onChange }: {
  person: Person; recipient?: Recipient; rules: MembershipRule[]; busy: boolean
  onChange: (ruleId: string, receive: boolean) => void
}) {
  const financial = person.role === 'ADMIN' || person.role === 'ACCOUNTING'
  const canJoin = financial && person.isActive && !!recipient?.isActive && !!recipient.staffPushEnabled
  const choices = rules.filter(r => !r.branchId || r.branchId === person.branchId || (recipient && r.recipientIds.includes(recipient.id)))
  return <div className="space-y-2 rounded-md border border-blue-100 bg-blue-50/50 p-3">
    <p className="text-sm font-semibold">Otomatik aidat özeti</p>
    {choices.map(rule => {
      const joined = !!recipient && rule.recipientIds.includes(recipient.id)
      const compatible = !rule.branchId || rule.branchId === person.branchId
      return <label key={rule.id} className="flex min-h-11 items-start gap-3 text-sm">
        <input type="checkbox" className="mt-1" aria-label={`${rule.name} · ${summarySchedule(rule)}`} checked={joined} disabled={busy || (!joined && !(canJoin && compatible))} onChange={e => onChange(rule.id, e.target.checked)} />
        <span className="min-w-0 break-words"><span className="font-medium">{rule.name}</span><span className="block text-slate-600">{summarySchedule(rule)} · Türkiye saati</span><span className="block text-slate-600">{joined ? 'Özet alıcısı' : 'Seçili değil'} · {rule.enabled ? 'Kural etkin' : 'Kural kapalı; özet gönderilmez'}</span></span>
      </label>
    })}
    {!choices.length && <p className="text-sm text-slate-600">Bu kapsamda mevcut aidat özeti kuralı yok.</p>}
    {!canJoin && <p className="text-xs text-slate-600">{!financial ? 'Aidat özeti yalnız yönetici ve muhasebeye açıktır.' : !person.isActive ? 'Hesap pasif; yeni özet seçimi yapılamaz.' : 'Önce personeli bildirim alıcısı olarak seçin.'}</p>}
    <p className="text-xs text-slate-500">Değişiklikler anında kaydedilir. Gönderim için geçerli ana cihaz gerekir.</p>
  </div>
}
