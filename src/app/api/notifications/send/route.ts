import { NextRequest } from 'next/server'
import { POST as bulkPost } from '../bulk/route'
import { notificationFailure } from '@/lib/notification-access'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return bulkPost(new NextRequest(request.url, { method: 'POST', headers: request.headers, body: JSON.stringify({ notificationIds: body.notificationIds, action: 'send' }) }))
  } catch (error) { return notificationFailure(error) }
}
