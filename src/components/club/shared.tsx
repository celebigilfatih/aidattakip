'use client'

import { ReactNode, ReactElement, cloneElement, isValidElement, useEffect, useId, useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export type StudentOption = { id: string; firstName: string; lastName: string; branchId: string | null; groupId: string | null; familyId: string | null; isActive: boolean }
export type ClubOptions = { branches: { id: string; name: string }[]; groups: { id: string; name: string; branchId: string | null }[]; students: StudentOption[]; fees: { id: string; name: string; amount: number; period: string; groupId: string | null }[]; sessions: { id: string; groupId: string; date: string; startTime: string; group: { name: string } }[]; role: string; branchId: string | null }
export const control = 'min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100'
export const panel = 'rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4'
export const money = (v: number) => v.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
export const day = (v: string) => new Date(v).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' })
export async function clubHttp<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const r = await fetch(url, { method, cache: 'no-store', headers: { 'Content-Type': 'application/json' }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) })
  const data = await r.json()
  if (!r.ok) throw new Error(r.status === 401 ? 'Oturumunuz sona erdi. Yeniden giriş yapın.' : data.error || 'İşlem tamamlanamadı.')
  return data
}
export function useClubOptions() {
  const [options, setOptions] = useState<ClubOptions | null>(null), [error, setError] = useState('')
  const refresh = async () => { try { setOptions(await clubHttp<ClubOptions>('/api/club/options')); setError('') } catch (e) { setError((e as Error).message) } }
  useEffect(() => { void refresh() }, [])
  return { options, refresh, error }
}
export function ClubShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const { user } = useAuth()
  const links = [['/families','Aileler'],['/seasons','Sezon yenileme'],['/prospects','Aday kayıtlar'],['/attention','İlgi bekleyenler']].filter(([url]) => !(user?.role==='TRAINER'&&['/families','/seasons'].includes(url))&&!(user?.role==='ACCOUNTING'&&url==='/prospects'))
  return <AppLayout><section className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8"><div><h1 className="text-2xl font-bold sm:text-3xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{description}</p></div><nav aria-label="Sporcu süreçleri" className="flex flex-wrap gap-2 text-sm">{links.map(([url,label]) => <Link key={url} className="rounded-lg border bg-white px-3 py-2 text-blue-700 hover:bg-blue-50" href={url}>{label}</Link>)}</nav>{children}</section></AppLayout>
}
export function Notice({ text }: { text: string }) { return text ? <p role="status" className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{text}</p> : null }
export function ConfirmBox({title,description,label,busy,onConfirm,onCancel}:{title:string;description:string;label:string;busy:boolean;onConfirm:()=>void;onCancel:()=>void}){
  return <Dialog open onOpenChange={open=>{if(!open&&!busy)onCancel()}}><DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><DialogFooter className="gap-2"><Button variant="outline" disabled={busy} onClick={onCancel}>Vazgeç</Button><Button disabled={busy} onClick={onConfirm}>{label}</Button></DialogFooter></DialogContent></Dialog>
}
export function Field({ label, children }: { label: string; children: ReactNode }) { const id=useId(); return <div className="space-y-1 text-sm font-medium"><label className="block" htmlFor={id}>{label}</label>{isValidElement(children)?cloneElement(children as ReactElement<{id?:string}>,{id}):children}</div> }
export function Pager({ page, count, onChange }: { page: number; count: number; onChange: (p: number) => void }) { const pages = Math.max(1, Math.ceil(count / 20)); return <div className="flex flex-wrap items-center gap-3"><span className="text-sm text-gray-600">{count} kayıt · {page} / {pages}</span><Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>Önceki</Button><Button variant="outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>Sonraki</Button></div> }
export function StudentPicker({ students, selected, onChange }: { students: StudentOption[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const [query, setQuery] = useState('')
  const filtered = students.filter(s => `${s.firstName} ${s.lastName}`.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')))
  return <fieldset className="space-y-2"><legend className="text-sm font-medium">Sporcular ({selected.length} seçili)</legend><input aria-label="Sporcu ara" className={control} placeholder="Ad veya soyadla ara" value={query} onChange={e => setQuery(e.target.value)} /><div className="max-h-64 overflow-y-auto rounded-lg border p-2">{filtered.map(s => <label key={s.id} className="flex min-h-11 items-center gap-3 rounded px-2 hover:bg-gray-50"><input type="checkbox" className="h-5 w-5" checked={selected.includes(s.id)} onChange={e => onChange(e.target.checked ? [...selected,s.id] : selected.filter(id => id !== s.id))} /><span>{s.firstName} {s.lastName} <span className="text-xs text-gray-500">{!s.isActive ? '· Pasif' : ''}</span></span></label>)}{!filtered.length && <p className="p-2 text-sm text-gray-500">Uygun sporcu bulunamadı.</p>}</div></fieldset>
}
