import { notificationResponse } from '@/lib/notification-access'
import { pushConfiguration } from '@/lib/notification-dispatch'
export async function GET() {
  const config = pushConfiguration()
  return notificationResponse({ configured: !!config, publicKey: config?.publicKey ?? null })
}
