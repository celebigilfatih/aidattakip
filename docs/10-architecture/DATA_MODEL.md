# Data Model

## ADR-0009 additive modeller — 2026-10-20

37 model/18 migration. Family + Student.familyId; Season/SeasonEnrollment (seasonId/studentId unique), Payment.seasonEnrollmentId/seasonInstallment unique kaynak; Prospect/TrialVisit/ProspectActivity (tek convertedStudentId ve aday/seans unique); AttentionPolicy/FollowUp/FollowUpActivity (şube politikası, sporcu/neden unique). İlişkiler Restrict; yeni alanlar eski satırlarda NULL, backfill/silme/retention yok. Finansal Float ve mevcut veli satırları korunur. Beş migration yalnız yerelde applied; demo sonucu ayrıca kaydedilecek. [ADR-0009](../50-decisions/ADR-0009-aile-sezon-aday-takip.md).

## ADR-0008 arşiv alanı — 2026-10-20

28 model/13 migration. Kullanıcı ADR-0008 ve yalnız demo migration/yayınını onayladı. StaffSummaryRule.archivedAt DateTime? NULL mevcut/yeni kullanılabilir kural, tarihli arşivdir; archivedAt doluysa enabled=false CHECK constraint. 20261020100000_archive_staff_summary_rules yerel5477/aidat_takip üzerinde applied; diğer alanlar/ilişkiler ve geçmiş değişmedi. Aynı migration yalnız demo7f5710c startup logunda başarıyla applied doğrulandı;13 migration ve seed atlandı, yeni archivedAt API alanı NULL. DROP/DELETE/backfill yok. [ADR-0008](../50-decisions/ADR-0008-aidat-ozeti-kurallarini-arsivleme.md).

## ADR-0007 ek modeli

28 model/12 migration: NotificationRecipient staffPushEnabled ve ana cihaz ilişkisi; StaffSummaryRule/Recipient/Run ile haftalık takvim, seçili mali alıcılar ve benzersiz ruleId/scheduledAt çalışması. Notification isFeeSummary/summaryBranchId/summaryRunId alanları ve run/alıcı benzersizliği eklenir. 20261019150000_staff_notifications_summary yerelde applied; eski kayıtlar silinmedi. Veli/sporcu cihazları ve kullanılmamış davetler pasifleştirildi. Bildirim/çalışma geçmişine otomatik silme yok. Demo uygulaması henüz bekler.

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
