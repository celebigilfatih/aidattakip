'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Session = { name: string; kind: string; devices: { id: string; label: string; expiresAt: string }[]; notifications: { id: string; title: string; message: string; sentAt: string }[] }
export default function RecipientPage() {
  const [token, setToken] = useState(''), [session, setSession] = useState<Session | null>(null)
  const [message, setMessage] = useState(''), [busy, setBusy] = useState(false)
  const [supported, setSupported] = useState(false), [needsInstall, setNeedsInstall] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  async function load() {
    const response = await fetch('/api/push/session', { cache: 'no-store' })
    if (response.ok) setSession(await response.json())
  }
  useEffect(() => {
    const fragment = new URLSearchParams(location.hash.slice(1)).get('invite')
    if (fragment) { setToken(fragment); history.replaceState(null, '', '/recipient') }
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const standalone = matchMedia('(display-mode: standalone)').matches || !!(navigator as Navigator & { standalone?: boolean }).standalone
    setNeedsInstall(ios && !standalone)
    setSupported('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && window.isSecureContext)
    load().catch(() => setMessage('Bağlantı kurulamadı.'))
    fetch('/api/push/config').then(r => r.json()).then(c => setConfigured(c.configured)).catch(() => {})
  }, [])
  async function action(fn: () => Promise<void>) {
    setBusy(true); setMessage('')
    try { await fn() } catch (error) { setMessage(error instanceof Error ? error.message : 'İşlem tamamlanamadı.') } finally { setBusy(false) }
  }
  async function check(response: Response) {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'İşlem tamamlanamadı.')
    return data
  }
  async function activate() {
    await check(await fetch('/api/push/activate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }))
    setToken(''); await load(); setMessage('Alıcı kaydınız doğrulandı. Şimdi bu cihazda bildirimleri açabilirsiniz.')
  }
  function useInviteLink() {
    try {
      const url = new URL(inviteLink)
      const invitation = new URLSearchParams(url.hash.slice(1)).get('invite')
      if (url.origin !== location.origin || url.pathname !== '/recipient' || !invitation || !/^[A-Za-z0-9_-]{43}$/.test(invitation)) throw new Error()
      setToken(invitation); setInviteLink(''); setMessage('')
    } catch { setMessage('Kulübünüzün bu uygulama için verdiği kişisel davet bağlantısını eksiksiz yapıştırın.') }
  }
  async function subscribe() {
    // Keep the permission request directly attached to the user's button press (iOS requirement).
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') throw new Error('Bildirim izni verilmedi. Tarayıcı ayarlarından izin verip tekrar deneyebilirsiniz.')
    const config = await check(await fetch('/api/push/config'))
    if (!config.publicKey) throw new Error('Push sunucusu henüz yapılandırılmadı.')
    await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      const key = Uint8Array.from(atob(config.publicKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
      subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
    }
    const data = subscription.toJSON()
    await check(await fetch('/api/push/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: data.endpoint, keys: data.keys, label: /iPhone/.test(navigator.userAgent) ? 'iPhone' : 'Tarayıcı cihazım' }) }))
    await load(); setMessage('Bu cihaz kaydedildi. Kulüp yöneticisi şimdi test bildirimi gönderebilir.')
  }
  async function disable() {
    // Stop server dispatch first. If unsubscribe fails, the server still cannot send through this session.
    for (const device of session?.devices ?? []) await check(await fetch('/api/push/subscription', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: device.id }) }))
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration('/')
      await (await registration?.pushManager.getSubscription())?.unsubscribe()
    }
    await load(); setMessage('Bu oturumun cihaz bildirimleri kapatıldı.')
  }
  async function logout() {
    await check(await fetch('/api/push/session', { method: 'DELETE' }))
    setSession(null); setMessage('Alıcı oturumu kapatıldı; bu oturumun cihazlarına gönderim durduruldu.')
  }
  return <main className="max-w-xl mx-auto px-4 py-8 space-y-5">
    <h1 className="text-2xl font-bold">SporManage Bildirimlerim</h1>
    <p className="text-gray-600">Kulübünüzden gelen bildirimleri güvenli şekilde alın. Bu ekran yönetim paneli erişimi sağlamaz.</p>
    {token && <Card><CardHeader><CardTitle>Kulüp daveti</CardTitle></CardHeader><CardContent className="space-y-3">
      <p>Bu bağlantı yalnız kulübün sizin adınıza doğruladığı kayıt içindir. Size ait değilse kullanmayın. Bağlantı tek kullanımlıktır.</p>
      <Button disabled={busy} onClick={() => action(activate)}>Daveti kabul et</Button>
    </CardContent></Card>}
    {!token && (!session || session.kind === 'STAFF') && <div className="space-y-3">
      {!session && <p>Kulübünüzden kişisel davet bağlantısı isteyin. Personelseniz <a className="text-blue-700 underline" href="/login">personel girişi</a> sonrasında bu ekranı açabilirsiniz.</p>}
      {session?.kind === 'STAFF' && <p>Personel oturumunuz açık. Veli veya sporcu davetini kabul etmek için kişisel davet bağlantısını aşağıya yapıştırın.</p>}
      <p>iPhone ana ekranından açtığınızda oturum görünmüyorsa, kullanılmamış davet bağlantınızı buraya yapıştırıp bu uygulama içinde kabul edin.</p>
      <label className="block" htmlFor="invite-link">Kişisel davet bağlantısı</label>
      <input id="invite-link" type="password" autoComplete="off" spellCheck={false} value={inviteLink} onChange={event => setInviteLink(event.target.value)} className="w-full rounded border p-2" />
      <Button disabled={busy || !inviteLink.trim()} onClick={useInviteLink}>Davet bağlantısını kullan</Button>
    </div>}
    {session && <Card><CardHeader><CardTitle>{session.name}</CardTitle></CardHeader><CardContent className="space-y-4">
      <p className="font-medium">Açık oturum: {session.kind === 'PARENT' ? 'Veli' : session.kind === 'STUDENT' ? 'Sporcu' : 'Kulüp personeli'}</p>
      {needsInstall && <div className="rounded bg-blue-50 p-3">iPhone: Safari'de Paylaş → Ana Ekrana Ekle seçin. Ardından ana ekrandaki SporManage simgesinden açıp “Bildirimleri aç” düğmesine dokunun.</div>}
      {!configured && <p className="text-amber-800">Push gönderimi sunucuda henüz yapılandırılmadı.</p>}
      {!supported && !needsInstall && <p>Bu tarayıcıda push desteklenmiyor veya güvenli HTTPS bağlantısı yok.</p>}
      <p>Kilit ekranında genel bir mesaj görünür. Bildirim ayrıntıları yalnız bu oturumda açılır. Oturum süresi dolarsa kulüpten yeni davet almanız gerekir.</p>
      <div className="flex gap-2 flex-wrap">
        <Button disabled={busy || !!token || !supported || needsInstall || !configured} onClick={() => action(subscribe)}>Bildirimleri aç / cihazı yenile</Button>
        <Button variant="outline" disabled={busy || !session.devices.length} onClick={() => action(disable)}>Bildirimleri kapat</Button>
        <Button variant="outline" disabled={busy} onClick={() => action(logout)}>Alıcı oturumunu kapat</Button>
      </div>
      {session.devices.map(d => <p key={d.id} className="text-sm text-gray-600">{d.label} · Kayıt süresi: {new Date(d.expiresAt).toLocaleString('tr-TR')}</p>)}
    </CardContent></Card>}
    {message && <p role="status" className="rounded border p-3">{message}</p>}
    {session && <section className="space-y-3"><div className="flex justify-between items-center"><h2 className="text-xl font-semibold">Bildirim geçmişi</h2><Button variant="outline" onClick={() => action(load)}>Yenile</Button></div>
      {session.notifications.map(n => <Card key={n.id}><CardContent className="pt-5"><h3 className="font-semibold">{n.title}</h3><p className="whitespace-pre-wrap">{n.message}</p></CardContent></Card>)}
      {!session.notifications.length && <p>Henüz bildiriminiz yok.</p>}
    </section>}
  </main>
}
