# ADR-0009 — Aile, sezon, aday kayıt ve sporcu takibi

- Status: Accepted
- Date / approval date: 2026-10-20
- Decision owner / approved by: Kullanıcı / proje sahibi
- Approval evidence: Kullanıcı aynı başlıklı beş bölümlük planı bütünüyle “PLEASE IMPLEMENT THIS PLAN” talimatıyla onayladı. Onay; kapsam genişlemesi, aşağıdaki veri modeli/erişim sınırları, additive migration ve yalnız yerel/SporManage demo yayınını içerir.
- Supersedes: N/A. ADR-0003/0007/0008 ve mevcut bildirim işletimi korunur.

## Karar

1. Aynı şubedeki sporcuların isteğe bağlı tek aile bağlantısı; manuel ilişkilendirme, arşiv/geri alma. Mevcut veli satırları birleştirilmez. Aile mali görünümü ADMIN/ACCOUNTING; tahsilat sporcu başınadır.
2. Kulüp genelinde sezon takvimi yalnız global ADMIN tarafından yönetilir. Sporcu/sezon benzersiz kayıtları, yenileme kararı ve hedef grup içerir. Bağlama/hazırlama borç veya güncel grup değişikliği üretmez. Mali önizleme/onay ve sezon başlangıcı sonrası grup geçişi ayrı işlemlerdir. Sezon kaynaklı borçlar benzersiz kaynak/sıra ile korunur. Onaylı borçlar tekrar üretilmez.
3. ADMIN/SECRETARY aday, iletişim, deneme ve kesin kayıt yönetir. TRAINER yalnız kendi gruplarının deneme katılımını işler. Kesin kayıt transaction/kilit ve benzersiz sporcu bağlantısıyla tek kez yapılır; açık seçimle mevcut sporcuya bağlanabilir. Mevcut veli zorunluluğu korunur; ADR-0002 kabul edilmez.
4. Takip listesi güncel veriden hesaplanır: 30 günde art arda 3 ABSENT, en az 7 takvim günü gecikmiş açık bakiye, 30 gün içinde biten ve yenileme kararı bekleyen/görüşülecek sezon. ADMIN şube eşiklerini yönetir. Görüşme/atama ayrı kalıcı geçmiş; GET mutasyon yapmaz, mali nedenler mali rol dışında yanıta dahil edilmez.

## Yetki ve veri sınırı

ADMIN kapsam içi tüm işlemler; ACCOUNTING mali görünüm/hazırlık/onay ve mali takip; SECRETARY aile/aday/yenileme/hedef grup ve sezon takibi; TRAINER yalnız izinli grupların devamsızlık ve denemeleri. Şubesiz global erişim yalnız ADMIN'e aittir. Atama yetki kazandırmaz. Her yazma origin ve güncel aktif personel/nesne kapsamı kontrol eder. Yeni API'ler eski geniş rol yardımcılarını kullanmaz (CR-002/003 açık kalır).

Additive ilişkiler; eski satırlara aile/sezon varsayılmaz, branchless kayıtlar düzeltme ister. Silme, retention/purge, ödeme dağıtımı veya Float mali modeli değişikliği yok. Yeni sağlayıcı/paket, veli girişi, herkese açık form ve yeni push yok. MAIN/Özlüce kapsam dışı.

## Uygulama ve doğrulama

Aile → sezon → aday → takip sırasıyla yerel migration, yetki/iş kuralı entegrasyon testleri, typecheck, Docker ve demo kabulü. 200 sporcu, İstanbul gün sınırı, paralel onay/dönüşüm, ay sonu/altı aylık vade, eksik yoklama/grup geçmişi doğrulanır. Mevcut Pazartesi09:00/Demo Kullanıcı bildirimi değiştirilmez. Her aşamanın gerçek sonucu handoff'ta ayrıca kaydedilir; onay uygulamanın tamamlandığı anlamına gelmez.

Geri dönüşte ek tablolar/kolonlar silinmez; mali onay sonucu borçlar korunur. Yeni yazmaları durdurup destekleyen düzeltme sürümüyle ilerlenir; geçmişi bilmeyen runtime'ın veri bütünlüğü garanti edilmez.

## Karar tarihçesi

- 2026-10-20: Plan açıkça onaylandı; Accepted kaydı uygulama öncesinde oluşturuldu. Aile birleşik görünüm, ortak sezon, personel aday girişi, ayrı grup geçişi ve şube bazında aile kullanıcı tercihleridir.
