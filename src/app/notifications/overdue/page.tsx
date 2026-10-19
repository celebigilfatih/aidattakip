'use client'
import { useEffect,useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { staffRead } from '@/components/notifications/PushPanel'
type Summary={studentCount:number;paymentCount:number;outstanding:number;rows:{id:string;studentName:string;active:boolean;group:string;dueDate:string;outstanding:number}[]}
const money=(value:number)=>value.toLocaleString('tr-TR',{style:'currency',currency:'TRY'})
export default function OverdueSummaryPage(){
 const [data,setData]=useState<Summary|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 async function load(){setBusy(true);setError('');try{setData(await fetch('/api/notifications/overdue-summary',{cache:'no-store'}).then(staffRead))}catch(e){setError(e instanceof Error?e.message:'Liste yüklenemedi.');setData(null)}finally{setBusy(false)}}
 useEffect(()=>{load()},[])
 return <AppLayout><section className="space-y-5"><div className="flex gap-4 justify-between"><h1 className="text-2xl font-bold">Güncel geciken aidatlar</h1><Button disabled={busy} onClick={load}>Yenile</Button></div><p>Vade günü tamamlanan açık borçlar; tüm dönemler, aktif ve pasif sporcular. Liste güncel verilerden hesaplanır.</p>{error&&<p role="alert" className="text-red-700">{error}</p>}{data&&<><p className="font-semibold">{data.studentCount} sporcu · {data.paymentCount} aidat · {money(data.outstanding)} açık bakiye</p><div className="overflow-auto"><table className="w-full text-left"><thead><tr>{['Sporcu','Durum','Grup','Vade','Açık bakiye'].map(h=><th className="border-b p-2" key={h}>{h}</th>)}</tr></thead><tbody>{data.rows.map(r=><tr key={r.id}><td className="p-2">{r.studentName}</td><td>{r.active?'Aktif':'Pasif'}</td><td>{r.group}</td><td>{new Date(r.dueDate).toLocaleDateString('tr-TR',{timeZone:'Europe/Istanbul'})}</td><td>{money(r.outstanding)}</td></tr>)}</tbody></table></div>{!data.rows.length&&<p>Gecikmiş açık aidat bulunmuyor.</p>}</>}</section></AppLayout>
}
