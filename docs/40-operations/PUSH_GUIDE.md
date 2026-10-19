# Personel bildirimleri ve otomatik aidat özeti

Karar: [ADR-0007](../50-decisions/ADR-0007-personel-bildirimleri-ve-aidat-ozeti.md) Accepted, 2026-10-19. Güncel demo fed6e33 personel oluşturma ve aynı formdan özet seçimi UI/API dağıtımı Success; Coolify her dakikalık işleyici doğrulandı. Gerçek personel iPhone manuel ve otomatik tek özet, mali liste açılışı ve kapalı saat kontrolü başarılı. 2026-10-19 kullanıcı talebiyle yalnız Demo Kullanıcı için mevcut Pazartesi09:00 Europe/Istanbul kuralı etkinleştirildi; sıradaki slot26.10.2026 09:00. Yeni oluşturulan kuralların kapalı varsayılanı değişmedi. Önceki veli iPhone testi bu yeni personel kabulünün yerine geçmez.

## Günlük kullanım

Yeni personel için ADMIN, Personel ve Cihazlar → **Yeni personel ekle** kullanır. Ad soyad/e-posta/ilk giriş şifresi/rol/şube; telefon isteğe bağlı, antrenör için şube zorunlu ve grup seçimi isteğe bağlıdır. Varsayılan rol Sekreterdir. **Bildirim alıcısı olarak seç** açıkken **Oluştur ve alıcı seç**, giriş hesabı ile alıcıyı birlikte kaydeder; kapatılırsa yalnız hesap oluşur. Giriş bilgileri otomatik iletilmez; mevcut e-posta tekrar oluşturulamaz. Mevcut personel adla aranır ve **Alıcı olarak seç** kullanılır. Cihaz izni personelin telefonunda verilir. Yönetici rolü yalnız bildirim almak için verilmemelidir.

Yeni yönetici/muhasebe için aynı formda **Pazartesi 09.00 aidat özetini alsın** kutusu işaretlenebilir; varsayılan kapalıdır. Alıcı seçimi açık olmalı ve şubesiyle uyumlu, yöneticinin erişebildiği mevcut Pazartesi09:00 kuralı bulunmalıdır. Tek kural kendiliğinden seçilir; birden fazla varsa kural seçilir. **Oluştur ve özete ekle**, hesap/alıcı/kural üyeliğini birlikte kaydeder. Kural kapalıysa açıkça belirtilir; bu form yeni kural oluşturmaz veya kapalı kuralı açmaz. Diğer alıcılar, zaman ve çalışma geçmişi değişmez; cihaz kurulmadan gönderim yapılmaz. Rol/şube değişince özet seçimini tekrar yapın. Mevcut personelin diğer takvim seçimleri Otomatik Aidat Özeti bölümünden yönetilir.

1. ADMIN /notifications → Personel ve Cihazlar bölümünde aktif personeli seçer. ADMIN/ACCOUNTING mali özet; diğer personel yalnız genel duyuru alır. Alıcı seçimi mali yetki sağlamaz.
2. Personel kendi hesabıyla /recipient açar. iPhone: Safari → Paylaş → Ana Ekrana Ekle, simgeden aç ve personel girişi. Bu cihazda bildirimleri aç düğmesine dokunup izni kendisi verir. Davet yoktur.
3. Eski veli aboneliği çakışırsa ekrandaki eski aboneliği sıfırla düğmesiyle tarayıcı aboneliğini kaldırıp yeniden açar. Eski sunucu cihaz sahipliği/geçmişi başka kişiye taşınmaz.
4. İlk cihaz ana cihazdır; personel kendi kayıtlı geçerli cihazlarından ana cihazı seçebilir. Otomatik özet yalnız ana cihaza; manuel duyuru seçili tek cihaza gider.
5. Cihaz 30 gün geçerlidir. Geçerli personel girişi + mevcut abonelik + granted izin, sayfa açılışı/öne gelmede aktif kaydı sessiz yeniler. Yeni izin sorusu otomatik açılmaz. Süresi bitmiş/pasif kayıt sessiz açılmaz; düğmeyle yeniden onay gerekir. Personel giriş süresi değişmedi.
6. Çıkış/cihazı kapatma/alıcıyı kaldırma gönderimi durdurur. Sessiz yenileme logout ile aynı alıcı kilidini kullanır. Platform izni/kaldırma anında sunucudan bilinemez; panel yalnız kayıt/son gönderim bilgisini gösterir. 404/410 cihazı pasifleştirir.

## Otomatik aidat özeti

ADMIN/ACCOUNTING kendi kapsamında hafta günleri, tek HH:mm Türkiye saati ve seçili yönetici/muhasebe alıcılarını seçer. Form Pazartesi 09:00; yeni kayıt daima kapalıdır. Önizlemeden sonra Düzenle → Kural etkin → Kaydet. Durdur düğmesi yeni gönderimleri keser. Şimdi tek özet gönder kapalı kuralda da bilinçli yeni manuel çalışma üretir; hata sonrası otomatik retry yok.

Vade günü Europe/Istanbul içinde tamamlanmış, durum PENDING/PARTIAL/OVERDUE ve max(amount-paidAmount,0)>0 olan tüm dönem aktif/pasif sporcu borçları alınır. PAID/CANCELLED ve vade günü devam edenler dışarıda. Önizleme, worker ve güncel liste aynı hesabı kullanır. Gönderim öncesi bakiye ve güncel kullanıcı/rol/şube/alıcı/cihaz yeniden kontrol edilir; borç kalmadıysa SKIPPED/CANCELLED. Raporlamanın diğer tarih aralığı veya eski ödeme filtreleri bu işte değiştirilmedi.

Kilit ekranına yalnız genel mesaj gider. Özet tıklaması /notifications/overdue açar; oturum yok/süresi dolmuşsa giriş sonrası aynı sayfaya döner. API aktif ADMIN/ACCOUNTING ve şube kapsamı ister. Güncel sayfada mobil/tablet kartları, masaüstü tablo, kapsam toplamları ve ayrı filtre sonuçları bulunur. Ad/grup araması, durum/grup filtresi, sıralama ve20 aidat sayfalaması yalnız görüntüyü daraltır; borç hesabı ve gönderim kapsamını değiştirmez. Push tek takip mekanizması değildir.

## İşleyici ve kayıtlar

Coolify yalnız demo uygulamasında her dakika container içinde şu komutu çalıştırır:

    node --import tsx /app/scripts/staff-summary-worker.ts

Sunucu timezone ne olursa olsun işleyici takvimi Europe/Istanbul olarak değerlendirir. Public cron API yok. Yeni bağımlılık yok; mevcut TSX ve paylaşılan servisler runtime image'a kopyalanır. Kurallar kapalıyken işleyici bildirim üretmez.

Bir saat dahil telafi yapılır; daha eski slot MISSED, birikmiş mesaj gönderilmez. Rule/slot benzersizliği ve transaction row lock çift çalışmayı engeller. Çalışmaya bağlı alıcı başına bir Notification ve tek ana cihaz delivery üretilir. PROCESSING kesintisi veya yanıt belirsizliği otomatik tekrar edilmez; geçmiş operatör tarafından incelenir. ACCEPTED yalnız servis HTTP kabulüdür. Tarihçe, başarısızlar ve eski veli kayıtları korunur; otomatik retention/purge yok.

## Test ve yayın

    node --import tsx --test src/lib/service-worker.test.ts src/lib/notification-policy.test.ts src/lib/staff-summary-policy.test.ts src/lib/notification.integration.test.ts prisma/demo.test.ts prisma/demo.integration.test.ts src/lib/reporting.test.ts
    node node_modules/typescript/bin/tsc --noEmit --incremental false
    docker build -t aidattakip:staff-summary-20261019 .

Yalnız yerel DB entegrasyonu kendi fixture'ını temizler; gerçek push stub'dır. Ayrı dal/sabit demo commit ve yedek doğrulanmadan migration/yayın yapılmaz. Main/Özlüce korunur. Geri alma: önce kuralları durdur ve demo Scheduled Task'ı kapat. Migration veya geçmiş otomatik silinmez; eski image yeni 30 günlük cihaz politikasıyla uyumsuz olabileceği için değerlendirmeden dönülmez.

## Önceki manuel Web Push rehberi — ADR-0006 tarihçesi

# Manuel Web Push — ilk aşama

Last updated: 2026-10-19. Karar: [ADR-0006](../50-decisions/ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) Accepted. İlk aşama yerel ve yalnız SporManage HTTPS demo ortamında hazırdır. Güncel 5e1fd7c dağıtımı, migration ve runtime/API kontrolleri başarılı. 2026-10-19 gerçek iPhone testi: Apple HTTP201/ACCEPTED; kullanıcı bildirimin geldiğini ve dokununca Volkan Acar alıcı ekranının açıldığını doğruladı. Otomatik aidat kuralları ve scheduler etkin değildir. [DEPLOYMENT](DEPLOYMENT.md).

## Ekranlar ve kişiler

- Yönetim: `/notifications`; aktif ADMIN/ACCOUNTING gönderim yönetir. Şube bağlı kullanıcı yalnız kendi şubesi kapsamında işlem yapar. Alıcı oluşturma, yeniden davet ve erişim iptali yalnız ADMIN'dir.
- Alıcı: `/recipient`; veli/sporcu ayrı alıcı oturumu kullanır ve yönetim paneline giremez. Personel mevcut personel oturumuyla kendi cihazını kaydeder.
- Yönetici, mevcut Parent veya Student kaydını seçip kişinin kimliğini ve alıcı yetkisini doğruladığını belirtir. Sporcu seçimi otomatik yaş kararı değildir; kendi hesabını kullanmaya uygun kişi yönetici tarafından doğrulanır.
- Tek kullanımlık davet 24 saat, alıcı oturumu 7 gün geçerlidir. Davet token'ı URL fragment'inde taşınır; DB'de yalnız SHA-256 özeti bulunur. Yeni davet eski kullanılmamış davetleri iptal eder; mevcut oturumları kapatmak için ayrıca `Alıcının erişimini kapat` kullanılır.
- Daveti yalnız doğrulanan kişiye yönetici iletir. Uygulama e-posta/SMS ile davet göndermez. Veli/sporcu kendi cihazında daveti kabul eder; başka kişinin bağlantısı yönetici cihazında açılmaz.

## Yerel runtime

`node scripts/setup-push-runtime.cjs` yerel VAPID anahtarlarını repository dışında, Windows'ta `%LOCALAPPDATA%/SporManage/aidattakip/push-runtime.json` dosyasında oluşturur. Var olan anahtarları korur; sırları yazdırmaz. Yerel başlatıcı bu dosyadaki değerleri yalnız sunucu sürecinin ortamına yükler. `.env`, anahtar dosyaları veya secret değerleri Git'e eklenmez.

Runtime değişkenleri: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (operatöre ait HTTPS URL veya mailto), `APP_ORIGIN` (tarayıcıdaki tam origin). Yerelde APP_ORIGIN `http://127.0.0.1:3077`; `localhost` farklı origin sayılır. Anahtar yenilenirse eski cihaz abonelikleri yeniden kaydedilmelidir. Yeni alıcı/push uçları mevcut JWT secret'ı olmadan personel oturumunu kabul etmez; genel AuthService fallback politikası bu işle değiştirilmedi.

Migration `20261019120000_add_manual_web_push` yerel ve kullanıcı onaylı SporManage demo DB'sine uygulandı. Beş yeni tablo (notification_recipients, push_invites, recipient_sessions, push_devices, push_deliveries), yeni enum değerleri ve Notification alıcı/cihaz ilişkileri ekler. Eski kayıtları silmez/dönüştürmez. Demo dağıtım öncesi yedeği ve sonrasında 60 sporcu/300 ödeme koruması doğrulandı. Migration üretiminde fark edilen SystemSetting.updatedAt default farkı bu migration'a alınmadı. Genel seed/reset çalıştırılmaz.

## iPhone test adımları — ilk gerçek test kabul edildi

1. Onaylı HTTPS test ortamında bu kaynak, migration ve o ortama özel VAPID runtime değerleri hazırlanır. Yerel loopback adresine iPhone'dan bağlanılamaz. Yerel anahtarlar veya abonelikler production ile paylaşılmaz.
2. Yönetici `Alıcılar ve Cihazlar` bölümünde test alıcısını doğrulayıp kişisel davet oluşturur. Gerçek kişinin yerine sentetik test alıcısı seçilecekse bağlantıyı sadece test cihazını kullanan kişi alır.
3. Alıcı Safari'de `/recipient` sayfasını açıp Paylaş → Ana Ekrana Ekle ile uygulamayı ekler. Ana ekrandaki simgeden açınca kullanılmamış kişisel davet bağlantısını ilgili alana yapıştırıp `Davet bağlantısını kullan` ve `Daveti kabul et` seçer. Böylece oturum bu uygulama içinde kurulur. Davet daha önce Safari'de tüketildiyse yönetici yeni davet üretir. Oturumun Safari/ana ekran uygulaması arasında taşınacağı varsayılmaz; bu akış cihazda test edilmelidir.
   Ekranda `Açık oturum: Kulüp personeli` yazması veli daveti kabulü değildir. Personel oturumu açıkken de davet alanı kullanılabilir; testte `Volkan Acar` ve `Açık oturum: Veli`, ardından `Bu cihaz kaydedildi` mesajı doğrulanmalıdır.
4. Alıcı `Bildirimleri aç / cihazı yenile` düğmesine dokunur ve iOS izin sorusunu kendisi yanıtlar. İzin reddedildiyse arka planda atlatılmaz; kullanıcı cihaz ayarından yönetir.
5. Yönetici alıcıları yeniler; **tek alıcı ve tek cihaz** seçip manuel test mesajını gönderir. Sunucu bir gönderim kaydı oluşturur; dış push servisinin cevabı alıcı/cihaz başına PushDelivery'de tutulur.
6. Yönetim ekranındaki `Push servisi kabul etti` ile iPhone'da görünen bildirim ayrı ayrı doğrulanır. Bildirime dokunulduğunda yalnız `/recipient` açılır; ayrıntı için geçerli alıcı oturumu gerekir.
7. `Bildirimleri kapat`, alıcı oturumu çıkışı ve yönetici erişim iptali denenir. Eski cihaza yeni gönderim yapılmaması doğrulanır. Ekran/cihaz gözlemleri tarihli handoff'a işlenir.

Kilit ekranına kişi, tutar veya borç ayrıntısı gönderilmez; genel mesaj taşınır. Alıcı ekranı yalnız kendi recipientId'sine gönderilen mesajları ve güncel ilişkisi bulunan aktif sporcunun yayınlanmış uygulama içi mesajlarını gösterir.

İlk test geçmişi: 25 karakter ham CUID Topic Apple tarafından BadWebPushTopic/400 ile reddedildi. Topic 32 karakter hash biçimine düzeltildikten sonra aynı cihaz/anahtarlarla HTTP201 ve kullanıcı ekran kabulü alındı. İki başarısız kayıt korunur. İzin kapatma/logout/yönetici iptali yerel entegrasyonda sınandı; gerçek iPhone üzerindeki bu üç iptal senaryosu ayrıca denenmedi.

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
