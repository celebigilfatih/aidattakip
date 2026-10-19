# Test Strategy

## Personel ekranından gün/saat düzenleme — 2026-10-19

47 test başarılı (onboarding17, diğer30). Yeni PUT yetki/origin/şube ve bozuk gün/saat/izinsiz alan reddi; sadece takvim değişimi, üyeler/sahip/şube/etkinlik/geçmiş koruması, değişiklikte cursor yenileme ve no-op cursor koruması; güncel takvimle yeni/mevcut personel katılımı, paralel üyelik/takvim düzenlemesi ve geçmiş slot dışlama sınandı. Test DB loopback5477/aidat_takip; dış push yok, kendi fixture'ları temizlenir. Typecheck geçti. Yerel gerçek tarayıcı1280px Salı/Perşembe10:31 kaydet/yenile, güncel kart/yeni personel formu, boş gün düğmesi ve Vazgeç doğrulandı; kapalı kural/tek üye/0 run fixture'ı temizlendi. Native saat girişinde otomasyon fill tek başına React olayını tamamlamadığı için klavyeyle sonlandırılıp DB kalıcılığı ayrıca okundu. Yerel ve nihai demo Docker başarılı; yalnız demo ec5e2dc Success/3m06s. Canlı559px/scrollWidth559,512px dialog, Pazartesi09:00 mevcut seçim ve yeni GET verileri doğrulandı.10 personel/17 bildirim, aynı ana iPhone, etkin kural/sahip/tek alıcı ve tek eski run korundu; cihaz süresi mevcut sessiz yenilemeyle ilerledi. Worker yayın sonrası13:22:04.316 UTC cursor ilerletti, yeni run/push yok. Genel lint CR-011, rollback/restore/tam erişilebilirlik ve yeni iPhone testi bu dar değişiklikte çalıştırılmadı.

## Mevcut personelin karttan özet seçimi — 2026-10-19

Toplam44 test başarılı: onboarding paketine4 senaryo eklendi; ADMIN/ACCOUNTING kendi kapsamındaki tek üyeliği açar/kapatır, tekrarlı ve paralel işlemler diğer üyeleri/cursor/saat/etkinliği korur. Veli/oturumsuz/SECRETARY/origin/yabancı şube ve eski kural reddi; pasif/rolü uygun olmayan/seçilmemiş kişi katılamaz, geçersiz eski üyelik çıkarılır. Son üye kaldırıldığında kuralın etkinliği/geçmişi korunur. Test verisi yalnız loopback5477 kendi fixture'larıdır, dış push yok. Typecheck, yerel ve nihai demo27bd03c Docker başarılı. Gerçek yerel tarayıcı1280px sentetik kart aç/yenile/kapat; canlı559px kartta yatay taşma yok, mevcut işaret ile yeni GET API üyeliği aynı. Canlı tercihi değiştirmeden10 personel/17 bildirim/ana cihaz/etkin kural/tek eski run korundu; worker yayın sonrası cursor ilerletti. Yerel fixture temizlendi. Genel lint CR-011, rollback/restore/tam erişilebilirlik ve yeni gerçek iPhone testi çalıştırılmadı.

## Personel formundan özet kuralına katılım — 2026-10-19

Toplam40 test geçti. Onboarding entegrasyonu mevcut6 teste4 senaryo ekler: yönetici kapsamındaki tam Pazartesi09:00 kuralları, mali personelin atomik üyeliği ve mevcut alıcı/cursor/takvim koruması, rol/alıcı/şube/değişmiş-silinmiş-yanlış saatli kural reddi, kapalı kuralın kapalı kalması ve paralel üyelik ekleme. Kendi yerel sentetik fixture'ları temizlenir; dış push yok. Typecheck, yerel ve nihai demo fed6e33 Docker build başarılı. Yerel UI kural yok açıklaması/kapalı kutu, iki kapalı fixture kuralıyla zorunlu seçim/kapalı bilgisi/rol değişimi; canlı tek etkin kural, alıcı ve şube değişiminde kutu temizliği kontrol edildi. Yerel UI fixture'ları temizlendi. Canlı ölçülen559px görünümde scrollWidth=559, dialog512px; tam390px veya gerçek iPhone kabulü iddia edilmez. Hesap/üyelik oluşturma entegrasyon testinde; demoya deneme hesabı/kural/push eklenmedi. Eski ana cihaz/etkin kural ve17 bildirim korundu. Genel lint CR-011, restore/rollback/tam erişilebilirlik bu dar işte çalıştırılmadı.

## Bildirim ekranından personel oluşturma — 2026-10-19

[staff-onboarding.integration.test.ts](../../src/lib/staff-onboarding.integration.test.ts) yalnız loopback5477/aidat_takip üzerinde6 test: veli/oturumsuz/pasif/ACCOUNTING/origin reddi, şube ve grup kapsamı, atomik hesap/alıcı, hash doğrulaması ve yanıt gizliliği, mevcut e-posta, paralel mükerrer kayıt, alıcı kutusu kapalı hesap ve pozitif antrenör grup kaydı. Kendi sentetik fixture'larını temizler; dış push yok. Mevcut30 regresyon da geçti. Typecheck, yerel Docker adayı ve son UI arama temizliği dahil nihai demo48d55af Docker build başarılı. Gerçek tarayıcı390px dialog taşması, rol/şube/gruplar, alıcı kutusu ve personel araması; canlı1280px form ve arama kontrol edildi. Canlı API'de mevcut personel/cihaz/bakiye/kural korundu; gerçek yeni personel/iPhone kurulumu bu görevde yapılmadı. Genel lint CR-011 nedeniyle, restore/rollback ve tam erişilebilirlik taraması bu dar işte çalıştırılmadı.

## ADR-0007 personel ve özet testleri

Typecheck ve toplam 30 test geçti: bildirim politika, İstanbul zaman/sözleşme, DB entegrasyonu, mevcut demo/rapor regresyonları. DB testi yalnız loopback:5477/aidat_takip ve kendi fixture kural/kişi/verisinde çalışır; gönderici stub, dış push yok. 200 aktif/pasif sporcu, kısmi/tam/iptal/vade günü, mali rol/şube, 30 gün, logout/iptal/410, paralel claim, restart, kapalı kural ve tam 1 saat telafi sınırı kapsanır. Gerçek demo personel iPhone manuel push ve otomatik tek özet Apple HTTP201; kullanıcı her iki görünüm/tıklamayı doğruladı. Gerçek cron etkin saatte1, kapalı kontrol saatinde0 çalışma üretti; standart kural kapalı bırakıldı. Genel lint CR-011 nedeniyle ayrı kapı değildir.

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

## Geciken aidat listesi UI/UX — 2026-10-19

Typecheck; gerçek tarayıcı320/390/768/1280 yeniden akış ve taşma, Türkçe/ASCII isim araması, grup/durum/sıralama, boş sonuç, filtre temizleme, üç sayfa sınırı ve odak kontrolü başarılı. Yeni düşük etkili görsel değişime implementation-mirroring unit test eklenmedi; anlamlı UI kontrolleri kullanıldı. Mali API ve entegrasyon kuralları değişmedi; önceki30 test kanıtı korunur, bu UI adımında yeniden çalıştırılmış sayılmaz. Ekran okuyucu/tam WCAG veya yeni gerçek iPhone görsel kabulü iddia edilmez. [İnceleme](OVERDUE_UX_REVIEW.md).
