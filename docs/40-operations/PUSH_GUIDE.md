# Manuel Web Push — ilk aşama

Last updated: 2026-10-19. Karar: [ADR-0006](../50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) Accepted. Yerel ilk aşama uygulanmıştır; iPhone/HTTPS ortamında gerçek teslim henüz doğrulanmadı. Otomatik aidat kuralları ve scheduler etkin değildir.

## Ekranlar ve kişiler

- Yönetim: `/notifications`; aktif ADMIN/ACCOUNTING gönderim yönetir. Şube bağlı kullanıcı yalnız kendi şubesi kapsamında işlem yapar. Alıcı oluşturma, yeniden davet ve erişim iptali yalnız ADMIN'dir.
- Alıcı: `/recipient`; veli/sporcu ayrı alıcı oturumu kullanır ve yönetim paneline giremez. Personel mevcut personel oturumuyla kendi cihazını kaydeder.
- Yönetici, mevcut Parent veya Student kaydını seçip kişinin kimliğini ve alıcı yetkisini doğruladığını belirtir. Sporcu seçimi otomatik yaş kararı değildir; kendi hesabını kullanmaya uygun kişi yönetici tarafından doğrulanır.
- Tek kullanımlık davet 24 saat, alıcı oturumu 7 gün geçerlidir. Davet token'ı URL fragment'inde taşınır; DB'de yalnız SHA-256 özeti bulunur. Yeni davet eski kullanılmamış davetleri iptal eder; mevcut oturumları kapatmak için ayrıca `Alıcının erişimini kapat` kullanılır.
- Daveti yalnız doğrulanan kişiye yönetici iletir. Uygulama e-posta/SMS ile davet göndermez. Veli/sporcu kendi cihazında daveti kabul eder; başka kişinin bağlantısı yönetici cihazında açılmaz.

## Yerel runtime

`node scripts/setup-push-runtime.cjs` yerel VAPID anahtarlarını repository dışında, Windows'ta `%LOCALAPPDATA%/SporManage/aidattakip/push-runtime.json` dosyasında oluşturur. Var olan anahtarları korur; sırları yazdırmaz. Yerel başlatıcı bu dosyadaki değerleri yalnız sunucu sürecinin ortamına yükler. `.env`, anahtar dosyaları veya secret değerleri Git'e eklenmez.

Runtime değişkenleri: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (operatöre ait HTTPS URL veya mailto), `APP_ORIGIN` (tarayıcıdaki tam origin). Yerelde APP_ORIGIN `http://127.0.0.1:3077`; `localhost` farklı origin sayılır. Anahtar yenilenirse eski cihaz abonelikleri yeniden kaydedilmelidir. Yeni alıcı/push uçları mevcut JWT secret'ı olmadan personel oturumunu kabul etmez; genel AuthService fallback politikası bu işle değiştirilmedi.

Migration `20261019120000_add_manual_web_push` yerel DB'ye uygulandı. Beş yeni tablo (notification_recipients, push_invites, recipient_sessions, push_devices, push_deliveries), yeni enum değerleri ve Notification alıcı/cihaz ilişkileri ekler. Eski kayıtları silmez/dönüştürmez. Migration üretiminde fark edilen SystemSetting.updatedAt default farkı bu migration'a alınmadı. Genel seed/reset çalıştırılmaz.

## iPhone test adımları — dağıtım ve cihaz izni bekliyor

1. Onaylı HTTPS test ortamında bu kaynak, migration ve o ortama özel VAPID runtime değerleri hazırlanır. Yerel loopback adresine iPhone'dan bağlanılamaz. Yerel anahtarlar veya abonelikler production ile paylaşılmaz.
2. Yönetici `Alıcılar ve Cihazlar` bölümünde test alıcısını doğrulayıp kişisel davet oluşturur. Gerçek kişinin yerine sentetik test alıcısı seçilecekse bağlantıyı sadece test cihazını kullanan kişi alır.
3. Alıcı Safari'de `/recipient` sayfasını açıp Paylaş → Ana Ekrana Ekle ile uygulamayı ekler. Ana ekrandaki simgeden açınca kullanılmamış kişisel davet bağlantısını ilgili alana yapıştırıp `Davet bağlantısını kullan` ve `Daveti kabul et` seçer. Böylece oturum bu uygulama içinde kurulur. Davet daha önce Safari'de tüketildiyse yönetici yeni davet üretir. Oturumun Safari/ana ekran uygulaması arasında taşınacağı varsayılmaz; bu akış cihazda test edilmelidir.
4. Alıcı `Bildirimleri aç / cihazı yenile` düğmesine dokunur ve iOS izin sorusunu kendisi yanıtlar. İzin reddedildiyse arka planda atlatılmaz; kullanıcı cihaz ayarından yönetir.
5. Yönetici alıcıları yeniler; **tek alıcı ve tek cihaz** seçip manuel test mesajını gönderir. Sunucu bir gönderim kaydı oluşturur; dış push servisinin cevabı alıcı/cihaz başına PushDelivery'de tutulur.
6. Yönetim ekranındaki `Push servisi kabul etti` ile iPhone'da görünen bildirim ayrı ayrı doğrulanır. Bildirime dokunulduğunda yalnız `/recipient` açılır; ayrıntı için geçerli alıcı oturumu gerekir.
7. `Bildirimleri kapat`, alıcı oturumu çıkışı ve yönetici erişim iptali denenir. Eski cihaza yeni gönderim yapılmaması doğrulanır. Ekran/cihaz gözlemleri tarihli handoff'a işlenir.

Kilit ekranına kişi, tutar veya borç ayrıntısı gönderilmez; genel mesaj taşınır. Alıcı ekranı yalnız kendi recipientId'sine gönderilen mesajları ve güncel ilişkisi bulunan aktif sporcunun yayınlanmış uygulama içi mesajlarını gösterir.

## Gönderim sözleşmesi ve işletim sınırları

- Tekil `/api/notifications/[id]/send`, toplu `/bulk` ve uyumlu `/send` aynı gönderim servisini kullanır. `IN_APP` yayınlanır; `PUSH` gerçek Web Push adaptörüne gider. E-posta/SMS sağlayıcısı yokken hata verilir; sahte SENT üretilmez. Eski SENT kayıtları geçmişten korunmuştur; gerçek teslim kanıtı sayılmaz.
- Manuel push için kayıtlı alıcıya ait aktif ve süresi dolmamış **tek cihaz** gerekir. Serbest endpoint sunucudan seçilmez; yalnız desteklenen tarayıcı push servislerinin HTTPS adresleri kabul edilir. Kütüphanenin HTTPS gönderimi redirect izlemez.
- Aynı kayıt atomik PENDING → PROCESSING geçişiyle bir işleme alınır. Aynı bildirim/cihaz için benzersiz delivery vardır. `ACCEPTED` yalnız push servisinin HTTP kabulüdür; görüntülendi/okundu bilgisi değildir. 404/410 aboneliği pasifleştirir. İlk aşamada otomatik retry yoktur; yanıt kaybında dış serviste mutlak tek teslim garantisi yoktur.
- Beklenmeyen kesintide PROCESSING kalırsa otomatik tekrar gönderilmez; operatör geçmişi incelemelidir. FAILED sonrası yeni gönderim yeni kayıt olarak bilinçli oluşturulur.
- Gelecek zamanlı kayıt manuel erken gönderilemez. Tarih alanı cihazın saat diliminde girilir, ISO offset/UTC olarak API'ye gider; zamanlama kaldırılabilir. Otomatik işleyici kurulmadığı için tarih geldiğinde kendiliğinden gönderim yapılmaz. GET `/process-scheduled` 405 döndürür ve mutasyon yapmaz.
- Öğrenci/tümü veya grup seçimi aktif sporcu başına kayıt üretir; antrenör seçimi **antrenörün personel alıcı hesabına** kayıt üretir. Liste scheduledAt/sentAt/iletişim bilgilerini ve sayfalamayı döndürür. Gönderilmiş kayıtta alıcı/kanal düzenlenmez.
- Abonelikler cihaz oturumuyla sınırlıdır. Alıcı çıkışı/izin kapatma, personel çıkışı ve yönetici iptali sunucuda gönderimi durdurur. Süresi dolan cihazlar listede gönderim hedefi olmaz. Personel rolünü/aktifliğini değiştirmenin mevcut diğer API etkileri CR-002/014 kapsamında ayrıca açıktır.

## Doğrulama komutları

- `node node_modules/prisma/build/index.js validate`
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`
- `node --import tsx --test src/lib/notification-policy.test.ts` (DB yok)
- `node --import tsx --test src/lib/notification.integration.test.ts` (yalnız loopback:5477/aidat_takip; yalnız kendisinin oluşturduğu geçici kayıtları temizler; dış gönderici kontrollü test adaptörüdür)
- `node --import tsx --test prisma/demo.test.ts prisma/demo.integration.test.ts src/lib/reporting.test.ts`
- `node node_modules/next/dist/bin/next build`

Entegrasyon testi gerçek Apple/Google/Mozilla servisine mesaj iletmez; iPhone adımlarının yerine geçmez. Genel lint yapılandırması CR-011'de açık olduğundan ayrı `npm run lint` çalışır kalite kapısı sayılmaz.

## Dağıtım, lisans ve geri alma

Somut paket: `web-push` 3.6.7, MPL-2.0; `@types/web-push` 3.6.4. Paket lisans bilgisi kurulu package.json/LICENSE'dan doğrulandı. Kullanıcı 2026-10-19 tarihinde önceki incelemedeki bu somut paketi kullanmayı ve yalnız SporManage demo ortamına dağıtımı açıkça onayladı; hukuki lisans yorumu yapılmadı.

iPhone testi için onaylı hedef yalnız ayrı sentetik `spormanage-aidat-demo` uygulamasıdır. `main` push'u iki uygulamayı da tetikleyebildiği için demo ayrı `codex/manual-push-demo-20261019` ref'i üzerinden hazırlanır; uygulama/ref eşlemesi doğrulanmadan push veya dağıtım başlatılmaz. Yalnız demo runtime/migration değişir. Özlüce uygulaması/DB/rolleri bu aşamanın hedefi değildir. Canlı PostgreSQL sürümü 2026-10-19 demo rolüyle salt okunur sorguda 17.7 doğrulandı; CR-006 Compose takipleri ayrıca açıktır. Çalıştırma sonuçları tarihli [DEPLOYMENT](DEPLOYMENT.md) ve [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md) kaydında tutulur.

Önce yeni migration ve 5 tablonun/ek kolonların mevcut kayıtları koruduğu doğrulanır, ardından o ortama özel runtime anahtarlarıyla uygulama başlatılır. `/sw.js` ve `/manifest.webmanifest` oturumsuz erişilebilir, alıcı API'leri kendi dar oturumunu doğrular. Genel yönetim uçları alıcı çerezini kabul etmez.

Gönderimi durdurmak için alıcı erişimi veya cihazlar pasifleştirilir. Scheduler kurulmadığından durdurulacak otomatik iş yoktur. Migration geri alma/sütun silme veri kaybı doğurabileceği için otomatik uygulanmaz; eski image'a dönüş öncesi yeni enum değerleri ve mevcut push kayıtları değerlendirilmelidir. Bu rehber canlı migration/rollback yetkisi değildir.
