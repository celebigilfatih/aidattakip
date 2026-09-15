# Integrations

Last updated: 2026-09-15. Durum: Repository kaynakları ve tarihli yerel doğrulamalar birlikte belgelenmiştir.

| Entegrasyon | Kaynakta görülen durum | Doğrulama sınırı |
|---|---|---|
| Ana PostgreSQL | [Prisma](../../src/lib/prisma.ts), `DATABASE_URL` | Çalışan bağlantı denenmedi |
| Lisans PostgreSQL | [pg.Pool](../../src/lib/license.ts), `LICENSE_DB_URL` ve `LICENSE_KEY` | Anahtar/DB yoksa veya DB hatasında girişe izin veren davranış var; aktif üretim topolojisi TBD |
| E-posta / SMS | [notification-service](../../src/lib/notification-service.ts), [notifications](../../src/lib/notifications.ts) | Simülasyon/TODO/yorum satırında sağlayıcı kodu; gerçek teslim kanıtı yok |
| Uygulama içi bildirim | Notification modeli, [UI](../../src/components/InAppNotifications.tsx) | Veritabanı/arayüz akışı; dış sağlayıcı değil |
| Rapor export | [reports/export](../../src/app/api/reports/export/route.ts), [report-export](../../src/lib/report-export.ts) | ADMIN/ACCOUNTING için gerçek XLSX; PDF tarayıcı yazdırma/PDF kaydetme akışında |
| Excel kütüphanesi | [package.json](../../package.json) içinde xlsx | Mevcut bağımlılıkla workbook üretiliyor; yeni paket eklenmedi |

[settings/test-email](../../src/app/api/settings/test-email/route.ts) ve [settings/test-sms](../../src/app/api/settings/test-sms/route.ts) de simüle sonuç üretir. [notifications/id/send](../../src/app/api/notifications/[id]/send/route.ts) e-posta/SMS için simülasyon içerir. `SENT` durumunu sağlayıcı teslimatıyla eşitlemek doğru değildir; CR-004.

Banka/kart enum değerleri ödeme kaydetme yöntemidir; incelenen aidat akışında ödeme sağlayıcı entegrasyonu yok. Yeni sağlayıcı, maliyet, lisans ve vendor seçimi TBD ve açık onaya tabidir. Bu oturum dış servise bağlanmadı.

Rapor biçimi ve export yetkisi [ADR-0003](../50-decisions/ADR-0003-rapor-disa-aktarim-ve-yetki.md) ile Accepted durumundadır. Sunucu tarafı PDF kütüphanesi/servisi eklenmedi; `format=pdf` çağrısı `410` döndürür.
