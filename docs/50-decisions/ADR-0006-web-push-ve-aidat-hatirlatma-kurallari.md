# ADR-0006 — Web Push ve aidat hatırlatma kuralları

- Status: Accepted
- Date: 2026-10-19
- Author: Codex
- Decision owners: Proje sahibi
- Approval required: Evet — alıcı kimliği/yetkisi, şema/migration, arka plan işletimi, bağımlılık ve kapsam kararları.
- Approved by / approval date / evidence: Kullanıcı, 2026-10-19: “ADR-0006’daki planı onaylıyorum. Önce bildirim ekranındaki hataları düzeltip veli/sporcu alıcı kaydını ve tek cihazda manuel push gönderimini çalışır hale getirelim.”
- Concrete package/deployment approval: Kullanıcı, 2026-10-19: “Onaylıyorum. web-push paketini kullanarak yalnız SporManage demo ortamına dağıtalım ve iPhone’da gerçek bildirim testini yapalım.” Önceki incelemede açıkça belirtilen `web-push` 3.6.7 MPL-2.0 paket seçimi ve ayrı demo HTTPS dağıtımı onaylandı. Demo için ayrı `codex/manual-push-demo-20261019` ref'i hazırlanır; `main` ve Özlüce dağıtımı bu onayın kapsamında değildir.
- Confirmed user intent: Geciken aidatlar ve belirli gün/haftalarda bildirim; alıcılar hem veli/sporcular hem kulüp personeli. Bu hedef, aşağıdaki teknik/politika tercihlerinin onayı değildir.
- Supersedes / Superseded by: N/A — yeni öneri; mevcut ADR'leri değiştirmez.

## Context — mevcut yapı ve doğrulama sınırı

2026-10-19 tarihinde yerel `/notifications` ekranı ve oluşturma formu mevcut demo ADMIN ile incelendi. Liste, tür/durum/yöntem/sporcu filtreleri, öğrenci/grup/antrenör alıcı seçenekleri ve tek seferlik tarih alanı var. Form kayıt oluşturmadan kapatıldı; hiçbir gönderim veya scheduled-processor çağrısı yapılmadı.

| Bulgu | Kaynak / etkisi |
|---|---|
| Push kanalı yok | `NotificationMethod` yalnız EMAIL/SMS/IN_APP; push aboneliği, service worker, PWA manifesti veya VAPID uygulaması bulunmadı |
| Uygulama içi bildirim push değildir | [InAppNotifications](../../src/components/InAppNotifications.tsx) 30 saniyede bir listeyi sorgular; okundu sayacı örnektir, sunucuda kişi bazlı okuma kaydı yok |
| Birden fazla gönderim yolu | [tekil send](../../src/app/api/notifications/[id]/send/route.ts), [send API](../../src/app/api/notifications/send/route.ts), [notifications servisi](../../src/lib/notifications.ts) ve [notification-service](../../src/lib/notification-service.ts) farklı yollar kullanır; e-posta/SMS simülasyon veya sağlayıcı çağrısı olmadan başarı içerir |
| Toplu gönderim iletim yapmıyor | [bulk](../../src/app/api/notifications/bulk/route.ts) `send` işlemi yalnız PENDING kayıtları SENT yapıyor |
| Zaman alanı otomasyon değildir | [process-scheduled](../../src/app/api/notifications/process-scheduled/route.ts) çağrılırsa vadesi gelen PENDING kayıtları işler; repository'de bunu periyodik çağıran iş bulunmadı. GET veri değiştirir; [middleware](../../middleware.ts) personel oturum çerezi bekler |
| Otomatik borç taraması yok | `createPaymentReminders()` yalnız `created: 0` dönen taslaktır; haftalık/aylık tekrar modeli yok |
| Alıcı/sözleşme eksikleri | Formdaki `recipientType/groupId/trainerId` POST tarafından çözülmüyor. Varsayılan `studentId='all'` gerçek sporcu gibi aranarak 404'e gider. Liste GET'i scheduledAt/sentAt/alıcı iletişim alanlarını seçmiyor; [CR-020](../20-execution/CHANGE_REQUESTS.md) |
| Veli/sporcu kimliği eksik | [User/Student/Parent](../../prisma/schema.prisma) arasında doğrulanmış alıcı oturumu/cihaz ilişkisi yok; mevcut User rolleri personel içindir. Telefon/e-posta kaydı tek başına push adresi değildir |

Bu bir güvenlik taraması değildir; mevcut personel rol/nesne sınırları CR-002/003 kapsamında ayrıca açıktır.

## Decision drivers

Her alıcıya yalnız yetkili olduğu kayıtların bildirilmesi; ödeme sonrası gereksiz hatırlatmayı durdurma; seçilebilir takvim; kayıt ile gerçek iletimi ayırma; yeniden başlatma/tekrar tetiklenmede kontrollü davranış; mevcut Next/Prisma/PostgreSQL/Coolify yapısına uyum.

## Kabul edilen plan ve aşama sınırı

2026-10-19 onayıyla ilk uygulama aşaması: bildirim ekranı/API sözleşmesi, güvenli veli/sporcu alıcı kaydı ve tek cihazda manuel Web Push. Otomatik aidat kuralları, scheduler ve canlı dağıtım bu ilk uygulama adımında etkinleştirilmez. Kullanıcı gerçek test cihazını iPhone olarak seçti; HTTPS test ortamı ve cihazdaki kullanıcı izni gerekecek.

İlk aşama uygulama ayrıntıları: alıcı kaydını yalnız aktif ADMIN, mevcut Parent/Student kaydıyla ilişkiyi kendisi doğrulayarak açar; tek kullanımlık 24 saatlik davet bağlantısını doğru kişiye kendisi iletir. Ham davet URL fragment'inde taşınır; DB'de SHA-256 özeti tutulur. Ayrı HttpOnly/SameSite=Strict alıcı oturumu 7 gün geçerlidir; personel yetkisi sağlamaz. Bildirim yönetimi aktif ADMIN/ACCOUNTING ile sınırlıdır; şube bağlı kullanıcı yalnız kendi şubesini yönetir. Diğer personel kendi cihazını kaydedebilir. Cihaz çıkışında abonelik sunucuda iptal edilir. Kilit ekranı içeriği genel tutulur, ayrıntı alıcı oturumunda görüntülenir. Bildirim/audit saklama için otomatik silme politikası bu aşamada eklenmez.

İlk aşamada denenen kanal kütüphanesi `web-push` 3.6.7 (paket lisansı **MPL-2.0**), tip paketi `@types/web-push` 3.6.4; kilitli sürümler package.json/package-lock.json'da kaydedilir. Yeni lisans yükü için AGENTS onay kapısı nedeniyle bu somut paket seçiminin dağıtım öncesi açık onayı gerekir. VAPID anahtarları yalnız runtime ortamına yazılır. İlk aşamada açık DNS host listeli HTTPS push endpoint doğrulaması ve redirect izlemeyen gönderim kullanılır; key/endpoint/token loglanmaz. Lisans seçimi dışında bu uygulama ayrıntıları onaylanan güvenli ilk aşamanın somutlaştırılmasıdır.

1. **Kanal:** İlk aday standart Web Push ve ana ekrana eklenebilen web uygulamasıdır (PWA). Personel mevcut girişini kullanır. Veli/sporcu için yönetim paneli yetkisi vermeden doğrulanmış, sınırlı bir alıcı giriş/kayıt akışı tasarlanır. Davet/hesap doğrulama yöntemi ve oturum politikası TBD; mevcut veli telefonunu bilen kişinin abonelik sahiplenmesi kabul edilmez. Çocuk/yetişkin yaş eşiği ADR-0002'den bağımsız varsayılmaz; yetkili alıcı ilişkisi açıkça doğrulanır.
2. **Cihaz:** Alıcı kendi cihazında bildirim izni verir; endpoint ve şifreleme anahtarları sunucuda doğrulanmış alıcıya bağlanır. Birden fazla cihaz, izin iptali, oturum çıkışı/ortak cihazdan ayrılma ve geçersiz aboneliğin kaldırılması ele alınır. PWA/service-worker/manifest kaynaklarının erişimi ve abonelik API'sinin kimlik/yetki/CSRF sınırları uygulamadan önce gözden geçirilir.
3. **Yönetim ekranı:** Mevcut sayfa `Gönderimler`, `Otomatik Kurallar`, `Alıcılar ve Cihazlar` alanlarıyla genişletilir. Manuel gönderim; alıcı önizlemesi/sayısı, kanal, şube/grup filtresi ve hemen/tek seferlik zaman seçimi sunar. Kurallar hafta günleri, her N hafta (başlangıç haftasıyla), ay günleri, saat ve Europe/Istanbul zaman dilimini tutar. Ayın olmayan günü, kaçırılan çalışma ve duraklatma davranışları uygulama öncesi netleştirilir.
4. **Aidat koşulu:** `dueDate` geçmiş, durum PENDING/PARTIAL/OVERDUE ve `max(amount-paidAmount,0)>0` olan borçlar adaydır; PAID/CANCELLED dışarıda kalır. Yalnız güncel ayla sınırlanmaz. Aktif sporcu filtresi, vade gününün saat sınırı ve pasif sporcu borçlarının dahil edilmesi TBD. Gönderimden hemen önce bakiye/izin/yetkili alıcı ilişkisi yeniden okunur; kapanan borç için gönderim SKIPPED olur. Rapor katmanındaki açık bakiye yaklaşımı kaynak alınır, yeni para modeli bu öneriyle seçilmez.
5. **Alıcıya göre içerik:** Veli/sporcu yalnız kendi bağlı kayıtlarının hatırlatmasını alır. Personel için yetkili şube/grup kapsamında ayrı özet veya istisna bildirimi üretilebilir; hangi rollerin oluşturacağı/alacağı TBD. Aynı velinin birden fazla çocuğu/borcu için uygun tek özet önerilir. Kilit ekranında genel mesaj, tutar/kişi ayrıntısı yalnız yetkili oturumdan sonra önerilir; bu gizlilik tercihi henüz kabul edilmedi.
6. **Arka plan işi:** Coolify Scheduled Tasks'ın uygulama container'ında bir işleyiciyi periyodik çalıştırması ilk adaydır. İşleyici zamanı gelen kuralı bulur, güncel alıcı/borçları hesaplar, DB'de gönderim işi üretir ve kanal adaptörüne aktarır. Tarayıcı açık olmasına bağlı değildir. Mevcut public/çerezli GET endpoint'ini korumasız cron uç noktasına çevirmek önerilmez; container içi komut yaklaşımı değerlendirilir. Komut, sıklık, sunucu zaman dilimi ve kurulu Coolify sürüm desteği TBD; işleyici dosyasının mevcut Docker image'ına ayrıca paketlenmesi gerekir.
7. **Kalıcı işler ve durumlar:** Kural, doğrulanmış alıcı/cihaz aboneliği ve alıcı/cihaz başına gönderim-deneme kayıtları gerekir; kesin Prisma modeli/alanları ve migration TBD. Mevcut genel Notification kaydıyla ilişkisi tasarlanır. Kural+alıcı+takvim dilimi başına benzersiz iş ve atomik iş sahiplenme ile çift üretim engellenir. Sınırlı retry/backoff, son kullanma ve geçersiz abonelik yönetimi eklenir. Dış push servisinde kabulden sonra yanıt kaybı gibi durumlarda mutlak tek teslim garantisi verilmez.
8. **Gerçek sonuç:** Manuel, toplu ve otomatik gönderim aynı gönderim servisini kullanır. Kuyruğa alındı, servise iletildi/kabul edildi, başarısız, atlandı ve uygulamada okundu birbirinden ayrılır; kesin durum enum'u TBD. Push servisinin isteği kabul etmesi cihazın gösterdiği veya kullanıcının okuduğu anlamına gelmez. Uygulama içi okuma ayrıca kalıcı alıcı kaydıyla tutulur.

## Örnek kurallar — yalnız öneri

| Amaç | Örnek takvim/koşul | Alıcı |
|---|---|---|
| Vade yaklaşımı | Vadeden 3 gün önce 10:00 | İzinli veli/sporcu |
| Gecikme hatırlatması | Vade sonrası 1. ve 7. gün 10:00; bakiye hâlâ açık | İzinli veli/sporcu |
| Düzenli borç hatırlatması | Her pazartesi veya her 2 haftada bir pazartesi 10:00 | Borcu olan izinli veli/sporcu |
| Aylık kontrol | Ayın 1 ve 15'i, seçilen saat | Kuralla eşleşen alıcılar |
| Kulüp özeti | Her pazartesi 09:00; yetkili kapsamdaki geciken kayıt özeti | Seçilen kulüp personeli |

Örneklerin hepsi birden etkinleştirilmez; çakışan kurallar/sıklık üst sınırı ve sessiz saatler için tek politika seçilmelidir. Kesin takvim TBD.

## Alternatives considered

- Yönetilen push servisi: Abonelik/raporlama işini azaltabilir; sağlayıcı, dışa veri aktarımı, maliyet ve vendor bağımlılığı değerlendirmesi gerekir. Seçilmedi.
- Native mobil uygulama: Ayrı ürün/dağıtım/bakım kapsamı gerektirir; bu incelemede önerilen ilk adım değildir.
- Yalnız uygulama içi kayıt: Mevcut ekrana yakın; uygulama dışındaki telefon bildirimi ihtiyacını karşılamaz.
- SMS/e-posta tamamlayıcı kanal: Push izni olmayanlar için ayrıca değerlendirilebilir; ücret/sağlayıcı ve iletişim izinleri ayrı onay ister. Otomatik fallback onaylanmadı.

## Security, privacy, cost and compatibility impact

Standart Web Push da tarayıcının Apple/Google/Mozilla gibi push altyapısına veri aktarır; ayrı yönetilen panel kullanmamak dış aktarımı sıfırlamaz. Abonelik endpoint'leri ve anahtarları hassas yapılandırmadır; erişim, log maskeleme, HTTPS hedef doğrulama/SSRF önlemi, izin iptali ve retention TBD. VAPID private key yalnız runtime secret olur; repository'ye yazılmaz.

Mevcut personel rolleri veli/sporcuya atanmaz. Alıcı, bağlı öğrenci ve şube/grup yetkisi sunucuda doğrulanır; yalnız istemciden gelen ID'ye güvenilmez. Demo/production abonelik ve anahtarları ayrılır; sentetik demo işi gerçek alıcıya göndermez. Yeni paket adı/sürümü/lisansı, gerçek işletim maliyeti ve genel güvenlik/gizlilik politikaları henüz seçilmedi. Şema/API/işletim değişiklikleri için açık plan onayı gerekir.

## Validation and rollback — uygulama öncesi kabul adayları

Yetkisiz kişi/yanlış öğrenci veya şube erişimi, izin reddi/iptali, pasif cihaz ve ortak cihaz ayrılması; tam/kısmi tahsilat, iptal, vade ve saat dilimi sınırları; haftalık/iki haftalık/aylık takvim, kaçan çalışma; eşzamanlı işleyici, yeniden başlatma ve tekrar çalıştırma; retry/yanıt kaybı, geçersiz abonelik; tekil/toplu/otomatik yolun aynı gerçek servisi kullanması test edilmelidir. Android, masaüstü ve iPhone ana ekran senaryoları test cihazlarında ayrıca doğrulanır.

İlk aşama dış gönderimsiz alıcı/borç önizlemesi; sonra izinli test cihazında tek gönderim; ardından devre dışı başlayıp açıkça etkinleştirilen kurallar önerilir. Geri alma ilk adımı kuralları/işleyiciyi durdurmaktır; migration geri alma ve kayıt/secret saklama planı TBD. Bu görevde bu testler veya gerçek gönderim yapılmadı.

## Implementation sequence and open questions

Önerilen sıra: (1) CR-020 ekran/API alıcı ve zaman sözleşmesi, (2) doğrulanmış alıcı kaydı ve tek test cihazına manuel push, (3) kalıcı gönderim/deneme servisi ve borç önizlemesi, (4) Coolify işleyicisi ve devre dışı varsayılan otomatik kurallar. Kimlik doğrulama, rol matrisi, veri modeli, gizlilik, paket/sağlayıcı ve dağıtım değişikliklerinin somut kapsamı onaylanmadan uygulanmaz.

Alıcı kapsamı kullanıcı tarafından doğrulandı. Eksikler: veli/sporcu giriş/doğrulama biçimi, hangi personel rolleri/şubeleri, kesin gün/saat ve tekrar sınırı, vade gününün saat sınırı, sessiz saatler, pasif sporcu borçları, cihaz ve teslim kayıtlarının retention'ı, yeni bağımlılık/işleyici tercihi. Hepsi TBD; soru örnekleri karar değildir.

## Sources and decision history

- 2026-10-19 son onay: Somut web-push/MPL-2.0 paket ve yalnız SporManage demo dağıtımı kullanıcı tarafından açıkça onaylandı. Aşağıdaki önceki onay bekleme kaydı tarihsel durumdur. Dağıtım ve gerçek cihaz teslimi ancak çalıştırılıp ayrı kanıtlandığında tamamlanmış sayılır.

- Mevcut kaynaklar: [bildirim ekranı](../../src/app/notifications/page.tsx), [liste/oluşturma API](../../src/app/api/notifications/route.ts), [şema](../../prisma/schema.prisma), [CR-004/020](../20-execution/CHANGE_REQUESTS.md).
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API): service worker, cihaz aboneliği ve tarayıcı açık değilken push işleme.
- [Apple Web Push belgesi](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers): HTTPS, kullanıcı izni, endpoint/anahtarların kullanıcıyla bağlanması ve iOS ana ekran web uygulaması gereksinimi.
- [WebKit iOS Web Push](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/): iOS/iPadOS 16.4+ ana ekrana eklenen web uygulamasında kullanıcı etkileşimiyle izin isteme.
- [Coolify Scheduled Tasks](https://coolify.io/docs/applications/operations/scheduled-tasks): container içi komut ve sunucu zaman dilimi; kurulu proje sürümünde yapılandırma bu görevde doğrulanmadı.
- 2026-10-19: Ekran/kod ve resmi kaynaklar incelendi; kullanıcı hem veli/sporcu hem personel alıcısını doğruladı. Yalnız Proposed plan yazıldı; uygulama/migration/secret/izin/schedule kurulmadı ve bildirim gönderilmedi.
- 2026-10-19 sonraki görev: Kullanıcı planı açıkça onayladı; Status Accepted. İlk manuel push/alıcı adımı yerelde uygulandı: additive migration, ayrı davet/oturum, endpoint/origin/rol kapsamı, PWA, ortak tekil/toplu gönderim, kalıcı delivery. Typecheck, 15 test, production build ve HTTP/UI kontrolleri başarılı. Test göndericisi kontrollü adaptördür; gerçek iPhone teslimi henüz yok. Somut web-push 3.6.7 MPL-2.0 lisansı ve yalnız demo HTTPS dağıtımı ayrıca açık onay bekler; otomatik kurallar/scheduler uygulanmadı. [PUSH_GUIDE](../40-operations/PUSH_GUIDE.md).
