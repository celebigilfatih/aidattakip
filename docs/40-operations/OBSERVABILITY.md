# Observability

Last updated: 2026-10-19. Durum: Mevcut kod ve tarihli doğrulama kayıtları eşlenmiştir; canlı log/izleme sistemi bu görevde incelenmedi.

## Mevcut sinyaller

[Prisma](../../src/lib/prisma.ts) development ortamında query/error/warn, diğer ortamlarda error logluyor. Uygulama console çağrıları kullanıyor; [Next config](../../next.config.js) production’da error/warn dışındakileri kaldırıyor.

[health](../../src/app/api/health/route.ts) SELECT 1 ve altı model sayımı yapar; başarıda healthy, hatada 503/unhealthy döndürür. Authentication/notifications/reports için operational değerleri statik; gerçek sağlayıcı veya tüm hizmet sağlığını ölçmez. [Middleware](../../middleware.ts) bu uç için de çerez gerektirir.

## Tamamlanan login düzeltmesi ve kalan riskler

[Login](../../src/app/api/auth/login/route.ts) e-posta/parola/hash debug logları 2026-09-15 tarihinde kaldırıldı. Mevcut catch bloğu hassas değişken veya ham exception eklemeden genel hata mesajı loglar. [CHANGELOG](../../CHANGELOG.md) ve kod bu dar düzeltmeyle uyumludur.

[AuthService](../../src/lib/auth.ts) kaynakta secret parçasını ve doğrulanan kullanıcının e-postasını `console.log` ile hâlâ loglar; sabit secret fallback'i devam eder. Next production derlemesi error/warn dışındaki console çağrılarını kaldıracak şekilde yapılandırılmıştır; bu, diğer çalışma biçimlerinde veya kaynakta riskin giderildiği anlamına gelmez. [ADR-0001](../50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) Proposed kalır; kalan log/fallback/secret yönetimi tamamlanmadı.

2026-10-19 yerel çalıştırmasında `[Auth]` satırları geçici başlatıcıda filtrelendi; [RUNBOOK](RUNBOOK.md). Bu çıktı filtresi kaynak değişikliği veya kalıcı log politikası değildir. Aynı tarihli önceki çalıştırmada health HTTP 200 verdi; statik servis durumlarının gerçek sağlık kontrolü olduğu sonucu çıkarılmaz.

Merkezi log/metric/trace servisi, alarm alıcısı, eşikler, log retention, erişim ve olay yönetimi sahibi TBD. Kaynaklarda otomatik CI/monitoring yapılandırması bu incelemede bulunmadı. Yeni servis veya retention politikası seçilmedi.
