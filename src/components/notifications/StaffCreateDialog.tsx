'use client'

import { FormEvent, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { staffRead, staffRequest } from './staff-http'

type Branch = { id: string; name: string; groups: { id: string; name: string }[] }
const field = 'mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base'
const roles = { SECRETARY: 'Sekreter', ACCOUNTING: 'Muhasebe', TRAINER: 'Antrenör', ADMIN: 'Yönetici' }
export default function StaffCreateDialog({ onCreated }: { onCreated: (message: string) => void }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [loading, setLoading] = useState(false)
  const [error, setError] = useState(''), [branches, setBranches] = useState<Branch[]>([]), [fixedBranchId, setFixedBranchId] = useState<string | null>(null)
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [phone, setPhone] = useState('')
  const [role, setRole] = useState<keyof typeof roles>('SECRETARY'), [branchId, setBranchId] = useState(''), [groupIds, setGroupIds] = useState<string[]>([])
  const [selected, setSelected] = useState(true)
  const [optionsReady, setOptionsReady] = useState(false)
  async function loadOptions() {
    setLoading(true); setError(''); setOptionsReady(false)
    try {
      const options = await staffRead(await fetch('/api/push/staff', { cache: 'no-store' }))
      setBranches(options.branches); setFixedBranchId(options.fixedBranchId); setBranchId(options.fixedBranchId || '')
      setOptionsReady(true)
    } catch (e) { setError(e instanceof Error ? e.message : 'Şubeler yüklenemedi.') }
    finally { setLoading(false) }
  }
  function changeOpen(next: boolean) {
    if (busy) return
    setOpen(next)
    if (!next) { setPassword(''); return }
    setName(''); setEmail(''); setPhone(''); setPassword(''); setRole('SECRETARY'); setGroupIds([]); setSelected(true)
    void loadOptions()
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      await staffRequest('/api/push/staff', 'POST', { name, email, password, phone, role, branchId: branchId || null, groupIds: role === 'TRAINER' ? groupIds : [], selectForNotifications: selected })
      setPassword(''); setOpen(false)
      onCreated(selected ? `${name.trim()} oluşturuldu ve bildirim alıcısı seçildi. Personel kendi hesabıyla cihazını kaydetmeli.` : `${name.trim()} oluşturuldu. Bildirim alıcısı seçilmedi.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Personel oluşturulamadı.') }
    finally { setBusy(false) }
  }
  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" />Yeni personel ekle</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg sm:max-w-xl">
      <DialogHeader><DialogTitle>Yeni personel ekle</DialogTitle><DialogDescription>Personelin giriş hesabını oluşturun ve bildirim alıcısı olup olmayacağını seçin.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={busy || !optionsReady} className="space-y-4">
          <label className="block text-sm font-medium">Ad soyad<input autoComplete="name" required maxLength={120} className={field} value={name} onChange={e => setName(e.target.value)} /></label>
          <label className="block text-sm font-medium">E-posta<input type="email" autoComplete="off" required maxLength={254} className={field} value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label className="block text-sm font-medium">İlk giriş şifresi<input type="password" autoComplete="new-password" required minLength={6} maxLength={72} className={field} value={password} onChange={e => setPassword(e.target.value)} /><span className="mt-1 block text-xs font-normal text-slate-500">En az 6 karakter. Giriş bilgileri otomatik gönderilmez.</span></label>
          <label className="block text-sm font-medium">Telefon <span className="font-normal text-slate-500">(isteğe bağlı)</span><input type="tel" autoComplete="tel" maxLength={30} className={field} value={phone} onChange={e => setPhone(e.target.value)} /></label>
          <label className="block text-sm font-medium">Rol<select className={field} value={role} onChange={e => { setRole(e.target.value as keyof typeof roles); setGroupIds([]) }}>{Object.entries(roles).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <p className="text-sm text-slate-600">{role === 'ADMIN' ? 'Yönetici tüm yönetim yetkilerini alır. Yalnız bildirim alması için bu rolü vermeniz gerekmez.' : role === 'ACCOUNTING' ? 'Muhasebe, yetkili olduğu kapsamda mali ayrıntı ve aidat özeti görebilir.' : 'Bu rol genel duyuru alabilir; aidat özeti ve mali ayrıntılara erişemez.'}</p>
          <label className="block text-sm font-medium">Şube{role === 'TRAINER' ? ' (zorunlu)' : ''}<select required={role === 'TRAINER'} disabled={!!fixedBranchId} className={field} value={branchId} onChange={e => { setBranchId(e.target.value); setGroupIds([]) }}><option value="">Şube kısıtı yok</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
          {role === 'TRAINER' && branchId && <fieldset className="rounded-md border p-3"><legend className="px-1 text-sm font-medium">Yetkili gruplar (isteğe bağlı)</legend>{branches.find(b => b.id === branchId)?.groups.map(g => <label key={g.id} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={groupIds.includes(g.id)} onChange={e => setGroupIds(ids => e.target.checked ? [...ids, g.id] : ids.filter(id => id !== g.id))} />{g.name}</label>)}{!branches.find(b => b.id === branchId)?.groups.length && <p className="text-sm text-slate-500">Bu şubede aktif grup yok.</p>}</fieldset>}
          <label className="flex min-h-11 items-start gap-3 rounded-md border bg-slate-50 p-3 text-sm"><input type="checkbox" className="mt-1" checked={selected} onChange={e => setSelected(e.target.checked)} /><span><strong>Bildirim alıcısı olarak seç</strong><span className="mt-1 block text-slate-600">Cihaz izni personelin kendi telefonunda verilir. Haftalık aidat özeti için ayrıca ilgili kuraldan alıcı seçin.</span></span></label>
        </fieldset>
        {loading && <p role="status" className="text-sm">Şubeler yükleniyor…</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!loading && !optionsReady && <Button type="button" variant="outline" onClick={loadOptions}>Şubeleri yeniden yükle</Button>}
        <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => changeOpen(false)}>Vazgeç</Button><Button type="submit" disabled={busy || !optionsReady}>{busy ? 'Kaydediliyor…' : selected ? 'Oluştur ve alıcı seç' : 'Personeli oluştur'}</Button></div>
      </form>
    </DialogContent>
  </Dialog>
}
