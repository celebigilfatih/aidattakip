# Test Strategy

Last updated: 2026-09-15. Kaynak envanteri ile tarihli çalışma zamanı doğrulamaları aşağıda ayrı tutulur.

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
| Temiz DB migration ve ilişkilerle restore | CR-005/006 | İzole test ortamı, kapsam ve onay gerekli |

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
