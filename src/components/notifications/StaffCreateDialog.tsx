'use client'

import { FormEvent, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { staffRead, staffRequest } from './staff-http'
import { summarySchedule } from './summary-schedule'

type Branch = { id: string; name: string; groups: { id: string; name: string }[] }
type SummaryRule = { id: string; name: string; enabled: boolean; branchId: string | null; weekdays: number[]; time: string }
const field = 'mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base'
const roles = { SECRETARY: 'Sekreter', ACCOUNTING: 'Muhasebe', TRAINER: 'Antrenör', ADMIN: 'Yönetici' }
export default function StaffCreateDialog({ onCreated }: { onCreated: (message: string) => void }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [loading, setLoading] = useState(false)
  const [error, setError] = useState(''), [branches, setBranches] = useState<Branch[]>([]), [fixedBranchId, setFixedBranchId] = useState<string | null>(null)
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [phone, setPhone] = useState('')
  const [role, setRole] = useState<keyof typeof roles>('SECRETARY'), [branchId, setBranchId] = useState(''), [groupIds, setGroupIds] = useState<string[]>([])
  const [selected, setSelected] = useState(true)
  const [summaryRules, setSummaryRules] = useState<SummaryRule[]>([]), [wantsSummary, setWantsSummary] = useState(false), [summaryRuleId, setSummaryRuleId] = useState('')
  const eligibleRules = summaryRules.filter(r => !r.branchId || r.branchId === branchId)
  const canReceiveSummary = selected && (role === 'ADMIN' || role === 'ACCOUNTING') && eligibleRules.length > 0
  const [optionsReady, setOptionsReady] = useState(false)
  async function loadOptions() {
    setLoading(true); setError(''); setOptionsReady(false)
    try {
      const options = await staffRead(await fetch('/api/push/staff', { cache: 'no-store' }))
      setBranches(options.branches); setFixedBranchId(options.fixedBranchId); setBranchId(options.fixedBranchId || '')
      setSummaryRules(options.summaryRules || [])
      setOptionsReady(true)
    } catch (e) { setError(e instanceof Error ? e.message : 'Şubeler yüklenemedi.') }
    finally { setLoading(false) }
  }
  function changeOpen(next: boolean) {
    if (busy) return
    setOpen(next)
    if (!next) { setPassword(''); return }
    setName(''); setEmail(''); setPhone(''); setPassword(''); setRole('SECRETARY'); setGroupIds([]); setSelected(true)
    setWantsSummary(false); setSummaryRuleId('')
    void loadOptions()
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const result = await staffRequest('/api/push/staff', 'POST', { name, email, password, phone, role, branchId: branchId || null, groupIds: role === 'TRAINER' ? groupIds : [], selectForNotifications: selected, summaryRuleId: wantsSummary && canReceiveSummary ? summaryRuleId : null })
      setPassword(''); setOpen(false)
      onCreated(result.staff.summaryRule ? `${name.trim()} oluşturuldu, bildirim alıcısı seçildi ve aidat özetine eklendi.${result.staff.summaryRule.enabled ? '' : ' Kural kapalı; etkinleştirilene kadar özet gönderilmez.'} Personel kendi hesabıyla cihazını kaydetmeli.` : selected ? `${name.trim()} oluşturuldu ve bildirim alıcısı seçildi. Personel kendi hesabıyla cihazını kaydetmeli.` : `${name.trim()} oluşturuldu. Bildirim alıcısı seçilmedi.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Personel oluşturulamadı.') }
    finally { setBusy(false) }
  }
  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" />Yeni personel ekle</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg sm:max-w-xl">
      <DialogHeader><DialogTitle>Yeni personel ekle</DialogTitle><DialogDescription>Personelin giriş hesabını oluşturun ve bildirim alıcısı olup olmayacağını seçin.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={busy || !optionsReady} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Ad soyad<input autoComplete="name" required maxLength={120} className={field} value={name} onChange={e => setName(e.target.value)} /></label>
          <label className="block text-sm font-medium">E-posta<input type="email" autoComplete="off" required maxLength={254} className={field} value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label className="block text-sm font-medium">İlk giriş şifresi<input type="password" autoComplete="new-password" required minLength={6} maxLength={72} className={field} value={password} onChange={e => setPassword(e.target.value)} /><span className="mt-1 block text-xs font-normal text-slate-500">En az 6 karakter. Giriş bilgileri otomatik gönderilmez.</span></label>
          <label className="block text-sm font-medium">Telefon <span className="font-normal text-slate-500">(isteğe bağlı)</span><input type="tel" autoComplete="tel" maxLength={30} className={field} value={phone} onChange={e => setPhone(e.target.value)} /></label>
          <label className="block text-sm font-medium">Rol<select className={field} value={role} onChange={e => { setRole(e.target.value as keyof typeof roles); setGroupIds([]); setWantsSummary(false); setSummaryRuleId('') }}>{Object.entries(roles).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label className="block text-sm font-medium">Şube{role === 'TRAINER' ? ' (zorunlu)' : ''}<select required={role === 'TRAINER'} disabled={!!fixedBranchId} className={field} value={branchId} onChange={e => { setBranchId(e.target.value); setGroupIds([]); setWantsSummary(false); setSummaryRuleId('') }}><option value="">Şube kısıtı yok</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
          <p className="text-sm text-slate-600 sm:col-span-2">{role === 'ADMIN' ? 'Yönetici tüm yönetim yetkilerini alır. Yalnız bildirim alması için bu rolü vermeniz gerekmez.' : role === 'ACCOUNTING' ? 'Muhasebe, yetkili olduğu kapsamda mali ayrıntı ve aidat özeti görebilir.' : 'Bu rol genel duyuru alabilir; aidat özeti ve mali ayrıntılara erişemez.'}</p>
          {role === 'TRAINER' && branchId && <fieldset className="rounded-md border p-3 sm:col-span-2"><legend className="px-1 text-sm font-medium">Yetkili gruplar (isteğe bağlı)</legend>{branches.find(b => b.id === branchId)?.groups.map(g => <label key={g.id} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={groupIds.includes(g.id)} onChange={e => setGroupIds(ids => e.target.checked ? [...ids, g.id] : ids.filter(id => id !== g.id))} />{g.name}</label>)}{!branches.find(b => b.id === branchId)?.groups.length && <p className="text-sm text-slate-500">Bu şubede aktif grup yok.</p>}</fieldset>}
          <label className="flex min-h-11 items-start gap-3 rounded-md border bg-slate-50 p-3 text-sm sm:col-span-2"><input type="checkbox" className="mt-1" checked={selected} onChange={e => { setSelected(e.target.checked); if (!e.target.checked) { setWantsSummary(false); setSummaryRuleId('') } }} /><span><strong>Bildirim alıcısı olarak seç</strong><span className="mt-1 block text-slate-600">Gönderim için personel kendi telefonunda bildirim izni vermeli ve cihazını kaydetmeli.</span></span></label>
          <div className="space-y-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 font-semibold"><input type="checkbox" disabled={!canReceiveSummary} checked={wantsSummary && canReceiveSummary} onChange={e => { setWantsSummary(e.target.checked); setSummaryRuleId(e.target.checked && eligibleRules.length === 1 ? eligibleRules[0].id : '') }} />Otomatik aidat özetini alsın</label>
            <p className="text-slate-600">{!selected ? 'Önce bildirim alıcısı olarak seçin.' : role !== 'ADMIN' && role !== 'ACCOUNTING' ? 'Aidat özeti yalnız yönetici ve muhasebe rollerine açıktır.' : !eligibleRules.length ? 'Bu kapsamda mevcut aidat özeti kuralı yok. Yeni kural oluşturulmaz.' : 'Türkiye saati. Seçerseniz mevcut haftalık kurala eklenir; takvim ve diğer alıcılar değişmez.'}</p>
            {wantsSummary && canReceiveSummary && <>
              {eligibleRules.length > 1 ? <label className="block font-medium">Aidat özeti kuralı<select required className={field} value={summaryRuleId} onChange={e => setSummaryRuleId(e.target.value)}><option value="">Kural seçin</option>{eligibleRules.map(r => <option key={r.id} value={r.id}>{r.name} · {summarySchedule(r)} · {r.enabled ? 'Etkin' : 'Kapalı'}</option>)}</select></label> : <p>{eligibleRules[0].name} · {summarySchedule(eligibleRules[0])} · {eligibleRules[0].enabled ? 'Etkin' : 'Kapalı'}</p>}
              {summaryRuleId && !eligibleRules.find(r => r.id === summaryRuleId)?.enabled && <p>Kural kapalı; etkinleştirilene kadar özet gönderilmez.</p>}
            </>}
          </div>
        </fieldset>
        {loading && <p role="status" className="text-sm">Şubeler yükleniyor…</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!loading && !optionsReady && <Button type="button" variant="outline" onClick={loadOptions}>Şubeleri yeniden yükle</Button>}
        <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => changeOpen(false)}>Vazgeç</Button><Button type="submit" disabled={busy || !optionsReady || (wantsSummary && canReceiveSummary && !summaryRuleId)}>{busy ? 'Kaydediliyor…' : wantsSummary && canReceiveSummary ? 'Oluştur ve özete ekle' : selected ? 'Oluştur ve alıcı seç' : 'Personeli oluştur'}</Button></div>
      </form>
    </DialogContent>
  </Dialog>
}
