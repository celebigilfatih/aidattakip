# Bounded Contexts

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

Bu harita mevcut dosya ve model sorumluluklarının betimlemesidir; servis ayırma, veri sahipliği politikası veya DDD geçiş kararı değildir. Hepsi aynı uygulama içinde çalışır.

| Mantıksal alan | Modeller / kaynak | Mevcut bağlantılar |
|---|---|---|
| Sporcu yönetimi | Student, Parent, GroupHistory; [students](../../src/app/api/students/route.ts) | Grup, şube, not, ödeme ve yoklama |
| Aidat | FeeType, Payment; [payments](../../src/app/api/payments/route.ts) | Sporcu, grup, oluşturan kullanıcı |
| Organizasyon | Group, Branch, Trainer, Field, Location; [şema](../../prisma/schema.prisma) | Sporcu ve antrenman |
| Antrenman/yoklama | Training, TrainingSession, TrainingException, Attendance, AttendanceAnalytics | Sporcu, grup, saha/konum |
| İletişim | Note, Notification; [notifications](../../src/app/api/notifications/route.ts) | Sporcu, veli, kullanıcı |
| Erişim ve ayarlar | User, UserGroupPermission, SystemSetting | Diğer modüllerde rol/grup kontrolleri |
| Uygulama lisansı | [license](../../src/lib/license.ts) | Ayrı bağlantı; giriş akışında kontrol |

Şema ilişkileri ortak veritabanı üzerinden kuruluyor; alanlar arası özel mesajlaşma sözleşmesi bu incelemede bulunmadı. Takım/sorumlu sahipliği ve hedef sınırlar TBD. Yeni sınır veya dağıtım değişikliği ADR ve açık onay gerektirir.
