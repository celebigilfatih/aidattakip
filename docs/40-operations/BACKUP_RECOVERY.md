# Backup and Recovery

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Demo dağıtımı kaydı — 2026-09-15

`spormanage_aidat_demo`, mevcut Coolify PostgreSQL kaynağında Özlüce `ozlucepay` DB'sinden ayrı mantıksal veritabanıdır. İlk kurulumda yerel `aidat_takip` kaynağından owner/ACL taşımayan custom-format `pg_dump` alındı, SHA-256 checksum doğrulandı ve boş demo DB'ye geri yüklendi. Restore sonrası 10 migration ile beklenen ana kayıt sayıları doğrulandı; geçici aktarım dosyaları kapanışta silinir.

Bu ilk aktarım, zamanlanmış backup veya kanıtlanmış olağanüstü durum prosedürü değildir. Demo için yedek sıklığı, retention, RPO/RTO ve izole restore tatbikatı TBD'dir. Paylaşılan fiziksel PostgreSQL servisindeki arıza iki uygulamayı da etkileyebilir. Geri yükleme hedefi açıkça `spormanage_aidat_demo` olarak doğrulanmadan komut çalıştırılmamalı; `ozlucepay` hedeflenmemelidir.

## Mevcut uygulama

[backup API](../../src/app/api/settings/backup/route.ts) yalnızca ADMIN için GET export yapar. PostgreSQL’de `format=auto` veya `sql` ile pg_dump dener, başarısız olursa JSON’a düşer; `format=json` doğrudan JSON verir. SQLite dalı kodda var ancak mevcut Prisma datasource PostgreSQL; bu dal SQLite desteğinin doğrulandığı anlamına gelmez.

## Kapsam sınırları

JSON export 12 koleksiyonu içerir: users, students, parents, groups, feeTypes, payments, notes, trainings, trainingSessions, attendances, notifications, groupHistories. [20 modelli şemaya](../../prisma/schema.prisma) göre Trainer, Branch, UserGroupPermission, TrainingException, Field, Location, AttendanceAnalytics ve SystemSetting eksiktir. Parent/Student çoktan çoğa bağlantılarını yeniden kuracak ilişkiler bu yalın findMany çağrılarında ayrıca alınmıyor. users içinde alan sınırlaması yok; parola hash’leri dahil hassas veriler için koruma kararı gerekir.

pg_dump ana DATABASE_URL veritabanını hedefler; ayrı lisans DB kapsamı ayrıca ele alınmalı. JSON çıktı tam ve doğrulanmış geri yükleme yedeği sayılmaz. Kaynakta autoBackup/backupFrequency ayarları olması çalışan bir scheduler kanıtı değildir; zamanlanmış yedek işinin çalışma kanıtı yok.

## Recovery

Geri yükleme API’si veya uçtan uca doğrulanmış prosedür bu incelemede bulunmadı. Restore komutu, saklama süresi, şifreleme/erişim yöntemi, RPO/RTO ve sorumlular TBD. İzole geri yükleme testi önerilir; canlı veriye restore veya retention kararı açık onay gerektirir. [CR-005](../20-execution/CHANGE_REQUESTS.md).
