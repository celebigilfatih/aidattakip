# Core Workflows

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

Bunlar mevcut kod akışlarıdır; kabul edilmiş hedef iş kuralları veya geçen testler değildir.

## WF-001 — Sporcu kaydı ve listeleme

1. Personel giriş yapar; sporcu ekranı API’den sayfalı listeyi alır.
2. Ad/soyad ve en az bir veli gönderilir; velilerden en az birinin birincil olması API’de zorunludur.
3. Sporcu ve veli kayıtları transaction içinde oluşturulur; grup/şube bağlantıları isteğe bağlıdır.
4. Liste ad, grup, şube ve aktiflik ile filtrelenir; TRAINER için izinli grup filtresi eklenir.

Kaynaklar: [ekran](../../src/app/students/page.tsx), [API](../../src/app/api/students/route.ts). Zorunlu alan eksikliği 400, yetki eksikliği 403, kimlik eksikliği 401. Çocuk ve yetişkin kapsamı kullanıcı tarafından doğrulandı; yaşa göre kayıt kuralı [ADR-0002](../50-decisions/ADR-0002-cocuk-yetiskin-sporcu-kaydi.md) içinde Proposed durumundadır.

## WF-002 — Tekil veya toplu borçlandırma

Sporcu/öğrenci listesi veya grup, aidat türü, tutar ve tarih seçilir. API her vade için ayrı `Payment` oluşturur. Mevcut kod tutarı vade sayısına bölmez; her kayda aynı tutarı yazar. Toplu işlem transaction kullanır.

Kaynaklar: [tekil API](../../src/app/api/payments/route.ts), [toplu API](../../src/app/api/payments/bulk/route.ts). `SEMI_ANNUAL` şemada bulunmasına rağmen iki dönem switch’inde açık dalı yok; varsayılan bir aylık aralık uygulanıyor. [CR-008](../20-execution/CHANGE_REQUESTS.md).

## WF-003 — Tahsilat ve durum takibi

`PATCH /api/payments/[id]` için `record_payment` eylemi mevcut ödenen tutara yeni tutarı ekler; toplam borca ulaşıldığında PAID, pozitif ve eksikse PARTIAL olur. `mark_overdue` ve `cancel` eylemleri de vardır. Toplu tahsilat seçilen kaydın ödenen tutarını borç tutarına eşitler.

Kaynaklar: [tahsilat API’si](../../src/app/api/payments/[id]/route.ts), [toplu API](../../src/app/api/payments/bulk/route.ts). Ayrı tahsilat hareket tablosu yok. Tekrar gönderim, eşzamanlılık, fazla/negatif ödeme ve düzeltme kuralları kabul açısından TBD; test önerileri [TEST_STRATEGY](../30-quality/TEST_STRATEGY.md).

## Diğer akışlar

Antrenman, yoklama, not, bildirim, rapor ve lisans mevcut modüllerdir; ilk hedefe dahil edilmediler. Gereksinim eşleştirmesi [REQUIREMENTS](REQUIREMENTS.md).
