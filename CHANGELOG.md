#### Deployed — 2026-10-19 — Personel özeti yalnız SporManage demo

### Improved — 2026-10-19 — Geciken aidat listesi UI/UX

- Mevcut liste görüntülenip mobil taşma ve arama/sayfalama eksikleri giderildi. Mobil/tablet kartları, masaüstü tablo, genel/filtre toplamları, Türkçe arama, grup/durum filtreleri ve sıralama eklendi.20 aidat/sayfa, liste başına odak dönüşü ve erişilebilir etiketler.
- Yükleme/yenileme, boş sonuç ve401/403 hata eylemleri ayrılır. AppLayout içerik kolonunda min-width0; API, mali hesap, yetki, veri ve otomatik kurallar değişmedi. Yerel typecheck ve gerçek tarayıcı kontrolleri başarılı; yeni demo yayını hazırlanıyor.

### Verified — 2026-10-19 — Personel iPhone ve otomatik aidat özeti

- Manuel bildirim ve gerçek 14:39 takvim özeti Apple HTTP201; kullanıcı doğru personel ekranını ve güncel geciken aidat listesini doğruladı. 150 gecikmiş aidat için tek ana cihaz bildirimi üretildi.
- Durdurma sonrasında kapalı 14:42 saatindeki gerçek cron0 çalışma/0 yeni bildirim üretti. Kural Pazartesi09:00/kapalı durumuna geri alındı, geçmiş korundu; CR-021 kapatıldı.

- Sabit dbc329d0, Coolify Success/3m02s; additive migration, mevcut veri/anahtarlar ve HTTPS doğrulandı. Güncellenen PWA service worker aktivasyonu ve güvenli bildirim yönlendirmesi dahil.
- Her dakikalık container TSX Scheduled Task etkin ve gerçek otomatik çalışması başarılı. Haftalık kural kapalıdır; personel iPhone ve kısa takvim/durdurma kabulü bekler. Main ve Özlüce değişmedi.

 Changelog

Her anlamlı değişiklikte ilgili belgeler ve AI Handoff ile birlikte güncellenir. Geçmiş sürümler: TBD.

## [Unreleased]

### Added / Changed — 2026-10-19 — Personel bildirimi ve haftalık aidat özeti

- ADR-0007 kullanıcı plan uygulama onayıyla Accepted. Yalnız yönetici seçili personel push; mali özet mevcut mali rol/şube sınırında, diğer personel genel duyuru. Veli daveti/aboneliği/gönderimi sunucuda kapalı; geçmiş korunur.
- 30 günlük cihaz kaydı, sessiz yenileme ve ana cihaz; çıkış/iptal sonrası sessiz yeniden açmayı engelleme. Üç bölüm ve güncel gecikmiş borç listesi, güvenli tıklama/giriş dönüşü.
- Haftalık gün/saat, kapalı varsayılan; İstanbul vade günü sonrası aktif/pasif açık borç hesabı; 1 saat telafi, MISSED/çalışma geçmişi ve tekil gönderim. Container içi TSX işleyicisi; yeni paket/servis yok.
- Additive yerel migration, typecheck ve 30 test başarılı; Docker/demo/personel iPhone/takvim doğrulaması sürüyor.

### Verified — 2026-10-19 — Demo iPhone gerçek push testi tamamlandı

- Apple Topic düzeltmesi 5e1fd7c yalnız demo ortamına başarıyla dağıtıldı (2m44s); normal API gönderimi ACCEPTED, Apple HTTP201. Kullanıcı bildirimin geldiğini ve dokununca Volkan Acar alıcı ekranının açıldığını doğruladı. Önceki iki FAILED test kaydı korundu.
- Typecheck, dört ilgili test ve gerçek Docker production build geçti; demo sporcu/ödeme verileri ve Özlüce container/image/StartedAt korundu. Operasyon rehberi, ADR kanıtı, Project Boot ve handoff güncellendi; yeni ADR yok, otomasyon etkinleştirilmedi.

### Fixed — 2026-10-19 — Apple push Topic uyumluluğu

- iPhone veli cihazı kaydedildi. İlk normal gönderim HTTP 400/FAILED, ayrı tek cihaz tanılama denemesi Apple `BadWebPushTopic` döndürdü. Ham CUID yerine 32 karakterlik hash Topic kullanılır; payload ve izin sınırları korunur. Typecheck ve dört politika/entegrasyon testi geçti. Yalnız demo 5e1fd7c dağıtımı ve yeni gerçek cihaz sonucu bekleniyor.
- Önceki davet ekranı düzeltmesi 86105c3, Coolify urf7fi3z4gfwjq8lcug5s5ih ile Success/2m52s dağıtıldı.

### Fixed — 2026-10-19 — iPhone davet ekranında personel oturumu

- Açık personel oturumu kişisel davet yapıştırma alanını gizliyordu; alan personel oturumunda da gösterilir. Veli/sporcu/personel oturum türü görünür ve davet kabulü beklerken cihaz kayıt düğmesi kapalıdır. Mevcut davet/API/yetki sözleşmesi korunur; typecheck geçti. Yalnız demo için sonraki dağıtım hazırlanır.

### Deployed — 2026-10-19 — Yalnız SporManage demo manuel push

- Ayrı demo dalı ve sabit 6b1e1c2 commit'i Coolify'da 4m15s içinde Success ile dağıtıldı; additive migration yalnız demo DB'sine uygulandı. Runtime UID/anahtar/HTTPS/API kontrolleri geçti; 60 sporcu ve 300 ödeme korundu. Özlüce container ID/image/StartedAt ve uzak main değişmedi.
- Sentetik veli için kişisel test daveti kullanıcıya verildi; iPhone Ana Ekran/izin/gerçek teslimi bekliyor. Otomatik aidat kuralları/scheduler kapalı. Dağıtım, yedek ve doğrulama ayrıntıları DEPLOYMENT/PUSH_GUIDE/SESSION_HANDOFF içinde; token/secret değerleri repository'ye yazılmadı.

### Deployment preparation — 2026-10-19 — Yalnız demo push onayı

- Kullanıcı `web-push` 3.6.7/MPL-2.0 paket seçimini ve yalnız SporManage demo ortamına dağıtıp iPhone testi yapmayı açıkça onayladı; ADR-0006 ve PUSH_GUIDE onay kaydı güncellendi. Ayrı demo ref'i hazırlanır; `main`/Özlüce kapsam dışıdır. Bu kayıt dağıtımın veya gerçek cihaz tesliminin tamamlandığı iddiası değildir.
- Coolify demo kaynağı ayrı branch ve manuel dağıtıma alındı; ayrıca anlık kullanıcı onayıyla ayrı demo VAPID/origin/subject runtime değişkenleri kaydedildi, buildtime kapalı doğrulandı. Demo DB'nin PostgreSQL 17.7 sürümü salt okunur sorguyla kanıtlandı; dağıtım öncesi yalnız demo yedeği alındı ve arşiv listesi kontrol edildi.

### Added / Fixed — 2026-10-19 — Manuel Web Push ve alıcı kaydı

- ADR-0006 kullanıcı onayıyla Accepted; ilk aşama veli/sporcu için ayrı alıcı oturumu, ADMIN doğrulamalı tek kullanımlık davet, personelin kendi cihaz kaydı, PWA/service worker ve tek cihazda manuel push adaptörüyle uygulandı. Otomatik aidat kuralları/scheduler etkinleştirilmedi.
- Notification ekranının tümü/grup/antrenör alıcı sözleşmesi, zamanlama alanları/temizleme, offset dönüşümü, sayfalama ve hata sonuçları düzeltildi. Tekil/toplu yollar ortak servise bağlandı; gerçek sağlayıcı olmadan e-posta/SMS artık SENT sayılmıyor. Push ACCEPTED ile görüntülendi/okundu ayrımı korundu.
- Beş additive tablo ve ilgili enum/ilişkiler için migration yalnız yerel DB'ye uygulandı. Runtime VAPID sırları repository dışında oluşturuldu; `.dockerignore` ortam varyantları/dump/çıktı dosyalarını dışlar.
- Typecheck, 15 test, production ve Docker build, ağsız image dosya kontrolü ve yerel HTTP/tarayıcı kontrolleri başarılı. iPhone ana ekran uygulamasında kullanılmamış davet yapıştırma akışı eklendi; gerçek iPhone/HTTPS teslimi henüz doğrulanmadı. `web-push` 3.6.7 MPL-2.0 paket seçimi ve yalnız demo dağıtımı için açık onay beklenir; Git push/production deploy yapılmadı.
- [PUSH_GUIDE](docs/40-operations/PUSH_GUIDE.md), ADR/CR-020, ürün/mimari/kalite belgeleri, Project Boot ve handoff güncellendi. CR-004 e-posta/SMS, otomasyon ve gerçek cihaz kabulü için açık kalır.

### Documentation — 2026-10-19 — Push ve aidat otomasyonu önerisi

- Yerel bildirim ekranı/formu, API/gönderim yolları, şema ve resmi Web Push/Coolify kaynakları incelendi. Kullanıcı alıcıları hem veli/sporcu hem kulüp personeli olarak doğruladı.
- Gerçek push/cihaz aboneliği ve tekrar kuralları eksik; toplu gönderim yalnız SENT işaretliyor. Alıcı/zamanlama sözleşmesi CR-020'ye, çözüm ve aşamalı uygulama planı ADR-0006'ya Proposed olarak kaydedildi.
- ADR dizini, CR-004, backlog, entegrasyon, Project Boot ve AI Handoff güncellendi. Uygulama, migration, secret, scheduled task veya entegrasyon kurulmadı; bildirim gönderilmedi.

### Documentation — 2026-10-19 — CR-019 belge eşlemesi

- Mimari ve operasyon belgeleri yerel PostgreSQL 15.19 kanıtını son kayıtlı Coolify topolojisinden ayırır. Çelişkili canlı 15/17 sürüm iddiası yerine TBD ve CR-006 takip kaydı kullanılır; canlı ortam bu görevde yeniden sorgulanmadı.
- Login API log/debug temizliği tamamlanan ayrı düzeltme olarak güvenlik, gözlemlenebilirlik ve ADR-0001 açıklamalarına işlendi; AuthService log/fallback/secret işleri ve Proposed durumu korundu.
- Yayın/roadmap/milestone ve entegrasyon kayıtları tarihli dağıtım/yerel test sonuçlarıyla eşlendi. Eski ortak production ADMIN/domain anlatımları tarihsel etiket aldı; güncel işletim ADR-0005'e bağlandı.
- CR-019 belge kapsamıyla kapatıldı; Project Boot ve AI Handoff güncellendi. Uygulama, veri, altyapı ve karar onayları değiştirilmedi.

### Operations — 2026-10-19 — Windows yerel demo çalıştırması

- Kullanıcı onayıyla yeni yerel PostgreSQL 15 konteyneri/volume, uygulama ve lisans DB'si oluşturuldu; mevcut 10 migration, bcrypt uyumlu yerel yönetici ve sentetik demo kuruldu. Mevcut ortam dosyası ve production korundu.
- Kilitli bağımlılıklar/Prisma Client kuruldu; Next loopback:3077 üzerinde başlatıldı. ADMIN login ve temel HTTP kontrolleri, demo check ve 7 demo testi başarılı.
- RUNBOOK, PROJECT_BOOT ve SESSION_HANDOFF güncellendi. Uygulama kaynağı, şema, migration dosyaları, paket/lock ve ADR durumları değiştirilmedi.

### Documentation — 2026-10-19 — CDSK durum kontrolü

- CDSK kök dosyaları, yedi dokümantasyon klasöründeki 40 Markdown belgesi, metadata ve yerel bağlantılar kontrol edildi. Kurulum ve proje bağlamı mevcut; tam süreç/ürün uyumu doğrulanmış değil.
- PostgreSQL sürümü, login logları ve dağıtım/işletim açıklamalarındaki güncellik çelişkileri CR-019'a kaydedildi; Project Boot ve AI Handoff güncellendi.
- Uygulama, şema, migration, bağımlılık ve altyapı değişikliği veya yeni ADR yok. Doğrulama kapsamı ve çalıştırılmayan kontroller SESSION_HANDOFF içinde kayıtlıdır.

### Operations — 2026-09-15 — İzole SporManage demo dağıtımı

- `SporManage Aidat Demo` ayrı Coolify proje/uygulaması olarak kuruldu; mevcut PostgreSQL 15 kaynağında ayrı `spormanage_aidat_demo` veritabanı ve kısıtlı uygulama rolü kullanıldı.
- Yerel sentetik snapshot 2 şube, 6 grup, 60 sporcu, 300 ödeme, 78 seans ve 378 yoklama ile aktarıldı. Broşür ADMIN hesabı yeni DB'de aktifleştirildi; Özlüce DB'deki aynı hesap silinmeden pasifleştirildi.
- `aidat.spormanage.com.tr` yeni uygulamaya taşındı; TLS/HTTP, ADMIN login ve demo ekranları doğrulandı. `aidat.ozlucespor.com` eski uygulamada çalışmaya devam eder; kullanılmayan `www` varyantı kaldırıldı.
- Runtime secret'ları Coolify'da tutuldu, `RUN_SEED=false` bırakıldı. Ayrı PostgreSQL servisi kurulmadı; dağıtım kararı [ADR-0005](docs/50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md) ile Accepted, ADR-0004 Superseded kaydedildi.

### Fixed — 2026-09-15 — Grup saha adı görünümü

- Grup detayına saha ilişkisi eklendi ve arayüzde teknik `demo-v1-...` kimliği yerine saha adı gösterildi.

### Fixed — 2026-09-15 — Giriş loglarında kimlik bilgisi sızıntısı

- Login API'sindeki e-posta, parola ve parola hash önizlemesi üreten geçici debug logları kaldırıldı.
- Başarısız login yanıtlarındaki kullanıcı/parola ayrımını açığa çıkaran `debug` alanları ve ham exception metni kaldırıldı; mevcut HTTP durumları ile kullanıcı mesajları korundu.

### Operations — 2026-09-15 — Broşür alan adı aktivasyonu

- `aidat.spormanage.com.tr`, kullanıcının açık onayıyla mevcut Coolify uygulamasına ikinci HTTPS domain olarak eklendi; mevcut `aidat.ozlucespor.com` adresi korunmuştur.
- Coolify DNS eşleşmesi ve `3ebc3ef` manuel deployment başarısı doğrulandı. Yeni alan adı geçerli TLS ile `/login` HTTP 200 verdi; ortak ADMIN login’i `/dashboard` sayfasına ulaştı ve doğrulama oturumu kapatıldı.
- Broşür bağlantıları ve QR kodları artık doğrulanmış production hedefiyle eşleşir; CR-018 kapatıldı. Coolify’ın eklediği `www` varyantında DNS kaydı yoktur ve broşür bu varyantı kullanmaz.
- Uygulama kodu, şema, migration, veritabanı, kullanıcılar, roller ve parolalar değiştirilmedi; yeni ADR gerekmedi.

### Operations — 2026-09-15 — Broşür production demo hesabı

- Kullanıcının açık onayıyla `demo@spormanage.com.tr`, `Demo Kullanıcı` adı ve ADMIN rolüyle production veritabanında oluşturuldu. Parola bcrypt cost 12 ile saklandı ve repository’ye yazılmadı.
- Canlı login dashboard’a yönlendi, ADMIN menüleri göründü ve doğrulama oturumu kapatıldı. Başka production kaydı değiştirilmedi.
- Ortak ADMIN yetkisinin veri/gizlilik sonuçları [ADR-0004](docs/50-decisions/ADR-0004-brosur-demo-admin-hesabi.md) ile Accepted kaydedildi; rotasyon/iptal tarihi ve salt okunur demo çözümü açık bırakıldı.
- Broşürün `aidat.spormanage.com.tr` QR/link hedefi ile çalışan `aidat.ozlucespor.com` production domain’i arasındaki uyuşmazlık CR-018 olarak kaydedildi.

### Operations — 2026-09-15 — Coolify production kurulumu

- SporManage `main` dalı mevcut Coolify production uygulamasına repository Dockerfile’ıyla dağıtıldı; [aidat.ozlucespor.com](https://aidat.ozlucespor.com) HTTP 200 ve canlı SporManage giriş görünümüyle doğrulandı.
- Mevcut özel PostgreSQL kaynağı, veritabanı, kullanıcılar, roller ve parolalar korundu. Startup migration’ı başarıyla geçti; `RUN_SEED` kapalı tutuldu, demo/genel seed veya restore çalıştırılmadı.
- Build ortamında `DATABASE_URL` bulunmadığında Prisma istemci kurulumu artık geçersiz `undefined` datasource göndermez. Aynı Dockerfile yerel olarak başarıyla build edildi.
- Yerel demo giriş bilgileri production giriş ekranında gizlendi; development sunumunda korunur. Coolify başlangıç kimliği/rol uyuşmazlığı CR-016 olarak kaydedildi ve hiçbir kimlik/rol değişikliği yapılmadı.
- Coolify buildtime secret uyarısı, doğrulanmamış healthcheck ve backup/restore açık risk olarak bırakıldı. Yeni ADR, migration, şema veya dış bağımlılık yok.

### Added — 2026-09-15 — Aidat Takip tanıtım PDF'si

- İki sayfalık turuncu/beyaz tanıtım PDF'si, 300 DPI sayfa PNG'leri ve birleşik önizleme üretildi. [Broşür rehberi](docs/40-operations/BROCHURE_GUIDE.md).
- Ön sayfaya gerçek yerel giriş ekranı, yönetim paneli ve mobil ödeme ekranı eklendi; arka sayfada dokuz modül ve canlı demo erişim kutusu yer alır.
- PDF metni, A4 sayfa yapısı, gömülü fontlar, beş bağlantı ve iki QR hedefi doğrulandı. Uygulama, veri ve mevcut kullanıcı değişiklikleri korundu.

### Added — 2026-09-15 — SporManage rapor ve gösterim tamamlama

- Ortak rapor hesaplama katmanı; toplam/aktif sporcu ayrımı, `paidAmount` tahsilatı, geciken açık bakiye, gerçek ödeme tarihli aylık eğilim ve kayıt temelli devam oranını ekran ve export için birleştirdi.
- Mevcut `xlsx` paketiyle rapor türüne göre gerçek workbook üretimi eklendi. ADMIN/ACCOUNTING export erişimi, çerez tabanlı oturum ve 401/403/400/410 davranışları uygulandı.
- Rapor türü, grup ve dönem filtreleri çalışır hale geldi; `Yazdır / PDF Kaydet` görünümü ve baskı stilleri eklendi.
- Görünür uygulama markası SporManage oldu. Şube, grup, saha/tesis, ücret, işlem metni, kullanıcı ve `@spormanage.example` e-postaları güvenli yenileme komutuyla güncellendi; teknik kimlikler ve parolalar korundu.
- [ADR-0003](docs/50-decisions/ADR-0003-rapor-disa-aktarim-ve-yetki.md) kullanıcı onayıyla Accepted kaydedildi. ADR-0001 ve ADR-0002 Proposed kaldı; şema/migration veya yeni paket bağımlılığı yok.
- Sunum yenilemesi ikinci çalıştırmada sıfır değişiklik üretti. 6 demo + 4 rapor testi, demo check, iki typecheck, gerçek API rol/durum kontrolleri, XLSX içeriği, production build ve canlı tarayıcı kontrolleri geçti.

### Changed — 2026-09-15 — Kulüp görünen adı

- Yerel demo kulüp görünen adı `Demo Futbol Kulübü` yerine `SporManage` olarak ayarlandı.
- Yeni seed kurulumları ve `demo:refresh-brand` aynı marka değerini kullanır; önceden özelleştirilmiş kulüp adı korunur.

### Changed — 2026-09-15 — Kurgusal kişi adları

- Sporcu ve veli fixture adlarındaki `Demo` ifadesi, gerçekçi fakat tamamen kurgusal Türkçe adlarla değiştirildi.
- Teknik kadrodaki altı eski `Demo … Antrenör` adı da kurgusal gerçekçi antrenör adlarıyla değiştirildi.
- Mevcut yerel kurulum için `demo:refresh-people` eklendi; yalnızca eski `Demo` adını taşıyan kişi kayıtlarını günceller ve elle değiştirilmiş adları korur.

### Added — 2026-09-15 — Tam futbol demosu

- Kullanıcı onaylı Demo Futbol Kulübü: 2 şube, 6 grup/antrenör, 60 sporcu, 8 ücret, 300 ödeme; antrenman/yoklama/analitik, 18 not ve 12 IN_APP bildirim mevcut modele eklendi.
- `demo:seed` / `--dry-run`, `demo:check`, saf ve salt okunur DB test komutları eklendi. Loopback:5477/aidat_takip sınırı, sabit kimlik/tarih, çakışma kontrolü ve tek transaction; yeniden çalıştırma mevcut kayıt/parolaları koruyor.
- 8 personel hesabı mevcut bcrypt biçiminde oluşturuldu; yönetici, lisans ve özel ayarlar korundu. Parolalar repository’ye yazılmadı; e-posta/SMS gönderilmedi.
- 7 test, tüm proje typecheck, dokuz hesap girişi/grup kapsamı ve canlı ekran kontrolleri başarılı. [Doğrulama kaydı](docs/30-quality/DEMO_VALIDATION.md).
- [Demo rehberi](docs/40-operations/DEMO_GUIDE.md), Project Boot, Runbook, test stratejisi ve AI Handoff güncellendi. Şema, migration, API/UI/yetki, paket bağımlılığı ve lock değişmedi; ADR-0001/0002 Proposed kaldı.

### Operations — 2026-09-14 — Yerel başlangıç hesabı

- Kullanıcı onayıyla yeni yerel PostgreSQL 15 konteyneri/volume, aidat_takip ve yerel license_db oluşturuldu.
- Mevcut 10 migration ve lisans başlangıç SQL’i uygulandı; yalnızca ADMIN hesabı mevcut bcrypt biçiminde oluşturuldu. Örnek sporcu veya ödeme verisi eklenmedi.
- Login, oturum, health ve sporcu/aidat liste GET kontrolleri 200 döndü.
- Genel seed’in SHA-256/bcrypt uyumsuzluğu CR-015 olarak kaydedildi; uygulama, seed, migration, şema, paket/lock ve ortam dosyaları değiştirilmedi.

### Operations — 2026-09-14 — Yerel çalıştırma

- Kilit dosyasına göre bağımlılıklar ve Prisma istemcisi kuruldu; geliştirme sunucusu yalnızca 127.0.0.1:3077 üzerinde başlatıldı.
- Giriş ekranı HTTP 200 ve tarayıcı formuyla doğrulandı; DB kurulum tercihi bekleniyor.
- Kod, paket/lock, şema, migration ve ortam dosyaları değiştirilmedi; migration/seed/restore yapılmadı. Çalıştırma bilgileri Runbook ve AI Handoff’a kaydedildi.

### Changed — 2026-09-14 — Kaynaklı proje bağlamı

- Aidat Takip kimliği ve sporcu/aidat ilk hedefi ürün belgelerine işlendi; kullanıcı çocuk ve yetişkin kapsamını doğruladı.
- Ürün, mimari, API/veri envanteri, kalite ve operasyon belgeleri mevcut kaynaklarla dolduruldu; bilinmeyenler TBD bırakıldı.
- 14 çelişki/risk kaydı ve önerilen backlog hazırlandı; iki ADR Proposed olarak eklendi. Accepted karar veya kod uygulaması yok.
- README’ye CDSK giriş ve çelişki notu eklendi; önceki içeriği korunuyor. Project Boot, metadata ve AI Handoff güncellendi.
- Anayasa, uygulama kaynakları, şema, migration, paket/lock ve dağıtım dosyaları değiştirilmedi.
- Doğrulamalar ve çalıştırılmayan kontroller [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md) içinde kayıtlıdır.


### Added — 2026-09-14

- Kullanıcının belirttiği CDSK iskeleti: dört yeni kök dosya ve yedi dokümantasyon klasöründe 32 belge.
- Zorunlu okuma sırası, kaynak hiyerarşisi, kullanıcı onayı kapıları ve AI hafıza kuralları.
- Project Boot, ADR ve konu bazlı dokümantasyon şablonları; projeye özel alanlar `TBD`.
- Mevcut README ve diğer dosyalar korunarak yalnızca eksik dosyalar eklendi.
- Yeni proje ADR’si veya teknik karar kabul edilmedi.
- Doğrulama sonuçları: [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md).
