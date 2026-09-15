# Deployment

Last updated: 2026-09-15. Durum: Repository kaynakları ve tarihli Coolify çalışma zamanı doğrulaması birlikte belgelenmiştir.

## Coolify production kurulumu — 2026-09-15

Kullanıcının verdiği Coolify projesindeki mevcut production kaynakları korunarak uygulama kuruldu.

| Alan | Doğrulanan değer |
|---|---|
| Coolify project/environment | `Aidat_Takip` / `production` |
| Application resource | `rccowokc40kkgss0s0c4440c` |
| Canonical Git source | `celebigilfatih/aidattakip`, `main`, `HEAD` |
| Build/runtime | Repository `Dockerfile`, Next standalone, container port `3000` |
| Public URLs | [aidat.spormanage.com.tr](https://aidat.spormanage.com.tr) (broşür/canonical), [aidat.ozlucespor.com](https://aidat.ozlucespor.com) (korunan mevcut adres) |
| PostgreSQL resource | Mevcut özel Coolify kaynağı `f4gwswcwo48cww88c80s8sg8`; mevcut `ozlucepay` veritabanı |

`833a17d` commit’i GitHub’a gönderildi. Push webhook’u ve aynı commit için ayrıca başlatılan manuel tekrar dağıtım başarıyla tamamlandı; son iki kayıt aynı kaynak içeriğini çalıştırdı. Rolling update yeni konteyneri başlattıktan sonra önceki konteyneri kaldırdı. `/login` dış URL’den HTTP 200 döndürdü ve SporManage arayüzü tarayıcıda doğrulandı.

Broşürde kullanılan `aidat.spormanage.com.tr`, kullanıcının 2026-09-15 tarihli açık onayıyla aynı Coolify uygulamasına ikinci HTTPS domain olarak eklendi. Coolify DNS kontrolü eşleşti; yapılandırmayı uygulayan `3ebc3ef` manuel deployment’ı 10 saniyede başarıyla tamamlandı. Yeni domain’in geçerli TLS ile `/login` HTTP 200 verdiği, SporManage giriş ekranını açtığı ve ortak ADMIN hesabını `/dashboard` sayfasına yönlendirdiği doğrulandı; test oturumu kapatıldı. Önceki `aidat.ozlucespor.com` adresi korunmuştur ve aynı kontrolde HTTP 200 vermeye devam etmiştir. Coolify’ın otomatik eklediği `www.aidat.spormanage.com.tr` varyantı için DNS eşleşmesi yoktur; broşür ve canonical erişim bu `www` adresini kullanmaz.

Startup mevcut 10 migration için `prisma migrate deploy` çalıştırır. `RUN_SEED` ayarlanmadığından genel seed çalışmadı; mevcut production verisi, kullanıcıları, rolleri, parolaları ve veritabanı korunmuştur. SQL restore, demo seed, şema/migration değişikliği veya yıkıcı veri işlemi yapılmadı.

Yerel Docker doğrulamasında build aşamasında `DATABASE_URL` bulunmadığında Prisma istemcisine `undefined` datasource gönderen hata düzeltildi. Runtime’da tanımlı bağlantı yine Prisma tarafından kullanılır; production veritabanı secret’ı image build için gerekli değildir.

### Açık production riskleri

- Coolify build logu, secret nitelikli bazı environment değerlerinin build argümanı olarak sunulduğunu uyardı. Değerler bu belgeye veya komut çıktısına alınmadı. Buildtime erişimini kaldırma ve secret rotasyonu [CR-007](../20-execution/CHANGE_REQUESTS.md) ile birlikte güvenlik onayı gerektirir.
- `SEED_ADMIN_*` adıyla tanımlı başlangıç kimliği mevcut veritabanında aktif `TRAINER` rolüne bağlıdır; ayrıca ayrı bir aktif ADMIN vardır. Hiçbir rol/parola değiştirilmedi. Çelişki [CR-016](../20-execution/CHANGE_REQUESTS.md) içinde izlenir.
- Coolify kaynak görünen adı eski repository adını taşıyor ve panelde “configuration changes not applied” bildirimi kalıyor. Kaydedilen canonical kaynak, yeniden yükleme ve dağıtım loguyla doğrulandı; bilinmeyen panel farkı sıfırlanmadı.
- Uygulama için Coolify healthcheck yapılandırması doğrulanmadı. `/api/health` kimlik doğrulaması istediği ve tam bağımlılık sağlığı vermediği için public readiness kontrolü olarak kullanılamaz; [CR-011](../20-execution/CHANGE_REQUESTS.md).
- Coolify veritabanı yedeği veya restore denemesi bu kurulumda doğrulanmadı; [BACKUP_RECOVERY](BACKUP_RECOVERY.md).
- Coolify’ın otomatik eklediği `www.aidat.spormanage.com.tr` varyantı DNS ile eşleşmiyor. Broşür `www` kullanmaz; ana `aidat.spormanage.com.tr` TLS/HTTP/login kontrollerini geçmiştir. Önceki broşür domain uyuşmazlığı [CR-018](../20-execution/CHANGE_REQUESTS.md) kapsamında kapatıldı.

## Broşür demo hesabı — 2026-09-15

Kullanıcının açık onayıyla `demo@spormanage.com.tr` hesabı mevcut production veritabanında aktif ADMIN olarak oluşturuldu. E-posta önceden boşta doğrulandı; diğer kullanıcıların üzerine yazılmadı. Parola bcrypt cost 12 hash olarak saklandı, repository’ye yazılmadı. Canlı login `/dashboard` yönlendirmesi ve ADMIN menüleriyle geçti; doğrulama oturumu kapatıldı. Yetki kararı ve sonuçları [ADR-0004](../50-decisions/ADR-0004-brosur-demo-admin-hesabi.md) içindedir.

## Mevcut dosya modeli

[Dockerfile](../../Dockerfile): çok aşamalı Node 20 Alpine build, npm ci, Prisma generate, Next standalone; runtime non-root kullanıcı ve PostgreSQL client paketini içerir. [startup](../../scripts/startup.sh): önce `prisma migrate deploy`; yalnızca `RUN_SEED=true` ise seed; sonra `node server.js`.

[Compose](../../docker-compose.yml): PostgreSQL 15 Alpine ve frontend servisleri; host 5477 → PostgreSQL 5432, host 3177 → uygulama 3000. DB volume mevcut. Ayrı lisans DB bağlantısı tanımlanıyor; gerçekten kurulmuş olduğu doğrulanmadı. Üretim hostu, domain, TLS/proxy, müşteri başına topoloji ve işletim sahibi TBD. Compose dosyası üretimde fiilen kullanılan modelin kanıtı değildir.

## Açık bağımlılıklar

Compose `init.sql` dosyasına referans veriyor fakat çalışma ağacında yok. Coolify kurulumu Compose kullanmaz. Dockerfile `.npmrc` kopyalıyor; dosyada registry/auth satırı bulunmadığı biçimsel olarak doğrulandı, ancak paket yapılandırması yine image kapsamındadır. [CR-006/007](../20-execution/CHANGE_REQUESTS.md).

[deploy-production.sh](../../deploy-production.sh) durdurma/yeniden build ile başlatma komutları içeriyor; bu dosyanın varlığı güncel ve güvenle çalıştırılabilir prosedür olduğunu göstermez. Bu oturum çalıştırılmadı.

## Yayın doğrulaması ve geri alma

Production Docker build, migration başlangıcı, rolling update, dış HTTP 200 ve giriş görünümü doğrulandı. Yetkili production iş akışları ve yedek/restore kanıtı eksiktir. Geri alma için Coolify’da önceki başarılı image/deployment kaydını seçme prosedürü çalışma zamanı üzerinde denenmedi; rollback gerektiğinde veritabanı migration uyumluluğu ayrıca kontrol edilmelidir. Model, migration ve operasyon politikası değişiklikleri açık onay gerektirir.
