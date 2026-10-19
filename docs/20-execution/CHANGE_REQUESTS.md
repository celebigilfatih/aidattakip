# Change Requests

## CR-028 — Personel ekranından yeni aidat özeti kuralı oluşturma

- Kullanıcı talebi (2026-10-19): Yeni kuralın gün/saat/alıcıları aynı personel formundan seçilsin; ayrı sekmeye gidilmesin.
- Status: Closed — yalnız demo3b7ebcc Success/3m12s; typecheck/51 test, yerel/nihai Docker ve UI/koruma kontrolleri başarılı.
- Önceki CR-026/027 akışındaki ilk kayıt için ayrı sekme yönlendirmesi değişir. StaffSummaryCreateDialog kural adı, varsayılan Pazartesi09:00, çoklu gün ve güncel seçili mali alıcılar; arama/boş sonuç, ana cihaz bilgisi, zorunlu gün/alıcı, kapalı kayıt ve iptal içerir. Yeni kart/üyelikler aynı ekran içinde yenilenir.
- Mevcut GET recipients/POST summary-rules kullanılır; backend/yetki/model/migration/paket/anahtar/retention/dağıtım politikası değişmez. ADR-0007 korunur, yeni ADR gerekmedi. Yeni kural daima kapalıdır; bilinçli etkinleştirme mevcut karttadır.
- Yerel kanıt: Typecheck ve mevcut51 test geçti.1280px/576px dialogda alıcı yok, boş gün, mali rol filtresi (seçili Sekreter dışarıda), arama/sonuç yok ve seçim sayısı; Salı/Cuma10:30/tek Muhasebe ile UI oluştur/yenile ve aynı personel kartında seçili üyelik. Yeni form tekrar Pazartesi09:00/boş alıcı, Vazgeç0 ek kayıt. DB tek kapalı kural/tek üye/0 run/push; kendi fixture'ları temizlendi. Yeni UI testi yazılmadı; mevcut API regresyonu ve gerçek form akışı doğrulandı. Yalnız demo yayımlanacak, mevcut etkin Pazartesi09:00/Demo Kullanıcı tercihi korunacak.
- Kapanış: Yalnız demo3b7ebcc/uy5h59frb20iukwqm89ueafv Success/3m12s, nihai Docker başarılı. Son arama Enter koruması geçerli yerel formda0 kayıtla sınandı. Canlı559px/512px dialog gün/saat/alıcı ve kapalı kayıt eylemi, Vazgeç; mevcut10 personel/17 bildirim/ana iPhone/etkin Pazartesi09:00 tek alıcı/sahip/tek eski run aynı. Worker14:00:12.271 UTC ilerledi, yeni run/push yok. Gerçek yeni iPhone testi, genel lint CR-011 ve restore/rollback/tam erişilebilirlik kapsam dışında.

## CR-027 — Personel ekranından kuralı etkinleştirme/durdurma

- Kullanıcı talebi (2026-10-19): Etkinleştirme ve durdurma da Personel ve Cihazlar ekranından yapılsın.
- Status: Closed — yalnız demo6c4ee5b Success/2m55s; typecheck/51 test, yerel/nihai Docker ve UI/koruma kontrolleri başarılı.
- CR-026 kısa kartının gün/saat dışındaki durum yönetimi için ayrı sekmeye gitme sınırı kullanıcı talebiyle kaldırılır. Kartta mevcut duruma göre Etkinleştir/Durdur, tüm bağlı personele etki ve alıcısız kural açıklaması. Sonuç/hata kartların üstünde; diğer ayarlar korunur.
- PATCH staff-summary ek strict `{ruleId,enabled}` gövdesi; mevcut üyelik biçimi korunur. Aynı aktif mali yönetici/origin/şube ve kural kilidi. Etkinleştirmede mevcut tüm üyeler ve sahip doğrulanır; stop geçersiz seçimler olsa da açıktır. Yalnız etkinleştirme geçişinde cursor şimdiye alınır, geçmiş saatler gönderilmez; aynı durumu tekrar yazmak cursor'ı korur.
- Yeni yetki/model/migration/paket/anahtar/retention/dağıtım kararı yok; ADR-0007 korunur, yeni ADR gerekmedi. Yalnız demo yayını; mevcut etkin Pazartesi09:00/Demo Kullanıcı tercihi değiştirilmez.
- Yerel kanıt:51 test (onboarding21+diğer30), typecheck; yetki/origin/şube, bozuk/karışık alan, alıcı/sahip, no-op/cursor, tarihçe koruması, paralel gün/saat ve etkinlik, eski slot atlama ve durmuş kuralda gelecek worker0. Gerçek1280px UI etkinleştir/yenile/durdur/yenile, boş alıcılı düğme koruması ve durumun personel kartına yansıması başarılı; iki kural/tek üyeli kendi fixture'ları0 run ile temizlendi. Yeni gerçek iPhone testi yapılmadı.
- Yayın kanıtı: yalnız demo6c4ee5b, cgkadbvpctgupn7m0gjghe52 Success/2m55s. Canlı559px kartında etkin kural/Durdur ve gün/saat düğmeleri; tercih değiştirilmeden10 personel/17 bildirim/aynı ana iPhone/etkin Pazartesi09:00 tek Demo Kullanıcı kuralı/sahip/tek eski run korundu. Yeni push yok. Genel lint CR-011, restore/rollback ve tam erişilebilirlik kapsam dışında.

## CR-026 — Personel ve Cihazlar ekranında gün/saat düzenleme

- Kullanıcı talebi (2026-10-19): Aidat özetinin gün/saat ayarı için ayrı sekmeye gitmeden mevcut personel ekranından düzenlensin.
- Status: Closed — yalnız demo ec5e2dc Success/3m06s; yerel/canlı UI ve koruma kontrolleri başarılı.
- Önceki CR-024/025 ve ürün/API/rehber belgelerindeki tam Pazartesi09:00 seçim kısıtı bu taleple değişir. Mevcut haftalık kuralı düzenleyen ortak takvim kartı/dialog; en az bir gün, tek HH:mm, Europe/Istanbul ve tüm bağlı alıcılara etki açıklaması. Yeni/mevcut personel seçimleri de tüm yetkili haftalık kuralları güncel saatle gösterir.
- PUT staff-summary aynı aktif ADMIN/ACCOUNTING, origin, şube ve kural kilidi kullanır; yalnız gün/saat değişir. Üyeler/sahip/şube/etkinlik/cihaz/geçmiş korunur. Değişiklikte cursor kaydetme anına alınır; geçmiş saatler gönderilmez. Aynı değerleri kaydetmek cursor'ı korur. Paralel üyelik değişimi kaybolmaz. Yeni kural/etkinleştirme veya push yok.
- Yeni model/migration/paket/anahtar/retention/yetki/dağıtım kararı yok; mevcut ADR-0007 haftalık model uygulanır, yeni ADR gerekmedi. Yalnız demo yayımlanacak; mevcut etkin Pazartesi09:00 tek Demo Kullanıcı tercihi değiştirilmez. Main/Özlüce kapsam dışında.
- Yerel kanıt:47 test (onboarding17 + mevcut30), typecheck; invalid alan/yetki/origin/şube, değişiklik/no-op cursor, üyeler/sahip koruması, yeni saatli kurala katılım ve paralel takvim/üyelik. Gerçek tarayıcı1280px Salı/Perşembe10:31 kaydet/yenile, kart/yeni personel formunda güncel takvim ve Vazgeç doğrulandı; kapalı kural/tek üyelik/0 run, kendi fixture'ları temizlendi. Saat alanı otomasyon fill sonrasında native klavye ile tamamlandı; gerçek iPhone testi yapılmadı. Kanıt output/staff-calendar (Git dışında).
- Yayın kanıtı: Yerel/nihai Docker başarılı; canlı559px dialog512px, yatay taşma yok; haftalık kart/yeni GET seçenekleri doğru. Canlı tercih değiştirilmeden10 personel/17 bildirim, aynı seçili kişi/ana iPhone/etkin Pazartesi09:00 kuralı ve tek eski run korundu; worker13:22:04.316 UTC'de yeni container sonrası değerlendirdi. Ana cihaz süresi mevcut sessiz yenilemeyle ilerledi; cihaz ID/aktiflik aynı. Genel lint CR-011, restore/rollback ve tam erişilebilirlik taraması bu dar işte çalıştırılmadı.

## CR-025 — Mevcut personelin aidat özetini karttan değiştirme

- Kullanıcı talebi (2026-10-19): Mevcut personel Pazartesi09:00 aidat özeti seçimi Personel ve Cihazlar ekranından değişsin.
- Status: Closed — yalnız demo27bd03c Success/3m03s; canlı kart ve koruma kontrolleri başarılı.
- Her kartta uygun mevcut Pazartesi09:00 kuralları/üyelikleri, anında kaydeden kutu ve kapalı/uygun olmayan personel açıklaması. Takvim yönetiminin mevcut ADMIN/ACCOUNTING ve şube sınırı geçerli; genel bildirim alıcısı seçimi hâlâ yalnız ADMIN.
- Ayrı GET/PATCH staff-summary API tek kişinin tek kural üyeliğini idempotent değiştirir. Kural row lock; gün/saat/kapsam/aktif mali personel/seçili alıcı/owner tekrar kontrol edilir. Geçersizleşmiş seçim kaldırılabilir. Diğer üyeler, saat, etkinlik, cursor, cihaz ve geçmiş değişmez; son üye çıkınca kural silinmez/otomatik kapanmaz, alıcı olmadığı için push yok.
- Kanıt: Typecheck/44 test, yerel ve nihai demo Docker başarılı. Yerel gerçek tarayıcıda sentetik personelde aç/yenile/kapat; canlı kartta Demo Kullanıcı mevcut işareti ve API üyeliği doğrulandı.10 personel/17 bildirim/aynı ana iPhone/etkin Pazartesi09:00 tek alıcılı kural/tek eski run korundu; canlı seçim değiştirilmedi. Schema/migration/paket/anahtar/yetki değişikliği yok, ADR-0007 geçerli. API envanteri57 rotaya güncellendi.

## CR-024 — Personel formunda Pazartesi09:00 aidat özeti seçimi

- Kullanıcı talebi (2026-10-19): Yeni personelin Pazartesi09:00 aidat özetini alıp almayacağı aynı formdan seçilsin; ayrı sekmeye gidilmesin.
- Status: Closed — yalnız demo fed6e33 Success/3m03s; canlı form ve koruma kontrolleri başarılı.
- Önceki CR-023 akışında mali özet için ayrıca kural düzenleniyordu. Yeni isteğe bağlı kutu varsayılan kapalı; yalnız bildirim alıcısı ve ADMIN/ACCOUNTING rolü ile mevcut, yetkili kapsamda tam Pazartesi09:00 kuralı seçilebilir. Birden çok uygun kural varsa seçim zorunlu; hiç yoksa açıklama gösterilir. Yeni kural oluşturulmaz/etkinleştirilmez.
- Hesap, alıcı ve kural üyeliği tek transaction; kural row lock ile yeniden doğrulanır. Diğer alıcılar, zaman, etkinlik ve worker cursor değişmez. Rol/şube/alıcı seçimi değişince kutu temizlenir. Yetki/model/retention/dağıtım kararı değişmedi; ADR-0007 geçerli.
- Kanıt: Typecheck/40 test, yerel ve nihai demo Docker build başarılı. Yerel kural yok/çoklu kapalı kural/seçim zorunluluğu/rol temizliği; canlı tek etkin kural/alıcı ve şube temizliği doğrulandı. İki geçici yerel UI kuralı temizlendi; demoya deneme personeli veya kuralı eklenmedi. Mevcut10 personel/17 bildirim/ana cihaz/etkin kural ve tek eski run korundu.

## CR-023 — Bildirim ekranından personel ekleme

- Kullanıcı talebi (2026-10-19): Yeni personel hesabı ve bildirim alıcısı seçimi Bildirimler ekranında birlikte yönetilsin.
- Status: Closed — yalnız demo48d55af yayımlandı, canlı form/arama ve koruma kontrolleri başarılı.
- Çözüm: Personel ve Cihazlar → Yeni personel ekle; mevcut roller, şube ve antrenör grup seçimleri. Varsayılan Sekreter; bildirim alıcısı kutusu açık. Hesap ve isteğe bağlı alıcı tek transaction ile oluşturulur. Mevcut personel araması/seçimi korunur. Cihaz izni ve haftalık kural alıcısı ayrıca seçilir.
- Sınır: Yalnız aktif ADMIN; mevcut şube/rol politikası ve ADR-0007 korunur. Yeni model/migration/entegrasyon veya yetki genişlemesi yok; additive API, eski kullanıcı API'si değişmez. Yeni ADR gerekmez.
- Doğrulama: Typecheck, mevcut30 regresyon ve6 yeni onboarding entegrasyon testi başarılı. Yerel Docker adayı ve390px form/arama/rol/şube/grup/alıcı kutusu kontrolü geçti. Nihai48d55af Docker demo build Success/3m40s; canlı1280px form ve arama,10 personel/17 bildirim/54 sporcu150 aidat201.000 toplamı ve etkin Pazartesi09:00/Demo Kullanıcı kuralı korundu. Gerçek yeni personel/telefon kurulumu bu görevde yapılmadı.

## CR-022 — Geciken aidat listesi okunabilirliği

- Status: Closed — mevcut liste UI/UX düzeltmesi yalnız demo1db9776 ile yayımlandı ve canlı doğrulandı.
- Kanıt: Güncel demo ekranları yakalandı;390px genişlikte bakiye ekran dışında, arama/filtre/sayfalama yok,401 durumda giriş düğmesi yok. [İnceleme](../30-quality/OVERDUE_UX_REVIEW.md).
- Düzeltme: Mobil/tablet kartları, masaüstü tablo, özet/filtre toplamı ayrımı, Türkçe arama, grup/durum/sıra,20 satır sayfalama ve durum eylemleri. Mali API/hesap/şube yetkisi değişmez; yeni ADR/migration yok.
- Yerel kontrol: Typecheck;320/390/768/1280 genişlikleri, arama/grup/durum/sıralama, boş sonuç, sayfa sınırları ve odak başarılı. Coolify Success/3m09s; canlı mobil/masaüstü ve arama/sayfalama kontrolleri geçti. Önceki mali toplamlar/17 bildirim ve kapalı kural korundu.


## CR-021 — Personel odaklı bildirim ve otomatik aidat özeti

- Status: Closed — onaylı uygulama, demo yayını, gerçek personel iPhone/takvim/durdurma kabulü tamamlandı; ADR-0007 Accepted.
- Önceki kaynak: ADR-0006 hem veli/sporcu hem personel ve oturuma bağlı cihaz kaydı içeriyordu. Yeni onay alıcı işletimini yalnız seçili personele ve cihaz kaydını 30 güne değiştirir; eski tarihçe korunur.
- Uygulama: ADMIN seçimi, ana cihaz, 30 gün/sessiz yenileme/iptal; mali rol ve şube kapsamı; haftalık takvim ve bir saat telafi; ortak güncel borç hesabı, kalıcı çalışma/idempotent gönderim. Veli davet/abonelik/gönderimi kapalı.
- Yerel kanıt: Additive migration applied; typecheck ve 30 test başarılı. 200 sentetik sporcu tek özet, paralel işleyici, 1 saat sınırı, rol/şube, çıkış/iptal sınandı. Yalnız demo dbc329d0 Success, migration ve Coolify her dakikalık işleyici doğrulandı. Gerçek personel manuel push, tek otomatik özet ve doğru mali liste açılışı kullanıcı tarafından doğrulandı. Kapalı saatte gerçek cron sıfır çalışma üretti; kural standart Pazartesi09:00/kapalı.
- Takip: CR-004 e-posta/SMS ve ilk sürüm dışı otomasyon tercihleri ayrıca açık kalır.

Last updated: 2026-10-19. Durum: Repository kaynakları ve tarihli uygulama/doğrulama kayıtları birlikte izlenir.

## Kayıt ilkesi

Bu kayıtlar kaynaklar arasındaki çelişki veya uygulama eksiklerini açıkça gösterir. Öneriler kabul edilmiş karar değildir. İlk bağlam doldurma görevi kod/veri/dağıtım değiştirmedi; sonraki onaylı uygulamalar kendi tarihli çözüm kayıtlarında belirtilir. Öncelikler öneridir; kullanıcı adına sprint veya yayın kapsamı seçilmedi.

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
- 2026-10-19 incelemesi: Kullanıcı geciken aidatlar ve belirli gün/haftalarda hem veli/sporcuya hem personele push istiyor. Push kanalı/abonelik/PWA altyapısı yok; toplu send yalnız SENT işaretliyor, otomatik aidat hatırlatma işlevi taslak ve repository'de periyodik işleyici çağrısı bulunmadı. [ADR-0006](../50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) Proposed; gönderim yapılmadı. Ekran/API sözleşmesi CR-020'de ayrıca izlenir.
- Sonraki uygulama (2026-10-19): Kullanıcı ADR-0006'yı ve ilk manuel push/alıcı kaydı adımını onayladı. Yeni route'lar gerçek tekil/toplu ortak gönderim servisini kullanır; e-posta/SMS sağlayıcısı yokken gönderimi reddeder. Web Push/PWA adaptörü ve yerel runtime anahtarları hazır, testte dış servis kontrollü adaptörle değiştirildi. MPL-2.0 paket/yalnız demo dağıtımı sonradan onaylandı. 5e1fd7c demo testi Apple HTTP201/ACCEPTED ve kullanıcının bildirim/tıklama kabulüyle başarılı. CR-004 e-posta/SMS sağlayıcısı ve otomatik kurallar/scheduler için açık kalır.

## CR-005 — Yedekleme kapsamı ve geri yükleme

- Kaynaklar: [backup API](../../src/app/api/settings/backup/route.ts), [şema](../../prisma/schema.prisma).
- Gözlem/çelişki: JSON fallback 12 model koleksiyonu içeriyor; şemada 20 model var. Parent/Student ilişki bağlantıları bu yalın koleksiyonlarda ayrıca yüklenmiyor. users alan seçimi yok.
- Etki ve öneri: Tam geri yüklenebilir yedek kabul edilmemeli. İzole restore denemesi ve kapsam tasarımı önerilir.
- Durum/onay: Açık; retention, hassas veri ve restore işlemleri onaya tabidir.

## CR-006 — Dağıtım referansları

- Kaynaklar: [Compose](../../docker-compose.yml), [Dockerfile](../../Dockerfile), [gitignore](../../.gitignore).
- İlk gözlem (2026-09-14): Compose init.sql bağlaması tanımlı fakat dosya yok. Dockerfile .npmrc kopyalıyor; ortam kurulumu ve taşınabilirlik o görevde doğrulanmamıştı.
- Mevcut kanıt: 2026-09-15 Docker build/Coolify dağıtımı [DEPLOYMENT](../40-operations/DEPLOYMENT.md) içinde kayıtlı; 2026-10-19 Windows yerel kurulumunda 10 migration uygulandı. Bunlar eksik init.sql ile Compose'un uçtan uca çalıştığını kanıtlamaz.
- Kalan takip: Compose eksikleri ve taşınabilirliği incelenmeli. CR-019 eşlemesinde canlı PostgreSQL sürümünün eski 15/17 kayıtlarıyla doğrulanamadığı görüldü; yetkili ortamdan yalnız sunucu sürümü okunup buraya tarihli kanıt eklenmeli. 2026-10-19 demo uygulamasının kısıtlı spormanage_demo rolüyle READ ONLY transaction içinde current_database/current_user/server_version sorgulandı: spormanage_aidat_demo / spormanage_demo / **17.7**. Canlı sürüm alt takibi tamamlandı; yerel 15.19 ayrı kanıttır. Compose/init.sql taşınabilirlik işi açık kalır.
- Durum/onay: Açık; ortam/topoloji değişikliği açık onay gerektirir.

## CR-007 — Secret ve kimlik doğrulama logları

- Kaynaklar: [login](../../src/app/api/auth/login/route.ts), [auth](../../src/lib/auth.ts), [Compose](../../docker-compose.yml).
- İlk gözlem (2026-09-14): Login parola/debug logları, AuthService secret parçası logu, sabit secret fallback ve Compose'a yazılı değerler bulundu.
- Tamamlanan dar düzeltme: 2026-09-15 `d6db67c` login API e-posta/parola/hash loglarını ve hassas debug yanıtlarını kaldırdı. 2026-10-19 mevcut kodla eşlendi; bu, ADR-0001'in tümünün kabulü/uygulaması değildir.
- Kalan durum: AuthService kaynakta secret parçası/e-posta loglar ve fallback kullanır. `.env`/`.npmrc`/SQL dökümü `git ls-files` içinde hâlâ takip ediliyor; içeriklerin gerçek canlı kullanımı/rotasyon envanteri TBD. 2026-09-15 Özlüce Coolify build logu secret nitelikli environment değerlerinin build argümanı olarak sunulduğu konusunda uyardı. Demo runtime ayarı ADR-0005 kaydındadır; Özlüce riskini kendiliğinden kapatmaz.
- Etki ve öneri: Öncelikli değerlendirme önerilir; değerler belgelere taşınmadı. Ayrı ortam envanteri olmadan rotasyon yapılmamalı.
- Durum/onay: Açık; [ADR-0001](../50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) Proposed. Login düzeltmesi tamamlandı; kalan politika/uygulama ve rotasyon onayı TBD.

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

## CR-016 — Production başlangıç kimliği adı ve rolü uyuşmuyor

- Kaynaklar: Coolify application environment adları ve production veritabanındaki salt okunur kullanıcı/rol doğrulaması, 2026-09-15.
- Gözlem/çelişki: `SEED_ADMIN_*` adıyla tanımlı mevcut kimlik production veritabanında aktif `TRAINER` rolüne bağlıdır. Veritabanında ayrıca ayrı bir aktif ADMIN vardır. Production login ekranındaki yerel demo hesabı da bu ortam için geçerli değildir.
- Bu oturum: Kullanıcı, rol, e-posta, parola ve hash değiştirilmedi. Yerel örnek hesap kutusu production build’de gizlendi; development gösteriminde korunur.
- Etki ve öneri: Otomatik bootstrap/işletim beklentisi yanlış hesaba bağlanabilir. Değişiklikten önce gerçek işletim sahibi, hedef ADMIN kimliği ve rotasyon yöntemi doğrulanmalı; ardından Coolify değişkenleri ile kullanıcı rolü tutarlı hale getirilmelidir.
- Durum/onay: Açık. Kimlik, parola ve rol değişikliği güvenlik/yetkilendirme kararıdır ve açık kullanıcı onayı gerektirir.

## CR-017 — Ortak broşür hesabı production ADMIN yetkisine sahip — Kapalı

- Kaynaklar: Kullanıcının 2026-09-15 tarihli açık hesabı ve ADMIN rolü onayı; [ADR-0004](../50-decisions/ADR-0004-brosur-demo-admin-hesabi.md); production login doğrulaması.
- Gözlem: Broşür için oluşturulan ortak hesap aktif ADMIN’dir. Canlı dashboard mevcut production kayıtlarını gösterir; ADMIN rolü kullanıcılar ve ayarlar dahil bütün menülere erişir.
- Etki: Hesabı bilen her broşür alıcısı production verisini görebilir ve uygulamanın izin verdiği yönetim mutasyonlarını yapabilir. Ortak kimlikte kişi bazlı audit ayrımı yoktur.
- Çözüm/durum: [ADR-0005](../50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md) ile broşür hesabı ayrı sentetik demo veritabanına taşındı. Özlüce veritabanındaki aynı e-posta silinmeden `isActive=false` yapıldı ve eski uygulama girişi reddedildi. Demo ortamında ADMIN'in sentetik veriyi değiştirme ve parola rotasyon tarihi riskleri ADR-0005 takibindedir. Kapalı.

## CR-018 — Broşür URL’si çalışan production domain ile uyuşmuyor — Kapalı

- Kaynaklar: [BROCHURE_GUIDE](../40-operations/BROCHURE_GUIDE.md), PDF/QR üretim kaynağı ve [DEPLOYMENT](../40-operations/DEPLOYMENT.md).
- İlk gözlem/çelişki: Broşür bağlantıları ve QR kodları `https://aidat.spormanage.com.tr` hedefini kullanırken doğrulanmış canlı Coolify domain’i `https://aidat.ozlucespor.com` adresiydi. Broşür domain’i ilk kontrolde güvenilir TLS/DNS bağlantısı kurmadı.
- Etki: Dağıtılan broşürü kullanan ziyaretçi giriş ekranına ulaşamayabilir; doğru hesap oluşturulmuş olsa da erişim akışı tamamlanmazdı.
- Çözüm/durum: İlk geçici çözüm domain'i Özlüce uygulamasına ekledi. Kullanıcının sonraki açık kararıyla [ADR-0005](../50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md) uygulanarak domain yeni `SporManage Aidat Demo` uygulamasına taşındı. Geçerli TLS, `/login` HTTP 200 ve yeni demo DB ile ADMIN dashboard doğrulandı. `aidat.ozlucespor.com` yalnız eski uygulamada korunur; `www` varyantı iki uygulamada da yoktur. Kapalı.

## CR-019 — CDSK belgelerinin güncel durumla eşlenmesi — Kapalı (belge kapsamı)

- Kaynaklar: [OVERVIEW](../10-architecture/OVERVIEW.md), [ADR-0001](../50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md), [OBSERVABILITY](../40-operations/OBSERVABILITY.md), [RELEASE_PLAN](RELEASE_PLAN.md), [RUNBOOK](../40-operations/RUNBOOK.md), [DEPLOYMENT](../40-operations/DEPLOYMENT.md), [login kodu](../../src/app/api/auth/login/route.ts) ve [CHANGELOG](../../CHANGELOG.md).
- İlk gözlem/çelişki (2026-10-19): OVERVIEW aynı fiziksel PostgreSQL kaynağını bir bölümde 15, diğerinde 17 Alpine olarak tanımlıyordu. Login debug logları kodda kaldırılmış ve CHANGELOG'a kaydedilmiş olmasına rağmen OBSERVABILITY hâlâ üretildiğini, ADR-0001 ise uygulamanın yapılmadığını söylüyordu. Bu dar düzeltme tüm ADR'nin kabul edildiği veya kalan secret risklerinin kapandığı anlamına gelmez.
- İlk güncellik bulgusu: RELEASE_PLAN üretim dağıtımının doğrulanmadığını ve DEPLOYMENT'ın yalnız dosyaları tarif ettiğini söylüyordu; 2026-09-15 tarihli dağıtım kayıtları mevcuttu. RUNBOOK'un eski broşür alt bölümü aynı uygulama/production ADMIN tarifini güncel demo işletimiyle birlikte sunuyordu; ADR-0005 bunların yerine ayrı demo uygulamasını kaydediyordu.
- Etki ve öneri: Sonraki çalışma yanlış işletim bağlamıyla başlayabilir. Tarihsel kayıtları açıkça ayırmak, güncel açıklamaları kabul edilmiş ADR-0005 ve mevcut kodla eşlemek; gerçek PostgreSQL sürümünü yetkili ortamdan doğrulayana kadar kesin sürüm iddiasını çözülmüş saymamak önerilir.
- İlk kontrol durumu: Yalnız bulgu kaydı açılmıştı; uygulama/politika değişikliği yapılmamıştı.
- Çözüm (2026-10-19): Kullanıcının belge eşleme talebiyle aşağıdaki düzeltmeler yapıldı. Uygulama, veri modeli, altyapı veya kabul edilmiş kararların kapsamı değiştirilmedi.

| Bulgu | Belgedeki çözüm / kanıt | Kalan iş |
|---|---|---|
| PostgreSQL 15/17 | OVERVIEW ve DEPLOYMENT ortamları ayırır; yerel salt okunur sorgu 15.19, Coolify sürümü TBD. ADR-0005 ilk sürüm ifadesini tarihsel bağlam olarak korur | Canlı sunucu sürüm kanıtı CR-006 altında açık |
| Login logları / ADR-0001 | Login kodu ve `d6db67c` ile tamamlanan temizlik SECURITY_MODEL, OBSERVABILITY, ADR-0001, CR-007 ve özetlere işlendi | AuthService log/fallback/secret işleri CR-007 ve Proposed ADR-0001 altında açık |
| Dağıtım / kabul | RELEASE_PLAN, ROADMAP ve MILESTONES tarihli dağıtım/yerel test kanıtlarını ürün kabulünden ayırır | Kesin ürün kabulü, lint, backup/restore konuları mevcut kayıtlarda açık |
| Eski ortak uygulama / ADMIN | RUNBOOK ve DEPLOYMENT güncel başvuru olarak ADR-0005'i gösterir; önceki ortak domain/production ADMIN kayıtları tarihsel olarak etiketlendi | Yeni topoloji kararı yok; canlı durum bu görevde yeniden kontrol edilmedi |

- Doğrulama: Paket/lock, 17 sayfa/48 rota/20 model, login/AuthService/Next config ve startup kaynakları eşlendi. Yerel PostgreSQL sürümü READ ONLY transaction ile okundu. Belge bağlantıları, metadata, biçim ve dosya bütünlüğü kapanışta kontrol edildi; ayrıntılar [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md).
- Durum/onay: Kapalı — belge çelişkileri giderildi ve doğrulanmayan canlı sürüm iddiası kaldırıldı; gerçek canlı sürümün çözüldüğü veya açık güvenlik/ürün kararlarının kabul edildiği iddia edilmez. Yeni ADR kabulü yok.

## CR-020 — Bildirim alıcı ve zamanlama sözleşmesi — Kapalı (ilk aşama)

- Kaynaklar: [ekran](../../src/app/notifications/page.tsx), [liste/oluşturma API](../../src/app/api/notifications/route.ts), [bulk](../../src/app/api/notifications/bulk/route.ts), [scheduled processor](../../src/app/api/notifications/process-scheduled/route.ts), [middleware](../../middleware.ts).
- Gözlem (2026-10-19): Form öğrenci/grup/antrenör ve tümü seçenekleri gönderiyor; POST yalnız studentId çözüyor. Varsayılan `all` öğrenci kimliği gibi aranarak 404'e gider; grup/antrenör parametreleri hedef kitleye açılmıyor. GET liste seçimi scheduledAt/sentAt/alıcı iletişim alanlarını içermediğinden form/liste beklediği bilgileri alamıyor.
- Zamanlama: UI tek `datetime-local` alanı içeriyor; haftalık/aylık tekrar modeli ve net timezone sözleşmesi yok. Düzenlemede UTC `toISOString()` ile yerel giriş alanı dolduruluyor. Process-scheduled GET mutasyon yapıyor; middleware personel oturumu gerektirdiği için bu uç korunmadan cron'a açılmamalı. Toplu send sağlayıcı çağrısı yapmadan SENT işaretliyor (CR-004).
- Etki/öneri: Gerçek push eklenmeden önce alıcı önizlemesi ve sözleşme eşlenmeli; manuel/toplu/otomatik yollar ortak gerçek gönderim katmanına bağlanmalı. Europe/Istanbul iş kuralları, rol/nesne sınırları ve cihaz sahipliği [ADR-0006](../50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) içinde Proposed.
- Durum/onay: Açık; bu görev statik kod + salt inceleme UI doğrulamasıdır. Hatalı POST veya gönderim uçları çalıştırılmadı; uygulama düzeltmesi ve yeni veri/yetki/işletim kararları uygulanmadı.
- Çözüm/onay (sonraki görev, 2026-10-19): ADR-0006 açık kullanıcı onayıyla Accepted. POST tümü/grup seçimlerini sporculara, antrenör seçimini antrenörün personel alıcı hesabına açar; GET gerekli alanlar ve kararlı sayfalama döndürür. Zamanlama offset içeren ISO ile gönderilir, yerel alanda doğru düzenlenir ve temizlenebilir. Yanıltıcı toplu SENT kaldırıldı; ortak gönderim servisi gerçek kanal sonucunu kaydeder. Gelecek tarih erken gönderilemez; scheduled GET mutasyon yapmadan 405 döndürür. Otomatik işleyici bu ilk aşamada kapalıdır.
- Kanıt: Typecheck, 15 test (kaynak regresyonları + DB'li davet/yetki/tek cihaz/çift gönderim) ve production build başarılı. Yerel HTTP ve tarayıcıda panel, zamanlama alanları/sayfalama görüldü. iPhone gerçek teslimi sonradan 5e1fd7c demo testinde Apple HTTP201 ve kullanıcı görünüm/tıklama onayıyla doğrulandı; bu sözleşme kapatmasından ayrı kabul kanıtıdır. [PUSH_GUIDE](../40-operations/PUSH_GUIDE.md).
