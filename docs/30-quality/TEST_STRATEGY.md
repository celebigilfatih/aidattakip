# Test Strategy

## ADR-0007 personel ve özet testleri

Typecheck ve toplam 30 test geçti: bildirim politika, İstanbul zaman/sözleşme, DB entegrasyonu, mevcut demo/rapor regresyonları. DB testi yalnız loopback:5477/aidat_takip ve kendi fixture kural/kişi/verisinde çalışır; gönderici stub, dış push yok. 200 aktif/pasif sporcu, kısmi/tam/iptal/vade günü, mali rol/şube, 30 gün, logout/iptal/410, paralel claim, restart, kapalı kural ve tam 1 saat telafi sınırı kapsanır. Gerçek personel iPhone, takvim/durdurma ve demo container işleyici kabulü ayrıca kaydedilecek. Genel lint CR-011 nedeniyle ayrı kapı değildir.

Last updated: 2026-10-19. Kaynak envanteri ile tarihli çalışma zamanı doğrulamaları aşağıda ayrı tutulur.

## Mevcut envanter

İlk incelemede [package.json](../../package.json) içinde test/typecheck script’i yoktu. Demo çalışmasında `demo:test` ve `demo:test:db`, rapor çalışmasında `report:test` eklendi; proje genelinde typecheck script’i hâlâ yok, `npx tsc --noEmit --incremental false` doğrulandı. [test-queries.ts](../../test-queries.ts) Prisma sorgularını deniyor; assertion’lı test paketi değil. [api/test](../../src/app/api/test/route.ts) temel/auth/database/permission denemeleri sunuyor; CI test suite değil.

## Çekirdek doğrulama adayları — henüz çalıştırılmadı

| Senaryo | Kaynak / gereksinim | Beklenen sonuç durumu |
|---|---|---|
| Sporcu kaydı, veli ilişkisi, filtre ve aktiflik | REQ-001, WF-001 | Mevcut davranış kaynakta; ürün kabul ölçütü TBD |
| Çocuk/yetişkin ve yaş sınırı, doğum tarihi yokluğu | REQ-003, ADR-0002 | Kural/yaş eşiği onayını bekliyor |
| Tekil/toplu borçlandırmada aylık/üç aylık/altı aylık/yıllık dönemler | CR-008, WF-002 | SEMI_ANNUAL uyuşmazlığı için regresyon gerekli |
| Kısmi/tam tahsilat, iptal, sıfır/negatif/fazla tutar | REQ-002, WF-003 | Hedef iş kuralları netleşmeli |
| Tekrar gönderim ve eşzamanlı tahsilat | CR-009 | İdempotency/tutarlılık hedefi netleşmeli |
| Yetkisiz kullanıcı, yanlış grup/şube ve devre dışı kullanıcı | CR-002/003 | Rol/nesne matrisi ve güvenlik kararı gerekli |
| Temiz DB migration ve ilişkilerle restore | CR-005/006 | Yerel 10 migration ve ilk demo snapshot aktarımı kayıtlı; zamanlanmış yedek/olağanüstü durum restore tatbikatı açık |

Kaynaklar: [CORE_WORKFLOWS](../00-product/CORE_WORKFLOWS.md), [CHANGE_REQUESTS](../20-execution/CHANGE_REQUESTS.md).

## Test verisi ve ortam

İzole veritabanı, sentetik sporcu/veli ve ödeme verisi önerilir; gerçek kişisel veri/döküm test fixture’ı olarak kopyalanmamalı. Demo için mevcut yerel 5477 veritabanı, sentetik fixture, Node test runner ve kurulu tsx kullanılır; [DEMO_VALIDATION](DEMO_VALIDATION.md). Üretim benzeri kapsamlı test ortamı ve veri temizleme politikası TBD. Yeni araç veya servis seçilmedi.

## Bu belge oturumunun doğrulaması

Zorunlu envanter, yerel belge bağlantıları, JSON, kaynak envanter sayıları, değişiklik kapsamı ve mevcut uygulama/Constitution bütünlüğü kontrol edilir. Uygulama lint/typecheck/test/build işlemleri belge değişikliği nedeniyle çalıştırılmadı; sonuçlar [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md).

## Yerel smoke kontrolü — 2026-09-14

Kilitli bağımlılık kurulumu ve Prisma generate başarılı. Geliştirme sunucusu başlatıldı; `/login` HTTP 200 ve tarayıcıda giriş formu doğrulandı. DB henüz hazır olmadığından giriş/çekirdek veri akışları test edilmedi. Lint, typecheck ve production build çalıştırılmadı. Ayrıntılar [RUNBOOK](../40-operations/RUNBOOK.md).

## Yerel giriş ve veritabanı smoke kontrolü — 2026-09-14

Kullanıcı onayıyla yeni yerel PostgreSQL kuruldu, 10 mevcut migration ve yerel lisans SQL’i başarıyla uygulandı; yalnızca başlangıç yöneticisi oluşturuldu. Login 200/ADMIN, auth/me 200/ADMIN, health 200/healthy, students GET 200 ve payments GET 200 doğrulandı. Sporcu sayısı başlangıçta 0. Bu kontroller temiz DB üzerinde bağlantı/oturum/liste erişimini kanıtlar; kayıt oluşturma, çocuk/yetişkin doğrulaması, borçlandırma ve tahsilatın ürün kabul testleri değildir. Genel seed çalıştırılmadı; parola uyumsuzluğu CR-015. Lint/typecheck/build çalıştırılmadı. [RUNBOOK](../40-operations/RUNBOOK.md).

## Tam demo doğrulaması — 2026-09-15

6 saf test + 1 salt okunur yerel DB testi ve tüm proje typecheck geçti. Seed/check/dry-run, tekrar çalıştırma, dokuz hesap girişi ve antrenör grup sınırları doğrulandı. Canlı tarayıcı ekranları incelendi. Ayrıntılı kanıt, komutlar ve çalıştırılmayan kontroller [DEMO_VALIDATION](DEMO_VALIDATION.md) içinde. Testler mevcut Node test runner ve kurulu tsx ile çalışır; yeni bağımlılık/framework eklenmedi.

## Rapor ve sunum doğrulaması — 2026-09-15

`report:test` toplam/aktif sporcu ayrımına temel olan filtre ayrıştırmasını, kısmi tahsilatı, geciken kalan tutarı, iptal hariç tutmayı, `(PRESENT + EXCUSED) / kayıt` devam oranını ve XLSX imza/sayfa/hücrelerini kapsar. Gerçek API smoke kontrolü 401/403/400/410/200 senaryolarını ve ADMIN/ACCOUNTING erişimini doğruladı. `npm run build` temiz `.next` sonrasında geçti. Lint çalıştırılmadı; mevcut `next lint` etkileşimli kurulum istediği için CR-011/B-008 kapsamında ayrı tutuldu.

## Windows yerel çalışma doğrulaması — 2026-10-19

Önceki yerel çalıştırma görevinde yeni DB'ye 10 mevcut migration ve sentetik demo uygulandı; demo check PASS, `node --import tsx --test prisma/demo.test.ts prisma/demo.integration.test.ts` 7/7 başarılı. ADMIN login, auth/me, health, students, payments ve dashboard HTTP 200 verdi. [RUNBOOK](../40-operations/RUNBOOK.md). Bu çalışma ürün kabul senaryolarının tamamını doğrulamaz; lint/typecheck/build o görevde çalıştırılmadı.

Aynı tarihli CR-019 belge eşleme görevi kod envanteri, yerel PostgreSQL sürümü (salt okunur sorgu: 15.19), bağlantı/metadata/biçim ve dosya bütünlüğünü kontrol eder. Bu belge işi uygulama testlerini yeniden çalıştırmış veya canlı ortamı doğrulamış sayılmaz.

## Manuel push/alıcı ilk aşaması — 2026-10-19

Prisma validate/generate ve yerel additive migration başarılı. `tsc --noEmit --incremental false` ile typecheck, Next production build ve 15 test geçti: 3 bildirim politika testi, 1 DB entegrasyon testi, 6 demo saf + 1 demo DB + 4 rapor testi. [notification-policy.test](../../src/lib/notification-policy.test.ts) endpoint/anahtar ve offset tarih doğrulamasını; [notification.integration.test](../../src/lib/notification.integration.test.ts) ADMIN/şube sınırlarını, tek kullanımlı davet yarışını, alıcıya personel yetkisi verilmemesini, cihaz sahipliğini, toplu sahte SENT'in engellenmesini, ileri tarihin korunmasını, antrenör alıcı sözleşmesini, eşzamanlı dispatch ve çıkışla iptali kapsar. Test yalnız yerel demo DB'de kendi geçici kayıtlarını temizler; dış sender stub'dır.

HTTP: recipient/PWA kaynakları ve public config 200; yönetici notifications/recipients/session 200; yetkisiz subscription reddedildi. Tarayıcıda alıcı kaydı, manuel tek cihaz, sayfalama ve zamanlama alanları görüldü. 60 sporcu, 300 ödeme, 6 grup ve 9 kullanıcı korundu; test kullanıcıları kalmadı.

Sonraki onaylı demo dağıtımı 6b1e1c2 için Coolify Success, yeni migration applied, runtime VAPID valid, HTTPS recipient/manifest/sw/icon/config 200; public key eşleşmesi, yönetici liste/alıcı 200, oturumsuz session 401, yanlış origin POST 403 ve scheduled GET 405 doğrulandı. 60 sporcu/300 ödeme ve Özlüce container ID/image/StartedAt korundu. Sonraki 5e1fd7c demo düzeltmesi: ham CUID Topic Apple BadWebPushTopic/400 nedeniyle 32 karakter hash biçimine çevrildi. Typecheck ve dört ilgili politika/yerel DB testi yeniden geçti; gerçek Docker build başarılı. 10:35 UTC normal API testi Apple HTTP201/ACCEPTED; kullanıcı iPhone bildirimi ve doğru Volkan Acar ekranı açılışını doğruladı. Gerçek cihazdaki iptal/logout/yönetici revoke senaryoları ayrıca denenmedi; bunların yerel entegrasyon kapsamı korunur. Ayrı genel lint komutu CR-011 nedeniyle çalıştırılmadı; build'in kendi tip/derleme kontrolleri geçti. Docker doğrulama sonucu ayrıntılı handoff'ta tutulur. [PUSH_GUIDE](../40-operations/PUSH_GUIDE.md).
