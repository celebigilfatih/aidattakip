import { Prisma } from '@prisma/client'

export const PREFIX = 'demo-v1-'
export const ANCHOR_ID = `${PREFIX}branch-merkez`
type Inputs = {
  branch: Prisma.BranchUncheckedCreateInput; field: Prisma.FieldUncheckedCreateInput
  location: Prisma.LocationUncheckedCreateInput; trainer: Prisma.TrainerUncheckedCreateInput
  user: Prisma.UserUncheckedCreateInput; group: Prisma.GroupUncheckedCreateInput
  userGroupPermission: Prisma.UserGroupPermissionUncheckedCreateInput
  parent: Prisma.ParentUncheckedCreateInput; student: Prisma.StudentUncheckedCreateInput
  groupHistory: Prisma.GroupHistoryUncheckedCreateInput; feeType: Prisma.FeeTypeUncheckedCreateInput
  payment: Prisma.PaymentUncheckedCreateInput; training: Prisma.TrainingUncheckedCreateInput
  trainingException: Prisma.TrainingExceptionUncheckedCreateInput
  trainingSession: Prisma.TrainingSessionUncheckedCreateInput; attendance: Prisma.AttendanceUncheckedCreateInput
  attendanceAnalytics: Prisma.AttendanceAnalyticsUncheckedCreateInput
  note: Prisma.NoteUncheckedCreateInput; notification: Prisma.NotificationUncheckedCreateInput
}
export type Model = keyof Inputs
export type Dataset = { [K in Model]: (Inputs[K] & { id: string; createdAt: Date })[] }
export const MODELS: Model[] = ['branch', 'field', 'location', 'trainer', 'user', 'group',
  'userGroupPermission', 'parent', 'student', 'groupHistory', 'feeType', 'payment', 'training',
  'trainingException', 'trainingSession', 'attendance', 'attendanceAnalytics', 'note', 'notification']

// All demo calendar dates use Istanbul noon, independent of the process time zone.
export function calendarDate(date: Date): Date {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  const value = (key: string) => Number(parts.find(p => p.type === key)!.value)
  return new Date(Date.UTC(value('year'), value('month') - 1, value('day'), 9))
}
export function dayOffset(date: Date, days: number): Date {
  const result = new Date(date); result.setUTCDate(result.getUTCDate() + days); return result
}
export function buildDemo(anchor: Date, adminId: string): Dataset {
  const data = Object.fromEntries(MODELS.map(model => [model, []])) as unknown as Dataset
  const today = calendarDate(anchor)
  const enrolled = dayOffset(today, -60)
  const id = (key: string) => `${PREFIX}${key}`
  const meta = (key: string) => ({ id: id(key), createdAt: anchor })
  // These are invented, Turkish-looking names. They make the local fixture feel
  // natural without representing real athletes or guardians.
  const studentFirstNames = [
    'Zeynep', 'Emir', 'Elif', 'Arda', 'Duru', 'Mert', 'Ece', 'Can', 'İpek', 'Kerem',
    'Defne', 'Bora', 'Yağmur', 'Kaan', 'Lina', 'Eren', 'Sude', 'Atlas', 'Mina', 'Deniz',
    'Ceren', 'Yiğit', 'Melis', 'Ozan', 'Nehir', 'Baran', 'Asya', 'Umut', 'Selin', 'Rüzgar',
    'Azra', 'Aras', 'Pelin', 'Berk', 'Nisa', 'Tolga', 'Gül', 'Mete', 'Eylül', 'Serkan',
    'Başak', 'Hakan', 'Buse', 'Onur', 'Sena', 'Volkan', 'Aylin', 'Tuna', 'Pınar', 'Doruk',
    'Cansu', 'Kıvanç', 'Şirin', 'Batuhan', 'Esra', 'Koray', 'Sıla', 'Kuzey', 'Özge', 'Levent'
  ]
  const familyNames = [
    'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Aydın', 'Çelik', 'Arslan', 'Koç', 'Yıldız', 'Aslan',
    'Kurt', 'Öztürk', 'Kılıç', 'Doğan', 'Güneş', 'Aksoy', 'Erdem', 'Bulut', 'Kaplan', 'Özer',
    'Taş', 'Polat', 'Ergin', 'Keskin', 'Sönmez', 'Turan', 'Bozkurt', 'Ekinci', 'Duman', 'Gültekin',
    'Bayraktar', 'Acar', 'Korkmaz', 'Özdemir', 'Yalçın', 'Sezer', 'Karaca', 'Köse', 'Ateş', 'Özkan',
    'Kara', 'Alkan', 'Özsoy', 'Tuna', 'Uçar', 'Çetin', 'Karaaslan', 'Aksu', 'Gür', 'Erdoğan',
    'Çakır', 'Ünal', 'Özçelik', 'Tan', 'Akın', 'Toprak', 'Ersoy', 'Bilgin', 'Özden', 'Karaman'
  ]
  const guardianFirstNames = [
    'Ayşe', 'Mehmet', 'Fatma', 'Ahmet', 'Emine', 'Mustafa', 'Sevgi', 'Murat', 'Pınar', 'Hüseyin',
    'Gülşah', 'Cem', 'Zehra', 'İsmail', 'Nermin', 'Oğuz', 'Figen', 'Serdar', 'Sibel', 'Levent',
    'Derya', 'Burak', 'Nilüfer', 'Yavuz', 'Aysun', 'Tayfun', 'Nalan', 'Selçuk', 'Gülcan', 'Kadir',
    'Merve', 'Volkan', 'Yasemin', 'Erhan', 'Tülay', 'Sinan', 'Sevil', 'Orhan', 'Ebru', 'Kamil',
    'Cihan', 'Suat', 'Belgin', 'Mert', 'Özlem', 'Cenk', 'Aslı', 'Mahir', 'İlayda', 'Kemal',
    'Hande', 'Ufuk', 'Nihan', 'Gökhan', 'Şule', 'Erdal', 'Meltem', 'Önder', 'Gizem', 'Alper'
  ]
  const trainerNames = ['Murat Akın', 'Selin Yalçın', 'Önder Kılıç', 'Burcu Toprak', 'Hakan Çetin', 'Derya Uçar']
  const types = [ { key: 'u10', name: 'U10', amount: 1500, hour: 16 },
    { key: 'u16', name: 'U16', amount: 1750, hour: 18 },
    { key: 'yetiskin', name: 'Yetişkin', amount: 2000, hour: 20 } ]
  for (const [branchIndex, branchKey] of Array.from(['merkez', 'sahil'].entries())) {
    const branchName = branchKey === 'merkez' ? 'Merkez Şube' : 'Sahil Şube'
    const locationName = branchKey === 'merkez' ? 'Merkez' : 'Sahil'
    const branchId = id(`branch-${branchKey}`), fieldId = id(`field-${branchKey}`), locationId = id(`location-${branchKey}`)
    data.branch.push({ ...meta(`branch-${branchKey}`), name: branchName, address: `${locationName} yerleşkesi`, isActive: true })
    data.field.push({ ...meta(`field-${branchKey}`), branchId, name: `${locationName} Sahası`, capacity: 30, location: `${locationName} antrenman alanı`, isActive: true })
    data.location.push({ ...meta(`location-${branchKey}`), branchId, name: `${locationName} Tesisi`, address: `${locationName} yerleşkesi`, city: 'İstanbul', isActive: true })
    for (const [typeIndex, type] of Array.from(types.entries())) {
      const key = `${branchKey}-${type.key}`, groupId = id(`group-${key}`), trainerId = id(`trainer-${key}`), userId = id(`user-${key}`)
      const startTime = `${type.hour}:00`, endTime = `${type.hour + 1}:30`
      data.trainer.push({ ...meta(`trainer-${key}`), name: trainerNames[branchIndex * 3 + typeIndex], position: `${type.name} Antrenörü`, experience: 5, biography: 'Altyapı gelişimi ve takım koordinasyonu üzerine çalışır.', isActive: true })
      data.user.push({ ...meta(`user-${key}`), email: `${key}@spormanage.example`, password: '', name: trainerNames[branchIndex * 3 + typeIndex], role: 'TRAINER', trainerId, branchId, isActive: true })
      data.group.push({ ...meta(`group-${key}`), name: `${locationName} ${type.name}`, description: 'Futbol gelişim grubu; ücretler temsilidir.', branchId, coachId: trainerId, fieldId,
        trainingDays: ['Monday', 'Thursday'], trainingStartTime: startTime, trainingEndTime: endTime, trainingType: 'Technical', isActive: true })
      data.userGroupPermission.push({ ...meta(`permission-${key}`), userId, groupId })
      data.feeType.push({ ...meta(`fee-${key}`), name: `${locationName} ${type.name} Aylık Aidat`, amount: type.amount, period: 'MONTHLY', groupId, isActive: true })
      data.training.push({ ...meta(`training-${key}`), groupId, name: `${type.name} Futbol Antrenmanı`, description: 'Teknik, pas ve takım oyunu programı.', isActive: true })
      for (let n = 0; n < 10; n++) {
        const studentKey = `${key}-${String(n + 1).padStart(2, '0')}`, studentId = id(`student-${studentKey}`), parentId = id(`parent-${studentKey}`)
        const adult = type.key === 'yetiskin'
        const personIndex = branchIndex * 30 + typeIndex * 10 + n
        const age = adult ? 22 + n * 2 : type.key === 'u10' ? 8 + n % 2 : 13 + n % 3
        const birthDate = new Date(today); birthDate.setUTCFullYear(today.getUTCFullYear() - age); birthDate.setUTCDate(birthDate.getUTCDate() - 1)
        data.parent.push({ ...meta(`parent-${studentKey}`), firstName: guardianFirstNames[personIndex], lastName: familyNames[personIndex],
          phone: `000${String(branchIndex * 30 + typeIndex * 10 + n + 1).padStart(8, '0')}`, email: `iletisim-${studentKey}@spormanage.example`, relationship: adult ? 'Diğer' : n % 2 ? 'Baba' : 'Anne', isPrimary: true, isEmergency: true })
        data.student.push({ ...meta(`student-${studentKey}`), firstName: studentFirstNames[personIndex], lastName: familyNames[personIndex], birthDate, groupId, branchId, isActive: n < 9, enrollmentDate: enrolled, createdById: adminId, parents: { connect: [{ id: parentId }] } })
        data.groupHistory.push({ ...meta(`history-${studentKey}`), studentId, groupId, startDate: enrolled, reason: 'İlk grup kaydı' })
        const payment = (suffix: string, feeTypeId: string, amount: number, dueDate: Date, status: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PENDING' | 'CANCELLED') => {
          const paid = status === 'PAID' || status === 'PARTIAL'
          data.payment.push({ ...meta(`payment-${studentKey}-${suffix}`), studentId, feeTypeId, amount, dueDate, status,
            paidAmount: status === 'PAID' ? amount : status === 'PARTIAL' ? amount / 2 : 0,
            paidDate: paid ? new Date(Math.min(dueDate.getTime(), dayOffset(today, -1).getTime())) : null,
            paymentMethod: paid ? (n % 2 ? 'BANK_TRANSFER' : 'CASH') : null,
            referenceNumber: `SM-${studentKey}-${suffix}`, notes: 'Temsili aidat işlemi.', createdById: adminId })
        }
        const feeId = id(`fee-${key}`)
        const monthDate = (offset: number, day: number) => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + offset, day, 9))
        payment('previous', feeId, type.amount, monthDate(-1, 5), n === 9 ? 'CANCELLED' : n % 3 === 0 ? 'OVERDUE' : n % 3 === 1 ? 'PARTIAL' : 'PAID')
        payment('current', feeId, type.amount, today, n === 9 ? 'CANCELLED' : n % 3 === 0 ? 'PAID' : n % 3 === 1 ? 'PARTIAL' : 'PENDING')
        payment('next', feeId, type.amount, monthDate(1, 5), n === 9 ? 'CANCELLED' : 'PENDING')
        payment('registration', id('fee-registration'), 750, enrolled, 'PAID')
        payment('equipment', id('fee-equipment'), 1000, dayOffset(today, -7), n === 9 ? 'CANCELLED' : n % 2 ? 'PARTIAL' : 'PAID')
        if (n < 3) data.note.push({ ...meta(`note-${studentKey}`), studentId, title: ['Gelişim notu', 'Aidat görüşmesi', 'Katılım notu'][n], content: 'Sporcunun dönem içi takibi için oluşturulmuş örnek kayıt.', type: n === 1 ? 'PAYMENT' : 'GENERAL', isPinned: n === 0, isImportant: n === 1, createdById: adminId })
        if (n < 2) data.notification.push({ ...meta(`notification-${studentKey}`), studentId, title: n ? 'Antrenman hatırlatması' : 'Kulüp duyurusu', message: n ? 'Haftalık antrenman programı uygulamada güncellendi.' : 'Yeni dönem kulüp programı yayınlandı.', type: n ? 'ATTENDANCE_REMINDER' : 'GENERAL_ANNOUNCEMENT', method: 'IN_APP', status: n ? 'PENDING' : 'SENT', scheduledAt: n ? dayOffset(today, 1) : null, sentAt: n ? null : anchor, createdById: adminId })
      }
      let pastIndex = 0
      for (let offset = -28; offset <= 14; offset++) {
        const date = dayOffset(today, offset), weekday = date.getUTCDay()
        const regular = weekday === 1 || weekday === 4
        if (!regular && offset !== 0) continue
        const dateKey = date.toISOString().slice(0, 10), sessionKey = `${key}-${dateKey}`
        const cancelled = offset < 0 && pastIndex === 0
        const changed = offset < 0 && pastIndex === 1
        let exceptionId: string | undefined
        if (cancelled || changed || !regular) {
          exceptionId = id(`exception-${sessionKey}`)
          data.trainingException.push({ ...meta(`exception-${sessionKey}`), groupId, date, type: cancelled ? 'CANCELLED' : changed ? 'TIME_CHANGE' : 'EXTRA_SESSION', newStartTime: changed ? `${type.hour}:15` : !regular ? startTime : null, newEndTime: changed ? `${type.hour + 1}:45` : !regular ? endTime : null, reason: cancelled ? 'Saha bakım çalışması' : changed ? 'Antrenman saati güncellendi' : 'Özel antrenman seansı', createdBy: userId })
        }
        const sessionId = id(`session-${sessionKey}`), completed = offset < 0 && !cancelled
        const markedAt = new Date(date); markedAt.setUTCHours(type.hour - 3 + 1, changed ? 45 : 30)
        data.trainingSession.push({ ...meta(`session-${sessionKey}`), groupId, date, startTime: changed ? `${type.hour}:15` : startTime, endTime: changed ? `${type.hour + 1}:45` : endTime,
          fieldId, locationId, status: cancelled ? 'CANCELLED' : completed ? 'COMPLETED' : 'PLANNED', attendanceTaken: completed, attendanceTakenAt: completed ? markedAt : null, exceptionId, generatedAutomatically: regular })
        if (completed) for (let n = 0; n < 9; n++) {
          const status = n === 0 ? 'ABSENT' : (['PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const)[(n + pastIndex) % 6]
          const studentId = id(`student-${key}-${String(n + 1).padStart(2, '0')}`)
          data.attendance.push({ ...meta(`attendance-${sessionKey}-${n + 1}`), studentId, sessionId, status, markedBy: userId, markedAt, excuseReason: status === 'EXCUSED' ? 'Önceden bildirilen mazeret' : null })
        }
        if (offset < 0) pastIndex++
      }
    }
  }
  data.feeType.push({ ...meta('fee-registration'), name: 'Kayıt Ücreti', amount: 750, period: 'ONE_TIME', isActive: true }, { ...meta('fee-equipment'), name: 'Ekipman Ücreti', amount: 1000, period: 'ONE_TIME', isActive: true })
  for (const [key, name, role] of [['muhasebe', 'Aylin Karaca', 'ACCOUNTING'], ['sekreter', 'Cem Yıldız', 'SECRETARY']] as const) {
    data.user.push({ ...meta(`user-${key}`), email: `${key}@spormanage.example`, password: '', name, role, isActive: true })
  }
  for (const student of data.student.filter(s => s.isActive)) {
    const entries = data.attendance.filter(a => a.studentId === student.id).map(a => ({ ...a, session: data.trainingSession.find(s => s.id === a.sessionId)! }))
    const months = new Set(entries.map(a => (a.session.date as Date).toISOString().slice(0, 7)))
    for (const monthKey of Array.from(months)) {
      const [year, month] = monthKey.split('-').map(Number)
      const records = entries.filter(a => (a.session.date as Date).toISOString().startsWith(monthKey))
      const count = (status: string) => records.filter(a => a.status === status).length
      const latest = Math.max(...records.map(a => (a.session.date as Date).getTime()))
      const recent = data.trainingSession.filter(s => s.groupId === student.groupId && s.status === 'COMPLETED' && (s.date as Date).getTime() <= latest).sort((a, b) => +(b.date as Date) - +(a.date as Date)).slice(0, 10)
      let consecutiveAbsences = 0
      for (const session of recent) {
        const record = records.find(a => a.sessionId === session.id)
        if (record?.status === 'ABSENT') consecutiveAbsences++
        else if (record) break
      }
      data.attendanceAnalytics.push({ ...meta(`analytics-${student.id.slice(PREFIX.length)}-${monthKey}`), studentId: student.id, month, year, totalSessions: records.length, presentCount: count('PRESENT'), absentCount: count('ABSENT'), lateCount: count('LATE'), excusedCount: count('EXCUSED'), attendancePercentage: (count('PRESENT') + count('EXCUSED')) / records.length * 100, consecutiveAbsences, hasWarning: consecutiveAbsences >= 3 })
    }
  }
  return data
}
