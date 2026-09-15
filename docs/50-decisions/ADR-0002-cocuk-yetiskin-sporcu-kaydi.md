# ADR-0002 — Çocuk ve yetişkin sporcu kaydı

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

- Status: Proposed
- Date: 2026-09-14
- Approval required: Evet — kayıt sözleşmesi, kişisel veri ve doğrulama kuralları.
- Approved by / approval date / evidence: TBD
- Uygulama: Yapılmadı.

## Context

Kullanıcı ilk sürümün **çocuk ve yetişkin sporcuları** kapsadığını açıkça belirtti; bu ürün kapsamı [PRODUCT_SPEC](../00-product/PRODUCT_SPEC.md) içinde kayıtlıdır. Bu yanıt aşağıdaki uygulama kurallarının kabulü değildir. [students POST](../../src/app/api/students/route.ts) yaş ayrımı olmadan en az bir veli ve birincil veli gerektiriyor; doğum tarihi modelde isteğe bağlı. [CR-013](../20-execution/CHANGE_REQUESTS.md).

## Proposed decision

Çocuk ve yetişkin kaydını ayrı doğrulama koşullarıyla desteklemek önerilir: çocuk için mevcut birincil veli ilişkisini sürdürmek; yetişkin için kendi iletişim bilgileriyle, zorunlu veli oluşturmadan kayıt imkânı sağlamak. Yetişkinin isteğe bağlı yakını/acil durum kişisi akışı ve zorunlu iletişim alanları TBD.

Çocuk/yetişkin yaş eşiği, yaşın hangi tarihe göre hesaplanacağı, doğum tarihi bilinmiyorsa uygulanacak kural ve sınır günü davranışı **TBD**. Bu ayrıntılar netleşmeden kod uygulanmaz; hukuki yaş eşiği tahmin edilmedi.

## Alternatives considered

Mevcut zorunlu veli kuralını herkese uygulamak: yetişkin hedefini zorlaştırır. Veli zorunluluğunu herkesten kaldırmak: çocuk akışını ve veri politikasını değiştirir; önerilmiyor. Yaşa göre koşullu kural: öneri, ek doğrulama ve iletişim akışlarının gözden geçirilmesini gerektirir.

## Data and compatibility impact

Şema değişikliği gerekip gerekmediği uygulama tasarımında doğrulanmalı; bu ADR migration onayı içermez. Kaydı kullanan form, POST/PUT doğrulamaları, yazdırma ve birincil veliye bakan iletişim/bildirim yolları incelenmeli. Mevcut veli bağlantıları silinmemeli veya otomatik dönüştürülmemeli.

## Validation and rollback

Çocuk/yetişkin, sınır gün, eksik doğum tarihi, veli yokluğu, birincil veli, mevcut kaydı düzenleme ve yetişkinin iletişim bilgisiyle kaydı için kabul senaryoları hazırlanmalı. Beklenen sonuçlar karar onayında kesinleşir; henüz test çalıştırılmadı. Mevcut ilişkileri koruyan geri dönüş planı TBD.

## Open questions and history

Yaş eşiği, iletişim alanları ve eksik yaş politikası açık. 2026-09-14: kullanıcı iki yaş grubunu hedeflediğini belirtti; teknik kural önerisi Proposed olarak hazırlandı. Accepted değil.
