# Glossary

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

| Terim | Anlam | Kod karşılığı |
|---|---|---|
| Sporcu | Kullanıcının hedef ürününde takip edilen kişi | `Student`; mevcut arayüzde öğrenci |
| Veli | Sporcuya bağlı iletişim/yakınlık kaydı | `Parent`; çoktan çoğa ilişki |
| Birincil veli | Öncelikli iletişim kaydı | `Parent.isPrimary` |
| Grup | Sporcuların ve antrenman düzeninin bağlandığı grup | `Group` |
| Şube | Mevcut kodda branch karşılığı; spor branşı olduğu varsayılmaz | `Branch` |
| Aidat türü | Tutar ve dönem tanımı | `FeeType` |
| Borçlandırma | Sporcu için vadesi ve tutarı olan kayıt açılması | `Payment` oluşturma |
| Tahsilat | Mevcut borca ödeme tutarı işlenmesi | `Payment.paidAmount`, `paidDate`, `status` |
| Ödeme kaydı | Hem borç hem tahsilat durumunu tutan kayıt | `Payment`; ayrı tahsilat hareket modeli değil |
| Antrenman tanımı | Gruba bağlı antrenman tanımı | `Training` |
| Antrenman seansı | Belirli tarih/saatte planlanan gerçekleşme | `TrainingSession` |
| Yoklama | Bir sporcu ve bir seans için katılım kaydı | `Attendance` |
| Kullanıcı | Sisteme giriş yapan personel | `User`; sporcu ile aynı varlık değil |
| Lisans | Uygulamanın kullanım lisansı | `src/lib/license.ts`; sporcu lisansı değil |

Kaynaklar: [şema](../../prisma/schema.prisma), [ödeme API’si](../../src/app/api/payments/route.ts), [tahsilat API’si](../../src/app/api/payments/[id]/route.ts).

Dokümanlarda sporcu terimi kullanılır; mevcut koddaki `Student` eşleştirmesi korunur. Bu kayıt API, tablo veya UI yeniden adlandırma kararı değildir. Kulüp/şube/branş ayrımının hedef üründeki kesin anlamı TBD.
