/* Network-only service worker: authenticated pages and financial data are never cached. */
self.addEventListener('push', event => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch { /* show the generic notification */ }
  event.waitUntil(self.registration.showNotification('SporManage', {
    body: 'Yeni bir bildiriminiz var. Ayrıntıları güvenli alıcı ekranından görüntüleyin.',
    icon: '/push-icon.png', badge: '/push-icon.png',
    tag: typeof data.notificationId === 'string' ? data.notificationId : 'spormanage',
    data: { url: '/recipient' },
  }))
})
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin && new URL(client.url).pathname === '/recipient') return client.focus()
    }
    return self.clients.openWindow('/recipient')
  })())
})
