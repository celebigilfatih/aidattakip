# Deployment

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Mevcut dosya modeli

[Dockerfile](../../Dockerfile): çok aşamalı Node 20 Alpine build, npm ci, Prisma generate, Next standalone; runtime non-root kullanıcı ve PostgreSQL client paketini içerir. [startup](../../scripts/startup.sh): önce `prisma migrate deploy`; yalnızca `RUN_SEED=true` ise seed; sonra `node server.js`.

[Compose](../../docker-compose.yml): PostgreSQL 15 Alpine ve frontend servisleri; host 5477 → PostgreSQL 5432, host 3177 → uygulama 3000. DB volume mevcut. Ayrı lisans DB bağlantısı tanımlanıyor; gerçekten kurulmuş olduğu doğrulanmadı. Üretim hostu, domain, TLS/proxy, müşteri başına topoloji ve işletim sahibi TBD. Compose dosyası üretimde fiilen kullanılan modelin kanıtı değildir.

## Açık bağımlılıklar

Compose `init.sql` dosyasına referans veriyor fakat çalışma ağacında yok. Dockerfile .npmrc kopyalıyor; secret etkisi incelenmeden içeriği belgelere taşınmamalı. [CR-006/007](../20-execution/CHANGE_REQUESTS.md).

[deploy-production.sh](../../deploy-production.sh) durdurma/yeniden build ile başlatma komutları içeriyor; bu dosyanın varlığı güncel ve güvenle çalıştırılabilir prosedür olduğunu göstermez. Bu oturum çalıştırılmadı.

## Yayın doğrulaması ve geri alma

Build, migration ve sağlık kontrolünün çalışma zamanı sonucu TBD. Yedek/restore kanıtı [BACKUP_RECOVERY](BACKUP_RECOVERY.md) içinde eksik olarak kayıtlı. Geri alma komutu ve kabul edilmiş dağıtım modeli değişikliği yok. Model, migration ve operasyon değişiklikleri açık onay gerektirir.
