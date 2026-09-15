# ADR-0001 — Secret ve kimlik doğrulama logları

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

- Status: Proposed
- Date: 2026-09-14
- Approval required: Evet — güvenlik ve secret yönetimi kararı.
- Approved by / approval date / evidence: TBD
- Uygulama: Yapılmadı.

## Context

[CR-007](../20-execution/CHANGE_REQUESTS.md) ve [SECURITY_MODEL](../10-architecture/SECURITY_MODEL.md): login parolayı logluyor, AuthService secret parçasını logluyor ve sabit fallback kullanıyor; Compose içine kimlik değerleri yazılı. Takip edilen ortam/döküm dosyaları var; gerçek içerik ve kullanım envanteri bu görevde incelenmedi. Değerler burada tekrar edilmez.

## Proposed decision

1. Kimlik doğrulama loglarından parola, hash önizlemesi ve secret içeriğini kaldırmak; yalnızca hassas içerik taşımayan sonuç/hata kayıtları bırakmak.
2. JWT_SECRET eksik olduğunda sabit fallback yerine açık yapılandırma hatası vermek. Hangi başlatma aşamasında doğrulanacağı ve mevcut ortam geçişi uygulama öncesinde netleşmeli.
3. Repository’ye yazılı değerleri ortam envanteriyle değerlendirmek; secret’ları sürümlenen içerikten ayırmak için ayrı ve gözden geçirilebilir değişiklik hazırlamak. Yeni secret servisi/vendor seçilmez.

## Alternatives considered

Yalnızca logları temizlemek: daha dar etki, fallback ve repository riskini açık bırakır. Log ve fallback’i birlikte düzeltmek: önerilen yaklaşım, eksik ortamların çalışmasını durdurabilir. Yeni secret platformu: kapsam dışı öneri; ek vendor/maliyet onayı gerekir.

## Consequences and trade-offs

Hassas log içeriği azalır; mevcut ortamlarda eksik secret varsa giriş/başlatma kesilebilir. Anahtar rotasyonu mevcut JWT’leri geçersiz kılabilir. Bu ADR, rotasyon zamanını, üretime erişimi veya geçmiş temizlemeyi otomatik yetkilendirmez.

## Approval boundary

Onay yalnızca açıkça kabul edilen maddeleri kapsar. Git geçmişini yeniden yazma, canlı anahtar rotasyonu, üretim deployment’ı ve eski log/yedek silme için ayrı somut plan ve açık onay gerekir. Rol matrisi, JWT ömrü ve retention bu ADR’de seçilmedi.

## Validation and rollback

Sentetik kimlik bilgileriyle logların içerik kontrolü; secret yokken beklenen hata; secret varken giriş/çerez doğrulaması önerilir. Ortam envanteri, komutlar ve sonuçlar TBD. Geri alma hassas logları yeniden açmamalı; ortam düzeltme yaklaşımı onay planında netleşmeli.

## Open questions and history

Canlı ortamlar, secret kaynakları/sahipleri, mevcut anahtarların kullanımı ve geçiş penceresi TBD. 2026-09-14: yalnızca öneri hazırlandı; Accepted değil.
