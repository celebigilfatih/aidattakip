# Backup and Recovery

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Mevcut uygulama

[backup API](../../src/app/api/settings/backup/route.ts) yalnızca ADMIN için GET export yapar. PostgreSQL’de `format=auto` veya `sql` ile pg_dump dener, başarısız olursa JSON’a düşer; `format=json` doğrudan JSON verir. SQLite dalı kodda var ancak mevcut Prisma datasource PostgreSQL; bu dal SQLite desteğinin doğrulandığı anlamına gelmez.

## Kapsam sınırları

JSON export 12 koleksiyonu içerir: users, students, parents, groups, feeTypes, payments, notes, trainings, trainingSessions, attendances, notifications, groupHistories. [20 modelli şemaya](../../prisma/schema.prisma) göre Trainer, Branch, UserGroupPermission, TrainingException, Field, Location, AttendanceAnalytics ve SystemSetting eksiktir. Parent/Student çoktan çoğa bağlantılarını yeniden kuracak ilişkiler bu yalın findMany çağrılarında ayrıca alınmıyor. users içinde alan sınırlaması yok; parola hash’leri dahil hassas veriler için koruma kararı gerekir.

pg_dump ana DATABASE_URL veritabanını hedefler; ayrı lisans DB kapsamı ayrıca ele alınmalı. JSON çıktı tam ve doğrulanmış geri yükleme yedeği sayılmaz. Kaynakta autoBackup/backupFrequency ayarları olması çalışan bir scheduler kanıtı değildir; zamanlanmış yedek işinin çalışma kanıtı yok.

## Recovery

Geri yükleme API’si veya uçtan uca doğrulanmış prosedür bu incelemede bulunmadı. Restore komutu, saklama süresi, şifreleme/erişim yöntemi, RPO/RTO ve sorumlular TBD. İzole geri yükleme testi önerilir; canlı veriye restore veya retention kararı açık onay gerektirir. [CR-005](../20-execution/CHANGE_REQUESTS.md).
