# Runbook

Last updated: 2026-10-19. Komut envanteri kaynaklıdır; çalışma zamanı sonuçları tarihli kayıtlarda ayrıca belirtilir.

## Ortam ve giriş kaynakları

Güncel demo (2026-10-19): sabit 5e1fd7c / ayrı codex/manual-push-demo-20261019 dalı, auto deploy manuel. İlk gerçek iPhone push testi Apple HTTP201 ve kullanıcının görünüm/tıklama onayıyla başarılı. Otomasyon kapalıdır; manuel işlem ve geri alma sınırları [PUSH_GUIDE](PUSH_GUIDE.md), dağıtım kanıtları [DEPLOYMENT](DEPLOYMENT.md) içindedir.

[package.json](../../package.json), [Dockerfile](../../Dockerfile), [Compose](../../docker-compose.yml), [startup](../../scripts/startup.sh). Docker Node 20 Alpine tanımlar; yerelde zorunlu Node sürümü için ayrı pin bulunmadı. README’nin Node 18+ iddiası bu oturumda doğrulanmadı. `DATABASE_URL` PostgreSQL bağlantısı gerekir; değerler belgelerde tutulmaz.

## Windows yerel çalıştırma — 2026-10-19

Güncelleme — manuel push ilk aşaması: Yeni migration yerelde uygulandı (toplam 11); 5 alıcı/cihaz/delivery tablosu ve PWA kaynakları eklendi. Yerel anahtarlar repository dışında `push-runtime.json` dosyasından sunucu ortamına yüklenir. Güncel geliştirme terminal oturumu **12714**, adres yine loopback:3077; aşağıdaki 65346 önceki çalıştırmadır. `/recipient` alıcı ekranı, `/notifications` alıcı/davet ve tek cihaz yönetimi içerir. iPhone test/dağıtım, runtime ve geri alma adımları [PUSH_GUIDE](PUSH_GUIDE.md) içindedir. Otomatik işleyici kurulmadı.

- Bu bilgisayarda önceki yerel konteyner/volume ve node_modules bulunmadı. Kullanıcı yeni yerel PostgreSQL ve mevcut demo verisinin oluşturulmasını açıkça onayladı.
- Node v24.19.0 mevcut; npm PATH'te yok. Bundled pnpm üzerinden `pnpm dlx npm@11.12.1 ci --no-audit --no-fund` ile kilitli 616 paket kuruldu. Paket/lock değiştirilmedi; Node/npm sürümleri yeni proje standardı olarak seçilmedi.
- Yeni `aidat-takip-postgres`, `postgres:15-alpine`, `aidat_takip_postgres_data`; yalnız `127.0.0.1:5477` yayımlanır. Mevcut `.env` ana/lisans bağlantılarının aynı yerel kullanıcıyı ve `aidat_takip`/`license_db` hedeflerini kullandığı doğrulandı; değerler değiştirilmedi veya çıktıya yazılmadı.
- Aynı günkü CR-019 eşlemesinde salt okunur `current_setting('server_version')` sorgusu yerelde **15.19** döndürdü. Coolify sunucu sürümü bu sonuçtan çıkarılamaz; CR-006 kapsamında TBD'dir.
- `node node_modules/prisma/build/index.js generate` ve `node node_modules/prisma/build/index.js migrate deploy` başarılı; 10 mevcut migration yalnız yeni yerel DB'ye uygulandı. Yeni license_db mevcut `scripts/init-license-db.sql` ile kuruldu.
- Yeni yerel ADMIN, README'de belirtilen yerel demo hesabıyla mevcut bcrypt cost 12 biçiminde oluşturuldu. Genel seed kullanılmadı. Demo dry-run ardından kurulum: 2 şube, 6 grup/antrenör, 60 sporcu, 300 ödeme, 78 seans ve 378 yoklama; yönetici dahil 9 kullanıcı. Referans tarih 2026-10-19'dur; önceki makinenin snapshot'ı taşınmadı.
- Next `node node_modules/next/dist/bin/next dev -p 3077 --hostname 127.0.0.1` ile çalışır. Bu oturumda stdout/stderr içindeki mevcut `[Auth]` logları bir geçici Node sarmalayıcısında filtrelendi; uygulama kodu/secret politikası değişmedi. Yönetilen terminal oturumu 65346 açık bırakıldı; sonraki oturumda port yeniden doğrulanmalıdır.
- [Yerel giriş](http://127.0.0.1:3077/login): HTTP 200; ADMIN login, auth/me, health, students, payments ve dashboard HTTP 200. `demo-check` PASS; `node --import tsx --test prisma/demo.test.ts prisma/demo.integration.test.ts` 7/7 başarılı. Entegrasyon testi salt okunur transaction kullanır.
- Konteyner durmuşsa `docker start aidat-takip-postgres` ile mevcut veriyi kullanın. Yeni volume, reset veya genel seed çalıştırmayın. Production'a bağlanılmadı; dış bildirim gönderilmedi. Lint/typecheck/build çalıştırılmadı; kaynak değişikliği yapılmadan yerel çalışma doğrulandı.

## Coolify demo işletimi

2026-10-19 güncellemesi: Yalnız demo uygulaması `codex/manual-push-demo-20261019` dalına/sabit 6b1e1c2 commit'ine alındı; auto deploy **Manual deployments only**. Runtime APP_ORIGIN/VAPID_* demo için yapılandırıldı, buildtime kapalı; PostgreSQL 17.7 ve yeni migration applied doğrulandı. Sonraki belge push'u runtime'ı değiştirmez. Yeni demo kodu için commit sabiti bilinçli güncellenip yalnız demo Deploy seçilir; main/Özlüce dağıtımı bu kapsamda değildir. Test daveti kullanıcının iPhone Ana Ekran uygulamasında kabul edilmelidir. Bildirim izni verildi beyanı tek başına cihaz kaydı veya teslim kanıtı sayılmaz; alıcı devices ve delivery sonucu ayrı kontrol edilir. [PUSH_GUIDE](PUSH_GUIDE.md), [DEPLOYMENT](DEPLOYMENT.md).

Bu bölüm ADR-0005 ve 2026-09-15 tarihli son dağıtım kaydını esas alır; 2026-10-19 belge eşlemesinde canlı ortam yeniden sorgulanmadı. Coolify PostgreSQL sürümü TBD; yerel 15.19 doğrulaması canlı sunucuya aktarılmaz. [DEPLOYMENT](DEPLOYMENT.md).

- Canonical demo: [https://aidat.spormanage.com.tr](https://aidat.spormanage.com.tr); uygulama `spormanage-aidat-demo`, DB `spormanage_aidat_demo`.
- Özlüce production: [https://aidat.ozlucespor.com](https://aidat.ozlucespor.com); uygulama ve `ozlucepay` DB'si demo ortamından ayrıdır.
- İki uygulama aynı fiziksel PostgreSQL kaynağını paylaşır; bir uygulamanın bağlantı URL'sini diğer DB'ye yöneltme. `RUN_SEED=false` kalmalıdır.
- `main` push'u iki uygulamada da webhook dağıtımı başlatabilir. Son commit, migration sonucu, container başlangıcı ve her iki `/login` yanıtı kontrol edilmelidir.
- Demo doğrulaması: TLS/HTTP 200, broşür ADMIN login, 60 toplam/54 aktif sporcu, 6 grup ve 6 antrenör. Özlüce'de aynı hesap aktif olmamalıdır.
- Secret değerlerini terminal çıktısına, deployment loguna veya repository belgesine yazma. Parola ve bağlantı secret'ı rotasyonunda DB rolü ile iki runtime URL'si aynı işlemde güncellenmelidir.
- Domain geçişi başarısızsa yeni demo doğrulanmadan Özlüce hesabını yeniden etkinleştirme veya production DB verisini değiştirme. Güncel karar: [ADR-0005](../50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md).

### Güncel broşür demo erişimi

- Ortak `demo@spormanage.com.tr` hesabı son kayıtta ayrı sentetik demo DB'sinde aktif ADMIN'dir; Özlüce DB'sindeki aynı hesap pasiftir. Parola yalnız kullanıcı tarafından dağıtılır.
- QR/link hedefi `aidat.spormanage.com.tr` yalnız demo uygulamasına, `aidat.ozlucespor.com` Özlüce uygulamasına aittir. Kullanılmayan `www` varyantı ADR-0005 geçişinde kaldırılmıştır; eski DNS uyarısı güncel kurulum tarifi değildir.
- Demo ADMIN sentetik veriyi değiştirebilir; kullanım süresi ve parola rotasyon/iptal tarihi TBD. [ADR-0004](../50-decisions/ADR-0004-brosur-demo-admin-hesabi.md) Superseded; geçerli dağıtım kararı ADR-0005'tir.

## Komut envanteri — tanımlar ve son doğrulama

| Amaç | Repository’de tanımlı komut | Etki |
|---|---|---|
| Geliştirme | `npm run dev` | Next port 3077 |
| Derleme | `npm run build` | Build çıktısı oluşturur |
| Başlatma | `npm start` | Next start; yapılandırmaya göre çalışma |
| Prisma istemcisi | `npm run db:generate` | Üretilen dosyaları değiştirir |
| Şema/migration | `npm run db:push`, `npm run db:migrate` | Veritabanını değiştirir; inceleme komutu değildir |
| Örnek veri | `npm run db:seed`, `db:sample`, `db:notes`, `db:groups` | Veri yazar |
| Warmup | `npm run warmup` | Script 3000 adresini kullanır; dev 3077 ile uyuşmaz |
| Sunum yenileme | `npm run demo:refresh-presentation [-- --dry-run]` | Yalnız yerel 5477/aidat_takip hedefinde beklenen eski görünen değerleri transaction ile yeniler |
| Rapor testi | `npm run report:test` | Ortak hesaplama ve XLSX üretimi için 4 test |

Komut tanımları kaynakla doğrulandı. Aşağıdaki yerel çalıştırma kaydı yalnızca belirtilen komutlar için başarı kanıtıdır; diğerlerinin çalışırlığı TBD. README’nin eksik .env.example kopyalama talimatı kullanılmadan önce CR-001 çözülmeli.

## Sağlık ve sorun giderme

`/api/health` veritabanı sorgusu ve tablo sayımları yapar; middleware kimlik doğrulaması gerekir. Uç içindeki servis operational değerleri sabittir. Yetkisiz 401 tüm servislerin bozuk olduğunu göstermez. [OBSERVABILITY](OBSERVABILITY.md).

Operasyon sorumlusu ve production erişim prosedürü TBD. Doğrulanmış mevcut production hedefi ve dağıtım kaydı [DEPLOYMENT](DEPLOYMENT.md) içindedir.

## Tarihsel Coolify production işlemleri — 2026-09-15, ADR-0005 öncesi

Aşağıdaki kayıt ortak domain/production ADMIN geçiş aşamasına aittir. Güncel işletimde yukarıdaki Coolify demo bölümünü kullanın; burada yer alan aynı uygulama ve `www` ifadeleri geçersizleşmiş tarihsel durumdur.

- Canonical broşür erişimi: [https://aidat.spormanage.com.tr](https://aidat.spormanage.com.tr). Korunan mevcut adres: [https://aidat.ozlucespor.com](https://aidat.ozlucespor.com).
- Kaynak: canonical GitHub repository `celebigilfatih/aidattakip`, branch `main`, Dockerfile build, port 3000.
- `main` push webhook’u otomatik deployment başlatır. Aynı push sonrasında ayrıca `Redeploy` kullanmak yinelenen dağıtım oluşturur; yalnızca webhook başlamazsa manuel deployment seçilmelidir.
- Startup önce `prisma migrate deploy` çalıştırır. Production’da `RUN_SEED` yoktur; genel seed veya demo seed çalıştırılmamalıdır.
- Production kullanıcı/rol/parola değişikliği ayrı güvenlik onayı olmadan yapılmaz. `SEED_ADMIN_*` adlandırma/rol çelişkisi CR-016 kapsamında açıktır.
- Dağıtım sonrası en az `/login` HTTP 200, SporManage marka görünümü, beklenmeyen örnek parola görünmemesi ve Coolify deployment başarı durumu kontrol edilir.
- Hata halinde eski image’a dönmeden önce yeni migration olup olmadığı kontrol edilir. Bu kurulumda migration dosyası değişmedi; doğrulanmış otomatik rollback prosedürü TBD.
- Veritabanı restore veya demo seed dağıtım doğrulaması değildir; mevcut production verisini değiştireceği için bu prosedüre dahil değildir.

### Tarihsel broşür demo erişimi — ADR-0004

- Ortak hesap: `demo@spormanage.com.tr`, aktif ADMIN. Parola yalnızca kullanıcı tarafından dağıtılır; repository’de tutulmaz.
- Hesap oluşturma ve yetki kararı [ADR-0004](../50-decisions/ADR-0004-brosur-demo-admin-hesabi.md) kapsamındadır. Ortak ADMIN hesabı production verisini değiştirebilir; kullanım süresi ve rotasyon/iptal tarihi TBD.
- 2026-09-15 tarihinde `https://aidat.spormanage.com.tr/login` geçerli TLS ile HTTP 200 verdi; canlı login `/dashboard` yönlendirmesi ve ADMIN görünümüyle başarılı oldu, test oturumu kapatıldı.
- Broşür QR/link hedefi aynı Coolify uygulamasına bağlıdır. `aidat.ozlucespor.com` adresi korunur ve HTTP 200 vermeye devam eder. Coolify’ın otomatik eklediği `www.aidat.spormanage.com.tr` varyantında DNS eşleşmesi yoktur ve yayınlanan broşür bu adresi kullanmaz. CR-018 kapatıldı.

## Tarihsel yerel çalıştırma — 2026-09-14

- Node.js v24.15.0 ve npm 11.12.1 mevcut ortamda doğrulandı; bunlar yeni zorunlu sürüm seçimi değildir.
- `npm ci --cache /tmp/aidat-npm-cache --no-audit --no-fund --fetch-retries=0 --fetch-timeout=20000` başarılı; kilit dosyası değişmeden 618 paket kuruldu.
- `npm run db:generate` başarılı; Prisma Client 6.17.1 oluşturuldu. Veritabanı şeması/verisi değişmedi.
- `npm run dev -- --hostname 127.0.0.1` ile geliştirme sunucusu 3077 portunda başlatıldı; ilk sandbox bind denemesi EPERM verdi, izinli çalıştırma başarılı oldu.
- [Giriş ekranı](http://127.0.0.1:3077/login) HTTP 200 döndürdü; tarayıcıda giriş formu görüldü. Bu URL yalnızca sunucu çalışırken bu bilgisayarda kullanılabilir.
- Mevcut yerel ayarlar ana ve lisans PostgreSQL bağlantısını localhost:5477 üzerinden bekliyor. Projeye ait konteyner/volume bulunmadı. Yeni boş DB+başlangıç kullanıcısı, mevcut SQL yedeğinden yerel kurulum veya yalnızca arayüz seçenekleri kullanıcıya sunuldu; yanıt bekleniyor.
- Giriş, DB bağlantısı ve sporcu/aidat işlemleri doğrulanmadı. Migration, seed, restore ve deploy çalıştırılmadı.
- Next `swcMinify` için tanınmayan config uyarısı verdi; Prisma package.json ayarı ve tarayıcı veri paketleri için güncellik uyarıları var. Başlatmayı engellemediler; otomatik sürüm/config değişikliği yapılmadı.
- Kaynaktaki auth log riskleri devam ediyor; bu oturumun terminal çıktısında ilgili log satırları filtrelendi. Bu, ADR-0001 uygulaması veya kalıcı kod düzeltmesi değildir.

Sunucu bu oturumda açık bırakıldı; sonraki oturumda 3077 portu kontrol edilmeden ikinci sunucu başlatılmamalı.

## Tarihsel temiz yerel veritabanı ve yönetici — 2026-09-14

Önceki DB tercihi bekleme durumu kapandı: kullanıcı başlangıç hesabının oluşturulmasını onayladı. Yalnızca yeni yerel ortam hazırlandı; mevcut SQL dökümü içe aktarılmadı.

- Konteyner: `aidat-takip-postgres`; imaj: `postgres:15-alpine`; volume: `aidat_takip_postgres_data`; bağlantı: yalnızca `127.0.0.1:5477` → `5432`.
- Kimlik bilgileri mevcut .env’den çalışma anında okundu; dosya değiştirilmedi ve değerler belgelere kopyalanmadı.
- Yeni `aidat_takip` DB’sinde `./node_modules/.bin/prisma migrate deploy` başarılı: mevcut 10 migration uygulandı. Migration dosyaları ve schema.prisma değişmedi.
- Girişin mevcut yerel lisans bağlantısı için `license_db` oluşturuldu; `scripts/init-license-db.sql` mevcut haliyle yalnızca bu yeni yerel DB’ye uygulandı. Dış lisans servisine erişilmedi.
- Yalnızca mevcut demo yönetici e-postasıyla aktif ADMIN hesabı oluşturuldu. Parola mevcut giriş koduyla aynı bcrypt cost 12 biçiminde hash’lendi; hesap varsa üzerine yazmayan işlem kullanıldı.
- Genel `prisma/seed.ts` çalıştırılmadı: SHA-256 parola hash’i girişteki bcrypt ile uyumsuz ve ayrıca 40 örnek sporcu/diğer örnek verileri oluşturuyor. Kalıcı seed düzeltmesi yapılmadı; CR-015.
- Başlangıçta sporcu sayısı 0 doğrulandı. Örnek sporcu/veli/aidat verisi eklenmedi.
- Gerçek HTTP kontrolleri: login 200/ADMIN, auth/me 200/ADMIN, health 200/healthy, students GET 200, payments GET 200. Token/çerez değerleri çıktıya yazılmadı. Bu kontroller ödeme/kayıt mutasyon testleri değildir.
- Yerel uygulama 3077 portunda ve PostgreSQL konteyneri açık bırakıldı. Sonraki kullanımda mevcut servisler kontrol edilmeli; yeni konteyner/volume oluşturulmamalı. Konteyner durmuşsa `docker start aidat-takip-postgres` ile mevcut veri korunarak başlatılabilir.

Üretim kurulumu, yedek/restore, veri dönüşümü veya Proposed güvenlik kararları bu onay kapsamında uygulanmadı. Lint/typecheck/production build çalıştırılmadı; uygulama kodu değişmedi.

## Tarihsel tam futbol demosu — 2026-09-15

Mevcut yerel DB üzerinde kullanıcı onayıyla kuruldu. Kullanıcı/lisans ve özel ayarlar korundu; kulüp görünen adı SporManage olarak ayarlandı. Detaylar, hesap e-postaları ve gösterim senaryoları [DEMO_GUIDE](DEMO_GUIDE.md); sonuçlar [DEMO_VALIDATION](../30-quality/DEMO_VALIDATION.md).

| Komut | Etki |
|---|---|
| `npm run demo:seed -- --dry-run` | Salt okunur hedef/çakışma ve eksik kayıt planı |
| `npm run demo:seed` | Tek transaction ile yalnızca eksik demo satırları; ilk oluşturulan personel parolaları yalnızca çıktıda |
| `npm run demo:refresh-people [-- --dry-run]` | Eski “Demo” sporcu/veli/teknik kadro adlarını kurgusal gerçekçi isimlerle günceller; elle özelleştirilmiş adları korur |
| `npm run demo:refresh-brand [-- --dry-run]` | Önceki varsayılan/demo kulüp adını SporManage olarak günceller; özel ad varsa yazmadan durur |
| `npm run demo:refresh-presentation [-- --dry-run]` | Eski görünen marka, şube/grup, personel/e-posta ve işlem metinlerini SporManage sunumuna taşır; özel alan/parolaları korur |
| `npm run demo:check` | Salt okunur ilişkiler/fixture ve yoklama analitiği kontrolü |
| `npm run demo:test` | DB bağlantısı olmadan 6 test |
| `npm run demo:test:db` | Kurulu demoda PostgreSQL READ ONLY transaction içinde tekrar çalıştırma ve satır/parola koruma testi |

Referans tarih ilk demo şubesinde korunur; takvimi yeni güne taşımak için yeniden seed çalıştırılmaz. Gerçek veri veya SQL yedeği içe aktarılmadı. Fark/çakışma halinde mevcut kayıtları silmeyin veya reset komutu çalıştırmayın; rehberdeki koruma davranışını inceleyin. Genel `db:seed` yerine bu görev için `demo:seed` kullanılır; CR-015 açık kalır.

## Tarihsel SporManage sunum ve rapor çalıştırması — 2026-09-15

- Sunum yenilemesi dry-run, gerçek transaction ve ikinci sıfır değişiklik çalıştırmasıyla doğrulandı; parola hashleri değişmedi.
- Geliştirme sunucusu kapatıldı, `npm run clean` ile `.next` temizlendi ve `npm run build` başarıyla tamamlandı. Ağ erişimi gerektiren Google font importu kaldırıldı; uygulama sistem font yığını kullanır. Eski `swcMinify` seçeneği Next 15 yapılandırmasından kaldırıldı.
- Uygulama tekrar `127.0.0.1:3077` üzerinde geliştirme modunda başlatıldı. Yeni sunucu açmadan önce port dinleyicisi kontrol edilmelidir.
- Rapor Excel’i ADMIN/ACCOUNTING rolüyle indirilir. PDF için rapor ekranındaki `Yazdır / PDF Kaydet` düğmesi kullanılır; API’de `format=pdf` bilinçli olarak `410` döndürür.
- Lint kurulumu bu çalışmaya dahil değildir; mevcut `next lint` etkileşimli kurulum ister. CR-011/B-008 açık kalır.
