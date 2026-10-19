import { notificationResponse } from '@/lib/notification-access'
// Scheduling is a later ADR-0006 stage. GET must never dispatch messages.
export async function GET() {
  return notificationResponse({ error: 'Otomatik işleyici bu aşamada etkin değil; GET gönderim yapmaz.' }, 405)
}
