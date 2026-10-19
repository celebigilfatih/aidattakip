# Aidat Takip — Product Specification

## Bildirim ekranında personel oluşturma — 2026-10-19

Kullanıcı talebiyle ADMIN, Personel ve Cihazlar bölümünden yeni giriş hesabı oluşturup aynı formdaki bildirim alıcısı kutusunu seçebilir. Yeni personel için ayrıca varsayılan kapalı **Pazartesi09:00 aidat özeti** kutusu vardır; uygun mali rol ve şubede mevcut kurala açık seçimle katılır. Mevcut personel adla aranıp ayrıca seçilebilir. Rol ve şube mali erişimi belirler; yalnız alıcı seçimi mali yetki veya haftalık kurala otomatik üyelik vermez. Personel kendi cihazında izin verir. [CR-023/024](../20-execution/CHANGE_REQUESTS.md), [PUSH_GUIDE](../40-operations/PUSH_GUIDE.md).

## Güncel personel bildirim kapsamı

2026-10-19 ADR-0007 Accepted: Kullanıcı personel odaklı bildirim ve otomatik aidat özeti planının tümünü uygulamayı onayladı. Yeni veli/sporcu push kapalı; ADMIN seçili personel, ana cihaz ve 30 günlük yenilenebilir kayıt. Mali özet ADMIN/ACCOUNTING ve güncel şube kapsamı; diğer personel yalnız genel duyuru. Haftalık gün/saat, İstanbul vade günü sonrası aktif/pasif açık borçlar, 1 saat telafi ve kalıcı çalışma/tek gönderim uygulanıyor. Yalnız demo dbc329d0 dağıtımı, gerçek personel iPhone manuel/otomatik özet kabulü ve kapalı kural testi tamamlandı. 30 test/typecheck/Docker build başarılı; haftalık kural Pazartesi09:00 ve kapalı bırakıldı. [ADR-0007](../50-decisions/ADR-0007-personel-bildirimleri-ve-aidat-ozeti.md). Aşağıdaki ADR-0006 kayıtları tarihçedir.

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

2026-10-19 onaylı ek iş: Kullanıcı [ADR-0006](../50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) planını kabul edip önce bildirim ekranı/API hataları, veli/sporcu alıcı kaydı ve tek cihazda manuel push istedi. Yerel ilk aşama uygulandı/test edildi ve kullanıcı onayıyla ayrı HTTPS demo ortamına dağıtıldı; ilk gerçek iPhone testi Apple HTTP201 ve kullanıcının bildirim/tıklama kabulüyle doğrulandı. Alıcı hedefi hem veli/sporcu hem kulüp personelidir; otomatik aidat takvimi sonraki aşamadır. Bu kayıt genel ürün kabulü veya bütün açık yaş/rol kurallarının çözümü değildir.

Çocuk/yetişkin ayrımının yaş eşiği ve veli/iletişim kuralları, kesin MVP alt özellikleri, rol bazlı yetki matrisi, kulüp/şube ayrımı ve ticari dağıtım beklentisi: TBD. Çelişkiler [CHANGE_REQUESTS](../20-execution/CHANGE_REQUESTS.md) içinde izlenir.

Yaş kapsamı kararı kullanıcı yanıtından bu belgeye kaydedildi. Uygulama kuralı önerisi [ADR-0002](../50-decisions/ADR-0002-cocuk-yetiskin-sporcu-kaydi.md) içindedir; yaş eşiği veya API değişikliği onaylanmış sayılmaz.
