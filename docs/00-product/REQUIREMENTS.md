# Requirements

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Onaylı hedef ile kod gözlemi ayrımı

| ID | Gereksinim veya gözlem | Kaynak / durum | Doğrulama |
|---|---|---|---|
| REQ-001 | Sporcuları takip etmek | Kullanıcı hedefi; [PRODUCT_SPEC](PRODUCT_SPEC.md) | Ayrıntılı kabul TBD; WF-001 önerilen doğrulama |
| REQ-002 | Aidatları takip etmek | Kullanıcı hedefi; [PRODUCT_SPEC](PRODUCT_SPEC.md) | Ayrıntılı kabul TBD; WF-002/003 önerilen doğrulama |
| REQ-003 | İlk sürüm çocuk ve yetişkin sporcuları kapsar | Kullanıcı yanıtı; [PRODUCT_SPEC](PRODUCT_SPEC.md) | Veli kuralı ve yaş eşiği ADR-0002’de Proposed |
| OBS-001 | Sporcu için veli ve birincil veli zorunluluğu | [students POST](../../src/app/api/students/route.ts); mevcut davranış | Ürün uygunluğu TBD |
| OBS-002 | Grup/şube filtreleri ve grup izinleri | [students GET](../../src/app/api/students/route.ts), [izinler](../../src/lib/trainer-permissions.ts) | Nesne bazlı erişim kapsamı doğrulanmalı |
| OBS-003 | Dönemli ve toplu borçlandırma | [payments](../../src/app/api/payments/route.ts), [bulk](../../src/app/api/payments/bulk/route.ts) | CR-008; dönem regresyonu gerekli |
| OBS-004 | Kısmi/tam tahsilat ve iptal | [payment id](../../src/app/api/payments/[id]/route.ts) | Tutar ve tekrar gönderim kuralları TBD |

`OBS` satırları kodun mevcut davranışını tanımlar; otomatik ürün gereksinimi onayı değildir.

## Kabul kriteri taslakları

REQ-001 için kaydın ilişkileriyle saklanıp filtrelenebilmesi; REQ-002 için borçlandırma ve tahsilatın beklenen tutar/durumla görünmesi önerilir. Kesin beklenen sonuçlar, rol matrisi ve istisnalar kullanıcıyla netleşmeden kabul edildi sayılmaz. Test adayları: [TEST_STRATEGY](../30-quality/TEST_STRATEGY.md).

## Fonksiyonel olmayan gereksinimler

Performans hedefi, kullanıcı/veri hacmi, erişilebilirlik seviyesi, uptime, RPO/RTO, veri saklama ve gizlilik gereksinimleri: TBD. CDSK kalite/onay kuralları bağlayıcıdır; yeni sayısal ürün hedefi tanımlanmadı.
