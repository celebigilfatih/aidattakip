# Aidat Takip — Project Boot

- Document version: 0.4.6
- CDSK version: TBD
- Last updated: 2026-10-19

Bu belge kısa çalışma bağlamıdır; ayrıntıların asıl kaynağı bağlantılı belgelerdir. Mevcut kod davranışı, kullanıcı hedefi ve Proposed karar birbirinden ayrılır. Statik inceleme uygulamanın çalıştığına dair kanıt değildir.

## Project Compass

- North star: Spor kulüplerinin sporcu ve aidat takibini yapabilmesi.
- Current mission: Ayrı SporManage demo dağıtımını işletmek; demo verisi, secret ve yedekleme risklerini yönetmek.
- Success signal: Ayrıntılı kabul ölçütleri TBD; [REQUIREMENTS](docs/00-product/REQUIREMENTS.md).
- Accepted trade-offs: Demo ve Özlüce uygulamalarında ayrı DB/rol ile aynı fiziksel PostgreSQL kaynağını paylaşma; demo lisans tablosunu demo DB'sinde tutma, [ADR-0005](docs/50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md). Diğer genel mimari tercihler için kabul kaydı TBD.

## 1. Project Identity

- Project name: Aidat Takip
- One-line vision: Spor kulüpleri için sporcu ve aidat takibi.
- Problem statement: Spor kulüplerinin sporcularını ve aidatlarını takip etmek.
- Target users: Kulüp personeli; ilk sürüm çocuk ve yetişkin sporcu kayıtlarını kapsar. [PERSONAS](docs/00-product/PERSONAS.md).
- Success criteria: Ayrıntılı kabul ve sayısal hedefler TBD.
- MVP goal: Sporcu ve Aidat Takibi; [SCOPE](docs/00-product/SCOPE.md).
- Explicit non-goals: TBD — kullanıcı tarafından belirlenmedi.

## 2. Current Status

- Demo push dağıtım onayı (2026-10-19): Kullanıcı `web-push` 3.6.7/MPL-2.0 ve yalnız SporManage demo HTTPS dağıtımı/iPhone gerçek testini onayladı. Ayrı `codex/manual-push-demo-20261019` ref'i hazırlanıyor; mevcut yerel image/test kanıtları korunur. Dağıtım ve cihaz kabulü henüz tamamlanmadı. Aşağıdaki önceki onay bekleme satırları tarihsel uygulama oturumuna aittir; güncel onay [ADR-0006](docs/50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) içindedir.

- Manuel push ilk aşaması (2026-10-19): Kullanıcı [ADR-0006](docs/50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) planını ve önce ekran/API düzeltmesi, veli/sporcu alıcı kaydı, tek cihazda manuel push'u onayladı. Yerel kod/migration/PWA hazır; typecheck, 15 test ve build geçti. CR-020 ilk aşama kapalı. Gerçek test cihazı iPhone; HTTPS demo dağıtımı, somut MPL-2.0 paket onayı ve cihazdaki izin/teslim kontrolü bekleniyor. Otomatik kurallar/scheduler etkin değil. [PUSH_GUIDE](docs/40-operations/PUSH_GUIDE.md).

- Yerel çalıştırma (2026-10-19, Windows): `http://127.0.0.1:3077/login` çalışıyor. Kullanıcı onayıyla yeni PostgreSQL 15 konteyneri/volume, `aidat_takip` ve `license_db` kuruldu; 10 mevcut migration ve sentetik demo uygulandı. ADMIN login ve dashboard/health/sporcu/ödeme erişimi HTTP 200, demo check ve 7 test başarılı. [RUNBOOK](docs/40-operations/RUNBOOK.md). Production ortamı bu görevde değiştirilmedi.

- CDSK eşlemesi (2026-10-19): Beş kök dosya, yedi docs klasörü ve dolu proje bağlamı mevcut; PUSH_GUIDE ile docs Markdown sayısı 42. [CR-019](docs/20-execution/CHANGE_REQUESTS.md) belge kapsamıyla kapalıdır. Canlı PostgreSQL sürümü TBD (CR-006); yerel sürüm 15.19. CDSK sürümü, ayrıntılı kabul ölçütleri ve kalite/operasyon kararları açık; tam süreç/ürün uyumu veya güncel canlı durum kanıtlanmış değildir.

- Broşür görevi (2026-09-15): Gerçek giriş, yönetim paneli ve mobil ödeme ekranlarını kullanan iki sayfalık A4 tanıtım PDF'si, 300 DPI sayfaları ve birleşik önizlemesi tamamlandı. Bağlantılar, QR kodları, demo bilgileri ve fontlar doğrulandı. [BROCHURE_GUIDE](docs/40-operations/BROCHURE_GUIDE.md).

- Phase: Mevcut uygulamaya CDSK bağlamı kazandırma; ürün kabul aşaması TBD.
- Version: package.json 1.0.0; 2026-09-15 dağıtım kaydı mevcut, bu numaranın release etiketi/ürün kabulüyle eşlenmesi TBD.
- Active sprint veya milestone: TBD
- Current focus: Yerel demo çalışır durumda; son kayıtlı canlı topoloji (2026-09-15) ayrı SporManage demo ve Özlüce production uygulamalarıdır. Bu belge eşlemesinde canlı ortam yeniden sorgulanmadı. [DEPLOYMENT](docs/40-operations/DEPLOYMENT.md).
- Critical risks: Demo ADMIN sentetik veriyi değiştirebilir; iki DB aynı fiziksel PostgreSQL servisinin kapasite/erişilebilirliğini paylaşır; doğrulanmış zamanlanmış backup/restore ve parola rotasyon tarihi yoktur. [CHANGE_REQUESTS](docs/20-execution/CHANGE_REQUESTS.md).
- Blocking decisions: Dağıtım kaydı mevcut; kesin ürün kabulü TBD. Production başlangıç kimliği/rol düzeltmesi ve kalan secret politikası açık onay bekler. ADR-0001 ve ADR-0002 hâlâ Proposed; login log temizliği ayrı düzeltme olarak tamamlandı.
- Last status update: 2026-10-19

## 3. Repository Navigation

1. [AGENTS.md](AGENTS.md)
2. [CONSTITUTION](docs/00-product/CONSTITUTION.md)
3. [PROJECT_BOOT](PROJECT_BOOT.md)
4. [README](README.md)
5. [PRODUCT_SPEC](docs/00-product/PRODUCT_SPEC.md)
6. [SCOPE](docs/00-product/SCOPE.md)
7. [ROADMAP](docs/00-product/ROADMAP.md)
8. İlgili mimari belgeler: [OVERVIEW](docs/10-architecture/OVERVIEW.md), [BOUNDED_CONTEXTS](docs/10-architecture/BOUNDED_CONTEXTS.md), [DATA_MODEL](docs/10-architecture/DATA_MODEL.md), [API_CONVENTIONS](docs/10-architecture/API_CONVENTIONS.md), [SECURITY_MODEL](docs/10-architecture/SECURITY_MODEL.md), [INTEGRATIONS](docs/10-architecture/INTEGRATIONS.md), [AI_ARCHITECTURE](docs/10-architecture/AI_ARCHITECTURE.md)
9. Kabul edilmiş ilgili [ADR’ler](docs/50-decisions/README.md)
10. İlgili execution: [BACKLOG](docs/20-execution/BACKLOG.md), [MILESTONES](docs/20-execution/MILESTONES.md), [RELEASE_PLAN](docs/20-execution/RELEASE_PLAN.md), [CHANGE_REQUESTS](docs/20-execution/CHANGE_REQUESTS.md); quality: [CODING_STANDARDS](docs/30-quality/CODING_STANDARDS.md), [TEST_STRATEGY](docs/30-quality/TEST_STRATEGY.md), [DEFINITION_OF_DONE](docs/30-quality/DEFINITION_OF_DONE.md); operations: [RUNBOOK](docs/40-operations/RUNBOOK.md), [DEPLOYMENT](docs/40-operations/DEPLOYMENT.md), [BACKUP_RECOVERY](docs/40-operations/BACKUP_RECOVERY.md), [OBSERVABILITY](docs/40-operations/OBSERVABILITY.md)
11. [CHANGELOG](CHANGELOG.md)
12. Göreve göre değiştirilecek mevcut kod ve testler; demo CLI/test dosyaları `prisma/demo-*` ve `prisma/demo*.test.ts` altındadır.

Diğer bağlam kaynakları: [GLOSSARY](docs/00-product/GLOSSARY.md), [PERSONAS](docs/00-product/PERSONAS.md), [CORE_WORKFLOWS](docs/00-product/CORE_WORKFLOWS.md), [REQUIREMENTS](docs/00-product/REQUIREMENTS.md), [PROMPT_GUIDE](docs/60-ai/PROMPT_GUIDE.md), [MEMORY_STRATEGY](docs/60-ai/MEMORY_STRATEGY.md), [CONTEXT_POLICY](docs/60-ai/CONTEXT_POLICY.md), [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md).

## 4. Architecture Snapshot

- Layers: React arayüzü → Next API → Prisma → PostgreSQL; [OVERVIEW](docs/10-architecture/OVERVIEW.md).
- Main integrations: PostgreSQL ve lisans bağlantısı; demo dağıtımında uygulama ile lisans tablosu aynı mantıksal demo DB'dedir. Manuel Web Push adaptörü yerelde hazır; gerçek iPhone testi açık. E-posta/SMS sağlayıcıları henüz bağlı değil; aktif gönderim yolları sahte başarı üretmez.
- AI components: N/A — incelenen kaynakta ürün içi AI bileşeni bulunmadı.
- Data and storage: 25 Prisma modeli ve 11 migration; yeni alıcı/push migration'ı yalnız yerelde uygulandı. Lisans verisi SQL/pg bağlantısından okunur. Yerelde ayrı license_db; son kayıtlı Coolify demosunda aynı demo DB'sindeki lisans tablosu kullanılır. Canlı PostgreSQL sürümü TBD; yerel 15.19 doğrulandı.
- Deployment model: Özlüce production ve SporManage demo için iki ayrı Coolify uygulaması; GitHub `main` webhook'u, repository Dockerfile/Next standalone ve aynı fiziksel PostgreSQL kaynağında ayrı mantıksal DB/roller. Compose production’da kullanılmaz. [DEPLOYMENT](docs/40-operations/DEPLOYMENT.md).
- Ayrıntılar: [OVERVIEW](docs/10-architecture/OVERVIEW.md), [DATA_MODEL](docs/10-architecture/DATA_MODEL.md), [INTEGRATIONS](docs/10-architecture/INTEGRATIONS.md), [AI_ARCHITECTURE](docs/10-architecture/AI_ARCHITECTURE.md), [DEPLOYMENT](docs/40-operations/DEPLOYMENT.md).

## 5. Decision Snapshot

| Decision | Status | ADR veya asıl kaynak |
|---|---|---|
| Mevcut model üzerinde SporManage gösterim ortamı | Kullanıcı tarafından onaylandı; kuruldu | [DEMO_GUIDE](docs/40-operations/DEMO_GUIDE.md) |
| Çocuk ve yetişkin sporcular ilk sürümde | Kullanıcı tarafından doğrulandı | [PRODUCT_SPEC](docs/00-product/PRODUCT_SPEC.md) |
| Secret/log düzenlemesi | Proposed; login temizliği tamamlandı, kalan maddeler açık | [ADR-0001](docs/50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) |
| Yaşa göre kayıt koşulları | Proposed; uygulanmadı | [ADR-0002](docs/50-decisions/ADR-0002-cocuk-yetiskin-sporcu-kaydi.md) |
| Rapor XLSX, tarayıcı PDF ve export yetkisi | Accepted; uygulandı | [ADR-0003](docs/50-decisions/ADR-0003-rapor-disa-aktarim-ve-yetki.md) |
| Broşür demo hesabı production ADMIN rolü | Superseded | [ADR-0004](docs/50-decisions/ADR-0004-brosur-demo-admin-hesabi.md) |
| SporManage ayrı demo uygulaması ve mantıksal DB | Accepted; uygulandı | [ADR-0005](docs/50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md) |
| Web Push ve periyodik aidat hatırlatma | Accepted; manuel ilk aşama yerelde hazır, otomasyon sonraki aşama | [ADR-0006](docs/50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) |

Karar gerekçeleri burada kopyalanmaz; asıl belgeye bağlantı verilir.

## 6. AI Context

- Project purpose: [PRODUCT_SPEC](docs/00-product/PRODUCT_SPEC.md) içindeki kullanıcı hedefi.
- Constraints and prohibitions: [CONSTITUTION](docs/00-product/CONSTITUTION.md) ve [AGENTS.md](AGENTS.md); projeye özel kısıtlar TBD.
- Open questions: Push alıcı kimliği/yetkisi, takvim ve işletim planı (ADR-0006); canlı PostgreSQL sürümü, production başlangıç kimliği/rolü, buildtime secret erişimi, backup/restore; yaş eşiği/veli kuralları, rol matrisi, para kuralları, operasyon hedefleri ve CDSK sürümü; [CHANGE_REQUESTS](docs/20-execution/CHANGE_REQUESTS.md).
- Recent decisions: Kullanıcı ayrı demo uygulamasını ve mevcut PostgreSQL kaynağında ayrı mantıksal DB kullanımını onayladı; ADR-0005 Accepted, ADR-0004 Superseded. ADR-0001/0002 Proposed, ADR-0003 Accepted kalır.
- Recently completed work: 2026-10-19 manuel push/alıcı kaydı yerel uygulaması ve doğrulamaları; ADR-0006 Accepted, CR-020 ilk aşama kapalı. iPhone gerçek test/dağıtım onayı açık. [PUSH_GUIDE](docs/40-operations/PUSH_GUIDE.md).

## 7. Current Priorities

1. Demo ADMIN hesabı için kullanım süresi ve parola rotasyonu/iptal tarihi belirlemek.
2. Demo DB için zamanlanmış backup/restore ve paylaşılan PostgreSQL kapasite izlemesini ele almak.
3. Production başlangıç kimliği/rol çelişkisini CR-016 kapsamında çözmek.

Bu sıra öneridir; uygulama onayı değildir.

## 8. Known Constraints

- Teknik: Mevcut Next/Prisma/PostgreSQL yapısı; sürümler [OVERVIEW](docs/10-architecture/OVERVIEW.md).
- Ürün: İlk hedef sporcu/aidat, çocuk ve yetişkin kapsamı; genişleme onayı yok.
- Zaman: TBD
- Bütçe: TBD
- Güvenlik: Mevcut riskler [SECURITY_MODEL](docs/10-architecture/SECURITY_MODEL.md); yeni politika onay gerektirir.
- Operasyon: Coolify production hedefi doğrulandı; RPO/RTO, healthcheck ve doğrulanmış restore prosedürü TBD.

## 9. Working Agreements

- Önce repository ve dokümantasyon doğrulaması yapılır.
- Küçük ve doğrulanabilir adımlarla ilerlenir.
- Kritik karar için ADR ve açık onay gerekir.
- Her anlamlı değişiklikte CHANGELOG güncellenir.
- Ayrıntılı kaynaklar Project Boot içine kopyalanmaz; bağlantı verilir.
- Bilinmeyenler tahmin edilmez.

## 10. Exit Checklist

### Definition of Ready

- [ ] Amaç ve kabul kriterleri açık.
- [ ] İlgili belgeler ve mevcut kod incelendi.
- [ ] Belirsizlikler ve onay kapıları işaretlendi.
- [ ] ADR ihtiyacı değerlendirildi.
- [ ] Doğrulama yöntemi tanımlandı.

### Definition of Done

- [ ] Kabul kriterleri karşılandı.
- [ ] Uygun lint, typecheck, test ve build kontrolleri geçti; çalıştırılmayanlar gerekçeleriyle kaydedildi.
- [ ] Güvenlik, gizlilik ve veri etkileri değerlendirildi.
- [ ] İlgili dokümantasyon güncellendi.
- [ ] ADR ve CHANGELOG gereksinimi tamamlandı.
- [ ] Repository tutarlılığı doğrulandı.
- [ ] Açık riskler ve sonraki adım kaydedildi.

## 11. AI Handoff

- Session summary (2026-10-19): Onaylı ADR-0006 ilk aşaması yerelde uygulandı; bildirim hataları, ayrı alıcı/davet/cihaz akışı ve tek cihaz manuel push adaptörü hazır. CR-020 ilk aşama kapalı; iPhone gerçek kabulü henüz tamamlanmadı.
- Documents updated: PUSH_GUIDE, ADR-0006/dizin, ürün/mimari/kalite, CR-004/020, backlog, CHANGELOG ve ayrıntılı handoff. Tarihsel oturumlar korunur.
- Decisions recorded: ADR-0006 Accepted, ADR-0001/0002 Proposed; diğer durumlar korunur. Somut MPL-2.0 paket ve yalnız demo HTTPS dağıtımı için açık onay beklenir; otomatik kurallar kurulmadı.
- Verification: Prisma validate/generate/yerel migration, typecheck, 15 test ve production build geçti; HTTP/PWA kaynakları ve tarayıcı paneli kontrol edildi. Gerçek push servisinin iPhone'a teslimi test edilmedi; test adaptörü kontrollüydü.
- Working environment: Next loopback:3077, PostgreSQL loopback:5477, güncel terminal oturumu 12714. Yerel VAPID sırları repository dışından yalnız sunucu ortamına yüklenir. Mevcut konteyner/veriyi koruyun. [RUNBOOK](docs/40-operations/RUNBOOK.md).
- Remaining risk / next step: Lisans/paket ve yalnız HTTPS demo dağıtımı onayı sonrası iPhone'da ana ekrana ekleme/izin/gerçek tek cihaz testi. Yeni sınırlı alıcı oturumu ve PROCESSING kayıtları için sınırlar PUSH_GUIDE'dadır; diğer açık CR'ler sürer. [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md).

## Revision History

| Version | Date | Summary |
|---|---|---|
| 0.1.0 | 2026-09-14 | CDSK iskeleti; projeye özel alanlar TBD. |
| 0.2.0 | 2026-09-14 | Kaynaklı proje bağlamı, çocuk/yetişkin hedefi ve Proposed karar bağlantıları. |
| 0.2.1 | 2026-09-14 | Yerel giriş ekranı çalıştırıldı; DB kurulumu tercihi bekleniyor. |
| 0.2.2 | 2026-09-14 | Temiz yerel DB ve başlangıç yöneticisi oluşturuldu; giriş doğrulandı. |
| 0.2.3 | 2026-09-15 | Tam futbol demosu, deterministik seed ve doğrulama kayıtları. |
| 0.2.4 | 2026-09-15 | Sporcu/veli kişi adları gerçekçi kurgusal adlarla yenilendi. |
| 0.2.5 | 2026-09-15 | Teknik kadro kişi adları gerçekçi kurgusal adlarla yenilendi. |
| 0.2.6 | 2026-09-15 | Kulüp görünen adı SporManage olarak yenilendi. |
| 0.3.0 | 2026-09-15 | SporManage sunumu ve hesaplar tamamlandı; ortak rapor hesapları, gerçek XLSX, tarayıcı PDF ve Accepted ADR-0003. |
| 0.3.1 | 2026-09-15 | Coolify production kurulumu, canlı doğrulama ve production giriş bilgilerinin ayrıştırılması. |
| 0.3.2 | 2026-09-15 | Broşür için kullanıcı onaylı production ADMIN hesabı ve domain erişim riski kaydı. |
| 0.3.3 | 2026-09-15 | Broşür domain’i Coolify’a bağlandı; DNS/TLS/HTTP ve ADMIN login doğrulandı, CR-018 kapatıldı. |
| 0.4.0 | 2026-09-15 | Ayrı Coolify demo uygulaması, mantıksal DB izolasyonu ve domain cutover; ADR-0005 Accepted. |
| 0.4.1 | 2026-10-19 | CDSK durum kontrolü ve CR-019 belge güncelliği bulguları; uygulama/altyapı değişikliği yok. |
| 0.4.2 | 2026-10-19 | Kullanıcı onaylı Windows yerel PostgreSQL/demo kurulumu ve uygulama çalıştırması. |
| 0.4.3 | 2026-10-19 | CR-019 belge eşlemesi; kısmi login düzeltmesi, son kayıtlı dağıtım ve açık sürüm kanıtı ayrımı. |
| 0.4.4 | 2026-10-19 | Push ve tekrarlı aidat bildirimi incelemesi; Proposed ADR-0006, CR-020 ve doğrulanmış alıcı hedefi. |
| 0.4.5 | 2026-10-19 | ADR-0006 Accepted; manuel push/alıcı ilk aşaması, yerel additive migration ve testler; iPhone/HTTPS kabulü açık. |
