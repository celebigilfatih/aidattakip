# Aidat Takip — Product Specification

## Kullanılmayan aidat özeti kurallarını kaldırma — 2026-10-20

Onaylı ADR-0008 yalnız demo7f5710c ile yayımlandı: Personel ve Cihazlar kartındaki **Kaldır**, yalnız kapalı kuralı isim/açıklama ve Vazgeç/Kaldır onayıyla arşivler. Etkin kural için önce Durdur gerekir. Kural günlük kart ve üyelik/personel seçeneklerinden çıkar; **Arşivlenen kurallar → Geri al** ile kapalı olarak döner. Takvim/alıcı/sahip/şube ve tüm gönderim geçmişi korunur. Otomatik Aidat Özeti bölümünde arşivli kural salt okunur, mevcut son10 run görünür; eski kayıtlar silinmez. Arşivli kurala düzenleme, etkinleştirme, üyelik veya manuel/otomatik gönderim sunucuda kapalıdır. Aynı mali rol/şube sınırı geçerlidir; önceki açık formlar409 ile yenilenir. Geri alma kendiliğinden gönderim/telafi yapmaz. [ADR-0008](../50-decisions/ADR-0008-aidat-ozeti-kurallarini-arsivleme.md), [CR-030](../20-execution/CHANGE_REQUESTS.md).

## Mevcut kuralı aynı personel formundan düzenleme — 2026-10-19

Personel ve Cihazlar → Aidat özeti takvimi → **Düzenle**, yeni kayıtla ortak formu mevcut ad/gün/saat/alıcılarla açar. Her açılışta güncel kayıt okunur. **Değişiklikleri kaydet** tüm alanları atomik günceller; sahip, şube, güncel etkinlik, cihazlar ve geçmiş korunur. En az bir gün ve bir uygun mali alıcı gerekir. Uygunluğunu kaybetmiş mevcut alıcı sessizce çıkarılmaz; açıklamayla görünür ve açıkça kaldırılmalıdır. Form açıkken ad/takvim/alıcı değişmişse409 ile yeniden açma istenir; başka bir durdurma işleminin üzerine yazılmaz. Yalnız değişen gün/saat değerlendirme imlecini şimdiye alır; ad/alıcı değişimi veya aynı değerleri kaydetmek imleci korur. ADR-0007 mali rol/şube/cihaz politikası değişmez. [CR-029](../20-execution/CHANGE_REQUESTS.md).

## Personel ekranından yeni aidat özeti kuralı — 2026-10-19

Personel ve Cihazlar → Aidat özeti takvimi → **Yeni aidat özeti kuralı**; kural adı, hafta günleri, Türkiye saati ve alıcılar tek formda seçilir. Varsayılan Pazartesi09:00 ve alıcı seçimi boştur. En az bir gün/alıcı gerekir. Yalnız kapsam içindeki seçili/aktif yönetici ve muhasebe listelenir; adla arama ve ana cihaz hazır/kurulum gerekli bilgisi vardır. Yeni kural kapalı oluşturulur, push göndermez ve aynı ekrandaki kartta görünür; açmak için mevcut Etkinleştir kullanılır. Alıcı bulunmazsa açıklama gösterilir, kayıt açılamaz. Vazgeç kayıt yapmaz. Mevcut POST summary-rules ve ADR-0007 yetki/kapsam/kapalı varsayılanı aynıdır; ilk kayıt için ayrı sekmeye gitme sınırı kullanıcı talebiyle kaldırılmıştır. [CR-028](../20-execution/CHANGE_REQUESTS.md).

## Personel ekranından kuralı etkinleştirme ve durdurma — 2026-10-19

Personel ve Cihazlar → Aidat özeti takvimi kartında **Etkinleştir / Durdur** bulunur. ADMIN/ACCOUNTING mevcut şube kapsamında kuralın ortak durumunu değiştirir; gün/saat, sahip, şube, alıcılar, cihazlar ve geçmiş korunur. Etkinleştirme en az bir seçili/aktif mali personel ve geçerli kural sahibi ister; cihaz izni gönderim anında ayrıca kontrol edilir. Boş alıcılı kuralda etkinleştirme açıklamayla kapalıdır. Geçersizleşmiş alıcı/sahip kuralın durdurulmasını engellemez. Etkinleşme yalnız gelecek slotlara uygulanır, tekrar aynı durumu kaydetmek cursor'ı değiştirmez. Bu, önceki kısa akışın etkinlik işlemi için ayrı sekmeye gitme sınırını kullanıcı talebiyle kaldırır. ADR-0007 politikası değişmez. [CR-027](../20-execution/CHANGE_REQUESTS.md).

## Personel ve Cihazlar ekranında aidat takvimi — 2026-10-19

CR-026 ilk gün/saat formu CR-029 ile yukarıdaki ortak **Düzenle** formuna genişletildi. ADMIN/ACCOUNTING kendi kapsamındaki haftalık kuralın adını, günlerini, saatini ve alıcılarını birlikte değiştirebilir. Takvim aynı kuralın tüm alıcılarına uygulanır; Türkiye saati (Europe/Istanbul) açıkça gösterilir. Güncel formda ad ve alıcılar da seçilebilir; sahip, şube, etkinlik ve geçmiş korunur. Değişen takvim kaydetme anından sonraki slotlara uygulanır; geçmiş saatler telafi edilmez. Aynı gün/saat tekrar kaydedilirse değerlendirme imleci de korunur. Gün/saat formu yeni kural oluşturmaz; etkinlik aynı karttaki ayrı düğmeden yönetilir (CR-027). [CR-026](../20-execution/CHANGE_REQUESTS.md).

Yeni personel formu ve mevcut personel kartları artık yalnız Pazartesi09:00 yerine kapsam içindeki tüm haftalık kuralları güncel gün/saatleriyle gösterir. Bu, CR-024/025'teki Pazartesi09:00 arayüz kısıtının kullanıcı talebiyle genişletilmesidir; ADR-0007'nin haftalık takvim, rol ve şube politikası değişmez.

## Bildirim ekranında personel oluşturma — 2026-10-19

Mevcut personelin aidat özeti üyeliği de Personel ve Cihazlar kartında ADMIN/ACCOUNTING tarafından kendi kapsamında açılıp kapatılır; her değişiklik anında kaydedilir. Diğer alıcılar ve kural ayarları korunur. Genel push alıcısı seçimi ADMIN'de kalır. [CR-025/026](../20-execution/CHANGE_REQUESTS.md).

Kullanıcı talebiyle ADMIN, Personel ve Cihazlar bölümünden yeni giriş hesabı oluşturup aynı formdaki bildirim alıcısı kutusunu seçebilir. Yeni personel için ayrıca varsayılan kapalı **Otomatik aidat özetini alsın** kutusu vardır; uygun mali rol ve şubede mevcut kurala açık seçimle katılır. Mevcut personel adla aranıp ayrıca seçilebilir. Rol ve şube mali erişimi belirler; yalnız alıcı seçimi mali yetki veya haftalık kurala otomatik üyelik vermez. Personel kendi cihazında izin verir. [CR-023/024/026](../20-execution/CHANGE_REQUESTS.md), [PUSH_GUIDE](../40-operations/PUSH_GUIDE.md).

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
