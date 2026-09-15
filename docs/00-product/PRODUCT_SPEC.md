# Aidat Takip — Product Specification

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Ürün kimliği ve kullanıcı tarafından verilen hedef

- Proje adı: **Aidat Takip**.
- Problem: Spor kulüplerinin sporcularını ve aidatlarını takip etmek.
- İlk hedef: **Sporcu ve Aidat Takibi**.
- Kaynak: Kullanıcının CDSK başlangıç talebinde verdiği bu üç bilgi, 2026-09-14 tarihli bağlam doldurma görevinde kalıcılaştırıldı. Bu kayıt yeni kapsam onayı değildir.

## Mevcut ürün ve hedef kullanıcılar

Kod futbol okulu/öğrenci terminolojisi kullanıyor. Yönetim, muhasebe, sekreterlik ve antrenör rolleri var. Spor kulübü hedefi ile mevcut futbol okulu arayüzü aynı şey olarak varsayılmamalı. Kullanıcı 2026-09-14 tarihinde ilk sürümün **çocuk ve yetişkin sporcuları** kapsadığını açıkça belirtti. Sporcu kaydı şu anda yaş ayrımı olmadan veli gerektiriyor; bu davranış hedef kapsamla uyumsuz. Kaynaklar: [şema](../../prisma/schema.prisma), [kayıt API’si](../../src/app/api/students/route.ts), [GLOSSARY](GLOSSARY.md), [PERSONAS](PERSONAS.md).

## Kaynakta görülen davranışlar

Sporcu ve veli kaydı, grup/şube atama, arama/filtreleme, aidat türleri, tekil ve toplu borçlandırma, tahsilat ve ödeme durumu takibi mevcut. Bunlar kod envanteridir; kabul testlerinin geçtiği anlamına gelmez. Ayrıntılar: [CORE_WORKFLOWS](CORE_WORKFLOWS.md) ve [REQUIREMENTS](REQUIREMENTS.md).

Antrenman, yoklama, notlar, bildirim, rapor, kullanıcı, ayar ve lisans modülleri de vardır. Mevcut olmaları MVP’ye dahil oldukları anlamına gelmez; [SCOPE](SCOPE.md) geçerlidir.

## Başarı kriterleri

Kullanıcı tarafından belirtilmiş sayısal hedef, kabul ölçütü veya teslim tarihi: TBD. Sporcu kaydı → borçlandırma → tahsilat → durum görüntüleme akışı için önerilen doğrulama senaryoları [TEST_STRATEGY](../30-quality/TEST_STRATEGY.md) içindedir; bunlar henüz ürün kabulü değildir.

## Açık sorular

Çocuk/yetişkin ayrımının yaş eşiği ve veli/iletişim kuralları, kesin MVP alt özellikleri, rol bazlı yetki matrisi, kulüp/şube ayrımı ve ticari dağıtım beklentisi: TBD. Çelişkiler [CHANGE_REQUESTS](../20-execution/CHANGE_REQUESTS.md) içinde izlenir.

Yaş kapsamı kararı kullanıcı yanıtından bu belgeye kaydedildi. Uygulama kuralı önerisi [ADR-0002](../50-decisions/ADR-0002-cocuk-yetiskin-sporcu-kaydi.md) içindedir; yaş eşiği veya API değişikliği onaylanmış sayılmaz.
