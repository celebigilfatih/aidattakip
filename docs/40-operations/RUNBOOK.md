# Runbook

Last updated: 2026-09-15. Komut envanteri kaynaklıdır; çalışma zamanı sonuçları tarihli kayıtlarda ayrıca belirtilir.

## Ortam ve giriş kaynakları

[package.json](../../package.json), [Dockerfile](../../Dockerfile), [Compose](../../docker-compose.yml), [startup](../../scripts/startup.sh). Docker Node 20 Alpine tanımlar; yerelde zorunlu Node sürümü için ayrı pin bulunmadı. README’nin Node 18+ iddiası bu oturumda doğrulanmadı. `DATABASE_URL` PostgreSQL bağlantısı gerekir; değerler belgelerde tutulmaz.

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

Operasyon sorumlusu, üretim hostu, erişim prosedürü, doğrulanmış müdahale komutları TBD. Deploy/restore/migration bu bağlam görevinde çalıştırılmaz.

## Yerel çalıştırma — 2026-09-14

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

## Temiz yerel veritabanı ve yönetici — 2026-09-14

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

## Tam futbol demosu — 2026-09-15

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

## SporManage sunum ve rapor çalıştırması — 2026-09-15

- Sunum yenilemesi dry-run, gerçek transaction ve ikinci sıfır değişiklik çalıştırmasıyla doğrulandı; parola hashleri değişmedi.
- Geliştirme sunucusu kapatıldı, `npm run clean` ile `.next` temizlendi ve `npm run build` başarıyla tamamlandı. Ağ erişimi gerektiren Google font importu kaldırıldı; uygulama sistem font yığını kullanır. Eski `swcMinify` seçeneği Next 15 yapılandırmasından kaldırıldı.
- Uygulama tekrar `127.0.0.1:3077` üzerinde geliştirme modunda başlatıldı. Yeni sunucu açmadan önce port dinleyicisi kontrol edilmelidir.
- Rapor Excel’i ADMIN/ACCOUNTING rolüyle indirilir. PDF için rapor ekranındaki `Yazdır / PDF Kaydet` düğmesi kullanılır; API’de `format=pdf` bilinçli olarak `410` döndürür.
- Lint kurulumu bu çalışmaya dahil değildir; mevcut `next lint` etkileşimli kurulum ister. CR-011/B-008 açık kalır.
