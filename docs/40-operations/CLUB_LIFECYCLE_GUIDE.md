# Aile, sezon, aday kayıt ve sporcu takibi

Karar: [ADR-0009](../50-decisions/ADR-0009-aile-sezon-aday-takip.md), kullanıcı 2026-10-20 plan uygulama onayı. Yeni sağlayıcı veya otomatik push yoktur. Yalnız SporManage demo8cd9f72 yayını ve kullanıcının iPhone görünüm kabulü2026-10-20 tamamlandı; mevcut kayıtlar otomatik aile/sezon ilişkisi almadı.

## Aile hesabı

Sol menü **Aile Hesapları → Yeni aile**: şube/ad ve sporcuları seçin. Aynı şube ve tek aile koşulu sunucuda denetlenir; benzer telefonlar otomatik birleştirilmez. Düzenle ile üye çıkarılabilir. Arşiv üyelikleri ve borçları korur; Geri al kullanılabilir. Arşivli aileye yeni üye eklenemez.

ADMIN/SECRETARY aile ilişkilerini yönetir; ADMIN/ACCOUNTING tüm dönemler ve aktif/pasif sporcular için mali toplamları görür. SECRETARY yanıtında tutar/bakiye alanı yoktur. Tahsilat aile adına dağıtılmaz; kardeşin **Sporcunun ödemeleri** bağlantısı mevcut sporcu filtresini açar. Bu görünümde genel toplu iptal ve toplu işlem bağlantısı kapalıdır; genel listeye geçiş açık eylemle yapılır. İptal borçlar toplam dışı; kalan max(amount-paidAmount,0), PAID kalan sıfır; gecikme İstanbul vade günü sonrasıdır. Tarihsel Float/tahsilat hareket modeli değiştirilmedi (CR-009).

## Sezon yenileme

Sonraki örnek kısmi ödeme (2026-10-20): Ailede Ece'nin **Sporcunun ödemeleri** bağlantısı → 31.01.2027 sezon aidatında **Ödeme Kaydet**,500 TL/Nakit/20.10.2026 ile kayıt yapıldı. 1500 TL taksit Kısmi, ödenen500/kalan1000; Ece toplam kalan7000, Eren9250, aile kalan16250/ödenen6750/tahakkuk23000/geciken7000. Kalıcılık ve toplamlar kontrol edildi. Makbuzda çift düşüm nedeniyle kalan500 gösterilmesi CR-033 açık hatasıdır; doğru bakiye ödeme listesi ve ailede1000/16250 olarak doğrulandı. Aşağıdaki onay toplamları ödeme öncesidir.

Demo kullanım örneği (2026-10-20): **Örnek 2027 İlkbahar Sezonu**, 01.01.2027–31.03.2027. Mevcut Ece Arslan ve Eren Aksoy sezona bağlandı; ikisi **Devam edecek**, hedefleri sırasıyla Merkez U10 ve Merkez U16. Ücretler ilgili aylık aidat türüyle 1500/1750 TL, ilk vade 31.01.2027; 31 Ocak/28 Şubat/31 Mart için Ece 4500 TL, Eren 5250 TL, toplam 9750 TL. İlk görevde taslak bırakıldı; sonraki açık kullanıcı isteğiyle **Aidat borçlarını oluştur → Onayla** yapıldı. Aynı eski önizlemeyi tutan ikinci sekmeden tekrar onay da sınandı: yalnız 6 yeni borç, her sporcuda 8 toplam ödeme kaydı, yeni önizlemede **Önceden onaylandı / yeni borç 0 TL**. Aile artık 23000 TL tahakkuk, 6250 TL ödenen, 16750 TL kalan ve 7000 TL geciken gösterir. Gelecek vadeler gecikmiş sayılmaz; tahsilat ve grup geçişi yapılmadı. Bu tutarlar sentetik demo örneğidir, gerçek sezon fiyat kararı değildir.

1. Şubesi olmayan kulüp geneli ADMIN ortak takvimi oluşturur. Tarihlerde saat dilimi Europe/Istanbul kullanılır.
2. ADMIN/SECRETARY mevcut sporcuları **borç oluşturmadan** sezona bağlar. Eski sporcu kopyalanmaz; aile/sezon backfill yapılmaz. Şubesiz kayıt önce sporcu ekranından düzeltilir. Hazırlık düzeltme listesi şubesi eksik/pasif veya farklı şubedeki hedef grup sorunlarını isimleriyle gösterir; kapsam dışı grup ayrıntıları döndürülmez.
3. Seçili kayıtlar için Karar bekliyor/Görüşülecek/Devam edecek/Ayrıldı ve hedef grup hazırlanır. Güncel grup ve aktiflik değişmez.
4. ADMIN/ACCOUNTING ücret türü, dönem başına tutar ve ilk vade taslağı kaydeder. MONTHLY/QUARTERLY/SEMI_ANNUAL/YEARLY 1/3/6/12 aylık; ONE_TIME tek borçtur. İlk vade sezon içinde; sonraki vadeler bitişe kadar ve ilk gün çapası korunarak ay sonuna kısaltılır.
5. **Aidatları önizle → Aidat borçlarını oluştur**: aktif, Devam edecek, uygun grup/ücret şartı. Önizleme özeti değişmişse409 ve yeni önizleme gerekir. Tek transaction, satır kilitleri ve kaynak/sıra benzersizliği mükerrer onayı engeller. Onaylı ücretler taslaktan değişmez.
6. Sezon başlangıcında/sonrasında ADMIN ayrıca **Grup geçişini onayla** kullanır. SECRETARY yalnız hazırlık yapar. Eski açık GroupHistory kapanır, yeni geçmiş açılır; aynı gruba geçiş gereksiz geçmiş üretmez. Tekrar işlem aynı sonucu korur; pasif sporcu otomatik açılmaz, gelecekteki veya daha eski sezona geri geçiş reddedilir.

Onay/geçiş varsa takvim tarihleri korunur, ad düzenlenebilir. Aidat onayı ve grup geçişi birbirini otomatik başlatmaz. “Ayrıldı” kararı mevcut sporcu hesabını pasifleştirmez. Tahakkuk düzeltmesi mevcut ödeme işlemlerinden ayrıca değerlendirilir.

## Aday ve deneme

ADMIN/SECRETARY **Aday Kayıtlar → Yeni aday** ile kişi, iletişim, şube/grup ve not ekler. Denemeye davet mevcut antrenmana bağlanır; dış mesaj göndermez. Yeni davet eski denemeyi silmez; aynı aday/antrenman tekrar kayıt oluşturmaz. Katıldı/Gelmedi/İptal sonuçları ve değişiklik geçmişi tutulur. İptal veya gelecek antrenmana katılım yazılamaz.

TRAINER yalnız yetkili gruplardaki deneme adlarını/katılımını görür, iletişim ve aday notlarını alamaz. Kesin kayıt ADMIN/SECRETARY işlemidir. Form mevcut kayıt olasılıklarını gösterir; mevcut sporcuya açık seçimle bağlanabilir veya mevcut veli zorunluluğuna uyarak yeni sporcu oluşturur. Birincil veli gerekir; ADR-0002 yaş kararı uygulanmaz. Aynı adaya eşzamanlı kesin kayıt tek sporcu üretir. Aile ve sezon isteğe bağlı; borç oluşturulmaz. Vazgeçti geçmişi korur, Yeniden aç ile döner. Herkese açık form/veli girişi yoktur.

## İlgi bekleyenler

Güncel liste sadece yetkili nedenleri, öğrenci başına tek kartta gösterir. ADMIN tüm nedenler; ACCOUNTING mali gecikme; SECRETARY sezon yenileme; TRAINER kendi gruplarının devamsızlığı. Şube kapsamı, rol ve atanan kişinin erişimi sunucuda kontrol edilir. Şubesiz global erişim yalnız ADMIN'dir.

Varsayılanlar: 30 gün içinde art arda3 mazeretsiz devamsızlık; en az7 İstanbul takvim günü gecikme; sezon bitimine30 gün. ADMIN şube eşiklerini değiştirir. Yalnız tamamlanan, yoklaması alınan ve bitiş saati geçmiş antrenman; grup geçmişindeki üyelik aralığı dikkate alınır. Eksik sporcu kaydı seriyi keser; gelme/geç kalma/mazeret de keser. İptal/gelecek veya yoklaması alınmamış seans yokluk sayılmaz.

Sezon bitişi, mevcut sezondan sonraki en yakın bağlı sezonun kararıyla değerlendirilir: sonraki kayıt yoksa veya karar UNDECIDED/CONTACT ise takip gerekir; CONTINUING/LEFT ise yenileme görüşmesi tamamlanmıştır. Sezon bağlantısı olmayan sporcunun bitişi tahmin edilmez. Devamsızlık/sezon yalnız aktif; mali takip aktif/pasif tüm dönem borçlarını kapsar.

**Görüşme / sorumlu** not ve isteğe bağlı sonraki tarih kaydeder. İleri tarihli görüşmeler ayrı filtrede; görüşme nedeni ortadan kaldırmaz. Kaynak koşulu düzelince aktif karttan çıkar, görüşme geçmişi korunur. GET kayıt oluşturmaz; atama mali/grup yetkisi kazandırmaz. Bu sürüm otomatik risk puanı veya yeni push üretmez.

## Yayın ve işletim

Beş additive migration yalnız yerel ve demo için; seed/reset/DROP/backfill yok. Eski API'ler korunur; yeni gruplar `/api/families`, `/api/seasons`, `/api/prospects`, `/api/attention`; güvenli seçenekler `/api/club/options`. Auth/origin/no-store, mali alanların yanıttan çıkarılması ve nesne kapsamı ortak `club-access` katmanındadır. Eski geniş rol/nesne sorunları CR-002/003'te açık kalır; aileye bağlı sporcunun eski düzenleme ekranından başka şubeye taşınması önce aileden çıkarma gerektirir.

Yerel tarayıcıda `APP_ORIGIN=http://127.0.0.1:3077` sunucu ortamında açıkça verilir. Demo runtime origin/anahtar/cron ve Pazartesi09:00/Demo Kullanıcı tercihi korunur. Yayın öncesi yalnız demo DB yedeği alınır; `scripts/club-release-guard.cjs` mevcut kayıtların secret içermeyen sayım/hash özetini verir. Image .env/dump/cache yedeği içermez. Özlüce/main korunur. Migration geri alınırken yeni tablolar/borçlar silinmez; yazmaları durdurup destekleyen düzeltme sürümüyle ilerlenir. Doğrulanmış restore tatbikatı bu iş değildir.

Gerçek doğrulama/yayın sonuçları [CLUB_LIFECYCLE_VALIDATION](../30-quality/CLUB_LIFECYCLE_VALIDATION.md) ve [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md) içindedir.

## Demoda kayıtlı örnek aile

2026-10-20 kullanıcı talebiyle Merkez Şube’de **Örnek Kardeş Ailesi** oluşturuldu. Mevcut sentetik Ece Arslan ve Eren Aksoy açık seçimle örnek kardeş olarak bağlıdır. Tahakkuk13.250 TL, ödenen6.250 TL, kalan/geciken7.000 TL; ayrı ödeme ekranlarının10 satırıyla karşılaştırıldı. Bu kaydı incelemek için Aile Hesapları → Sporcular ve iletişim kullanılır; tahsilat her sporcunun kendi bağlantısından yapılır. Doğrulama notu ve eski Ödemeler gecikmiş adet sayacı bulgusuCR-032, kalite/handoff kaydındadır.
