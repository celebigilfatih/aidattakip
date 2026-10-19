/* Network only: no authenticated pages or financial records are cached. */
self.addEventListener('push', event => {
 let data = {}
 try { data = event.data ? event.data.json() : {} } catch {}
 const destination = data.destination === '/notifications/overdue' ? '/notifications/overdue' : '/recipient'
 event.waitUntil(self.registration.showNotification('SporManage', {
  body: 'Yeni bir bildiriminiz var. Ayrıntıları güvenli ekranınızdan görüntüleyin.',
  icon: '/push-icon.png', badge: '/push-icon.png',
  tag: typeof data.notificationId === 'string' ? data.notificationId : 'spormanage', data: { url: destination },
 }))
})
self.addEventListener('notificationclick', event => {
 event.notification.close()
 const destination = event.notification.data?.url === '/notifications/overdue' ? '/notifications/overdue' : '/recipient'
 event.waitUntil((async () => {
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  for (const client of windows) {
   const url = new URL(client.url)
   if (url.origin === self.location.origin && url.pathname === destination) { await client.navigate(destination); return client.focus() }
  }
  return self.clients.openWindow(destination)
 })())
})
