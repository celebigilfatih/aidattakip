# Changelog

Her anlamlı değişiklikte ilgili belgeler ve AI Handoff ile birlikte güncellenir. Geçmiş sürümler: TBD.

## [Unreleased]

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
