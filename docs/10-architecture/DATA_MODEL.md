# Data Model

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Asıl kaynak

[prisma/schema.prisma](../../prisma/schema.prisma): PostgreSQL datasource, `DATABASE_URL`, Prisma istemcisi. 20 model: `User`, `Student`, `Parent`, `Group`, `GroupHistory`, `FeeType`, `Payment`, `Note`, `Training`, `TrainingSession`, `Attendance`, `Notification`, `Trainer`, `Branch`, `UserGroupPermission`, `TrainingException`, `Field`, `Location`, `AttendanceAnalytics`, `SystemSetting`. Lisans kayıtları bu şemada değil; [lisans servisi](../../src/lib/license.ts) ve [lisans SQL’i](../../scripts/init-license-db.sql) ayrı kaynaklardır.

## Çekirdek ilişkiler

- Student → isteğe bağlı Group ve Branch; oluşturan User zorunlu. Student ↔ Parent çoktan çoğa.
- Group → ana/yardımcı Trainer, Branch ve Field; GroupHistory sporcu/grup geçmişini tutar.
- Payment → Student, FeeType ve oluşturan User. `amount` ve `paidAmount` Float; ayrı tahsilat hareket tablosu yok.
- Attendance → Student ve TrainingSession; seans/sporcu çifti benzersiz.
- UserGroupPermission → User/Group; kullanıcı/grup çifti benzersiz.
- TrainingException grup/tarih başına benzersiz; AttendanceAnalytics sporcu/ay/yıl başına benzersiz.

## Durumlar ve bütünlük

PaymentStatus: PENDING, PARTIAL, PAID, OVERDUE, CANCELLED. FeePeriod: MONTHLY, QUARTERLY, YEARLY, ONE_TIME, SEMI_ANNUAL. Ödeme yöntem enum’u bir kayıt alanıdır; banka veya kart tahsilat entegrasyonu kanıtı değildir.

Student grup/aktiflik, şube/aktiflik ve ad indeksleri; Payment sporcu/durum ve vade/durum indeksleri vardır. Cascade silme ilişkileri şemada yer alır. Saklama/silme politikası veya para hassasiyeti standardı olarak onaylanmış sayılmaz.

## Migration ve operasyon

[migrations](../../prisma/migrations) içinde 10 tarihli `migration.sql` ve ayrıca `remove_location.sql` bulunur. Standalone SQL dosyası tarihli migration dizininin parçası değildir; bu oturumda çalıştırılmadı. Gerçek veritabanıyla şema/migration uyumu TBD. [startup](../../scripts/startup.sh) `prisma migrate deploy` çalıştırır.

## Açık kararlar

Para hassasiyeti, fazla/negatif tahsilat, hareket geçmişi, düzeltme ve retention gereksinimleri TBD. Model veya migration değişikliği yapılmadı; değişiklik için açık onay gerekir. [CR-009](../20-execution/CHANGE_REQUESTS.md).
