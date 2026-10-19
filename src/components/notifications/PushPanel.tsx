'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Identity = { id: string; firstName?: string; lastName?: string; name?: string }
type Recipient = { id: string; kind: string; name: string; isActive: boolean; devices: { id: string; label: string }[] }
type Catalog = { canInvite: boolean; recipients: Recipient[]; parents: Identity[]; students: Identity[]; staff: Identity[] }
const selectClass = 'w-full rounded border p-2 bg-white'
export default function PushPanel({ onSent }: { onSent: () => void }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const [kind, setKind] = useState('PARENT'), [identityId, setIdentityId] = useState(''), [verified, setVerified] = useState(false), [invite, setInvite] = useState('')
  const [recipientId, setRecipientId] = useState(''), [deviceId, setDeviceId] = useState(''), [title, setTitle] = useState('Test bildirimi'), [message, setMessage] = useState('SporManage bildirim kaydınız hazır.')
  const [notice, setNotice] = useState('')
  async function read(response: Response) {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'İşlem tamamlanamadı.')
    return data
  }
  async function load() { setCatalog(await read(await fetch('/api/push/recipients', { cache: 'no-store' }))) }
  useEffect(() => { load().catch(e => setError(e.message)) }, [])
  async function action(fn: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('')
    try { await fn() } catch (e) { setError(e instanceof Error ? e.message : 'İşlem tamamlanamadı.') } finally { setBusy(false) }
  }
  const identities = kind === 'PARENT' ? catalog?.parents : kind === 'STUDENT' ? catalog?.students : catalog?.staff
  const recipient = catalog?.recipients.find(r => r.id === recipientId)
  async function enroll() {
    const result = await read(await fetch('/api/push/recipients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, identityId, verified }) }))
    setInvite(result.inviteUrl || result.staffUrl); setVerified(false); await load()
    setNotice(result.inviteUrl ? 'Tek kullanımlık davet oluşturuldu. 24 saat geçerlidir; yalnız doğruladığınız kişiye iletin.' : 'Personel kaydedildi. Kendi personel hesabıyla bağlantıyı açıp cihazını kaydetmelidir.')
  }
  async function send() {
    const record = await read(await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, message, type: 'GENERAL_ANNOUNCEMENT', method: 'PUSH', recipientType: 'recipient', recipientId, targetDeviceId: deviceId }) }))
    try {
      const result = await read(await fetch('/api/notifications/' + record.id + '/send', { method: 'POST' }))
      setNotice(result.message || 'Push servisi kabul etti.'); await load()
    } finally { onSent() }
  }
  return <Card><CardHeader><CardTitle>Alıcılar ve Cihazlar · Manuel Push</CardTitle></CardHeader><CardContent className="space-y-5">
    <p>Veli/sporcu için kişisel davet, personel için kendi girişi kullanılır. iPhone testinde HTTPS adresi ve ana ekrana ekleme gerekir. Otomatik kurallar bu aşamada kapalıdır.</p>
    <a href="/recipient" target="_blank" rel="noreferrer" className="text-blue-700 underline">Kendi cihazımda bildirimleri aç</a>
    {catalog?.canInvite && <section className="rounded border p-4 space-y-3">
      <h3 className="font-semibold">1. Doğrulanmış alıcı kaydı</h3>
      <label className="block">Alıcı türü<select aria-label="Alıcı kayıt türü" className={selectClass} value={kind} onChange={e => { setKind(e.target.value); setIdentityId(''); setVerified(false); setInvite('') }}><option value="PARENT">Veli</option><option value="STUDENT">Kendi hesabını kullanacak sporcu</option><option value="STAFF">Kulüp personeli</option></select></label>
      <label className="block">Kişi<select aria-label="Davet edilecek kişi" className={selectClass} value={identityId} onChange={e => { setIdentityId(e.target.value); setVerified(false); setInvite('') }}><option value="">Kişi seçin</option>{identities?.map(p => <option key={p.id} value={p.id}>{p.name || p.firstName + ' ' + p.lastName}</option>)}</select></label>
      <label className="flex gap-2"><input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} />Kişinin kimliğini ve bu kayıt için bildirim alma yetkisini doğruladım. Sporcu kaydında kendi hesabını kullanmaya uygunluğunu ayrıca doğruladım.</label>
      <Button disabled={busy || !identityId || !verified} onClick={() => action(enroll)}>Alıcı kaydı / yeni davet oluştur</Button>
      {invite && <div className="space-y-2"><Input aria-label="Kişisel davet bağlantısı" readOnly value={invite} /><Button variant="outline" onClick={() => action(async () => { await navigator.clipboard.writeText(invite); setNotice('Bağlantı kopyalandı.') })}>Bağlantıyı kopyala</Button><p className="text-sm">Davet kişiye özeldir. Yeni davet, kullanılmamış eski davetleri iptal eder. Başkasına ait bağlantıyı kendi cihazınızda açmayın.</p></div>}
    </section>}
    {catalog && <section className="rounded border p-4 space-y-3"><div className="flex justify-between"><h3 className="font-semibold">2. Tek cihazda manuel push</h3><Button variant="outline" disabled={busy} onClick={() => action(load)}>Alıcıları yenile</Button></div>
      <label className="block">Kayıtlı alıcı<select aria-label="Push alıcısı" className={selectClass} value={recipientId} onChange={e => { setRecipientId(e.target.value); setDeviceId('') }}><option value="">Alıcı seçin</option>{catalog.recipients.filter(r => r.isActive).map(r => <option key={r.id} value={r.id}>{r.name} · {r.kind} · {r.devices.length} cihaz</option>)}</select></label>
      <label className="block">Tek hedef cihaz<select aria-label="Push hedef cihazı" className={selectClass} value={deviceId} onChange={e => setDeviceId(e.target.value)}><option value="">Cihaz seçin</option>{recipient?.devices.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
      {recipient && !recipient.devices.length && <p className="text-amber-800">Alıcı henüz bildirim izni vermemiş veya cihaz/oturum süresi dolmuş. Kişisel daveti alıcının kendi cihazında açın.</p>}
      <label className="block">Başlık<Input value={title} maxLength={120} onChange={e => setTitle(e.target.value)} /></label>
      <label className="block">Alıcı ekranındaki mesaj<textarea className={selectClass} rows={3} maxLength={2000} value={message} onChange={e => setMessage(e.target.value)} /></label>
      <p className="text-sm text-gray-600">Kilit ekranında genel mesaj gösterilir. Bu içerik yalnız alıcının giriş yaptığı ekranda açılır. Servis kabulü, telefonda görüntülenme veya okunma kanıtı değildir.</p>
      <Button disabled={busy || !deviceId || !title.trim() || !message.trim()} onClick={() => action(send)}>Seçili tek cihaza push gönder</Button>
      {catalog.canInvite && recipient && <Button variant="outline" disabled={busy} onClick={() => action(async () => {
        await read(await fetch('/api/push/recipients', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: recipient.id }) })); setRecipientId(''); setDeviceId(''); await load(); setNotice('Alıcı erişimi ve cihazları pasifleştirildi.')
      })}>Seçili alıcının erişimini kapat</Button>}
    </section>}
    {error && <p role="alert" className="text-red-700">{error}</p>}{notice && <p role="status" className="text-green-800">{notice}</p>}
  </CardContent></Card>
}
