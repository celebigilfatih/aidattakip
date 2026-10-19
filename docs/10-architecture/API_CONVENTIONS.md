# API Conventions

## ADR-0007 personel ve özet sözleşmesi

- `GET /api/push/staff-summary`: aktif ADMIN/ACCOUNTING'in kapsamındaki tam Pazartesi09:00 kuralları ve recipientIds üyelikleri. `PATCH {userId,ruleId,receive}` tek üyeyi idempotent upsert/deleteMany ile değiştirir; aynı origin, yönetici ve hedef personel kapsamı, kural row lock ve güncel gün/saat doğrulaması. Katılım aktif mali personel+açık STAFF alıcı+uyumlu şube+geçerli kural sahibi ister. Pasif/rolü değişmiş alıcıdan eski üyelik kaldırılabilir. Son üyenin çıkması etkinlik/cursor/saat/geçmişi değiştirmez; genel recipient seçimi ve cihazlar değişmez. 401/403 auth,404 hedef kapsamı,409 eski/yabancı kural,400 hedef koşulu. Yanıt userId/ruleId/receive/ruleEnabled. [Kaynak](../../src/app/api/push/staff-summary/route.ts).

- Staff formu `GET` yanıtındaki `summaryRules` ile kendi yönetim kapsamındaki yalnız `[1]`/`09:00` kurallarını sunar. `POST /api/push/staff` opsiyonel `summaryRuleId` alır (eksik/null → üyelik yok); alıcı seçili ve mali rol zorunludur. Kural row lock sonrası gün/saat/yönetici kapsamı/personel şubesi/kural sahibi yeniden doğrulanır; hesap+alıcı+üyelik aynı transaction. Var olan alıcılar/etkinlik/takvim/cursor değişmez. Kural artık uygun değilse409, mali rol/alıcı/şube uyuşmazlığı400; hesap yarım oluşmaz. Yanıt staff.summaryRule id/name/enabled veya null. Eski istemciyle geriye uyumludur.

- `GET /api/push/staff`: aktif ADMIN'in personel formu için kendi kapsamındaki aktif şubeleri ve grupları döndürür. `POST`: name/email/password/phone, mevcut dört rol, branchId, antrenör groupIds ve selectForNotifications alır; hesap + isteğe bağlı STAFF alıcı tek transaction. Şube bağlı ADMIN başka şube/kapsamsız hesap oluşturamaz; gruplar aktif ve seçilen şubeye ait olmalıdır. Aynı e-posta409; alan hatası400, oturumsuz401, yetkisiz/origin403. Yanıt201 yalnız id/ad/alıcı id ve cihaz yolu; şifre/hash/cihaz anahtarı yok. Mevcut `/api/users` sözleşmesi değişmedi. [Kaynak](../../src/app/api/push/staff/route.ts).

- POST /api/push/recipients yalnız ADMIN, kind STAFF ve kendi şubesinin aktif personeli; DELETE seçimi/cihazları kapatır. GET tüm kapsam içi personelin seçim, ana cihaz, süre ve son delivery durumunu döndürür; endpoint/key yok.
- POST /api/push/activate 410; veli alıcı çerezi personel yetkisi değildir. POST subscription yalnız seçili aktif personel; 30 gün. renewOnly true yalnız halen aktif/süresi geçerli sahipli aboneliği yeniler. PATCH subscription sahipli geçerli cihazı ana cihaz yapar.
- GET /api/notifications/overdue-summary aktif ADMIN/ACCOUNTING ve şube sınırı; güncel toplam/ayrıntı. GET/POST/PUT/PATCH summary-rules aynı mali sınır, yeni kural kapalı, hafta günleri 1..7/saat HH:mm/seçili mali alıcılar. PATCH action disable veya bilinçli send yeni manuel çalışma.
- Finansal olmayan personel yalnız kendi genel duyurusunu okur/alır. Manuel/toplu/otomatik PUSH ortak dispatch içinde seçili aktif STAFF, güncel sender/alıcı rol/şube ve cihaz kontrolünden geçer. Servis kabulü görüntülenme değildir.
- Worker public HTTP API değildir; container içi komut kullanılır. 57 rota, 19 sayfa. Ayrıntı [PUSH_GUIDE](../40-operations/PUSH_GUIDE.md).

Last updated: 2026-10-19. Durum: Repository kaynakları ve tarihli yerel doğrulamalar birlikte belgelenmiştir.

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

`GET /api/groups/[id]`, grup detayında ilişkili sahanın `id` ve `name` alanlarını döndürür. Arayüz kullanıcıya `fieldId` teknik anahtarını değil saha adını gösterir; liste rotasının mevcut saha ilişkisiyle uyumludur.

GET’in yan etkisiz olduğu varsayılmamalı: [settings GET](../../src/app/api/settings/route.ts) kayıt yoksa ayar kaydı oluşturur. Salt okunur incelemede API çağrısı yapılmadı.

## Bildirim ve alıcı sözleşmesi — ADR-0006 ilk aşama

Bildirim yönetimi aktif ADMIN/ACCOUNTING ve güncel şube kapsamını gerektirir; alıcı daveti/iptali yalnız ADMIN'dir. Yazma istekleri aynı origin kontrolünden geçer. Veli/sporcu `push-recipient-session` HttpOnly çereziyle ayrı alıcı oturumu kullanır; bu çerez personel API erişimi sağlamaz.

Liste `scheduledAt`, `sentAt`, alıcı bilgileri ve pagination döndürür. Öğrenci/tümü ve gruplar aktif öğrencilere; antrenörler bağlı aktif TRAINER hesabına açılır. Tarih ISO offset/UTC olmalıdır; `null` zamanlamayı kaldırır. PUSH tek kayıtlı alıcı/cihaz seçer. Tekil, bulk ve uyumlu send aynı adaptörü kullanır; IN_APP → SENT, başarılı push servis cevabı → ACCEPTED. ACCEPTED cihazda görüntülenme/okunma değildir. EMAIL/SMS gerçek sağlayıcısı olmadığı için 409 verir. Gelecek zamanlı kayıt erken gönderilmez; PROCESSING/terminal kayıt yeniden gönderilmez. GET process-scheduled 405 döndürür; otomatik işleyici kapalıdır.

Push config yalnız public key/yapılandırma durumunu verir. Activate tek kullanımlı daveti tüketir; session kendi cihazlarını ve bildirimlerini döndürür. Subscription endpoint/anahtarları yönetim listelerine veya hata yanıtlarına açılmaz. Davet/oturum anahtarlarının yalnız hash'i DB'dedir. Ayrıntılı kullanım ve sınırlar [PUSH_GUIDE](../40-operations/PUSH_GUIDE.md) içindedir.

## Rota envanteri — 57 dosya

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
| `/api/notifications/overdue-summary` | GET | [kaynak](../../src/app/api/notifications/overdue-summary/route.ts) |
| `/api/notifications/process-scheduled` | GET | [kaynak](../../src/app/api/notifications/process-scheduled/route.ts) |
| `/api/notifications` | GET, POST | [kaynak](../../src/app/api/notifications/route.ts) |
| `/api/notifications/send` | POST | [kaynak](../../src/app/api/notifications/send/route.ts) |
| `/api/notifications/summary-rules` | GET, POST, PUT, PATCH | [kaynak](../../src/app/api/notifications/summary-rules/route.ts) |
| `/api/payments/[id]` | PATCH, PUT, DELETE | [kaynak](../../src/app/api/payments/[id]/route.ts) |
| `/api/payments/bulk` | POST | [kaynak](../../src/app/api/payments/bulk/route.ts) |
| `/api/payments` | GET, POST, DELETE | [kaynak](../../src/app/api/payments/route.ts) |
| `/api/push/activate` | POST | [kaynak](../../src/app/api/push/activate/route.ts) |
| `/api/push/config` | GET | [kaynak](../../src/app/api/push/config/route.ts) |
| `/api/push/recipients` | GET, POST, DELETE | [kaynak](../../src/app/api/push/recipients/route.ts) |
| `/api/push/session` | GET, DELETE | [kaynak](../../src/app/api/push/session/route.ts) |
| `/api/push/staff-summary` | GET, PATCH | [kaynak](../../src/app/api/push/staff-summary/route.ts) |
| `/api/push/staff` | GET, POST | [kaynak](../../src/app/api/push/staff/route.ts) |
| `/api/push/subscription` | POST, DELETE, PATCH | [kaynak](../../src/app/api/push/subscription/route.ts) |
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
