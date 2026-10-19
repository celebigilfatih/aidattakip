'use client'
import { useEffect,useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card,CardHeader,CardTitle,CardContent } from '@/components/ui/card'
import StaffCreateDialog from './StaffCreateDialog'
import StaffSummaryMembership, { type MembershipRule } from './StaffSummaryMembership'
import StaffSummarySchedule from './StaffSummarySchedule'
import { summarySchedule } from './summary-schedule'
import { staffRead, staffRequest } from './staff-http'
export { staffRead, staffRequest } from './staff-http'
export type StaffDevice={id:string;label:string;isActive:boolean;expiresAt:string;updatedAt:string;deliveries:{status:string;statusCode:number|null;finishedAt:string|null}[]}
export type StaffRecipient={id:string;name:string;role:string;userId:string;userActive:boolean;isActive:boolean;staffPushEnabled:boolean;primaryDeviceId:string|null;devices:StaffDevice[]}
export type StaffCatalog={canManageStaff:boolean;recipients:StaffRecipient[];staff:{id:string;name:string;role:string;isActive:boolean;branchId:string|null}[]}
export const validDevice=(d:StaffDevice)=>d.isActive&&new Date(d.expiresAt)>new Date()
const field='w-full border rounded p-2 bg-white'
export default function PushPanel({onSent}:{onSent:()=>void}){
 const [catalog,setCatalog]=useState<StaffCatalog|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[search,setSearch]=useState('')
 const [summaryRules,setSummaryRules]=useState<MembershipRule[]>([])
 async function load(){const [people,summary]=await Promise.all([fetch('/api/push/recipients',{cache:'no-store'}).then(staffRead),fetch('/api/push/staff-summary',{cache:'no-store'}).then(staffRead)]);setCatalog(people);setSummaryRules(summary.rules);setError('')}
 useEffect(()=>{load().catch(e=>setError(e.message))},[])
 async function toggle(id:string,recipient?:StaffRecipient){setBusy(true);setError('');try{if(recipient?.staffPushEnabled&&recipient.isActive)await staffRequest('/api/push/recipients','DELETE',{id:recipient.id});else await staffRequest('/api/push/recipients','POST',{kind:'STAFF',identityId:id,verified:true});await load();onSent()}catch(e){setError(e instanceof Error?e.message:'İşlem başarısız.')}finally{setBusy(false)}}
 async function setSummary(userId:string,name:string,ruleId:string,receive:boolean){setBusy(true);setError('');setNotice('Özet seçimi kaydediliyor…');let saved=false;try{const result=await staffRequest('/api/push/staff-summary','PATCH',{userId,ruleId,receive});saved=true;setNotice(receive?`${name} aidat özetine eklendi.${result.ruleEnabled?'':' Kural kapalı; etkinleştirilene kadar gönderim yapılmaz.'}`:`${name} için bu aidat özeti kapatıldı.`);await load();onSent()}catch(e){setNotice('');setError(saved?'Seçim kaydedildi ancak liste yenilenemedi. Yenile düğmesini kullanın.':e instanceof Error?e.message:'Özet seçimi kaydedilemedi.')}finally{setBusy(false)}}
 function scheduleSaved(rule:Pick<MembershipRule,'id'|'weekdays'|'time'>){setSummaryRules(rules=>rules.map(r=>r.id===rule.id?{...r,...rule}:r));setError('');setNotice(`Aidat özeti takvimi kaydedildi: ${summarySchedule(rule)} · Türkiye saati. Alıcı seçimleri ve kuralın durumu korundu.`);load().catch(()=>setError('Takvim kaydedildi ancak liste yenilenemedi. Yenile düğmesini kullanın.'));onSent()}
 const filtered=catalog?.staff.filter(s=>s.name.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR')))
 const roleNames:Record<string,string>={ADMIN:'Yönetici',ACCOUNTING:'Muhasebe',SECRETARY:'Sekreter',TRAINER:'Antrenör'}
 function created(message:string){setNotice(message);setSearch('');setError('');load().catch(()=>setError('Personel oluşturuldu ancak liste yenilenemedi. Yenile düğmesini kullanın.'));onSent()}
 return <Card>
  <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3"><CardTitle>Personel ve Cihazlar</CardTitle>{catalog?.canManageStaff&&<StaffCreateDialog onCreated={created}/>}</CardHeader>
  <CardContent className="space-y-4">
   <p className="text-sm text-slate-600">Yeni personel ekleyin veya mevcut personeli bildirim alıcısı seçin. Personel kendi hesabıyla <a href="/recipient" className="text-blue-700 underline">cihazını kaydeder</a>.</p>
   <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">Aidat özetinin gününü, saatini ve alıcılarını buradan yönetebilirsiniz. Özet yalnız yönetici/muhasebeye açıktır.</p>
   {notice&&<p role="status" className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">{notice}</p>}
   {catalog&&<section aria-label="Aidat özeti takvimi" className="space-y-3 rounded-md border bg-slate-50 p-3"><div><h3 className="font-semibold">Aidat özeti takvimi</h3><p className="mt-1 text-sm text-slate-600">Türkiye saati (Europe/Istanbul). Gün ve saat, aynı kurala bağlı tüm personel için geçerlidir.</p></div>{summaryRules.map(rule=><StaffSummarySchedule key={rule.id} rule={rule} disabled={busy} onSaved={scheduleSaved}/>)}{!summaryRules.length&&<p className="text-sm text-slate-600">Bu kapsamda aidat özeti kuralı yok. İlk kuralı Otomatik Aidat Özeti bölümünden oluşturabilirsiniz.</p>}</section>}
   <label className="block text-sm font-medium">Personel ara<input type="search" className="mt-1 min-h-11 w-full rounded-md border px-3 py-2 text-base" placeholder="Ad soyad ile ara" value={search} onChange={e=>setSearch(e.target.value)}/></label>
   {!catalog&&!error&&<p role="status">Personeller yükleniyor…</p>}
   {filtered?.map(s=>{const r=catalog!.recipients.find(r=>r.userId===s.id);return <article className="border rounded-md p-4 space-y-2" key={s.id}>
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between"><div><strong className="break-words">{s.name}</strong><p className="text-sm text-slate-600">{roleNames[s.role]||s.role}{!s.isActive?' · Hesap pasif':''}</p><p className="mt-1 text-sm">{r?.isActive&&r.staffPushEnabled?'Bildirim alıcısı':'Seçilmedi'}</p></div>{catalog!.canManageStaff&&<Button className="min-h-11 shrink-0 self-start" variant="outline" disabled={busy||!s.isActive} onClick={()=>toggle(s.id,r)}>{r?.isActive&&r.staffPushEnabled?'Alıcıyı kaldır':'Alıcı olarak seç'}</Button>}</div>
    {!r?.devices.length&&<p className="text-sm text-slate-500">Henüz cihaz kaydı yok.{r?.isActive&&r.staffPushEnabled?' Personel kendi hesabıyla cihazında bildirimleri açmalı.':''}</p>}
    {r?.devices.map(d=><p key={d.id} className="break-words text-sm">{d.label} {r.primaryDeviceId===d.id?'· Ana cihaz':''} · {!d.isActive?'Pasif':validDevice(d)?'Cihaz kayıtlı':'Süresi dolmuş'} · Geçerlilik: {new Date(d.expiresAt).toLocaleString('tr-TR')} · Son gönderim: {d.deliveries[0]?.status==='ACCEPTED'?'Servis kabul etti':d.deliveries[0]?.status==='FAILED'?'Başarısız':'Yok'}</p>)}
    <StaffSummaryMembership person={s} recipient={r} rules={summaryRules} busy={busy} onChange={(ruleId,receive)=>setSummary(s.id,s.name,ruleId,receive)}/>
   </article>})}
   {filtered?.length===0&&<p className="text-sm text-slate-600">{search?'Aramanıza uygun personel yok.':'Henüz personel yok.'}</p>}
   {error&&<p role="alert" className="text-red-700">{error}</p>}
   <Button variant="outline" onClick={()=>load().catch(e=>setError(e.message))}>Yenile</Button>
  </CardContent>
 </Card>
}
export function StaffManualSend(){
 const [catalog,setCatalog]=useState<StaffCatalog|null>(null),[recipientId,setRecipientId]=useState(''),[deviceId,setDeviceId]=useState(''),[title,setTitle]=useState('Duyuru'),[message,setMessage]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false)
 useEffect(()=>{fetch('/api/push/recipients',{cache:'no-store'}).then(staffRead).then(setCatalog).catch(e=>setNotice(e.message))},[])
 const recipients=catalog?.recipients.filter(r=>r.userActive&&r.isActive&&r.staffPushEnabled)??[]
 async function send(){setBusy(true);setNotice('');try{const n=await staffRequest('/api/notifications','POST',{title,message,type:'GENERAL_ANNOUNCEMENT',method:'PUSH',recipientType:'recipient',recipientId,targetDeviceId:deviceId});const r=await staffRequest('/api/notifications/'+n.id+'/send','POST');setNotice(r.message);window.dispatchEvent(new Event('staff-notification-sent'))}catch(e){setNotice(e instanceof Error?e.message:'Gönderim başarısız.')}finally{setBusy(false)}}
 return <Card><CardHeader><CardTitle>Personele manuel duyuru</CardTitle></CardHeader><CardContent className="space-y-3"><label className="block">Personel<select className={field} value={recipientId} onChange={e=>{setRecipientId(e.target.value);setDeviceId('')}}><option value="">Personel seçin</option>{recipients.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label className="block">Hedef cihaz<select className={field} value={deviceId} onChange={e=>setDeviceId(e.target.value)}><option value="">Cihaz seçin</option>{recipients.find(r=>r.id===recipientId)?.devices.filter(validDevice).map(d=><option key={d.id} value={d.id}>{d.label}</option>)}</select></label><label className="block">Başlık<input className={field} value={title} maxLength={120} onChange={e=>setTitle(e.target.value)}/></label><label className="block">Mesaj<textarea className={field} value={message} maxLength={2000} onChange={e=>setMessage(e.target.value)}/></label><p>Kilit ekranı geneldir; mesaj yalnız personelin giriş yaptığı ekranda açılır.</p><Button disabled={busy||!deviceId||!title.trim()||!message.trim()} onClick={send}>Seçili cihaza gönder</Button>{notice&&<p role="status">{notice}</p>}</CardContent></Card>
}
