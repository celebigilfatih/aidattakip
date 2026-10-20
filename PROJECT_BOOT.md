# Aidat Takip — Project Boot

## Güncel görev — CR-032

CR-032 kullanıcı tarafından2026-10-20 düzeltme ve yalnız demo yayınıyla onaylandı. Ortak payment-balance hesabı aile, personel gecikmiş borç ve Ödemeler okumasında kullanılır: PENDING/PARTIAL/OVERDUE, max(amount-paidAmount,0), PAID/CANCELLED kapalı, İstanbul vade günü tamamlandıktan sonra gecikme. Veritabanı status/borç/tahsilat geçmişi yazılmaz. API raw status korunur; displayStatus/remainingAmount/overdue/asOf ve summary.totalRemaining/overdueAmount additive alanları eklenir. Filtre ve SQL sayımı aynı koşulla kesişir; plan/rozet/Excel ortak güncel görünümü kullanır. Yeni model/migration/paket/yetki/retention kararı yok, ADR-0007/0009 geçerli. Yerel80 test+son9 test (81 benzersiz) ve typecheck başarılı; yerel Docker başarılı. Demo yayını ve sonrası guard/UI henüz bekliyor. Ayrıntı [doğrulama](docs/30-quality/PAYMENT_OVERDUE_VALIDATION.md).

## Son modül yayını — ADR-0009 / CR-031

2026-10-20 ADR-0009 dört modül yalnız SporManage demo8cd9f72 ile yayımlandı; Coolify Success/04m05s, beş additive migration applied,37 model/18 migration.79 test/typecheck/yerel ve demo Docker başarılı; son yerel onay/görüşme ve canlı390/1280px kontrolleri geçti. Kullanıcı dört ekranın iPhone görünümünü onayladı; CR-031 kapalı. Önce/sonra hash/sayımlar, mevcut etkin Pazartesi09:00/Demo Kullanıcı/ana iPhone korundu; worker ilerledi. main/Özlüce değişmedi. [Rehber](docs/40-operations/CLUB_LIFECYCLE_GUIDE.md), [doğrulama](docs/30-quality/CLUB_LIFECYCLE_VALIDATION.md). Aşağıdaki yayınlar tarihçedir.

- Document version: 0.5.2
- CDSK version: TBD
- Last updated: 2026-10-20

Bu belge kısa çalışma bağlamıdır; ayrıntıların asıl kaynağı bağlantılı belgelerdir. Mevcut kod davranışı, kullanıcı hedefi ve Proposed karar birbirinden ayrılır. Statik inceleme uygulamanın çalıştığına dair kanıt değildir.

## Demo örnek aile — 2026-10-20

Kullanıcı isteğiyle Merkez Şube’de Örnek Kardeş Ailesi (Ece Arslan/Eren Aksoy) oluşturuldu ve kalıcılık/10 ödeme satırı karşılaştırıldı:13.250 TL tahakkuk,6.250 TL ödenen,7.000 TL kalan/geciken. Kod/yayın değişmedi; eski Ödemeler gecikmiş adet sayacı tutarsızlığıCR-032 açık. [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md).

## Project Compass

- North star: Spor kulüplerinin sporcu ve aidat takibini yapabilmesi.
- Current mission: ADR-0009 aile/sezon/aday/takip modüllerini yalnız demo için doğrulayıp yayımlamak; mevcut veriyi ve bildirim kuralını korumak.
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

- Güncel yayın (CR-030 kapalı): ADR-0008 açık kullanıcı onaylı/Accepted; kapalı kuralı geçmişi koruyarak Kaldır ve arşivden kapalı Geri al. Tek archivedAt + CHECK additive migration yerel/demo applied,28 model/13 migration;63 test/typecheck, yerel UI ve nihai Docker başarılı. Yalnız demo7f5710c Success/4m43s; canlı559px Kaldır/önce Durdur/arşiv bölümü ve mevcut etkin Pazartesi09:00/Demo Kullanıcı/ana iPhone/10 personel/17 bildirim/geçmiş korundu, worker ilerledi. Main/Özlüce aynı; arşivi tanımayan eski runtime'a rollback güvenli sayılmaz. [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md). Aşağıdaki kayıtlar tarihçedir.

- Güncel yayın (CR-029 kapalı): Mevcut haftalık kuralın ad/gün/saat/alıcıları Personel ve Cihazlar ortak Düzenle formundan atomik değiştirilir; güncel değer/uygunsuz eski üye/stale409 ve etkinlik/sahip/şube/geçmiş koruması. Typecheck/55 test, yerel UI ve Docker başarılı; yalnız demo6f11cf1 Success/3m08s. Canlı559px form/iptal,10 personel/17 bildirim/aynı ana iPhone/etkin Pazartesi09:00 tek Demo Kullanıcı/tek eski run korundu; worker yayın sonrası ilerledi. ADR-0007 geçerli, yeni model/migration/paket/anahtar/yetki kararı yok. [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md). Aşağıdaki kayıtlar tarihçedir.

- Güncel yayın (CR-028 kapalı): Personel ve Cihazlar bölümünden yeni haftalık kural; gün/saat/alıcılar tek formda, varsayılan Pazartesi09:00/boş alıcı ve daima kapalı kayıt. Mevcut mali rol/şube/API ve ADR-0007 korunur; backend/model/paket/anahtar değişmedi. Typecheck/51 test, yerel UI oluştur/yenile/iptal/arama Enter ve0 push başarılı; yerel Docker adayı/nihai demo Docker geçti. Yalnız demo3b7ebcc Success/3m12s; canlı559px form, mevcut etkin Pazartesi09:00/Demo Kullanıcı tercihi,10 personel/17 bildirim/ana iPhone/geçmiş korundu ve worker yayın sonrası ilerledi. [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md). Aşağıdaki kayıtlar tarihçedir.

- Güncel yayın (CR-027 kapalı): Personel ve Cihazlar takvim kartında Etkinleştir/Durdur; mevcut mali yönetici/şube sınırı, ortak etki ve alıcı/sahip doğrulaması. Takvim/alıcı/geçmiş korunur; etkinleşme geleceğe uygulanır, no-op cursor korunur. Typecheck/51 test, yerel/nihai Docker ve yerel UI başarılı; yalnız demo6c4ee5b Success/2m55s. Canlı559px Durdur kartı ve10 personel/17 bildirim/aynı ana iPhone/etkin Pazartesi09:00 tek Demo Kullanıcı kuralı/tek eski run korundu. ADR-0007/model/paket/anahtar değişmedi. [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md). Aşağıdaki kayıtlar tarihçedir.

- Güncel yayın (CR-026 kapalı): Personel ve Cihazlar ekranında haftalık aidat takvimi gün/saat dialogu; tüm bağlı alıcılar için ortak, mevcut yetki/şube ve alıcı/sahip/etkinlik/geçmiş korunur. Yeni/mevcut personel seçimleri güncel haftalık takvimleri gösterir; eski tam Pazartesi09:00 UI kısıtı kullanıcı talebiyle kalktı. Typecheck/47 test, yerel kaydet/yenile/vazgeç ve yerel/nihai Docker başarılı; yalnız demo ec5e2dc Success/3m06s. Canlı559px form ve10 personel/17 bildirim/aynı ana cihaz/etkin Pazartesi09:00 tek Demo Kullanıcı kuralı/tek eski run korundu; worker yayın sonrası ilerledi. ADR-0007 geçerli; model/paket/anahtar değişmedi. [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md). Aşağıdaki kayıtlar tarihçedir.

- Güncel yayın (CR-025 kapalı): Mevcut personelin Pazartesi09:00 aidat özeti üyeliği aynı kartta değiştirilir; ADMIN/ACCOUNTING ve mevcut şube/finans sınırı. Typecheck/44 test, yerel ve nihai Docker başarılı; yalnız demo27bd03c Success/3m03s. Yerel kart aç/yenile/kapat, canlı mevcut işaret ve API doğrulandı;10 personel/17 bildirim/ana iPhone/etkin Demo Kullanıcı kuralı ve geçmiş korundu. ADR-0007/model değişmedi;57 API rota. [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md). Aşağıdaki kayıtlar tarihçedir.

- Güncel yayın (CR-024 kapalı): Yeni personelin Pazartesi09:00 aidat özeti aynı formda seçilir. İsteğe bağlı kutu ve mevcut kurala atomik katılım; yeni kural/açma yok, mali rol ve kapsam korunur. Typecheck/40 test, yerel ve nihai Docker başarılı; yalnız demo fed6e33 Success/3m03s, canlı form ve verilerin korunması doğrulandı. Mevcut10 personel/17 bildirim/ana iPhone/etkin Pazartesi09:00 Demo Kullanıcı kuralı aynı. [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md). Aşağıdaki yayın kayıtları tarihçedir.

- Güncel yayın: Kullanıcı talebiyle Bildirimler → Personel ve Cihazlar bölümüne ADMIN personel oluşturma ve aynı formda alıcı seçimi eklendi (CR-023 kapalı). Hesap/alıcı atomik, şube/antrenör grupları ve mevcut rol sınırı korunur. Typecheck,30 regresyon+6 yeni test ve Docker başarılı; yalnız demo48d55af Success/3m40s. Canlı form/arama doğrulandı;10 personel/17 bildirim, açık bakiye ve etkin Pazartesi09:00 Demo Kullanıcı kuralı korundu. Yeni model/ADR yok. [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md).

- Güncel işletim: Kullanıcı iPhone UI görünümünü onayladı; yalnız Demo Kullanıcı için mevcut haftalık aidat özeti Pazartesi09:00 Europe/Istanbul etkinleştirildi. Sonraki çalışma26 Ekim2026 09:00. Aktif ana iPhone, kalıcılık ve etkin kuralı değerlendiren gerçek worker doğrulandı; anlık bildirim gönderilmedi. Kod/yayın değişmedi, runtime1db9776. [İşletim kaydı](docs/60-ai/SESSION_HANDOFF.md). Aşağıdaki kapalı kural kayıtları etkinleştirme öncesinin tarihçesidir.

- Güncel UI işi: Bildirimin açtığı geciken aidat listesi mobil/tablet kartları, masaüstü tablo, arama/filtre/sıra/20 satır sayfalama ve durum eylemleriyle düzenlendi. Yerel typecheck/genişlik/davranış kontrolleri başarılı; yalnız demo1db9776 Success/3m09s yayımlandı ve canlı mobil/masaüstü kontrolleri geçti. CR-022 kapalı; otomatik kural Pazartesi09:00/kapalı. [CR-022](docs/20-execution/CHANGE_REQUESTS.md), [İnceleme](docs/30-quality/OVERDUE_UX_REVIEW.md). Mali hesap/yetki/otomatik kural değişmedi.

- Güncel görev: 2026-10-19 ADR-0007 Accepted: Kullanıcı personel odaklı bildirim ve otomatik aidat özeti planının tümünü uygulamayı onayladı. Yeni veli/sporcu push kapalı; ADMIN seçili personel, ana cihaz ve 30 günlük yenilenebilir kayıt. Mali özet ADMIN/ACCOUNTING ve güncel şube kapsamı; diğer personel yalnız genel duyuru. Haftalık gün/saat, İstanbul vade günü sonrası aktif/pasif açık borçlar, 1 saat telafi ve kalıcı çalışma/tek gönderim uygulanıyor. Yerel migration/typecheck/30 test ve Docker build başarılı. Yalnız demo dbc329d0 sabiti Success ile dağıtıldı; migration ve her dakikalık Coolify işleyicisi doğrulandı. Gerçek personel iPhone manuel ve otomatik özet/tıklama kabulü, kapalı saat kontrolü tamamlandı; kural Pazartesi09:00 ve kapalı. [ADR-0007](docs/50-decisions/ADR-0007-personel-bildirimleri-ve-aidat-ozeti.md), [CR-021](docs/20-execution/CHANGE_REQUESTS.md). Aşağıdaki kayıtlar tarihçedir.

- Güncel iPhone kabulü (2026-10-19): Yalnız demo sabit 5e1fd7c, Coolify Success/2m44s. Apple Topic hatası düzeltildi; normal API testi HTTP201/ACCEPTED. Kullanıcı bildirimin geldiğini ve dokununca Volkan Acar ekranı açıldığını doğruladı. Typecheck, dört ilgili test, Docker build başarılı; demo verisi ve Özlüce korundu. Otomasyon kapalı. Aşağıdaki eski durumlar tarihçedir. [PUSH_GUIDE](docs/40-operations/PUSH_GUIDE.md).

- Güncel dağıtım (2026-10-19): Yalnız SporManage demo için `codex/manual-push-demo-20261019` / sabit `6b1e1c2` dağıtıldı. Coolify `19les87jazptcvfqxsroietk` **Success**, süre 4m15s; yeni migration applied, runtime VAPID valid, HTTPS/API kontrolleri başarılı. 60 sporcu/300 ödeme ve Özlüce container ID/image/StartedAt korundu. iPhone için sentetik veli daveti oluşturuldu; cihaz izni/gerçek teslim kabulü henüz bekliyor. Önceki onay/hazırlık satırları tarihçedir. [DEPLOYMENT](docs/40-operations/DEPLOYMENT.md), [PUSH_GUIDE](docs/40-operations/PUSH_GUIDE.md).

- Demo push dağıtım onayı (2026-10-19): Kullanıcı `web-push` 3.6.7/MPL-2.0 ve yalnız SporManage demo HTTPS dağıtımı/iPhone gerçek testini onayladı. Ayrı `codex/manual-push-demo-20261019` ref'i hazırlanıyor; mevcut yerel image/test kanıtları korunur. Dağıtım ve cihaz kabulü henüz tamamlanmadı. Aşağıdaki önceki onay bekleme satırları tarihsel uygulama oturumuna aittir; güncel onay [ADR-0006](docs/50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) içindedir.

- Canlı demo hazırlığı (aynı görev): Coolify erişildi; yalnız demo branch'i ayrı ref'e alındı ve auto deploy manuel yapıldı. Onaylı VAPID runtime kaydı tamamlandı, buildtime kapalı. Demo DB kısıtlı rolüyle salt okunur sorguda PostgreSQL **17.7**, 60 sporcu/300 ödeme doğrulandı ve yalnız demo yedeği alındı. Önceki “canlı sürüm TBD” kayıtlarının güncel karşılığı bu kanıttır; CR-006 Compose taşınabilirliği açık kalır. [DEPLOYMENT](docs/40-operations/DEPLOYMENT.md).

- Manuel push ilk aşaması (2026-10-19): Kullanıcı [ADR-0006](docs/50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) planını ve önce ekran/API düzeltmesi, veli/sporcu alıcı kaydı, tek cihazda manuel push'u onayladı. Yerel kod/migration/PWA hazır; typecheck, 15 test ve build geçti. CR-020 ilk aşama kapalı. Gerçek test cihazı iPhone; HTTPS demo dağıtımı, somut MPL-2.0 paket onayı ve cihazdaki izin/teslim kontrolü bekleniyor. Otomatik kurallar/scheduler etkin değil. [PUSH_GUIDE](docs/40-operations/PUSH_GUIDE.md).

- Yerel çalıştırma (2026-10-19, Windows): `http://127.0.0.1:3077/login` çalışıyor. Kullanıcı onayıyla yeni PostgreSQL 15 konteyneri/volume, `aidat_takip` ve `license_db` kuruldu; 10 mevcut migration ve sentetik demo uygulandı. ADMIN login ve dashboard/health/sporcu/ödeme erişimi HTTP 200, demo check ve 7 test başarılı. [RUNBOOK](docs/40-operations/RUNBOOK.md). Production ortamı bu görevde değiştirilmedi.

- CDSK eşlemesi (2026-10-19): Beş kök dosya, yedi docs klasörü ve dolu proje bağlamı mevcut; PUSH_GUIDE ile docs Markdown sayısı 42. [CR-019](docs/20-execution/CHANGE_REQUESTS.md) belge kapsamıyla kapalıdır. Canlı PostgreSQL sürümü TBD (CR-006); yerel sürüm 15.19. CDSK sürümü, ayrıntılı kabul ölçütleri ve kalite/operasyon kararları açık; tam süreç/ürün uyumu veya güncel canlı durum kanıtlanmış değildir.

- Broşür görevi (2026-09-15): Gerçek giriş, yönetim paneli ve mobil ödeme ekranlarını kullanan iki sayfalık A4 tanıtım PDF'si, 300 DPI sayfaları ve birleşik önizlemesi tamamlandı. Bağlantılar, QR kodları, demo bilgileri ve fontlar doğrulandı. [BROCHURE_GUIDE](docs/40-operations/BROCHURE_GUIDE.md).

- Phase: Mevcut uygulamaya CDSK bağlamı kazandırma; ürün kabul aşaması TBD.
- Version: package.json 1.0.0; 2026-09-15 dağıtım kaydı mevcut, bu numaranın release etiketi/ürün kabulüyle eşlenmesi TBD.
- Active sprint veya milestone: TBD
- Current focus: ADR-0009 dört modül demo yayını ve iPhone kabulü tamam; CR-031 kapalı. İlk aile ve sezon ilişkileri personel tarafından açık seçimle kurulacak; eski veriler otomatik bağlanmadı. [DEPLOYMENT](docs/40-operations/DEPLOYMENT.md).
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
- Main integrations: PostgreSQL ve lisans bağlantısı; demo dağıtımında uygulama ile lisans tablosu aynı mantıksal demo DB'dedir. Manuel Web Push adaptörü demo runtime ortamında hazır; ilk gerçek iPhone servis/ekran kabulü tamamlandı. E-posta/SMS sağlayıcıları henüz bağlı değil; aktif gönderim yolları sahte başarı üretmez.
- AI components: N/A — incelenen kaynakta ürün içi AI bileşeni bulunmadı.
- Data and storage: 28 Prisma modeli ve 12 migration; yeni alıcı/push migration'ı yerel ve onaylı demo DB'sinde uygulandı. Lisans verisi SQL/pg bağlantısından okunur. Yerelde ayrı license_db; son kayıtlı Coolify demosunda aynı demo DB'sindeki lisans tablosu kullanılır. Canlı PostgreSQL 17.7 ve yerel 15.19 doğrulandı.
- Deployment model: Özlüce production ve SporManage demo için iki ayrı Coolify uygulaması; Özlüce GitHub `main` webhook'u ve demo için onaylı ayrı sabit ref/manuel dağıtım, repository Dockerfile/Next standalone ve aynı fiziksel PostgreSQL kaynağında ayrı mantıksal DB/roller. Compose production’da kullanılmaz. [DEPLOYMENT](docs/40-operations/DEPLOYMENT.md).
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
| Personel bildirimi ve haftalık aidat özeti | Accepted; 30 test, demo yayın ve gerçek personel iPhone/takvim/durdurma kabulü tamam | [ADR-0007](docs/50-decisions/ADR-0007-personel-bildirimleri-ve-aidat-ozeti.md) |
| Web Push ve periyodik aidat hatırlatma | Accepted; manuel ilk aşama demoda, iPhone kabulü tamam, otomasyon sonraki aşama | [ADR-0006](docs/50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) |

Karar gerekçeleri burada kopyalanmaz; asıl belgeye bağlantı verilir.

## 6. AI Context

- Project purpose: [PRODUCT_SPEC](docs/00-product/PRODUCT_SPEC.md) içindeki kullanıcı hedefi.
- Constraints and prohibitions: [CONSTITUTION](docs/00-product/CONSTITUTION.md) ve [AGENTS.md](AGENTS.md); projeye özel kısıtlar TBD.
- Open questions: ADR-0007 sonrası gerçek işletim alıcı/takvim seçimi; production başlangıç kimliği/rolü, buildtime secret erişimi, backup/restore; yaş eşiği/veli kuralları, rol matrisi, para kuralları, operasyon hedefleri ve CDSK sürümü; [CHANGE_REQUESTS](docs/20-execution/CHANGE_REQUESTS.md).
- Recent decisions: Kullanıcı ayrı demo uygulamasını ve mevcut PostgreSQL kaynağında ayrı mantıksal DB kullanımını onayladı; ADR-0005 Accepted, ADR-0004 Superseded. ADR-0001/0002 Proposed, ADR-0003 Accepted kalır.
- Recently completed work: 2026-10-19 manuel push/alıcı kaydı yerel uygulaması ve doğrulamaları; ADR-0006 Accepted, CR-020 ilk aşama kapalı. Demo paket/dağıtımı onaylandı; ilk gerçek iPhone testi tamamlandı. [PUSH_GUIDE](docs/40-operations/PUSH_GUIDE.md).

## 7. Current Priorities

1. Demo ADMIN hesabı için kullanım süresi ve parola rotasyonu/iptal tarihi belirlemek.
2. Demo DB için zamanlanmış backup/restore ve paylaşılan PostgreSQL kapasite izlemesini ele almak.
3. Production başlangıç kimliği/rol çelişkisini CR-016 kapsamında çözmek.

Bu sıra öneridir; uygulama onayı değildir.

## 8. Known Constraints

- Teknik: Mevcut Next/Prisma/PostgreSQL yapısı; sürümler [OVERVIEW](docs/10-architecture/OVERVIEW.md).
- Ürün: İlk hedef sporcu/aidat, çocuk ve yetişkin kapsamı; ADR-0009 aile/sezon/aday/takip genişlemesi ayrıca onaylıdır.
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

- Session summary (2026-10-19): Onaylı ADR-0006 ilk aşaması yerelde uygulandı; bildirim hataları, ayrı alıcı/davet/cihaz akışı ve tek cihaz manuel push adaptörü hazır. CR-020 ilk aşama kapalı; iPhone gerçek kabulü demo ortamında tamamlandı.
- Documents updated: PUSH_GUIDE, ADR-0006/dizin, ürün/mimari/kalite, CR-004/020, backlog, CHANGELOG ve ayrıntılı handoff. Tarihsel oturumlar korunur.
- Decisions recorded: ADR-0006 Accepted, ADR-0001/0002 Proposed; diğer durumlar korunur. Somut MPL-2.0 paket ve yalnız demo HTTPS dağıtımı kullanıcı tarafından onaylandı; otomatik kurallar kurulmadı.
- Verification: Prisma validate/generate/yerel migration, typecheck, 15 test ve production build geçti; HTTP/PWA kaynakları ve tarayıcı paneli kontrol edildi. Gerçek demo testi Apple HTTP201 ve kullanıcı görünüm/tıklama kabulüyle doğrulandı; önceki yerel adaptör testleri kontrollüydü.
- Working environment: Next loopback:3077, PostgreSQL loopback:5477, güncel terminal oturumu 12714. Yerel VAPID sırları repository dışından yalnız sunucu ortamına yüklenir. Mevcut konteyner/veriyi koruyun. [RUNBOOK](docs/40-operations/RUNBOOK.md).
- Remaining risk / next step: İlk gerçek iPhone testi tamam; sonraki otomasyon aşamasının kesin takvim/işletim tercihleri açık. Yeni sınırlı alıcı oturumu ve PROCESSING kayıtları için sınırlar PUSH_GUIDE'dadır; diğer açık CR'ler sürer. [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md).

## Revision History

| Version | Date | Summary |
|---|---|---|
| 0.5.2 | 2026-10-20 | Demoda örnek aile ve10 satır mali karşılaştırma; legacy gecikmiş adet sayacıCR-032 bulgusu. |
| 0.5.1 | 2026-10-20 | ADR-0009 yalnız demo8cd9f72 Success/04m05s; migration/veri-kural koruması ve gerçek iPhone kabulü, CR-031 kapalı. |
| 0.5.0 | 2026-10-20 | ADR-0009 onaylı dört modül yerelde hazır;79 test/typecheck ve demo yayın hazırlığı, UI engeli/handoff. |
| 0.4.19 | 2026-10-20 | ADR-0008 kullanıcı onaylı arşiv/kapalı geri alma; yerel/demo migration,63 test ve yalnız demo7f5710c canlı kabulü. |
| 0.4.18 | 2026-10-19 | Ortak mevcut kural formu,55 test ve yalnız demo6f11cf1 canlı kabulü (önceki eksik revizyon satırı tamamlandı). |
| 0.4.17 | 2026-10-19 | Personel ekranında yeni kapalı aidat kuralı;51 test/typecheck, Docker ve yalnız demo3b7ebcc canlı kabulü. |
| 0.4.16 | 2026-10-19 | Personel ekranında özet kuralını etkinleştirme/durdurma;51 test/typecheck/Docker ve yalnız demo6c4ee5b canlı kabulü. |
| 0.4.15 | 2026-10-19 | Personel ekranında ortak aidat takvimi gün/saat düzenleme;47 test/Docker ve yalnız demo ec5e2dc canlı kabulü. |
| 0.4.14 | 2026-10-19 | Mevcut personel kartından Pazartesi09:00 özet seçimi;44 test/Docker ve yalnız demo27bd03c kabulü. |
| 0.4.13 | 2026-10-19 | Personel formunda Pazartesi09:00 özetine katılım;40 test/Docker ve yalnız demo fed6e33 kabulü. |
| 0.4.12 | 2026-10-19 | Bildirim ekranından personel ve alıcı ekleme;36 test, Docker ve yalnız demo48d55af canlı kabulü. |
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
| 0.4.6 | 2026-10-19 | Somut web-push/MPL-2.0 ve yalnız demo dağıtımı onaylandı; ayrı dal/yedek/runtime hazırlığı. |
| 0.4.7 | 2026-10-19 | Yalnız demo 6b1e1c2 dağıtımı, migration ve HTTPS/runtime kanıtı; iPhone davet/cihaz adımının doğrulanması bekleniyor. |
| 0.4.8 | 2026-10-19 | Demo davet ekranı/Apple Topic düzeltmesi; gerçek iPhone servis, görünüm ve doğru ekran açılış kabulü. |
| 0.4.9 | 2026-10-19 | ADR-0007 onaylı personel/30 gün/haftalık özet uygulaması; yerel test ve demo yayın hazırlığı. |
