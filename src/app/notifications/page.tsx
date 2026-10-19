'use client'
import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import NotificationHistory from '@/components/notifications/NotificationHistory'
import PushPanel, { StaffManualSend } from '@/components/notifications/PushPanel'
import StaffSummaryPanel from '@/components/notifications/StaffSummaryPanel'
export default function NotificationsPage(){const {user}=useAuth();const [tab,setTab]=useState('Gönderimler');const manager=user&&['ADMIN','ACCOUNTING'].includes(user.role);return <AppLayout><div className="space-y-5"><nav aria-label="Bildirim bölümleri" className="flex gap-2 flex-wrap">{(manager?['Gönderimler','Personel ve Cihazlar','Otomatik Aidat Özeti']:['Gönderimler']).map(t=><Button key={t} variant={t===tab?'default':'outline'} onClick={()=>setTab(t)}>{t}</Button>)}<a className="self-center text-blue-700 underline" href="/recipient">Kendi cihazım</a></nav>{tab==='Gönderimler'?<>{manager&&<StaffManualSend/>}<NotificationHistory/></>:tab==='Personel ve Cihazlar'?<PushPanel onSent={()=>{}}/>:<StaffSummaryPanel/>}</div></AppLayout>}
