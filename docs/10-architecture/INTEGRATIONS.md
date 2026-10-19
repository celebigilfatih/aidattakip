# Integrations

Last updated: 2026-10-19. Durum: Repository kaynakları, tarihli yerel doğrulamalar ve son kayıtlı dağıtım birlikte belgelenmiştir.

| Entegrasyon | Kaynakta görülen durum | Doğrulama sınırı |
|---|---|---|
| Ana PostgreSQL | [Prisma](../../src/lib/prisma.ts), `DATABASE_URL` | 2026-10-19 yerel migration/login/health/liste kontrolleri başarılı; canlı dağıtım kanıtı 2026-09-15 tarihli [DEPLOYMENT](../40-operations/DEPLOYMENT.md) kaydıdır |
| Lisans PostgreSQL | [pg.Pool](../../src/lib/license.ts), `LICENSE_DB_URL` ve `LICENSE_KEY` | Yerelde ayrı `license_db` kuruldu ve login geçti; son kayıtlı Coolify demo topolojisinde aynı demo DB'si kullanılır. Anahtar/bağlantı ayarı yoksa veya sorgu hatasında erişime izin verilir; DB'de anahtar kaydı bulunamazsa erişim reddedilir |
| E-posta / SMS | [notification-service](../../src/lib/notification-service.ts), [notifications](../../src/lib/notifications.ts) | Simülasyon/TODO/yorum satırında sağlayıcı kodu; gerçek teslim kanıtı yok |
| Uygulama içi bildirim | Notification modeli, [UI](../../src/components/InAppNotifications.tsx) | Veritabanı/arayüz akışı; dış sağlayıcı değil |
| Rapor export | [reports/export](../../src/app/api/reports/export/route.ts), [report-export](../../src/lib/report-export.ts) | ADMIN/ACCOUNTING için gerçek XLSX; PDF tarayıcı yazdırma/PDF kaydetme akışında |
| Excel kütüphanesi | [package.json](../../package.json) içinde xlsx | Mevcut bağımlılıkla workbook üretiliyor; yeni paket eklenmedi |

[settings/test-email](../../src/app/api/settings/test-email/route.ts) ve [settings/test-sms](../../src/app/api/settings/test-sms/route.ts) de simüle sonuç üretir. [notifications/id/send](../../src/app/api/notifications/[id]/send/route.ts) e-posta/SMS için simülasyon içerir. `SENT` durumunu sağlayıcı teslimatıyla eşitlemek doğru değildir; CR-004.

Banka/kart enum değerleri ödeme kaydetme yöntemidir; incelenen aidat akışında ödeme sağlayıcı entegrasyonu yok. Yeni sağlayıcı, maliyet, lisans ve vendor seçimi TBD ve açık onaya tabidir. 2026-10-19 belge eşlemesinde yalnız yerel DB sürümü sorgulandı; canlı entegrasyonlara bağlanılmadı.

Rapor biçimi ve export yetkisi [ADR-0003](../50-decisions/ADR-0003-rapor-disa-aktarim-ve-yetki.md) ile Accepted durumundadır. Sunucu tarafı PDF kütüphanesi/servisi eklenmedi; `format=pdf` çağrısı `410` döndürür.

Coolify demo dağıtımında `DATABASE_URL` ile `LICENSE_DB_URL` aynı `spormanage_aidat_demo` mantıksal veritabanını hedefler; farklı tabloları kullanırlar. Bu, kullanıcı tarafından ayrı servis kurulmadan demo izolasyonu için kabul edilen dağıtım istisnasıdır ve genel lisans mimarisini değiştirmez. [ADR-0005](../50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md).

Push ilk aşaması 2026-10-19 kullanıcı onayıyla uygulandı; [ADR-0006](../50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) Accepted. Web Push/PWA, ayrı alıcı/cihaz kaydı ve manuel tek cihaz gönderim adaptörü vardır. `web-push` 3.6.7 MPL-2.0 lisansı ve HTTPS demo dağıtımı için somut onay beklenir. Yerel testte dış gönderici kontrollü adaptördür; gerçek iPhone teslimi henüz doğrulanmadı. E-posta/SMS gerçek sağlayıcısı hâlâ yoktur ve yeni gönderim yolları sahte başarı üretmez. Eski simülasyon yardımcıları aktif route akışında kullanılmaz. Otomatik aidat kuralları ve Coolify scheduler sonraki aşamadır. [PUSH_GUIDE](../40-operations/PUSH_GUIDE.md).
