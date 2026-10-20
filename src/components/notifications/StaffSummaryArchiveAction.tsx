'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { staffRequest } from './staff-http'

export default function StaffSummaryArchiveAction({ rule, action, disabled, onSaved }: {
  rule: { id: string; name: string }; action: 'archive' | 'restore'; disabled: boolean; onSaved: (action: 'archive' | 'restore', name: string) => void
}) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const archive = action === 'archive'
  function changeOpen(next: boolean) { if (!busy) { setOpen(next); setError('') } }
  async function save() {
    setBusy(true); setError('')
    try {
      await staffRequest('/api/push/staff-summary', 'PATCH', { ruleId: rule.id, action })
      setOpen(false); onSaved(action, rule.name)
    } catch (e) { setError(e instanceof Error ? e.message : 'İşlem kaydedilemedi.') }
    finally { setBusy(false) }
  }
  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogTrigger asChild><Button variant="outline" disabled={disabled} className="min-h-11" aria-label={`${rule.name}: ${archive ? 'kuralı kaldır' : 'arşivden geri al'}`}>{archive ? 'Kaldır' : 'Geri al'}</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg sm:max-w-lg">
      <DialogHeader><DialogTitle>{archive ? 'Aidat özeti kuralını kaldır' : 'Arşivden geri al'}</DialogTitle><DialogDescription>{rule.name}</DialogDescription></DialogHeader>
      <p className="text-sm">{archive ? 'Kural günlük listeden kaldırılacak. Gönderim geçmişi ve alıcı seçimleri korunacak; Arşivlenen kurallar bölümünden geri alabilirsiniz.' : 'Kural kapalı olarak günlük listeye dönecek. Takvim, alıcı seçimleri ve gönderim geçmişi korunacak. Etkinleştirene kadar otomatik bildirim gönderilmez.'}</p>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" disabled={busy} onClick={() => changeOpen(false)}>Vazgeç</Button><Button disabled={busy} onClick={save}>{busy ? 'Kaydediliyor…' : archive ? 'Kaldır' : 'Geri al'}</Button></div>
    </DialogContent>
  </Dialog>
}
