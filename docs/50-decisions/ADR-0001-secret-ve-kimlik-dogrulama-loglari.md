# ADR-0001 — Secret ve kimlik doğrulama logları

Last updated: 2026-10-19. Durum: Proposed karar korunmuştur; mevcut kod ve tamamlanan dar düzeltme ayrıca kaydedilmiştir.

- Status: Proposed
- Date: 2026-09-14
- Approval required: Evet — güvenlik ve secret yönetimi kararı.
- Approved by / approval date / evidence: TBD
- Uygulama: Login log temizliği ayrı düzeltme olarak tamamlandı; önerinin bütünü uygulanmadı ve Accepted değildir.

## Context

İlk gözlem (2026-09-14): Login parolayı logluyordu; AuthService secret parçasını logluyor ve sabit fallback kullanıyordu. Compose içine kimlik değerleri yazılıydı; takip edilen ortam/döküm dosyaları vardı. Bu tarihsel bağlam [CR-007](../20-execution/CHANGE_REQUESTS.md) ve [SECURITY_MODEL](../10-architecture/SECURITY_MODEL.md) ile izlenir. Değerler burada tekrar edilmez.

Mevcut durum (2026-10-19): `d6db67c` düzeltmesiyle login API'sindeki e-posta/parola/hash debug logları ve hassas debug yanıtları kaldırılmıştır; [login kodu](../../src/app/api/auth/login/route.ts) yalnız genel hata mesajını loglar. AuthService kaynak logları, sabit fallback ve takip edilen ortam/döküm dosyaları devam eder. Login düzeltmesi aşağıdaki 1. maddenin yalnız bir kısmını karşılar; ADR'nin tamamı için onay kaydı oluşturmaz. Yerel çıktı filtresi kalıcı kod düzeltmesi değildir.

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

- 2026-09-15: Login API log/debug temizliği ayrı düzeltme olarak yapıldı; CHANGELOG ve `d6db67c` kaydı mevcut.
- 2026-10-19: Uygulama durumu kodla eşlendi; kalan öneriler ve onay sınırı korunarak Status Proposed bırakıldı. Yeni güvenlik kararı veya rotasyon yapılmadı.
