'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { registerStaffDevice } from '@/lib/staff-push-client'
type Device = { id: string; label: string; isActive: boolean; expiresAt: string; thisSession: boolean }
type Session = { name: string; selected: boolean; financial: boolean; primaryDeviceId: string | null; devices: Device[]; notifications: { id: string; title: string; message: string; isFeeSummary: boolean }[] }
export default function RecipientPage() {
 const [session,setSession] = useState<Session|null>(null), [message,setMessage]=useState(''), [busy,setBusy]=useState(false), [needsInstall,setNeedsInstall]=useState(false), [supported,setSupported]=useState(false)
 async function load() { const r=await fetch('/api/push/session',{cache:'no-store'});if(r.ok)setSession(await r.json());else setSession(null) }
 useEffect(()=>{
  history.replaceState(null,'','/recipient')
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)
  const standalone=matchMedia('(display-mode: standalone)').matches||!!(navigator as Navigator & {standalone?:boolean}).standalone
  setNeedsInstall(ios&&!standalone);setSupported('Notification' in window&&'serviceWorker' in navigator&&'PushManager' in window&&isSecureContext)
  load().catch(()=>setMessage('Bağlantı kurulamadı.'))
 },[])
 async function action(fn:()=>Promise<void>) {setBusy(true);setMessage('');try{await fn()}catch(e){setMessage(e instanceof Error?e.message:'İşlem tamamlanamadı.')}finally{setBusy(false)}}
 async function request(path:string,method:string,body?:unknown){const r=await fetch(path,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();if(!r.ok)throw Error(d.error||'İşlem başarısız.');return d}
 async function subscribe(){const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('Bildirim izni verilmedi. iPhone bildirim ayarlarını kontrol edin.');if(!await registerStaffDevice())throw Error('Bu tarayıcıda push desteklenmiyor.');await load();setMessage('Bu cihaz kaydedildi. Bildirim kaydı 30 gün geçerlidir.');}
 async function disable(){for(const d of session?.devices.filter(d=>d.thisSession)??[])await request('/api/push/subscription','DELETE',{deviceId:d.id});const reg=await navigator.serviceWorker.getRegistration('/');await(await reg?.pushManager.getSubscription())?.unsubscribe();await load();setMessage('Bu oturumun cihaz bildirimleri kapatıldı.');}
 return <main className="max-w-2xl mx-auto p-5 space-y-5">
  <h1 className="text-2xl font-bold">Personel Bildirimlerim</h1><p>Personel hesabınızla bildirim alın. Veli/sporcu push davetleri bu sürümde kapalıdır.</p>
  {!session?<a className="text-blue-700 underline" href="/login?next=/recipient">Personel hesabıyla giriş yap</a>:<>
   <h2 className="text-xl font-semibold">{session.name}</h2>
   {!session.selected?<p>Bildirim alıcısı olarak seçilmediniz. Kulüp yöneticinize başvurun.</p>:<>
    {needsInstall&&<p className="bg-blue-50 p-3 rounded">iPhone: Safari → Paylaş → Ana Ekrana Ekle. Ardından SporManage simgesinden açıp personel hesabınızla giriş yapın.</p>}
    <p>Cihaz kaydı 30 gün geçerlidir; uygulamayı geçerli girişle kullandığınızda yenilenir. Ayrıntı için giriş gerekir. Çıkış bildirimleri kapatır.</p>
    <div className="flex gap-2 flex-wrap"><Button disabled={busy||needsInstall||!supported} onClick={()=>action(subscribe)}>Bu cihazda bildirimleri aç</Button><Button variant="outline" disabled={busy||!supported} onClick={()=>action(disable)}>Bu cihazda bildirimleri kapat</Button></div>
    <Button variant="outline" disabled={busy||!supported} onClick={()=>action(async()=>{for(const d of session.devices.filter(d=>d.thisSession))await request('/api/push/subscription','DELETE',{deviceId:d.id});const reg=await navigator.serviceWorker.getRegistration('/');await(await reg?.pushManager.getSubscription())?.unsubscribe();setMessage('Tarayıcı aboneliği sıfırlandı. Şimdi bildirimleri açabilirsiniz.');})}>Eski tarayıcı aboneliğini sıfırla</Button>
    <p className="text-sm text-gray-600">Sıfırlama eski veli/personel aboneliği çakışmasını giderir. Yeni kayıt için üstteki düğmeye dokunun.</p>
   </>}
   {session.devices.map(d=><div key={d.id} className="border rounded p-3 flex justify-between gap-3"><div>{d.label} {session.primaryDeviceId===d.id?'· Ana cihaz':''}<p>{!d.isActive?'Pasif':new Date(d.expiresAt)<=new Date()?'Süresi dolmuş':'Cihaz kayıtlı'} · {new Date(d.expiresAt).toLocaleString('tr-TR')}</p></div><Button variant="outline" disabled={busy||!session.selected||!d.isActive||new Date(d.expiresAt)<=new Date()} onClick={()=>action(async()=>{await request('/api/push/subscription','PATCH',{deviceId:d.id});await load()})}>Ana cihaz seç</Button></div>)}
   {session.financial&&<a className="block text-blue-700 underline" href="/notifications/overdue">Güncel geciken aidat listesini aç</a>}
   <h2 className="text-xl font-semibold">Bildirim geçmişi</h2>{session.notifications.map(n=><article key={n.id} className="border rounded p-3"><h3 className="font-semibold">{n.title}</h3><p>{n.message}</p>{n.isFeeSummary&&<a className="text-blue-700 underline" href="/notifications/overdue">Güncel liste</a>}</article>)}
   <Button variant="outline" disabled={busy} onClick={()=>action(async()=>{await request('/api/auth/logout','POST');setSession(null);setMessage('Çıkış yapıldı; bu oturumun cihazlarına gönderim durduruldu.');})}>Personel oturumunu kapat</Button>
  </>}{message&&<p role="status" className="border rounded p-3">{message}</p>}
 </main>
}
