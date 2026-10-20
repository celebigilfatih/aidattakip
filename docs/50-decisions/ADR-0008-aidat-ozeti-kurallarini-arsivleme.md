# ADR-0008 — Aidat özeti kurallarını geçmişi koruyarak kaldırma

- Status: Accepted
- Date: 2026-10-20
- Decision owner: Proje sahibi
- Approval required: StaffSummaryRule için additive archivedAt alanı/migration ve aşağıdaki arşivleme davranışı.
- Approved by / date: Kullanıcı, 2026-10-20
- Approval evidence and scope: Kullanıcı kullanılmayan kuralları Personel ve Cihazlar ekranından kaldırmayı ve gönderim geçmişini korumayı istedi. Kullanıcı somut öneriyi “ADR-0008 ve yalnız demo migration/yayınını onaylıyorum” yanıtıyla kabul etti.
- Supersedes: N/A — ADR-0007 mali rol, şube, haftalık takvim, cihaz ve kalıcı geçmiş politikası korunur.

## Bağlam ve kaynak kanıtı

[Şemada](../../prisma/schema.prisma) StaffSummaryRule yalnız enabled taşır; kapalı kural ile kaldırılmış kuralı ayıran alan yoktur. StaffSummaryRun → StaffSummaryRule ilişkisi onDelete: Restrict'tir. Geçmişi olan kural doğrudan silinemez; bu bağı kaldırmak veya run silmek kullanıcı talebine aykırıdır. enabled=false tek başına mevcut Etkinleştir/Durdur davranışıdır ve kuralı seçeneklerden kaldırmaz.

[Kural servisi](../../src/lib/staff-summary-service.ts), [personel kural API'si](../../src/app/api/push/staff-summary/route.ts), [eski tam kural API'si](../../src/app/api/notifications/summary-rules/route.ts), [personel oluşturma API'si](../../src/app/api/push/staff/route.ts) ve [dispatch](../../src/lib/notification-dispatch.ts) aynı yaşam döngüsünü uygulamalıdır. Yalnız UI'da gizlemek yeterli değildir.

## Onaylanan karar

1. StaffSummaryRule'a nullable `archivedAt DateTime?` eklenir. NULL mevcut/yeni kullanılabilir kuraldır; tarihli kayıt arşivlidir. Mevcut satırlar ve ilişkiler değiştirilmez, yeni kurallar NULL başlar.
2. Personel ve Cihazlar kartına **Kaldır** eklenir. Yalnız kapalı kurallarda kullanılabilir; etkin kuralda önce **Durdur** açıklaması gösterilir. İsim ve “Kural listeden kaldırılacak; gönderim geçmişi korunacak” açıklamalı onay penceresi, **Vazgeç / Kaldır** içerir.
3. İşlem aynı mali yönetici/origin/şube sınırı ve kural row lock altında archivedAt yazar; enabled=false kalır. Kural adı, takvim, sahip, şube, alıcı üyelikleri, run/notification/delivery kayıtları ve sonuçları silinmez/değiştirilmez. Tekrar kaldırma idempotenttir; aktif kuralın eşzamanlı etkinleşmesi409 ile reddedilir.
4. Arşivli kurallar günlük takvim kartlarından, personel üyelik kutularından ve yeni personel/kural seçimlerinden çıkar. Personel ve Cihazlar'da **Arşivlenen kurallar** bölümü ve **Geri al** bulunur. Mevcut Otomatik Aidat Özeti geçmişinde arşivli kural salt okunur etiketle görünür; mevcut son10 run gösterimi korunur, veritabanındaki daha eski kayıtlar da tutulur.
5. Geri al aynı kapsam/kilit altında archivedAt=NULL yapar; kural kapalı kalır. Alıcı/takvim/geçmiş korunur. Yeniden etkinleştirme mevcut alıcı/sahip kontrolü ve gelecek slot politikasına tabidir; geri alma kendiliğinden gönderim veya telafi üretmez.
6. Arşivli kurala düzenleme, etkinleştirme, yeni üyelik ve manuel gönderim sunucuda reddedilir. Eski tam PUT/PATCH yolları da arşivden kaçış sağlayamaz. Worker başlangıçta ve sahiplenme kilidi içinde arşivi denetler. Dispatch hem manuel hem otomatik özette arşivi tekrar kontrol eder. Başlamış/servisçe kabul edilmiş push geri çekilemez; geçmişteki sonucu değiştirilmez. Yeni otomatik tekrar gönderim eklenmez.

## Onaylanan additive migration

Prisma alanı:

```prisma
archivedAt DateTime?
```

PostgreSQL additive migration:

```sql
ALTER TABLE "staff_summary_rules"
  ADD COLUMN "archivedAt" TIMESTAMP(3);

ALTER TABLE "staff_summary_rules"
  ADD CONSTRAINT "staff_summary_rules_archive_disabled_check"
  CHECK ("archivedAt" IS NULL OR "enabled" = false);
```

Onaydan önce SQL yalnız Proposed belgede tutuldu. Açık onay sonrasında aynı SQL migration klasörüne eklenir. DROP/DELETE/backfill veya FK değişikliği yoktur; 28 model korunur, migration sayısı13 olur. Uygulama/yayın kanıtı handoff'ta ayrıca kaydedilir.

## API ve uyumluluk

- Mevcut `/api/push/staff-summary` PATCH'e strict `{ruleId,action:"archive"|"restore"}` biçimi eklenir; eski üyelik/durum biçimleri korunur. Yanıt rule id/name/enabled/archivedAt içerir. Oturum/rol/origin/şube sınırı mevcut ADMIN/ACCOUNTING yönetimidir; genel alıcı seçimi hâlâ yalnız ADMIN.
- Personel seçenekleri varsayılan arşivsizdir. Arşiv listesi için kapsamı aynı `GET /api/push/staff-summary?archived=true` eklenir. Arşiv liste sorgusu hiçbir mutasyon yapmaz; bozuk filtre400.
- Mevcut GET `/api/notifications/summary-rules` kapsam içi geçmişi arşivli kurallarla birlikte döndürmeye devam eder; additive archivedAt ile UI eylemleri ayrılır. Yeni ayrı history servisi veya retention/purge eklenmez.
- Eski açık düzenleme/personel formları arşivlenen kurala yazamaz;409 ile yenileme ister. Mevcut aktif kurallar ve bildirim alıcısı/cihaz kayıtları taşınmaz.

## Alternatifler

- Kuralı veya bağlı run kayıtlarını silmek: Geçmişi koruma gereksinimi ve Restrict FK ile uyumsuz.
- Sadece enabled=false veya tarayıcıda gizleme: Durdurma ile kaldırmayı ayıramaz; diğer cihaz/formlar ve eski API yolları kuralı tekrar kullanabilir.
- Ad öneki, özel saat veya boş alıcıyla arşiv kodlamak: Mevcut alanların anlamını bozar, geçmişi yanlış sunar; tercih edilmez.

## Etki, maliyet ve yayın

Yeni servis/paket/anahtar/maliyet/rol yetkisi/retention süresi yoktur. Bir nullable kolon ve tutarlılık constraint'i eklenir. Yalnız yerel demo ve SporManage demo için uygulanması önerilir; main ve Özlüce kapsam dışıdır. Gerçek mevcut kuralı arşivlemek bu geliştirme testi değildir; canlı Pazartesi09:00/Demo Kullanıcı tercihi korunur.

## Doğrulama ve geri dönüş

Onaydan sonra yerel migration/Prisma generate/typecheck, ilgili entegrasyonlar ve Docker build; gerçek UI kaldır/yenile/geri al/iptal. Yetki/origin/yanlış şube/veli, aktif kural reddi, history bütünlüğü, idempotency, stale form/yeni personel transaction rollback, eski API'den tekrar etkinleşme/manuel gönderim reddi, worker/dispatch ve paralel kaldır-etkinleştir/üyelik sınanır. Gönderici stub kullanılır, dış push yok. Demo yayını öncesi mevcut kural/kişi/cihaz/geçmiş guard, sonrası salt okunur karşılaştırma yapılır.

Additive kolon geri dönüşte silinmez; arşiv durumunu ve geçmişi korur. Ürün içi Geri al kuralı kapalı olarak geri getirir. Arşivi tanımayan eski runtime'a dönüş, eski manuel API'nin arşivli kuralları kullanması riski taşır; böyle bir rollback güvenli varsayılmaz ve yayın öncesinde ayrıca değerlendirilir. Kesin uygulama/test/yayın sonuçları henüz yoktur.

## Açık karar ve tarihçe

- 2026-10-20: Kullanıcı özelliği istedi; kaynaklar incelendi, bu somut öneri hazırlandı. [AGENTS.md](../../AGENTS.md) model/migration için açık onay gerektirir. İlk incelemede onay bekleniyordu; uygulama/DB/canlı ayar değiştirilmedi.
- 2026-10-20: Kullanıcı ADR-0008 ve yalnız demo migration/yayınını açıkça onayladı; Accepted. Uygulama ve doğrulama başlatıldı.
- İlgili takip: [CR-030](../20-execution/CHANGE_REQUESTS.md), [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md).
