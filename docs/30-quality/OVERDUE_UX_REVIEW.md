# Geciken aidat listesi — UI/UX incelemesi

Tarih: 2026-10-19. Kapsam: Bildirime dokunulduğunda açılan `/notifications/overdue`; yönetici/muhasebenin açık borçları okuması ve bulması. Kullanıcı “açılan listeyi kontrol edelim ui/ux olarak düzenleyelim” talimatıyla mevcut ekranda düzenlemeyi istedi. Yeni iş kuralı, mali yetki, API, migration veya ADR kararı yok.

## Yakalanan akış ve bulgular

1. Oturumu olmayan görünüm — iyileştirme gerekli. Ekranda “Giriş yapmalısınız” var, devam etmek için giriş düğmesi yok. Kanıt: `output/overdue-ux/01-session-expired-before.png`.
2. Masaüstü liste — veri okunabilir, tarama zor. Toplamlar tek metin satırında; 150 aidat tek uzun tabloda, arama/filtre/sayfalama yok. Kanıt: `02-list-desktop-before.png`. Gerçek demo:54 sporcu/150 aidat/201.000 açık bakiye.
3. 390×844 mobil liste — düzeltme gerekli. Dar sütunlarda isim/grup satır kırılıyor, bakiye sağda ekran dışında kalıyor. Kanıt: `03-list-mobile-before.png`. İlk yeniden boyutlandırma karesindeki menü geçiş animasyonu reddedildi; yerleşim tamamlanınca aynı dosya yeniden yakalanıp açıldı. Menünün kalıcı açık olduğu iddia edilmez.
4. Düzenlenen liste — yerel davranış kontrolü sürüyor. Mobilde kart, masaüstünde tablo; toplam kartları, Türkçe ad/grup araması, aktif/pasif ve grup filtreleri, vade/bakiye/ad sıralaması,20 aidatlık sayfalama. Her satır bir aidattır; sporcu gruplaması veya borç hesabı değiştirilmedi. Genel toplam ile filtre sonucu açıkça ayrılır.

## Uygulanan düzeltmeler

- Mobilde vade ve bakiye kartın içinde görünür. Özet kartları dar ekranda2 kolon, bakiye tam genişlik; mevcut renk/bileşenler kullanılır.
- Filtreler etiketlidir;44px kontroller, metinli durum rozetleri, tablo caption/scope, canlı sonuç sayısı ve sayfa değişiminde liste başlığına odak vardır.
- Başarılı okuma zaman damgası İstanbul saatidir; yenileme sırasında ilerleme, hata/yeniden deneme,401 giriş ve403 geri dönüş eylemleri ayrılır. Hata halinde mali veri kaldırılır.
- AppLayout içerik kolonuna min-width0 eklendi; dar ekranlarda içeriğin pencereyi genişletmesini engeller. Yetki/hesap/oturum politikası korunur.

## Doğrulama ve sınırlar

Yerel TypeScript kontrolü başarılı. İlk kontroldeki eski ES hedefiyle uyumsuz Unicode regex bayrağı kaldırıldı; yapılandırma/dependency değiştirilmedi. Yerel sunucu ve mevcut PostgreSQL konteyneri durduğu için aynı yerel ortam yeniden başlatıldı; veri reset/seed yapılmadı.

Gerçek tarayıcı yerel kontrolü:SAHIN araması Arda Şahin'in2 aidatını/2.000 tutarını buldu; genel toplam59.250 kaldı. Grup Merkez U10+aktif+bakiye sırası7 sporcu/10 aidat/8.750 sonuç verdi; bulunamayan ad0 sonuç ve filtre temizleme eylemi gösterdi. Ek sayfalama/genişlik/yayın kanıtı handoff'a eklenecek.

Ekran görüntüleri bu inceleme sırasında tarayıcıdan kaydedilip yerel dosya olarak açıldı. PNG kanıtları output altında Git dışında tutulur. Yerel veri canlı demodan farklıdır; öncesi/sonrası tutarlar görsel değişim nedeniyle değişmiş sayılmaz.390px tarayıcı kontrolü gerçek iPhone Safari veya VoiceOver testi değildir. Tam WCAG uyumu, ekran okuyucu ve tüm tarayıcı/platform kabulü iddia edilmez. API mali rol/şube hesapları ADR-0007 entegrasyon testlerinin kapsamındadır.
