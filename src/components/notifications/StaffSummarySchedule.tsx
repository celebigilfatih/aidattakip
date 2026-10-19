'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { type MembershipRule } from './StaffSummaryMembership'
import { summaryDays, summarySchedule } from './summary-schedule'
import { staffRequest } from './staff-http'

export default function StaffSummarySchedule({ rule, disabled, onSaved, onEnabledChange }: {
  rule: MembershipRule; disabled: boolean; onSaved: (rule: Pick<MembershipRule, 'id' | 'weekdays' | 'time'>) => void
  onEnabledChange: (enabled: boolean) => void
}) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const [weekdays, setWeekdays] = useState(rule.weekdays), [time, setTime] = useState(rule.time)
  function changeOpen(next: boolean) {
    if (busy) return
    setOpen(next)
    if (next) { setWeekdays(rule.weekdays); setTime(rule.time); setError('') }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = await staffRequest('/api/push/staff-summary', 'PUT', { ruleId: rule.id, weekdays, time })
      setOpen(false); onSaved(result.rule)
    } catch (e) { setError(e instanceof Error ? e.message : 'Takvim kaydedilemedi.') }
    finally { setBusy(false) }
  }
  return <article className="space-y-3 rounded-md border bg-white p-3">
    <div className="min-w-0 space-y-1 break-words"><p className="text-sm font-semibold">{rule.name}</p><p className="text-sm">{summarySchedule(rule)}</p><p className="text-xs text-slate-600">{rule.enabled ? 'Kural etkin' : 'Kural kapalı; özet gönderilmez'} · {rule.recipientIds.length} seçili personel</p></div>
    <p className="text-xs text-slate-600">{rule.enabled ? 'Durdur, bu kurala bağlı tüm personel için yeni otomatik gönderimleri durdurur.' : !rule.recipientIds.length ? 'Etkinleştirmek için aşağıdaki personel kartlarından en az bir özet alıcısı seçin.' : 'Etkinleştir, bu kurala bağlı tüm personel için gelecek planlanan saatleri açar. Geçmiş saatler için bildirim gönderilmez.'}</p>
    <div className="flex flex-wrap gap-2">
    <Button type="button" variant={rule.enabled ? 'outline' : 'default'} className="min-h-11" disabled={disabled || busy || (!rule.enabled && !rule.recipientIds.length)} aria-label={`${rule.name}: ${rule.enabled ? 'kuralı durdur' : 'kuralı etkinleştir'}`} onClick={() => onEnabledChange(!rule.enabled)}>{rule.enabled ? 'Durdur' : 'Etkinleştir'}</Button>
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild><Button variant="outline" className="min-h-11" disabled={disabled || busy} aria-label={`${rule.name}: gün ve saati düzenle`}>Gün ve saati düzenle</Button></DialogTrigger>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg sm:max-w-lg">
        <DialogHeader><DialogTitle>Aidat özeti takvimini düzenle</DialogTitle><DialogDescription>{rule.name} · Türkiye saati (Europe/Istanbul)</DialogDescription></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">Bu takvim, kurala bağlı tüm personel için geçerlidir ({rule.recipientIds.length} kişi). Alıcı seçimleri ve kuralın açık/kapalı durumu korunur.</p>
          <fieldset disabled={busy} className="space-y-3">
            <fieldset><legend className="mb-2 text-sm font-medium">Gönderim günleri</legend><div className="grid grid-cols-2 gap-2">{summaryDays.map((day, i) => <label key={day} className="flex min-h-11 items-center gap-3 rounded-md border px-3 text-sm"><input type="checkbox" checked={weekdays.includes(i + 1)} onChange={e => setWeekdays(days => e.target.checked ? [...days, i + 1].sort((a, b) => a - b) : days.filter(d => d !== i + 1))} />{day}</label>)}</div></fieldset>
            {!weekdays.length && <p role="status" className="text-sm text-red-700">En az bir gün seçin.</p>}
            <label className="block text-sm font-medium">Gönderim saati<input type="time" required className="mt-1 min-h-11 w-full rounded-md border bg-white px-3 py-2 text-base" value={time} onChange={e => setTime(e.target.value)} /></label>
          </fieldset>
          <p className="text-sm text-slate-600">Yeni takvim kaydettikten sonraki saatler için uygulanır; geçmiş saatler için bildirim gönderilmez.{!rule.enabled && ' Bu kural kapalı kalır.'}</p>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => changeOpen(false)}>Vazgeç</Button><Button type="submit" disabled={busy || !weekdays.length || !time}>{busy ? 'Kaydediliyor…' : 'Takvimi kaydet'}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
    </div>
  </article>
}
