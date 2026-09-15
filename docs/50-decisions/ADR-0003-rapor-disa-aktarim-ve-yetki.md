# ADR-0003 — Rapor dışa aktarımı ve yetki kapsamı

- Status: Accepted
- Date: 2026-09-15
- Author: Codex
- Decision owners: Proje sahibi
- Approval required: Evet — API sözleşmesi ve rapor yetkilendirmesi
- Approved by: Kullanıcı / proje sahibi
- Approval date: 2026-09-15
- Approval evidence and scope: Kullanıcı; gerçek XLSX, tarayıcı yazdırma/PDF, yalnız ADMIN ve ACCOUNTING erişimi ve eski `format=pdf` isteğine `410 Gone` dönülmesini içeren planın uygulanmasını açıkça istedi.
- Supersedes / Superseded by: Rapor biçimi için CR-010’u çözer / N/A

## Context

Eski rapor export ucu PDF veya XLSX dosyası gibi etiketlenmiş örnek metin döndürüyordu. Rapor ekranı ile export aynı hesaplama kaynağını kullanmıyor, PDF davranışı gerçek bir belge üretildiği izlenimi veriyor ve yetkilendirme taşıma biçimi uygulamanın çerez tabanlı oturumuyla uyuşmuyordu.

## Decision drivers

- Ekran ve dışa aktarımda aynı hesapların kullanılması.
- Mevcut `xlsx` paketinden yararlanılması ve yeni bağımlılık eklenmemesi.
- Tarayıcının yerleşik yazdırma/PDF kaydetme akışının kullanılması.
- Mali rapor dosyalarının yalnızca uygun rollere açılması.
- Eski istemcilerin yanıltıcı sahte PDF almaması.

## Decision

`GET /api/reports/overview` ve Excel export ortak raporlama katmanını kullanır. Kanonik dönem parametresi `dateRange`; `timeRange` geriye uyumluluk için kabul edilir. Geçersiz dönem veya grup `400` döndürür.

`GET /api/reports/export?format=excel`, çerez tabanlı oturumla yalnız ADMIN ve ACCOUNTING rollerine gerçek XLSX döndürür. Oturumsuz istek `401`, izin verilmeyen rol `403`, bilinmeyen biçim `400` döndürür. `format=pdf` artık belge üretmez; `410 Gone` ve tarayıcıdaki `Yazdır / PDF Kaydet` akışına yönlendiren açıklama döndürür.

Rapor türü seçimi ekran, Excel sayfaları ve yazdırma içeriğini sınırlar. Yazdırma görünümünde gezinme, filtreler ve işlem düğmeleri gizlenir.

## Alternatives considered

- Sunucuda PDF üretmek: yeni bağımlılık ve bakım yükü nedeniyle seçilmedi.
- Eski örnek metin davranışını korumak: geçerli bir dosya üretmediği için seçilmedi.
- Export’u tüm oturumlu rollere açmak: mali veri kapsamı nedeniyle seçilmedi.

## Consequences and trade-offs

Excel çıktısı gerçek ve makinece okunabilir olur. PDF kaydetme tarayıcı/yazdırma sürücüsüne bağlıdır. Eski `format=pdf` istemcileri bilinçli olarak `410` alır ve kullanıcı akışına geçmelidir.

## Security, privacy, data and compatibility impact

Export çerez tabanlı mevcut oturumu ve aktif kullanıcı kaydını doğrular. ADMIN ve ACCOUNTING dışındaki roller dosya alamaz. Şema, migration ve veri saklama politikası değişmez. `timeRange` desteği eski overview çağrıları için korunur; PDF endpoint davranışı onaylı sözleşme değişikliğidir.

## Cost, license and vendor impact

Yeni maliyet, lisans veya vendor bağımlılığı yoktur. Repository’de bulunan `xlsx` paketi ve tarayıcı yazdırma özelliği kullanılır.

## Validation and rollback

Hesaplama birim testleri; XLSX imzası, sayfaları ve hücreleri; 401/403/400/410/200 HTTP senaryoları; typecheck, production build ve tarayıcı görünümü doğrulanır. Geri alma, ortak raporlama/export değişikliklerinin önceki uygulamaya döndürülmesiyle mümkündür; veri migration’ı yoktur.

## Related documents and requirements

- [API Conventions](../10-architecture/API_CONVENTIONS.md)
- [Integrations](../10-architecture/INTEGRATIONS.md)
- [Demo Validation](../30-quality/DEMO_VALIDATION.md)
- [CR-010](../20-execution/CHANGE_REQUESTS.md)

## Open questions

N/A — bu ADR’nin dar kapsamı için karar tamamlandı. Diğer rol/nesne erişim kuralları CR-002/003 altında açıktır.

## Decision history

- 2026-09-15: Kullanıcı uygulama planını açıkça onayladı; karar Accepted kaydedildi ve uygulandı.
