# Change Requests

Last updated: 2026-09-15. Durum: Repository kaynakları ve tarihli uygulama/doğrulama kayıtları birlikte izlenir.

## Kayıt ilkesi

Bu kayıtlar kaynaklar arasındaki çelişki veya uygulama eksiklerini açıkça gösterir. Öneriler kabul edilmiş karar değildir. Kod/veri/dağıtım değişikliği yapılmadı. Öncelikler öneridir; kullanıcı adına sprint veya yayın kapsamı seçilmedi.

## CR-001 — Kurulum ve dokümantasyon çelişkileri

- Kaynaklar: [README](../../README.md), [package](../../package.json), [şema](../../prisma/schema.prisma), [warmup](../../scripts/warmup.ts).
- Gözlem/çelişki: README SQLite, .env.example ve 3000 portuyla kurulum anlatıyor; şema PostgreSQL, dev 3077; .env.example yok. Warmup 3000 kullanıyor.
- Etki ve öneri: Kurulum yanlış yöne gidebilir. README’ye kaynak uyarısı eklendi; eski içerik korunuyor. Ayrıntılı düzeltme önerilir.
- Durum/onay: Açık; belge düzeltmesi teknik karar değildir. Runtime değişirse onay kapsamı değerlendirilmeli.

## CR-002 — Rol tablosu ve nesne erişimi

- Kaynaklar: [README](../../README.md), [auth](../../src/lib/auth.ts), [izinler](../../src/lib/trainer-permissions.ts), [payments id](../../src/app/api/payments/[id]/route.ts).
- Gözlem/çelişki: README TRAINER için sporcu/ödeme yönetimini kapalı gösterirken yardımcılar izin veriyor. Liste grup filtresi, detay/yazma uçlarının tamamının aynı kapsamı uyguladığını kanıtlamaz.
- Etki ve öneri: Hedef rol ve nesne erişim matrisi netleşmeli; tüm çekirdek uçlar için doğrulama önerilir.
- Durum/onay: Açık; yetkilendirme kararı ve değişikliği açık onay gerektirir.

## CR-003 — Kimlik doğrulama taşıma biçimleri

- Kaynaklar: [middleware](../../middleware.ts), [reports/export](../../src/app/api/reports/export/route.ts), [test-email](../../src/app/api/settings/test-email/route.ts).
- Gözlem/çelişki: Middleware çerez bekliyor; bazı handler’lar Bearer başlığı okuyor. Yalnızca bir biçimi gönderen istemci reddedilebilir.
- Etki ve öneri: Gerçek istemci istekleriyle doğrulanmalı; ortak yaklaşım kararı önerilir.
- Durum/onay: Açık; auth/sözleşme değişikliği onay gerektirir.

## CR-004 — Bildirim teslimatı

- Kaynaklar: [notification-service](../../src/lib/notification-service.ts), [notifications](../../src/lib/notifications.ts), [id/send](../../src/app/api/notifications/[id]/send/route.ts).
- Gözlem/çelişki: Gönderim yollarında simülasyon veya sağlayıcı çağrısı olmadan başarı sonucu var; README çok kanallı bildirim özelliği sunuyor.
- Etki ve öneri: SENT gerçek teslim kanıtı sayılmamalı. MVP ilişkisi ve sağlayıcı kararı netleşmeli.
- Durum/onay: Açık; sağlayıcı ekleme, maliyet ve veri aktarımı için açık onay gerekir.

## CR-005 — Yedekleme kapsamı ve geri yükleme

- Kaynaklar: [backup API](../../src/app/api/settings/backup/route.ts), [şema](../../prisma/schema.prisma).
- Gözlem/çelişki: JSON fallback 12 model koleksiyonu içeriyor; şemada 20 model var. Parent/Student ilişki bağlantıları bu yalın koleksiyonlarda ayrıca yüklenmiyor. users alan seçimi yok.
- Etki ve öneri: Tam geri yüklenebilir yedek kabul edilmemeli. İzole restore denemesi ve kapsam tasarımı önerilir.
- Durum/onay: Açık; retention, hassas veri ve restore işlemleri onaya tabidir.

## CR-006 — Dağıtım referansları

- Kaynaklar: [Compose](../../docker-compose.yml), [Dockerfile](../../Dockerfile), [gitignore](../../.gitignore).
- Gözlem/çelişki: Compose init.sql bağlaması tanımlı fakat dosya yok. Dockerfile .npmrc kopyalıyor. Ortam kurulumu ve taşınabilirlik doğrulanmadı.
- Etki ve öneri: Temiz ortamda build/migration incelemesi önerilir; hiçbir deployment çalıştırılmadı.
- Durum/onay: Açık; ortam/topoloji değişikliği açık onay gerektirir.

## CR-007 — Secret ve kimlik doğrulama logları

- Kaynaklar: [login](../../src/app/api/auth/login/route.ts), [auth](../../src/lib/auth.ts), [Compose](../../docker-compose.yml).
- Gözlem/çelişki: Parola/secret parçası loglama, sabit secret fallback ve Compose’a yazılı değerler var. .env/.npmrc/SQL dökümü git ls-files içinde takip ediliyor; hassas içerikleri açılmadı.
- Etki ve öneri: Öncelikli değerlendirme önerilir; değerler belgelere taşınmadı. Ayrı ortam envanteri olmadan rotasyon yapılmamalı.
- Durum/onay: [ADR-0001](../50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) Proposed; uygulama/rotasyon onayı yok.

## CR-008 — Altı aylık aidat aralığı

- Kaynaklar: [şema](../../prisma/schema.prisma), [tekil](../../src/app/api/payments/route.ts), [toplu](../../src/app/api/payments/bulk/route.ts).
- Gözlem/çelişki: SEMI_ANNUAL enum’u var; iki borçlandırma switch’inde karşılığı yok ve default 1 ay uygulanıyor.
- Etki ve öneri: Altı aylık planın vadeleri yanlış oluşabilir. Beklenen dönem kuralı teyidi ve tekil/toplu regresyon önerilir.
- Durum/onay: Açık; mevcut kayıtları toplu değiştirme yetkisi yok. Veri düzeltmesi ayrıca onay gerektirir.

## CR-009 — Parasal kayıt kuralları

- Kaynaklar: [şema](../../prisma/schema.prisma), [tahsilat](../../src/app/api/payments/[id]/route.ts).
- Gözlem/çelişki: Tutarlar Float; tahsilat aggregate alan üzerine ekleniyor. Ayrı hareket modeli ve idempotency anahtarı yok.
- Etki ve öneri: Para hassasiyeti, fazla/negatif tutar, tekrar istek ve eşzamanlılık kriterleri belirlenmeli. Bu kayıt henüz veri kaybı veya hatalı bakiye PoC’si değildir.
- Durum/onay: Açık; veri modeli/sözleşme değişimi için ADR ve onay gerekir.

## CR-010 — Rapor biçimi

- Kaynaklar: [README](../../README.md), [reports/export](../../src/app/api/reports/export/route.ts).
- Gözlem/çelişki: Export endpoint’i gerçek PDF/XLSX yerine örnek metne bu MIME türlerini veriyor.
- Çözüm: Ekran ve export ortak hesaplama katmanını kullanır; mevcut `xlsx` ile gerçek workbook üretilir. PDF tarayıcı yazdırma/PDF kaydetme akışına taşındı, eski `format=pdf` `410` döndürür.
- Durum/onay: Kapalı; kullanıcı onayı ve sözleşme [ADR-0003](../50-decisions/ADR-0003-rapor-disa-aktarim-ve-yetki.md) içinde Accepted. Yeni bağımlılık eklenmedi.

## CR-011 — Kalite, lint ve işletim iddiaları

- Kaynaklar: [package](../../package.json), [test-queries](../../test-queries.ts), [health](../../src/app/api/health/route.ts), [middleware](../../middleware.ts).
- Gözlem/çelişki: Demo ve rapor testleri eklendi, typecheck/build çalıştırıldı. Mevcut `next lint` komutu Next 15 ortamında etkileşimli kurulum ister; doğrulanmış ESLint yapılandırması yoktur. Health servis durumlarını sabit operational veriyor; middleware sağlık/test uçlarında da çerez istiyor.
- Etki ve öneri: Lint yapılandırması ayrı işte seçilip otomatik çalışır hale getirilmeli; health tam servis kontrolü sayılmamalı.
- Durum/onay: Açık; health erişim değişikliği güvenlik onayına tabidir.

## CR-012 — Lisans ve eski tasarım iddiaları

- Kaynaklar: [README](../../README.md), [eski tasarım](../../TRAINING_ATTENDANCE_SYSTEM_DESIGN.md).
- Gözlem/çelişki: README MIT LICENSE dosyasına atıf yapıyor; dosya yok. Tarihsel özellik/takvim ve güvenlik vaatleri güncel kabul kanıtı değil.
- Etki ve öneri: Yasal lisans ve güncel kapsam TBD; eski metinler onaylı karar sayılmadı.
- Durum/onay: Açık; lisans seçimi yapılmadı. İlgili karar kullanıcı onayı gerektirir.

## CR-013 — Çocuk ve yetişkin kayıt kapsamı

- Kaynaklar: [PRODUCT_SPEC](../00-product/PRODUCT_SPEC.md), [students POST](../../src/app/api/students/route.ts).
- Gözlem/çelişki: Kullanıcı her iki yaş grubunu hedefliyor; kod yaş ayrımı yapmadan veli ve birincil veli istiyor.
- Etki ve öneri: Yetişkinin kendi iletişim bilgisiyle kaydı için kural netleşmeli; sahte veli kaydı önerilmez.
- Durum/onay: [ADR-0002](../50-decisions/ADR-0002-cocuk-yetiskin-sporcu-kaydi.md) Proposed; yaş eşiği TBD.

## CR-014 — Ayar erişimi ve oturum süresi

- Kaynaklar: [SettingsContext](../../src/contexts/SettingsContext.tsx), [settings API](../../src/app/api/settings/route.ts), [auth](../../src/lib/auth.ts), [şema](../../prisma/schema.prisma).
- Gözlem/çelişki: Context ayarları yüklemeye çalışırken GET yalnızca ADMIN kabul ediyor. sessionTimeout ayarı var; JWT süresi kodda sabit 7 gün.
- Etki ve öneri: Diğer roller için varsayılan ayar gösterimi ve beklenen oturum süresi doğrulanmalı.
- Durum/onay: Açık; ayar erişimi/oturum politikası açık onay gerektirir.

## CR-015 — Seed parolası giriş koduyla uyumsuz

- Kaynaklar: [seed](../../prisma/seed.ts), [AuthService](../../src/lib/auth.ts).
- Gözlem: Seed parola hash’i SHA-256 kullanıyor; giriş bcrypt.compare bekliyor. Seed ayrıca örnek sporcu ve organizasyon verileri üretiyor.
- Etki: Genel seed ile oluşturulan yönetici varsayılan parolayla giriş yapamayabilir; yalnızca hesap isteyen kurulumda istenmeyen örnek veriler eklenir.
- Bu oturum: Kullanıcının onayladığı temiz yerel DB’de yalnızca yönetici, mevcut bcrypt cost 12 biçiminde oluşturuldu; login 200 doğrulandı. Seed kodu değiştirilmedi.
- Öneri/durum: Genel seed’in mevcut auth ile tutarlılığını ve yalnızca yönetici kurulum seçeneğini ayrı görevde düzeltmek. Açık; yeni güvenlik politikası/ADR kabulü yok.
