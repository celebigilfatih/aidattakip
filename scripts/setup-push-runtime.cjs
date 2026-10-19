// Local runtime only: keep keys outside the repository and never print them.
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const webpush = require('web-push')
const folder = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), '.config'), 'SporManage', 'aidattakip')
const target = path.join(folder, 'push-runtime.json')
fs.mkdirSync(folder, { recursive: true })
if (!fs.existsSync(target)) {
  const keys = webpush.generateVAPIDKeys()
  fs.writeFileSync(target, JSON.stringify({ VAPID_PUBLIC_KEY: keys.publicKey, VAPID_PRIVATE_KEY: keys.privateKey, VAPID_SUBJECT: 'https://aidat.spormanage.com.tr', APP_ORIGIN: 'http://127.0.0.1:3077' }), { mode: 0o600, flag: 'wx' })
}
console.log('Local push runtime is ready outside the repository. Keys were not printed.')
