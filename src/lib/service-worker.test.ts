import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

function worker(windows: unknown[] = []) {
  const handlers: Record<string, (event: unknown) => void> = {}, shown: unknown[] = [], opened: string[] = []
  vm.runInNewContext(readFileSync('public/sw.js', 'utf8'), { URL, self: {
    addEventListener: (type: string, fn: (event: unknown) => void) => { handlers[type] = fn },
    skipWaiting: async () => {}, location: { origin: 'https://demo.example' },
    registration: { showNotification: async (...args: unknown[]) => { shown.push(args) } },
    clients: { claim: async () => {}, matchAll: async () => windows, openWindow: async (url: string) => { opened.push(url) } },
  } })
  return { handlers, shown, opened }
}
test('push always displays generic text and only fixed destinations', async () => {
  const w = worker(); let done = Promise.resolve()
  w.handlers.push({ data: { json: () => ({ title: 'Özel kişi', body: 'Özel borç', destination: 'https://evil.example' }) }, waitUntil: (p: Promise<void>) => { done = p } })
  await done
  const [title, options] = w.shown[0] as [string, { body: string; data: { url: string } }]
  assert.equal(title, 'SporManage'); assert(!options.body.includes('Özel'))
  assert.equal(options.data.url, '/recipient')
})
test('summary click reloads existing current list before focusing', async () => {
  const calls: string[] = []
  const w = worker([{ url: 'https://demo.example/notifications/overdue', navigate: async (url: string) => { calls.push(url) }, focus: () => { calls.push('focus') } }])
  let done = Promise.resolve()
  w.handlers.notificationclick({ notification: { close() {}, data: { url: '/notifications/overdue' } }, waitUntil: (p: Promise<void>) => { done = p } })
  await done; assert.deepEqual(calls, ['/notifications/overdue', 'focus']); assert.equal(w.opened.length, 0)
})
test('notification click cannot open an external or arbitrary application URL', async () => {
  const w = worker(); let done = Promise.resolve()
  w.handlers.notificationclick({ notification: { close() {}, data: { url: 'https://evil.example' } }, waitUntil: (p: Promise<void>) => { done = p } })
  await done; assert.deepEqual(w.opened, ['/recipient'])
})
