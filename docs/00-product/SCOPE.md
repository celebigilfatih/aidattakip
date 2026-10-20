# Scope

## Onaylı kapsam genişlemesi — 2026-10-20

[ADR-0009](../50-decisions/ADR-0009-aile-sezon-aday-takip.md) Accepted: Kullanıcı dört modüllük planı, additive migration/erişim sınırları ve yalnız yerel/SporManage demo yayınını açıkça onayladı. Aile birleşik görünüm, sezon yenileme, personel aday kaydı ve sporcu takip listesi kapsam içidir. Ödeme dağıtımı/ledger değişikliği, yeni sağlayıcı/push, public başvuru/veli girişi ve retention değişikliği kapsam dışıdır. Aşağıdaki ilk kapsam kayıtları tarihçedir.

2026-10-20 CR-030 / ADR-0008 Accepted: Kapalı aidat kuralını aynı personel ekranından geçmişi koruyarak arşivleme ve kapalı geri alma; tek nullable archivedAt + additive migration yalnız yerel/SporManage demo. Kullanıcı somut öneri ve demo yayınını açıkça onayladı. Mali rol/şube/cihaz/retention süresi değişmez. [ADR-0008](../50-decisions/ADR-0008-aidat-ozeti-kurallarini-arsivleme.md).

2026-10-19 CR-029: Mevcut haftalık kuralın adı/günleri/saati/alıcıları Personel ve Cihazlar ekranındaki ortak yeni/düzenle formundan atomik değiştirilir. Mevcut mali yetki/şube, sahip, etkinlik ve geçmiş korunur; stale form409. Veri modeli/servis/politika değişikliği yok. [PRODUCT_SPEC](PRODUCT_SPEC.md).

2026-10-19 CR-028: Yeni haftalık aidat özeti kuralı gün/saat/alıcılarıyla Personel ve Cihazlar formundan da oluşturulur; kapalı varsayılan, mevcut mali rol/şube ve alıcı seçimi politikası korunur. Yeni API/model/servis yok. [PRODUCT_SPEC](PRODUCT_SPEC.md).

2026-10-19 CR-027: Mevcut aidat özeti kuralının etkinleştirme/durdurması Personel ve Cihazlar kartından da yapılır; aynı mali yetki/şube ve ortak kural/alıcı/cihaz politikası korunur. Yeni sağlayıcı, veri modeli veya tekrar türü yok. [PRODUCT_SPEC](PRODUCT_SPEC.md).

2026-10-19 CR-026: Mevcut haftalık aidat kuralının gün/saat düzenlemesi Personel ve Cihazlar ekranından da yapılır. Ortak takvim tüm bağlı alıcılara uygulanır; yeni/mevcut personel seçimi güncel haftalık kuralları gösterir. ADR-0007 rol/şube/haftalık model korunur; aylık/iki haftalık tekrar veya yeni servis yok. [PRODUCT_SPEC](PRODUCT_SPEC.md).

## Güncel personel bildirim kapsamı

2026-10-19 ADR-0007 Accepted: Kullanıcı personel odaklı bildirim ve otomatik aidat özeti planının tümünü uygulamayı onayladı. Yeni veli/sporcu push kapalı; ADMIN seçili personel, ana cihaz ve 30 günlük yenilenebilir kayıt. Mali özet ADMIN/ACCOUNTING ve güncel şube kapsamı; diğer personel yalnız genel duyuru. Haftalık gün/saat, İstanbul vade günü sonrası aktif/pasif açık borçlar, 1 saat telafi ve kalıcı çalışma/tek gönderim uygulanıyor. Yalnız demo dbc329d0 dağıtımı, gerçek personel iPhone manuel/otomatik özet kabulü ve kapalı kural testi tamamlandı. 30 test/typecheck/Docker build başarılı; haftalık kural Pazartesi09:00 ve kapalı bırakıldı. [ADR-0007](../50-decisions/ADR-0007-personel-bildirimleri-ve-aidat-ozeti.md). Aşağıdaki ADR-0006 kayıtları tarihçedir.

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Onaylı ilk hedef

Çocuk ve yetişkin sporcular için Sporcu ve Aidat Takibi. Kaynak: [PRODUCT_SPEC](PRODUCT_SPEC.md). Henüz ayrıntılı MVP kabulü veya kapsam genişletme onayı yok.

## Mevcut kod envanteri ve MVP ayrımı

| Alan | Repository’deki durum | MVP durumu |
|---|---|---|
| Sporcu ve aidat takibi | Ekranlar, API’ler ve veri modelleri mevcut | İlk hedef; alt özelliklerin kabul sınırları TBD |
| Veli, grup, şube, aidat türü | Çekirdek akışların mevcut ilişkileri | Gerekli asgari kullanım TBD |
| Oturum ve kullanıcı rolleri | Mevcut erişim mekanizması | Hedef yetki politikası TBD |
| Antrenman, yoklama, notlar | Mevcut modüller | İlk hedefe dahil edildiğine dair onay yok |
| Bildirim, rapor, lisans, yönetim ayarları | Mevcut modüller; kısmi/simüle davranışlar var | İlk hedefe dahil edildiğine dair onay yok |

Kaynak: [mimari envanter](../10-architecture/OVERVIEW.md). Hiçbir mevcut modülün kaldırılmasına karar verilmedi.

## Explicit non-goals

TBD — Kullanıcı kalıcı non-goal listesi tanımlamadı. İlk hedef dışında kalan bir özellik otomatik olarak kalıcı non-goal sayılmaz.

## 2026-09-14 bağlam doldurma görevinin tarihsel sınırı

Belge güncellemesi, kaynak eşleştirmesi, çelişki/risk kaydı ve Proposed ADR hazırlanması. Kod, şema, migration, bağımlılık, altyapı ve Constitution değişikliği yok.

## Onay kapıları

2026-10-19 kapsam onayı: [ADR-0006](../50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) ile önce bildirim ekranı/API düzeltmesi, doğrulanmış veli/sporcu alıcı kaydı ve tek cihazda manuel push uygulanması istendi. Yerel uygulama/test ve onaylı ayrı HTTPS demo dağıtımı hazır; iPhone gerçek testi cihazda tamamlanacak. Otomatik aidat kuralları/scheduler bu ilk adımda etkinleştirilmez. Bu onay mevcut diğer modüllerin tümünün MVP kabulü değildir.

MVP genişletme, non-goal, rol, veri modeli, dağıtım ve entegrasyon değişiklikleri açık onay gerektirir. [AGENTS](../../AGENTS.md).
