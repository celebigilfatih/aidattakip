# Observability

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Mevcut sinyaller

[Prisma](../../src/lib/prisma.ts) development ortamında query/error/warn, diğer ortamlarda error logluyor. Uygulama console çağrıları kullanıyor; [Next config](../../next.config.js) production’da error/warn dışındakileri kaldırıyor.

[health](../../src/app/api/health/route.ts) SELECT 1 ve altı model sayımı yapar; başarıda healthy, hatada 503/unhealthy döndürür. Authentication/notifications/reports için operational değerleri statik; gerçek sağlayıcı veya tüm hizmet sağlığını ölçmez. [Middleware](../../middleware.ts) bu uç için de çerez gerektirir.

## Açık riskler

[Login](../../src/app/api/auth/login/route.ts) parola debug logu üretir; [AuthService](../../src/lib/auth.ts) secret parçası loglar. Üretim error loglarının kaldırılmaması nedeniyle debug kelimesi tek başına koruma değildir. Öneri [ADR-0001](../50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) içinde; uygulanmadı.

Merkezi log/metric/trace servisi, alarm alıcısı, eşikler, log retention, erişim ve olay yönetimi sahibi TBD. Kaynaklarda otomatik CI/monitoring yapılandırması bu incelemede bulunmadı. Yeni servis veya retention politikası seçilmedi.
