export async function staffRead(r: Response) {
  const data = await r.json()
  if (!r.ok) throw Error(data.error || 'İşlem tamamlanamadı.')
  return data
}
export async function staffRequest(url: string, method: string, body?: unknown) {
  return staffRead(await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) }))
}
