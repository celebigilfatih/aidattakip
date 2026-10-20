# Kulüp yaşam döngüsü doğrulaması — 2026-10-20

## Demo sezon mali onayı ve tekrar koruması — 2026-10-20

Kullanıcı Ece/Eren sezon aidatlarını oluşturmayı ve tekrar onay/aile toplamı kontrolünü açıkça istedi. Yalnız SporManage demo **Örnek 2027 İlkbahar Sezonu** için mevcut iki kayıt ve 9750 TL / 6 taksit önizlemesi doğrulandı. İlk aile görünümü 13250 tahakkuk/6250 ödenen/7000 kalan-geciken idi. Aynı onay öncesi önizleme ikinci sekmede de hazırlandı. Ana sekmeden Aidat borçlarını oluştur → Onayla sonrası iki kayıt Aidatlar onaylı oldu; aile 23000/6250/16750/7000 gösterdi. İkinci sekmenin eski önizlemesinden aynı iki kayıt tekrar Onayla ile sunucuya gönderildi. İşlem başarılı döndü; güncel önizleme iki sporcu için Önceden onaylandı, aynı üçer taksit ve yeni borç toplamı 0 TL / oluşturma düğmesi kapalı gösterdi. Bu kontrol yalnız düğmenin kapanması değildir; ikinci gerçek UI onayı da yapıldı. Paralel yarış bu canlı görevde sınanmadı; önceki entegrasyon testlerinin ayrı kanıtıdır.

| Sporcu | Yeni sezon borcu | Toplam ödeme kaydı | Tahakkuk | Ödenen | Kalan |
|---|---:|---:|---:|---:|---:|
| Ece Arslan | 3 × 1500 = 4500 TL | 8 (5 eski + 3 yeni) | 10750 TL | 3250 TL | 7500 TL |
| Eren Aksoy | 3 × 1750 = 5250 TL | 8 (5 eski + 3 yeni) | 12250 TL | 3000 TL | 9250 TL |
| Aile | 9750 TL | 16 | 23000 TL | 6250 TL | 16750 TL |

Her sporcunun ödeme listesinde 31.01.2027/28.02.2027/31.03.2027 vadeli yalnız üç sezon satırı Bekliyor ve ödenen sıfır; toplam kayıt sayısı sekiz. Ece geciken 2/3000 TL, Eren 3/4000 TL değişmedi. İkinci onay sonrası aile Yenile ile tekrar okundu: aynı 23000 tahakkuk/6250 ödenen/16750 kalan/7000 geciken. Yeni vadeler gelecekte olduğundan gecikme artmadı. Tahsilat veya grup geçişi yapılmadı; mevcut grup/hedefler U10/U16 ve geçiş bekliyor. Onaylı borçlar örnek kullanım için bırakıldı, silinmedi.

Kod/model/migration/dağıtım değişmedi; ADR-0009 geçerli. Main/Özlüce veya bildirim ayarlarında işlem yapılmadı. Kanıtlar output/season-example/demo-repeat-approved.png ve demo-family-after-approval.png Git dışı. Canlı UI tekrarlı onay/16 ödeme satırı/aile aritmetiği kontrol edildi; kaynak değişmediği için typecheck/entegrasyon paketi/Docker yeniden çalıştırılmadı, yeni iPhone testi yapılmadı. Aşağıdaki önizleme-only kaydı önceki aşamanın tarihçesidir.

## Demo örnek sezon — 2026-10-20

Kullanıcının örnek sezon/yenileme/önizleme isteği canlı /seasons ekranında uygulandı. **Örnek 2027 İlkbahar Sezonu**, 01.01.2027–31.03.2027; mevcut Ece Arslan (Merkez U10) ve Eren Aksoy (Merkez U16) borç oluşturmadan bağlandı. İlk durumları Karar bekliyor/Ücret hazırlanmadı idi. İkisi ayrı ayrı Devam edecek ve mevcut grupları hedef seçilerek kaydedildi; ücret türleri Merkez U10 Aylık Aidat ve Merkez U16 Aylık Aidat, aylık 1500/1750 TL, ilk vade 31.01.2027.

| Sporcu | Karar / hedef | Önizleme vadeleri | Tutar |
|---|---|---|---:|
| Ece Arslan | Devam edecek / Merkez U10 | 31.01, 28.02, 31.03.2027 | 3 × 1500 = 4500 TL |
| Eren Aksoy | Devam edecek / Merkez U16 | 31.01, 28.02, 31.03.2027 | 3 × 1750 = 5250 TL |
| Toplam | 2 kayıt | 6 taslak borç | 9750 TL |

Tam sayfa yenilemesi sonrası sezon, kararlar, hedefler ve taslak tutarları kalıcı; yeniden önizleme aynı vadeleri/toplamı verdi. Şubat son güne kısalırken Mart tekrar 31'e döndü. Satırlar Aidatlar onaylı yerine Taslak, güncel gruplar U10/U16 ve Geçiş bekliyor gösterir. Ayrı aile ekranında mevcut 13250 TL tahakkuk/6250 TL ödenen/7000 TL kalan-geciken aynı. Mali onay veya grup geçişi yapılmadı; yalnız sezon takvimi/iki ilişki/karar/ücret taslağı yazıldı. Kod/migration/deploy/rol/bildirim kuralı değiştirilmedi; main/Özlüce üzerinde işlem yapılmadı. ADR-0009 geçerli, yeni karar yok.

Kanıtlar Git dışında output/season-example/demo-preview.png ve demo-decisions.png. Tarayıcı tarih fill işlemi ilk gönderimde boş değer hatası verdi; tarih denetiminde klavye değişimiyle değerler kesinleştirilip başarılı kayıt görünür olarak doğrulandı. Kaynak değişmediği için typecheck/entegrasyon testi/Docker yeniden çalıştırılmadı; bu kayıt canlı UI işletim kabulüdür. Yeni iPhone testi yapılmadı.

ADR-0009 açık kullanıcı onayı, yerel/demo kapsam. Bu belge çalıştırılan kontrolleri ürün kabulü veya telefon gözlemiyle karıştırmaz.

| Kontrol | Sonuç |
|---|---|
| Dört modül + kaynak bütünlüğü için beş additive migration / yerel deploy ve Prisma generate | Başarılı,37 model/18 migration; eski satırlara aile/sezon ataması yok |
| Yeni birim/HTTP entegrasyonları |16 test başarılı; mali redaksiyon, origin/rol/şube, aile geçmiş/veri koruma, eşzamanlı mali onay ve aday dönüşümü, tarihler, yoklama, 200 sporcu/0 push |
| Mevcut src/lib testleri dahil |72 test başarılı |
| Prisma demo testleri / salt okunur kurulu demo |7 test başarılı; toplam79 |
| Typecheck |Başarılı |
| Nihai Docker |Başarılı; 8cd9f72 ve UID1001/37 model/artifact dışlama probe geçti |
| Yerel tarayıcı masaüstü/mobil akışlar |Aile oluştur/ayrıntı, sezon oluştur/bağla/karar/ücret/16 satır önizleme/Vazgeç ve aday oluştur/davet/katılım geçti. 1280px aile ve390px takip kartı, scrollWidth=viewportWidth. Kullanıcı tarayıcı onayını kapattıktan sonra uygulama içi kesin kayıt onayı/Vazgeç/tamamla, sorumlu atama, görüşme ve geçmiş de doğrulandı |
| Demo yayın / migration / eski veri-kural guard |Başarılı;8cd9f72 / Coolify vmpdtffg5zhxz6jssxmr7urc Success04m05s.18 applied migration/37 model, seed yok; önce/sonra hash ve sayımlar aynı, mevcut kural/ana iPhone/Özlüce korunur, worker10:56:06.024 UTC ilerledi |
| Fiziksel iPhone kabulü |Kullanıcı dört yeni ekranın açıldığını ve görünümün düzgün olduğunu doğruladı;390px tarayıcı kontrolü ayrı kanıttır |
| Bağımsız lint |Çalıştırılmadı; mevcut next lint/Next15 uyumsuzluğu CR-011 açık. Docker'ın standart build kontrolü ayrıca çalışır |

DB testleri loopback5477/aidat_takip guard ile çalışır; yalnız yeni fixture şubelerinin satırları finally transaction'ında temizlenir. Mevcut öğrenci/bildirim/kural sayıları korunur. Yeni takip testlerinde gönderici çağrısı yok; mevcut push regresyonlarında kontrollü adaptör kullanılır. Beklenen arşiv CHECK ihlali testi error logu üretir; başarılı assert.rejects kontrolüdür.

Geliştirme önbelleği layout.js SyntaxError üretince Next durdurulup `.next-before-club-20261020` olarak veri silmeden saklandı; yeni önbellekle giriş çalıştı. Bu klasör Git/Docker'dan dışlanır. Yerel runtime'a doğru APP_ORIGIN verildi; demo anahtarları değiştirilmedi.

## Yayın kabulü ve hazırlık tarihçesi

2026-10-20 devam kabulü: Kullanıcı takılan yerel tarayıcı onayını kapattı; panel tıklaması yeniden çalıştı. Yeni `Kabul UITest20261020` adayı UI üzerinden oluşturuldu, uygulama içi onaydan Vazgeç formu korudu, yeniden onay tek sporcu ve birincil veli oluşturdu; otomatik aidat oluşmadı. Yalnız bu yeni sporcuya eklenen100/40 kısmi ödeme fixture'ı takipte60 bakiye gösterdi; sorumlu ve not UI'dan kaydedildi, neden aktif kalırken görüşme geçmişinde aynı not görüldü. Kesin aday/sporcu ID ve soyadı/veli paylaşım guard'ı ile kendi fixture'ı temizlendi:60 sporcu/300 ödeme/0 aday/0 takip kaydı. Kanıtlar `output/club-lifecycle/local-conversion.png` ve `local-follow-up.png` (Git dışında). Önceki engel kayıtları tarihçedir. Yalnız demo kaynak8cd9f72 sabitlendi; Coolify `vmpdtffg5zhxz6jssxmr7urc`, başlangıç10:51:10 UTC/13:51:10 Türkiye. Yayın öncesi tekrar guard eski before.json ile aynı; dağıtım sonucu ve sonrası kontroller ayrıca kaydedilecek.

Native window.confirm testinde tarayıcı Input.dispatchMouseEvent/Emulation.setFocusEmulationEnabled timeout verdi; ardından mevcut Daralt dahil düğme eylemleri de çalışmadı. Yeni akışlar standart Radix uygulama içi ConfirmBox ile değiştirildi; typecheck ve ilgili16 test tekrar geçti. Bu son modal/görüşme tıklamaları geçti diye raporlanmaz. Kullanıcıdan görünen test onayında Vazgeç istendi; yeni yayın onayı istenmedi (önceki plan onayı geçerlidir).

UI fixture yalnız yeni UI Kabul 20261020 şubesi/özel grup/sezon/kişilerle çalıştı. Kimlik/şube/soyadı/veli paylaşım guard ile temizlendi:60 sporcu/300 ödeme, yeni aile/sezon/aday sayıları0. Mevcut demo öğrenci ve borçları ilişkilendirilmedi. Ekran kanıtları output/club-lifecycle/local-family.png ve local-attention-mobile.png Git dışındadır.

Ek son kontroller: Şubesi eksik veya hedef grubu uygunsuz sezon kayıtları düzeltme listesinde; yabancı şube hedef grup ayrıntıları GET yanıtından çıkarılır (DB/HTTP testi geçti). Sporcuya özel ödeme bağlantısı ilk sorgudan itibaren filtreli, genel toplu iptal/işlem düğmeleri kapalı; temizlenmiş test sporcu ID'siyle0 ödeme ve kapalı düğmeler tarayıcıda doğrulandı. Prisma validate başarılı; son schema diff yalnız önceden bilinen SystemSetting.updatedAt default farkını gösterdi, uygulanmadı. SQL kapsam kontrolü5 additive dosya. İlk diff-check iki uygulanmış generated migration'da boş EOF satırı uyarısı verdi; checksum geçmişi için SQL dosyaları kozmetik amaçla değiştirilmedi.

Nihai kaynak 8cd9f72e1ab4ca8a576bb70c009cda2a27530f95 / aidat-club-lifecycle:8cd9f72e1ab4: Docker exit0, image config sha256:04448a20e21a3334d37c4f16fc57bb383dd18db385fc260939d593d883220175. UID1001/37 model/mevcut worker ve .env/output/cache yedeğinin image dışında olduğu container probe ile doğrulandı. Son ilgili16 test/typecheck geçti; eski56 lib ve7 Prisma testleriyle79 test kanıtı vardır. Son UI onay/görüşme kabulü ve demo dağıtımı henüz yapılmadı.

## Nihai canlı kabul

Yalnız demo8cd9f72, Coolify Success04m05s; dört modül form açma/iptal, takip54 kayıt/20 kart/3 sayfa, arama ve görüşme formu kontrolü başarılı.390px dört sayfa ve1280px takip/görüşme taşmasız; geçici viewport reset. Canlı mutasyon/test fixture/push yok. Kullanıcı gerçek iPhone kabulü verdi; CR-031 kapalı. Ayrıntılı migration/veri hash/worker/Özlüce kanıtı DEPLOYMENT ve SESSION_HANDOFF başındadır. Önceki pending/engel cümleleri tarihsel hazırlık kaydıdır; dört ayrı demo yayını yapılmadı, son aday tek yayında uygulandı.

## 2026-10-20 — Demo örnek aile hesabı

Kullanıcı demo ortamında iki kardeş senaryosu ve birleşik borç/ödeme görünümü istedi. Canlı /families ekranından **Örnek Kardeş Ailesi**, Merkez Şube'de mevcut sentetik Ece Arslan (Merkez U10, demo-v1-student-merkez-u10-07) ve Eren Aksoy (Merkez U16, demo-v1-student-merkez-u16-06) seçilerek oluşturuldu. Bu, açıkça seçilmiş örnek kardeş ilişkisidir; gerçek akrabalık/soyadı/telefon eşleşmesi varsayılmadı, adlar ve veli kayıtları değiştirilmedi. Kayıt kullanıcı kullanımına bırakıldı, arşivlenmedi.

| Sporcu | Tahakkuk | Ödenen | Kalan |
|---|---:|---:|---:|
| Ece Arslan |6.250 TL|3.250 TL|3.000 TL|
| Eren Aksoy |7.000 TL|3.000 TL|4.000 TL|
| Aile |13.250 TL|6.250 TL|7.000 TL|

Her sporcunun ailedeki bağlantısından açılan /payments?studentId=… ekranındaki beşer görünür ödeme satırı bağımsız toplandı:10 satır, aile kartıyla aynı toplamlar. Eren'in ekipman1000/ödenen500/kalan500 kısmi ödemesi dahil. Aile geciken7.000 TL; tüm açık satırların vadeleri20 Ekim2026'dan öncedir. Aile sayfası tam yenileme sonrası aynı iki üye/toplamla kalıcı; mevcut veli iletişimleri ve sporcuya özel ödeme bağlantıları görünür. Yeni tahakkuk/tahsilat/veli/sporcu/bildirim üretilmedi. Yalnız demo aile ilişkisi yazıldı; kod/migration/deploy/main/Özlüce/haftalık kural değişmedi. ADR-0009 geçerli, yeni karar yok.

Ayrı bulgu **CR-032**: eski Ödemeler özeti Ece'de gecikmiş1 sayarken5 Ağustos ve5 Ekim vadeli iki açık borç vardır; API sayacı OVERDUE durumunu dışlar, anlık zamanı kullanır. Aile tutar hesabı doğru; legacy sayaç/durum gösterimi bu görevde değiştirilmedi. Kanıt output/club-lifecycle/demo-example-family.png ve demo-family-ece-payments.png (Git dışında). Bu işletim kontrolünde UI ve10 satır aritmetiği çalıştı; kaynak değişmediği için typecheck/test/Docker tekrar çalıştırılmadı.
