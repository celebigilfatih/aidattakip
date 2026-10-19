'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, CreditCard, RefreshCw, Search, Users, Wallet } from 'lucide-react'
import AppLayout from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type OverdueRow = { id: string; studentId: string; studentName: string; active: boolean; group: string; dueDate: string; outstanding: number }
type Summary = { studentCount: number; paymentCount: number; outstanding: number; rows: OverdueRow[] }
type LoadError = { message: string; status: number }
const pageSize = 20
const money = (value: number) => value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
const dateFormat = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Europe/Istanbul' })
const updatedFormat = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })
const searchable = (value: string) => value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i')
const selectClass = 'h-11 w-full rounded-md border border-input bg-white px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
function StudentStatus({ active }: { active: boolean }) {
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>{active ? 'Aktif' : 'Pasif'}</span>
}

export default function OverdueSummaryPage() {
  const [data, setData] = useState<Summary | null>(null), [error, setError] = useState<LoadError | null>(null)
  const [busy, setBusy] = useState(true), [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [query, setQuery] = useState(''), [status, setStatus] = useState('all'), [group, setGroup] = useState('all')
  const [sort, setSort] = useState('oldest'), [page, setPage] = useState(1)
  const listHeading = useRef<HTMLHeadingElement>(null)
  const load = useCallback(async () => {
    setBusy(true); setError(null)
    try {
      const response = await fetch('/api/notifications/overdue-summary', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) { setData(null); setError({ status: response.status, message: result.error || 'Liste yüklenemedi.' }); return }
      setData(result); setUpdatedAt(new Date())
    } catch { setData(null); setError({ status: 0, message: 'Liste yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.' }) }
    finally { setBusy(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const groups = useMemo(() => Array.from(new Set(data?.rows.map(row => row.group) ?? [])).sort((a, b) => a.localeCompare(b, 'tr')), [data])
  const rows = useMemo(() => {
    const term = searchable(query.trim())
    return (data?.rows ?? []).filter(row => (!term || searchable(`${row.studentName} ${row.group}`).includes(term)) && (status === 'all' || row.active === (status === 'active')) && (group === 'all' || row.group === group)).sort((a, b) => {
      if (sort === 'amount') return b.outstanding - a.outstanding || a.dueDate.localeCompare(b.dueDate) || a.id.localeCompare(b.id)
      if (sort === 'name') return a.studentName.localeCompare(b.studentName, 'tr') || a.dueDate.localeCompare(b.dueDate) || a.id.localeCompare(b.id)
      return a.dueDate.localeCompare(b.dueDate) || a.studentName.localeCompare(b.studentName, 'tr') || a.id.localeCompare(b.id)
    })
  }, [data, query, status, group, sort])
  const filtered = query.trim() !== '' || status !== 'all' || group !== 'all'
  const pages = Math.max(1, Math.ceil(rows.length / pageSize)), currentPage = Math.min(page, pages), start = (currentPage - 1) * pageSize
  const visibleRows = rows.slice(start, start + pageSize), filteredTotal = rows.reduce((sum, row) => sum + row.outstanding, 0)
  function resetFilters() { setQuery(''); setStatus('all'); setGroup('all'); setPage(1) }
  function changePage(next: number) { setPage(next); listHeading.current?.focus({ preventScroll: true }); listHeading.current?.scrollIntoView({ block: 'start' }) }

  return <AppLayout><section className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8" aria-busy={busy}>
    <Link href="/notifications" className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" /> Bildirimlere dön</Link>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-2"><h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Güncel geciken aidatlar</h1><p className="max-w-2xl text-sm leading-6 text-gray-600">Vade günü tamamlanmış açık aidatlar. Tüm dönemler, aktif ve pasif sporcular dahildir.</p></div>
      <Button variant="outline" className="h-11 shrink-0 gap-2 self-start" disabled={busy} onClick={load}><RefreshCw className={`h-4 w-4 ${busy ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" />{busy ? 'Yenileniyor…' : 'Listeyi yenile'}</Button>
    </div>
    {error && <Card className="space-y-3 border-red-200 p-5" role="alert">
      <h2 className="font-semibold text-gray-900">{error.status === 401 ? 'Devam etmek için giriş yapın' : error.status === 403 ? 'Bu listeye erişiminiz yok' : 'Listeye ulaşılamadı'}</h2>
      <p className="text-sm text-gray-600">{error.status === 401 ? 'Giriş yaptıktan sonra güncel geciken aidat listesine döneceksiniz.' : error.message}</p>
      {error.status === 401 ? <Button className="h-11" asChild><Link href="/login?next=/notifications/overdue">Personel hesabıyla giriş yap</Link></Button> : error.status === 403 ? <Button variant="outline" className="h-11" asChild><Link href="/recipient">Personel bildirimlerime dön</Link></Button> : <Button variant="outline" className="h-11" onClick={load}>Yeniden dene</Button>}
    </Card>}
    {busy && !data && !error && <div className="space-y-4" role="status"><p className="text-sm text-gray-600">Güncel aidatlar yükleniyor…</p><div className="grid gap-3 sm:grid-cols-3" aria-hidden="true">{[1, 2, 3].map(i => <div key={i} className="h-28 rounded-lg border bg-gray-100 motion-safe:animate-pulse" />)}</div></div>}
    {data && <>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Card className="col-span-2 border-amber-200 bg-amber-50/60 p-4 sm:p-5 lg:col-span-1"><dt className="flex items-center gap-2 text-sm font-medium text-amber-900"><Wallet className="h-4 w-4 shrink-0" aria-hidden="true" />Toplam açık bakiye</dt><dd className="mt-2 break-words text-2xl font-bold tabular-nums tracking-tight text-gray-900">{money(data.outstanding)}</dd></Card>
        <Card className="p-4 sm:p-5"><dt className="flex items-center gap-2 text-sm font-medium text-gray-600"><Users className="h-4 w-4 shrink-0" aria-hidden="true" />Borcu olan sporcu</dt><dd className="mt-2 text-2xl font-bold tabular-nums text-gray-900">{data.studentCount}</dd></Card>
        <Card className="p-4 sm:p-5"><dt className="flex items-center gap-2 text-sm font-medium text-gray-600"><CreditCard className="h-4 w-4 shrink-0" aria-hidden="true" />Gecikmiş aidat</dt><dd className="mt-2 text-2xl font-bold tabular-nums text-gray-900">{data.paymentCount}</dd></Card>
      </dl>
      <p className="text-xs leading-5 text-gray-500">Özet kartları yetkili kapsamınızdaki tüm gecikmiş aidatları gösterir. {updatedAt && <>Son güncelleme: <time dateTime={updatedAt.toISOString()}>{updatedFormat.format(updatedAt)}</time> · Türkiye saati.</>}</p>
      <Card className="overflow-hidden">
        <div className="space-y-4 border-b p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 ref={listHeading} tabIndex={-1} className="scroll-mt-4 text-lg font-semibold text-gray-900 focus:outline-none">Aidat listesi</h2>{filtered && <Button variant="ghost" className="h-11 text-blue-700" onClick={resetFilters}>Filtreleri temizle</Button>}</div>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div className="col-span-2 space-y-2 xl:col-span-1"><Label htmlFor="overdue-search">Sporcu veya grup ara</Label><div className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" aria-hidden="true" /><Input id="overdue-search" type="search" value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Ad, soyad veya grup" className="h-11 pl-10 text-base" /></div></div>
            <div className="space-y-2"><Label htmlFor="overdue-status">Sporcu durumu</Label><select id="overdue-status" className={selectClass} value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}><option value="all">Aktif ve pasif</option><option value="active">Yalnız aktif</option><option value="inactive">Yalnız pasif</option></select></div>
            <div className="space-y-2"><Label htmlFor="overdue-group">Grup</Label><select id="overdue-group" className={selectClass} value={group} onChange={e => { setGroup(e.target.value); setPage(1) }}><option value="all">Tüm gruplar</option>{groups.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
            <div className="col-span-2 space-y-2 xl:col-span-1"><Label htmlFor="overdue-sort">Sıralama</Label><select id="overdue-sort" className={selectClass} value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}><option value="oldest">En eski vade</option><option value="amount">En yüksek bakiye</option><option value="name">Sporcu adı (A–Z)</option></select></div>
          </div>
          <p className="text-sm text-gray-600" role="status" aria-live="polite">{filtered ? 'Filtre sonucu: ' : ''}{new Set(rows.map(r => r.studentId)).size} sporcu · {rows.length} aidat{filtered && <> · {money(filteredTotal)} açık bakiye</>}</p>
        </div>
        {!rows.length ? <div className="space-y-3 p-8 text-center">{!filtered && <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden="true" />}<h3 className="font-semibold text-gray-900">{filtered ? 'Filtrelere uygun aidat bulunamadı' : 'Gecikmiş açık aidat bulunmuyor'}</h3><p className="text-sm text-gray-600">{filtered ? 'Başka bir ad deneyin veya filtreleri temizleyin.' : 'Yetkili kapsamınızda vadesi tamamlanmış açık borç yok.'}</p>{filtered && <Button variant="outline" className="h-11" onClick={resetFilters}>Filtreleri temizle</Button>}</div> : <>
          <ul className="divide-y lg:hidden" aria-label="Gecikmiş aidatlar">{visibleRows.map(row => <li key={row.id} className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-semibold text-gray-900">{row.studentName}</h3><p className="mt-1 break-words text-sm text-gray-500">{row.group}</p></div><StudentStatus active={row.active} /></div>
            <dl className="flex flex-wrap justify-between gap-4"><div><dt className="text-xs text-gray-500">Vade tarihi</dt><dd className="mt-1 text-sm text-gray-700"><time dateTime={row.dueDate}>{dateFormat.format(new Date(row.dueDate))}</time></dd></div><div className="text-right"><dt className="text-xs text-gray-500">Açık bakiye</dt><dd className="mt-1 font-semibold tabular-nums text-gray-900">{money(row.outstanding)}</dd></div></dl>
          </li>)}</ul>
          <div className="hidden overflow-x-auto lg:block"><table className="w-full text-left text-sm"><caption className="sr-only">Gecikmiş aidatlar. Her satır bir aidatı gösterir; bir sporcunun birden fazla aidatı olabilir.</caption><thead className="border-b bg-gray-50 text-gray-600"><tr>{['Sporcu', 'Durum', 'Grup', 'Vade tarihi', 'Açık bakiye'].map((label, i) => <th key={label} scope="col" className={`px-5 py-3 font-medium ${i === 4 ? 'text-right' : ''}`}>{label}</th>)}</tr></thead>
            <tbody className="divide-y">{visibleRows.map(row => <tr key={row.id} className="hover:bg-gray-50"><th scope="row" className="px-5 py-4 font-medium text-gray-900">{row.studentName}</th><td className="px-5 py-4"><StudentStatus active={row.active} /></td><td className="px-5 py-4 text-gray-600">{row.group}</td><td className="whitespace-nowrap px-5 py-4 text-gray-600"><time dateTime={row.dueDate}>{dateFormat.format(new Date(row.dueDate))}</time></td><td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-gray-900">{money(row.outstanding)}</td></tr>)}</tbody>
          </table></div>
          <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-gray-500">{rows.length} aidatın {start + 1}–{Math.min(start + pageSize, rows.length)} arası · Her satır bir aidat</p><nav className="flex items-center justify-between gap-3" aria-label="Aidat sayfaları"><Button variant="outline" className="h-11 gap-1 px-3" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}><ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />Önceki</Button><span className="whitespace-nowrap text-sm text-gray-600" aria-live="polite">{currentPage} / {pages}</span><Button variant="outline" className="h-11 gap-1 px-3" disabled={currentPage === pages} onClick={() => changePage(currentPage + 1)}>Sonraki<ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Button></nav></div>
        </>}
      </Card>
    </>}
  </section></AppLayout>
}
