import { notificationResponse } from '@/lib/notification-access'
export async function POST(_request?: unknown) { return notificationResponse({ error: 'Veli/sporcu push daveti kapalıdır. Personel hesabınızla giriş yapın.' }, 410) }
