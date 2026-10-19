'use client'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { registerStaffDevice } from '@/lib/staff-push-client'
export default function StaffPushSync() {
  const { user } = useAuth()
  useEffect(() => {
    if (!user) return
    const renew = () => { if (document.visibilityState === 'visible') registerStaffDevice(true).catch(() => {}) }
    renew()
    document.addEventListener('visibilitychange', renew)
    return () => document.removeEventListener('visibilitychange', renew)
  }, [user?.id])
  return null
}
