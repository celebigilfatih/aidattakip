'use client'

import { FormEvent, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { StaffCatalog } from './PushPanel'
import { staffRead, staffRequest } from './staff-http'
import { summaryDays, summarySchedule } from './summary-schedule'

type CreatedRule = { name: string; weekdays: number[]; time: string }
const field = 'mt-1 min-h-11 w-full rounded-md border bg-white px-3 py-2 text-base'
export default function StaffSummaryCreateDialog({ disabled, onCreated }: { disabled: boolean; onCreated: (rule: CreatedRule) => void }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState('')
  const [catalog, setCatalog] = useState<StaffCatalog | null>(null), [search, setSearch] = useState('')
  const [name, setName] = useState('Haftalık aidat özeti'), [weekdays, setWeekdays] = useState([1]), [time, setTime] = useState('09:00'), [recipientIds, setRecipientIds] = useState<string[]>([])
  const candidates = catalog?.recipients.filter(r => r.isActive && r.staffPushEnabled && r.userActive && ['ADMIN', 'ACCOUNTING'].includes(r.role)) ?? []
  const filtered = candidates.filter(r => r.name.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR')))
  async function loadRecipients() {
    setLoading(true); setError(''); setCatalog(null)
    try {
      const people: StaffCatalog = await staffRead(await fetch('/api/push/recipients', { cache: 'no-store' }))
      setCatalog(people)
      setRecipientIds(ids => ids.filter(id => people.recipients.some(r => r.id === id && r.isActive && r.staffPushEnabled && r.userActive && ['ADMIN', 'ACCOUNTING'].includes(r.role))))
    } catch (e) { setError(e instanceof Error ? e.message : 'Alıcılar yüklenemedi.') }
    finally { setLoading(false) }
  }
  function changeOpen(next: boolean) {
    if (busy) return
    setOpen(next)
    if (next) { setName('Haftalık aidat özeti'); setWeekdays([1]); setTime('09:00'); setRecipientIds([]); setSearch(''); void loadRecipients() }
  }
  async function create(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const rule = await staffRequest('/api/notifications/summary-rules', 'POST', { name, weekdays, time, recipientIds })
      setOpen(false); onCreated(rule)
    } catch (e) { setError(e instanceof Error ? e.message : 'Kural oluşturulamadı.') }
    finally { setBusy(false) }
  }
  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogTrigger asChild><Button disabled={disabled} className="min-h-11"><Plus className="mr-2 h-4 w-4" />Yeni aidat özeti kuralı</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg sm:max-w-xl">
      <DialogHeader><DialogTitle>Yeni aidat özeti kuralı</DialogTitle><DialogDescription>Hafta günlerini, saati ve alıcıları aynı formdan seçin. Türkiye saati (Europe/Istanbul).</DialogDescription></DialogHeader>
      <form onSubmit={create} className="space-y-4">
        <fieldset disabled={busy || loading || !catalog} className="space-y-4">
          <label className="block text-sm font-medium">Kural adı<input required maxLength={100} className={field} value={name} onChange={e => setName(e.target.value)} /></label>
          <fieldset><legend className="mb-2 text-sm font-medium">Gönderim günleri</legend><div className="grid grid-cols-2 gap-2">{summaryDays.map((day, i) => <label key={day} className="flex min-h-11 items-center gap-3 rounded-md border px-3 text-sm"><input type="checkbox" checked={weekdays.includes(i + 1)} onChange={e => setWeekdays(days => e.target.checked ? [...days, i + 1].sort((a, b) => a - b) : days.filter(d => d !== i + 1))} />{day}</label>)}</div>{!weekdays.length && <p role="status" className="mt-2 text-sm text-red-700">En az bir gün seçin.</p>}</fieldset>
          <label className="block text-sm font-medium">Gönderim saati<input type="time" required className={field} value={time} onChange={e => setTime(e.target.value)} /></label>
          <fieldset className="space-y-2"><legend className="mb-2 text-sm font-medium">Özet alıcıları</legend><p className="text-sm text-slate-600">Yalnız yetkili kapsamınızdaki seçili ve aktif yönetici/muhasebe personeli listelenir.</p>
            {candidates.length > 0 ? <>
              <label className="block text-sm font-medium">Alıcı ara<input type="search" placeholder="Ad soyad ile ara" className={field} value={search} onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }} onChange={e => setSearch(e.target.value)} /></label>
              <p className="text-xs text-slate-600">{recipientIds.length} seçili · {candidates.length} uygun personel</p>
              <div className="max-h-56 overflow-y-auto rounded-md border p-2">{filtered.map(r => {
                const primary = r.devices.find(d => d.id === r.primaryDeviceId && d.isActive && new Date(d.expiresAt) > new Date())
                return <label key={r.id} className="flex min-h-11 items-start gap-3 rounded p-2 text-sm"><input type="checkbox" className="mt-1" aria-label={`Özet alıcısı: ${r.name}`} checked={recipientIds.includes(r.id)} onChange={e => setRecipientIds(ids => e.target.checked ? [...ids, r.id] : ids.filter(id => id !== r.id))} /><span className="min-w-0 break-words"><span className="font-medium">{r.name}</span><span className="block text-xs text-slate-600">{r.role === 'ADMIN' ? 'Yönetici' : 'Muhasebe'} · {primary ? 'Ana cihaz kayıtlı' : 'Cihaz kurulumu gerekli'}</span></span></label>
              })}{!filtered.length && <p className="p-2 text-sm text-slate-600">Aramanıza uygun alıcı yok.</p>}</div>
            </> : !loading && catalog && <p className="rounded-md border p-3 text-sm text-slate-600">{catalog.canManageStaff ? 'Önce bu ekrandaki personel kartlarından aktif bir yönetici veya muhasebe personelini bildirim alıcısı seçin.' : 'Yöneticinizden aktif bir yönetici veya muhasebe personelini bildirim alıcısı seçmesini isteyin.'}</p>}
          </fieldset>
        </fieldset>
        <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">{summarySchedule({ weekdays, time })} · {recipientIds.length} alıcı. Yeni kural kapalı oluşturulur ve bildirim göndermez. İnceledikten sonra aynı karttaki Etkinleştir düğmesini kullanabilirsiniz.</p>
        {loading && <p role="status" className="text-sm">Alıcılar yükleniyor…</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!loading && !catalog && <Button type="button" variant="outline" onClick={loadRecipients}>Alıcıları yeniden yükle</Button>}
        <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => changeOpen(false)}>Vazgeç</Button><Button type="submit" disabled={busy || loading || !catalog || !name.trim() || !weekdays.length || !time || !recipientIds.length}>{busy ? 'Oluşturuluyor…' : 'Kapalı kural oluştur'}</Button></div>
      </form>
    </DialogContent>
  </Dialog>
}
