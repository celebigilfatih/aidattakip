export async function registerStaffDevice(renewOnly = false) {
  if (!('serviceWorker' in navigator) || !('Notification' in window) || !('PushManager' in window)) return
  if (renewOnly && Notification.permission !== 'granted') return
  const registration = renewOnly ? await navigator.serviceWorker.getRegistration('/') : await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  if (!registration) return
  let subscription = await registration.pushManager.getSubscription()
  if (renewOnly && !subscription) return
  if (!subscription) {
    const config = await (await fetch('/api/push/config', { cache: 'no-store' })).json()
    if (!config.publicKey) throw new Error('Push sunucusu yapılandırılmadı.')
    const key = Uint8Array.from(atob(config.publicKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })
  }
  const data = subscription.toJSON()
  const response = await fetch('/api/push/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: data.endpoint, keys: data.keys, renewOnly, label: /iPhone/.test(navigator.userAgent) ? 'iPhone' : 'Tarayıcı cihazım' }) })
  const result = await response.json()
  if (!response.ok && !renewOnly) throw new Error(result.error || 'Cihaz kaydedilemedi.')
  return response.ok
}
