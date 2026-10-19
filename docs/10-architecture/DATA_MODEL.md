# Data Model

Last updated: 2026-10-19. Durum: Mevcut şema ve yerelde uygulanan migration kaydı; canlı migration bu görevde yapılmadı.

## Asıl kaynak

[prisma/schema.prisma](../../prisma/schema.prisma): PostgreSQL datasource, `DATABASE_URL`, Prisma istemcisi. İlk 20 model: `User`, `Student`, `Parent`, `Group`, `GroupHistory`, `FeeType`, `Payment`, `Note`, `Training`, `TrainingSession`, `Attendance`, `Notification`, `Trainer`, `Branch`, `UserGroupPermission`, `TrainingException`, `Field`, `Location`, `AttendanceAnalytics`, `SystemSetting`. Lisans kayıtları bu şemada değil; [lisans servisi](../../src/lib/license.ts) ve [lisans SQL’i](../../scripts/init-license-db.sql) ayrı kaynaklardır.

## Çekirdek ilişkiler

ADR-0006 ile model sayısı **25** oldu. Yukarıdaki ilk 20 modele NotificationRecipient, PushInvite, RecipientSession, PushDevice ve PushDelivery eklendi. Recipient kind STAFF/PARENT/STUDENT ve tek bir kimlik ilişkisi DB CHECK ile sınırlandırılır; bu yeni bir personel rolü değildir. Davet/oturum token'ları hash olarak; cihaz endpoint/anahtarları yalnız sunucu erişiminde tutulur. Cihaz oturum özeti/son kullanma ile ilişkilidir. Notification recipientId/targetDeviceId ve delivery ilişkileri taşır; delivery notification/device çifti benzersizdir.

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

[migrations](../../prisma/migrations) içinde 11 tarihli `migration.sql` ve ayrıca `remove_location.sql` bulunur. `20261019120000_add_manual_web_push` kullanıcı onayıyla yerel aidat_takip ve yalnız SporManage spormanage_aidat_demo DB'sine uygulandı; mevcut kayıtlar korundu. Demo öncesi yedek alındı, migration applied ve 60 sporcu/300 ödeme sonrasında doğrulandı. Özlüce DB'sine uygulanmadı. Standalone SQL dosyası çalıştırılmadı. [startup](../../scripts/startup.sh) `prisma migrate deploy` çalıştırır. İlgisiz SystemSetting.updatedAt default farkı bu migration'a dahil edilmedi.

## Açık kararlar

Para hassasiyeti, fazla/negatif tahsilat, hareket geçmişi, düzeltme ve retention gereksinimleri TBD. ADR-0006 ilk aşama alıcı/push modeli onaylıdır; mali veri modeli bu görevde değişmedi. [CR-009](../20-execution/CHANGE_REQUESTS.md). PUSH kanalı ve PROCESSING/ACCEPTED durumları eklendi; ACCEPTED görüntülenme/okunma kanıtı değildir.
