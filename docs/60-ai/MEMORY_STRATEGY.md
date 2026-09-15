# AI Memory Strategy

Repository tek doğruluk kaynağıdır. Sohbetler kalıcı hafıza değildir. Secret veya hassas bilgiler hafıza belgelerine yazılmaz.

## Bilginin kalıcı adresi

| Bilgi | Asıl kaynak |
|---|---|
| İlkeler ve bağlayıcı sınırlar | [CONSTITUTION](../00-product/CONSTITUTION.md) |
| Ürün, kapsam ve öncelikler | [PRODUCT_SPEC](../00-product/PRODUCT_SPEC.md), [SCOPE](../00-product/SCOPE.md), [ROADMAP](../00-product/ROADMAP.md) |
| Terimler | [GLOSSARY](../00-product/GLOSSARY.md) |
| Mimari ve veri | [OVERVIEW](../10-architecture/OVERVIEW.md), [DATA_MODEL](../10-architecture/DATA_MODEL.md) ve ilgili mimari belgeler |
| Karar gerekçesi ve onay | [ADR dizini](../50-decisions/README.md) |
| İşler ve çelişkiler | [BACKLOG](../20-execution/BACKLOG.md), [CHANGE_REQUESTS](../20-execution/CHANGE_REQUESTS.md) |
| Anlamlı değişiklikler | [CHANGELOG](../../CHANGELOG.md) |
| Güncel kısa bağlam | [PROJECT_BOOT](../../PROJECT_BOOT.md) |
| Oturumdan güvenli devam | [SESSION_HANDOFF](SESSION_HANDOFF.md) |

## Güncelleme ilkesi

Bilgiyi önce doğru asıl belgeye işle; özet belgelerde bağlantı kullan. Mevcut davranış, öneri ve kabul edilmiş kararı birbirine karıştırma. Bilinmeyenleri `TBD` bırak. Her anlamlı oturum sonunda belgeler, CHANGELOG ve AI Handoff birlikte güncellenir.

## Tekrar kullanılabilir CDSK dersleri

2026-09-14: Paket bağımlılığı, ayar alanı, başarılı durum kodu veya README özellik listesi tek başına çalışan entegrasyon/operasyon kanıtı değildir. Aidat Takip bildirim, export ve backup bulguları [CHANGE_REQUESTS](../20-execution/CHANGE_REQUESTS.md) içinde kayıtlıdır. Mevcut davranış, kullanıcı hedefi ve Proposed kararı ayrı tutmak gerekir; bu ders standardın anayasasını değiştirmez.

Dersleri kaynak ve kapsamıyla kaydet; bu kayıt dış bir CDSK kaynağını değiştirme veya Constitution’ı onaysız güncelleme yetkisi vermez.
