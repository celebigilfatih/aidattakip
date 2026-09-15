# Scope

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

## Bu bağlam doldurma görevinin sınırı

Belge güncellemesi, kaynak eşleştirmesi, çelişki/risk kaydı ve Proposed ADR hazırlanması. Kod, şema, migration, bağımlılık, altyapı ve Constitution değişikliği yok.

## Onay kapıları

MVP genişletme, non-goal, rol, veri modeli, dağıtım ve entegrasyon değişiklikleri açık onay gerektirir. [AGENTS](../../AGENTS.md).
