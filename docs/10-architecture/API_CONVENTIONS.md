# API Conventions

Last updated: 2026-09-15. Durum: Repository kaynakları ve tarihli yerel doğrulamalar birlikte belgelenmiştir.

## Mevcut sözleşme

Next App Router `route.ts` dosyaları HTTP metotlarını dışa aktarır; `/api` altında sürüm segmenti yok. Yanıtlar çoğunlukla JSON fakat ortak response zarfı yok. Students liste yanıtı `students` ve `pagination`; groups liste yanıtı doğrudan dizi. Students varsayılan sayfa/limit 1/10; payments 1/20. Hata metinleri Türkçe ve İngilizce karışık; 400/401/403/404/500 örnekleri var. Kaynaklar aşağıdaki envanterde.

Middleware `auth-token` çerezi bekler. Bazı rapor ve test uçları ayrıca Authorization Bearer başlığı okuyor; tutarlılık [CR-003](../20-execution/CHANGE_REQUESTS.md) içinde. API sözleşmesi veya kimlik doğrulama yaklaşımı bu belgede değiştirilmedi.

## Rapor sözleşmesi

- `GET /api/reports/overview`: `dateRange=7|30|90|365` kanonik parametredir; eski `timeRange` aynı değerlerle geriye uyumluluk için kabul edilir. `groupId` aktif bir grubu göstermelidir. Geçersiz dönem, rapor türü veya grup `400` döndürür.
- `reportType=overview|financial|attendance|student`, döndürülen ortak veri içinden arayüzün, yazdırmanın ve Excel’in hangi bölümleri göstereceğini belirler.
- `GET /api/reports/export?format=excel`: gerçek XLSX döndürür. Çerez oturumu ve aktif kullanıcı gerekir; ADMIN/ACCOUNTING için `200`, oturumsuz istek için `401`, diğer roller için `403`.
- `GET /api/reports/export?format=pdf`: [ADR-0003](../50-decisions/ADR-0003-rapor-disa-aktarim-ve-yetki.md) gereği `410 Gone` döndürür. PDF kaydı rapor ekranındaki tarayıcı yazdırma akışıyla yapılır.
- Bilinmeyen export biçimi `400` döndürür. Mevcut overview yanıt alanları korunmuştur; hesaplamalar ortak raporlama katmanında düzeltilmiştir.

Bu dar rapor kararı diğer uçlardaki Bearer/çerez tutarsızlığını veya genel rol/nesne erişim matrisini çözmez; CR-002/003 açık kalır.

GET’in yan etkisiz olduğu varsayılmamalı: [settings GET](../../src/app/api/settings/route.ts) kayıt yoksa ayar kaydı oluşturur. Salt okunur incelemede API çağrısı yapılmadı.

## Rota envanteri — 48 dosya

| Rota | Metotlar | Kaynak |
|---|---|---|
| `/api/analytics/group` | GET | [kaynak](../../src/app/api/analytics/group/route.ts) |
| `/api/attendances/[sessionId]` | DELETE | [kaynak](../../src/app/api/attendances/[sessionId]/route.ts) |
| `/api/attendances` | GET, POST | [kaynak](../../src/app/api/attendances/route.ts) |
| `/api/auth/login` | POST | [kaynak](../../src/app/api/auth/login/route.ts) |
| `/api/auth/logout` | POST | [kaynak](../../src/app/api/auth/logout/route.ts) |
| `/api/auth/me` | GET | [kaynak](../../src/app/api/auth/me/route.ts) |
| `/api/branches/[id]` | GET, PUT, DELETE | [kaynak](../../src/app/api/branches/[id]/route.ts) |
| `/api/branches` | GET, POST | [kaynak](../../src/app/api/branches/route.ts) |
| `/api/fee-types/[id]` | GET, PUT, DELETE | [kaynak](../../src/app/api/fee-types/[id]/route.ts) |
| `/api/fee-types` | GET, POST | [kaynak](../../src/app/api/fee-types/route.ts) |
| `/api/fields/[id]` | PUT, DELETE | [kaynak](../../src/app/api/fields/[id]/route.ts) |
| `/api/fields` | GET, POST | [kaynak](../../src/app/api/fields/route.ts) |
| `/api/groups/[id]` | GET, PUT, PATCH, DELETE | [kaynak](../../src/app/api/groups/[id]/route.ts) |
| `/api/groups` | GET, POST | [kaynak](../../src/app/api/groups/route.ts) |
| `/api/groups/transfer` | POST | [kaynak](../../src/app/api/groups/transfer/route.ts) |
| `/api/health` | GET | [kaynak](../../src/app/api/health/route.ts) |
| `/api/license-admin` | GET, POST, PUT, DELETE | [kaynak](../../src/app/api/license-admin/route.ts) |
| `/api/locations/[id]` | PUT, DELETE | [kaynak](../../src/app/api/locations/[id]/route.ts) |
| `/api/locations` | GET, POST | [kaynak](../../src/app/api/locations/route.ts) |
| `/api/notes/[id]` | PATCH, DELETE | [kaynak](../../src/app/api/notes/[id]/route.ts) |
| `/api/notes` | GET, POST | [kaynak](../../src/app/api/notes/route.ts) |
| `/api/notifications/[id]` | GET, PUT, DELETE | [kaynak](../../src/app/api/notifications/[id]/route.ts) |
| `/api/notifications/[id]/send` | POST | [kaynak](../../src/app/api/notifications/[id]/send/route.ts) |
| `/api/notifications/bulk` | POST | [kaynak](../../src/app/api/notifications/bulk/route.ts) |
| `/api/notifications/process-scheduled` | GET | [kaynak](../../src/app/api/notifications/process-scheduled/route.ts) |
| `/api/notifications` | GET, POST | [kaynak](../../src/app/api/notifications/route.ts) |
| `/api/notifications/send` | POST | [kaynak](../../src/app/api/notifications/send/route.ts) |
| `/api/payments/[id]` | PATCH, PUT, DELETE | [kaynak](../../src/app/api/payments/[id]/route.ts) |
| `/api/payments/bulk` | POST | [kaynak](../../src/app/api/payments/bulk/route.ts) |
| `/api/payments` | GET, POST, DELETE | [kaynak](../../src/app/api/payments/route.ts) |
| `/api/reports/export` | GET | [kaynak](../../src/app/api/reports/export/route.ts) |
| `/api/reports/overview` | GET | [kaynak](../../src/app/api/reports/overview/route.ts) |
| `/api/search` | GET | [kaynak](../../src/app/api/search/route.ts) |
| `/api/settings/backup` | GET | [kaynak](../../src/app/api/settings/backup/route.ts) |
| `/api/settings` | GET, POST | [kaynak](../../src/app/api/settings/route.ts) |
| `/api/settings/test-email` | POST | [kaynak](../../src/app/api/settings/test-email/route.ts) |
| `/api/settings/test-sms` | POST | [kaynak](../../src/app/api/settings/test-sms/route.ts) |
| `/api/students/[id]/group-history` | GET | [kaynak](../../src/app/api/students/[id]/group-history/route.ts) |
| `/api/students/[id]` | GET, PUT, DELETE | [kaynak](../../src/app/api/students/[id]/route.ts) |
| `/api/students` | GET, POST | [kaynak](../../src/app/api/students/route.ts) |
| `/api/test` | GET | [kaynak](../../src/app/api/test/route.ts) |
| `/api/trainers/[id]` | GET, PUT, DELETE, PATCH | [kaynak](../../src/app/api/trainers/[id]/route.ts) |
| `/api/trainers` | GET, POST | [kaynak](../../src/app/api/trainers/route.ts) |
| `/api/training-sessions/[id]` | GET, DELETE, PUT | [kaynak](../../src/app/api/training-sessions/[id]/route.ts) |
| `/api/training-sessions` | GET, POST | [kaynak](../../src/app/api/training-sessions/route.ts) |
| `/api/trainings` | GET, POST | [kaynak](../../src/app/api/trainings/route.ts) |
| `/api/users/[id]` | GET, PUT, DELETE | [kaynak](../../src/app/api/users/[id]/route.ts) |
| `/api/users` | GET, POST | [kaynak](../../src/app/api/users/route.ts) |

## Hedef kurallar

Ortak hata/sayfalama formatı, idempotency ve sürümleme standardı TBD. Geriye uyumsuz değişiklik, yetki veya veri sözleşmesi için Proposed ADR ve açık onay gerekir.
