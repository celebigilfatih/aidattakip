# Kulüp yaşam döngüsü doğrulaması — 2026-10-20

ADR-0009 açık kullanıcı onayı, yerel/demo kapsam. Bu belge çalıştırılan kontrolleri ürün kabulü veya telefon gözlemiyle karıştırmaz.

| Kontrol | Sonuç |
|---|---|
| Dört modül + kaynak bütünlüğü için beş additive migration / yerel deploy ve Prisma generate | Başarılı,37 model/18 migration; eski satırlara aile/sezon ataması yok |
| Yeni birim/HTTP entegrasyonları |16 test başarılı; mali redaksiyon, origin/rol/şube, aile geçmiş/veri koruma, eşzamanlı mali onay ve aday dönüşümü, tarihler, yoklama, 200 sporcu/0 push |
| Mevcut src/lib testleri dahil |72 test başarılı |
| Prisma demo testleri / salt okunur kurulu demo |7 test başarılı; toplam79 |
| Typecheck |Başarılı |
| İlk Docker adayı |Başarılı; son UI/koruma düzeltmeleri sonrası nihai build ayrıca kaydedilecek |
| Yerel tarayıcı masaüstü/mobil akışlar |Aile oluştur/ayrıntı, sezon oluştur/bağla/karar/ücret/16 satır önizleme/Vazgeç ve aday oluştur/davet/katılım geçti. 1280px aile ve390px takip kartı, scrollWidth=viewportWidth. Son uygulama içi onay ve görüşme eylemi tarayıcı kontrolü takıldığı için tamamlanmadı |
| Demo yayın / migration / eski veri-kural guard |Yayın henüz başlatılmadı; yedek ve yayın öncesi özet alındı. Coolify kaydet/Deploy ve sonrası guard bekliyor |
| Fiziksel iPhone kabulü |Bu işte kullanıcı gözlemi alınmadı; tarayıcı mobil genişlik kontrolü ayrı kanıttır |
| Bağımsız lint |Çalıştırılmadı; mevcut next lint/Next15 uyumsuzluğu CR-011 açık. Docker'ın standart build kontrolü ayrıca çalışır |

DB testleri loopback5477/aidat_takip guard ile çalışır; yalnız yeni fixture şubelerinin satırları finally transaction'ında temizlenir. Mevcut öğrenci/bildirim/kural sayıları korunur. Yeni takip testlerinde gönderici çağrısı yok; mevcut push regresyonlarında kontrollü adaptör kullanılır. Beklenen arşiv CHECK ihlali testi error logu üretir; başarılı assert.rejects kontrolüdür.

Geliştirme önbelleği layout.js SyntaxError üretince Next durdurulup `.next-before-club-20261020` olarak veri silmeden saklandı; yeni önbellekle giriş çalıştı. Bu klasör Git/Docker'dan dışlanır. Yerel runtime'a doğru APP_ORIGIN verildi; demo anahtarları değiştirilmedi.

## Yayın hazırlığı ve kalan kontrol

Native window.confirm testinde tarayıcı Input.dispatchMouseEvent/Emulation.setFocusEmulationEnabled timeout verdi; ardından mevcut Daralt dahil düğme eylemleri de çalışmadı. Yeni akışlar standart Radix uygulama içi ConfirmBox ile değiştirildi; typecheck ve ilgili16 test tekrar geçti. Bu son modal/görüşme tıklamaları geçti diye raporlanmaz. Kullanıcıdan görünen test onayında Vazgeç istendi; yeni yayın onayı istenmedi (önceki plan onayı geçerlidir).

UI fixture yalnız yeni UI Kabul 20261020 şubesi/özel grup/sezon/kişilerle çalıştı. Kimlik/şube/soyadı/veli paylaşım guard ile temizlendi:60 sporcu/300 ödeme, yeni aile/sezon/aday sayıları0. Mevcut demo öğrenci ve borçları ilişkilendirilmedi. Ekran kanıtları output/club-lifecycle/local-family.png ve local-attention-mobile.png Git dışındadır.
