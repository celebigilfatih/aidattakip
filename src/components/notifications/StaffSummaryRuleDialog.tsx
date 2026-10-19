'use client'

import { FormEvent, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { StaffCatalog } from './PushPanel'
import { staffRead, staffRequest } from './staff-http'
import { summaryDays, summarySchedule } from './summary-schedule'
import type { MembershipRule } from './StaffSummaryMembership'

type SavedRule = { id: string; name: string; weekdays: number[]; time: string }
const field = 'mt-1 min-h-11 w-full rounded-md border bg-white px-3 py-2 text-base'
export default function StaffSummaryRuleDialog({ disabled, rule, onSaved }: { disabled: boolean; rule?: MembershipRule; onSaved: (rule: SavedRule) => void }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState('')
  const [catalog, setCatalog] = useState<StaffCatalog | null>(null), [search, setSearch] = useState('')
  const [name, setName] = useState('Haftalık aidat özeti'), [weekdays, setWeekdays] = useState([1]), [time, setTime] = useState('09:00'), [recipientIds, setRecipientIds] = useState<string[]>([])
  const [loadedRule, setLoadedRule] = useState<MembershipRule | null>(null)
  const eligible = (people: StaffCatalog, branch: string | null) => people.recipients.filter(r => r.isActive && r.staffPushEnabled && r.userActive && ['ADMIN', 'ACCOUNTING'].includes(r.role) && (!branch || people.staff.find(s => s.id === r.userId)?.branchId === branch))
  const candidates = catalog ? eligible(catalog, loadedRule?.branchId ?? null) : []
  const invalid = recipientIds.filter(id => !candidates.some(r => r.id === id))
  const filtered = candidates.filter(r => r.name.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR')))
  async function loadRecipients() {
    setLoading(true); setError(''); setCatalog(null)
    try {
      const [people, summary]: [StaffCatalog, { rules: MembershipRule[] } | null] = await Promise.all([
        fetch('/api/push/recipients', { cache: 'no-store' }).then(staffRead),
        rule ? fetch('/api/push/staff-summary', { cache: 'no-store' }).then(staffRead) : Promise.resolve(null),
      ])
      if (rule) {
        const current = summary?.rules.find(r => r.id === rule.id)
        if (!current) throw Error('Kural artık yetkili kapsamda bulunamıyor. Formu kapatıp listeyi yenileyin.')
        setLoadedRule(current); setName(current.name); setWeekdays(current.weekdays); setTime(current.time); setRecipientIds(current.recipientIds)
      }
      setCatalog(people)
    } catch (e) { setError(e instanceof Error ? e.message : 'Alıcılar yüklenemedi.') }
    finally { setLoading(false) }
  }
  function changeOpen(next: boolean) {
    if (busy) return
    setOpen(next)
    if (next) { setLoadedRule(null); setName(rule?.name ?? 'Haftalık aidat özeti'); setWeekdays(rule?.weekdays ?? [1]); setTime(rule?.time ?? '09:00'); setRecipientIds([]); setSearch(''); void loadRecipients() }
  }
  async function create(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = rule
        ? await staffRequest('/api/push/staff-summary', 'PUT', { ruleId: rule.id, name, weekdays, time, recipientIds, expected: { name: loadedRule!.name, weekdays: loadedRule!.weekdays, time: loadedRule!.time, recipientIds: loadedRule!.recipientIds } })
        : await staffRequest('/api/notifications/summary-rules', 'POST', { name, weekdays, time, recipientIds })
      setOpen(false); onSaved(rule ? result.rule : result)
    } catch (e) { setError(e instanceof Error ? e.message : 'Kural kaydedilemedi.') }
    finally { setBusy(false) }
  }
  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogTrigger asChild><Button variant={rule ? 'outline' : 'default'} disabled={disabled} className="min-h-11" aria-label={rule ? `${rule.name}: kuralı düzenle` : undefined}>{rule ? 'Düzenle' : <><Plus className="mr-2 h-4 w-4" />Yeni aidat özeti kuralı</>}</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg sm:max-w-xl">
      <DialogHeader><DialogTitle>{rule ? 'Aidat özeti kuralını düzenle' : 'Yeni aidat özeti kuralı'}</DialogTitle><DialogDescription>Kural adını, hafta günlerini, saati ve alıcıları aynı formdan {rule ? 'düzenleyin' : 'seçin'}. Türkiye saati (Europe/Istanbul).</DialogDescription></DialogHeader>
      <form onSubmit={create} className="space-y-4">
        <fieldset disabled={busy || loading || !catalog} className="space-y-4">
          <label className="block text-sm font-medium">Kural adı<input required maxLength={100} className={field} value={name} onChange={e => setName(e.target.value)} /></label>
          <fieldset><legend className="mb-2 text-sm font-medium">Gönderim günleri</legend><div className="grid grid-cols-2 gap-2">{summaryDays.map((day, i) => <label key={day} className="flex min-h-11 items-center gap-3 rounded-md border px-3 text-sm"><input type="checkbox" checked={weekdays.includes(i + 1)} onChange={e => setWeekdays(days => e.target.checked ? [...days, i + 1].sort((a, b) => a - b) : days.filter(d => d !== i + 1))} />{day}</label>)}</div>{!weekdays.length && <p role="status" className="mt-2 text-sm text-red-700">En az bir gün seçin.</p>}</fieldset>
          <label className="block text-sm font-medium">Gönderim saati<input type="time" required className={field} value={time} onChange={e => setTime(e.target.value)} /></label>
          <fieldset className="space-y-2"><legend className="mb-2 text-sm font-medium">Özet alıcıları</legend><p className="text-sm text-slate-600">Yalnız yetkili kapsamınızdaki seçili ve aktif yönetici/muhasebe personeli listelenir.</p>
            {invalid.length > 0 && <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3"><p className="text-sm">Artık uygun olmayan alıcılar var. Kaydetmeden önce bu seçimleri çıkarıp en az bir uygun alıcı seçin.</p>{invalid.map((id, index) => <label key={id} className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" className="mt-1" aria-label={`Uygun olmayan alıcı ${index + 1}`} checked onChange={() => setRecipientIds(ids => ids.filter(value => value !== id))} /><span>{catalog?.recipients.find(r => r.id === id)?.name ?? 'Önceki alıcı'} · Artık uygun değil</span></label>)}</div>}
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
        <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">{summarySchedule({ weekdays, time })} · {recipientIds.length} alıcı. {rule ? 'Kaydetme tüm bağlı personeli etkiler; kuralın güncel etkinlik durumu ve geçmiş korunur. Değişen gün/saat yalnız sonraki saatlere uygulanır.' : 'Yeni kural kapalı oluşturulur ve bildirim göndermez. İnceledikten sonra aynı karttaki Etkinleştir düğmesini kullanabilirsiniz.'}</p>
        {loading && <p role="status" className="text-sm">Alıcılar yükleniyor…</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!loading && !catalog && <Button type="button" variant="outline" onClick={loadRecipients}>Formu yeniden yükle</Button>}
        <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => changeOpen(false)}>Vazgeç</Button><Button type="submit" disabled={busy || loading || !catalog || (!!rule && !loadedRule) || !name.trim() || !weekdays.length || !time || !recipientIds.length || invalid.length > 0}>{busy ? 'Kaydediliyor…' : rule ? 'Değişiklikleri kaydet' : 'Kapalı kural oluştur'}</Button></div>
      </form>
    </DialogContent>
  </Dialog>
}
