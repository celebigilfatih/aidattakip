# Security Model

## Güncel personel bildirim kapsamı

2026-10-19 ADR-0007 Accepted: Kullanıcı personel odaklı bildirim ve otomatik aidat özeti planının tümünü uygulamayı onayladı. Yeni veli/sporcu push kapalı; ADMIN seçili personel, ana cihaz ve 30 günlük yenilenebilir kayıt. Mali özet ADMIN/ACCOUNTING ve güncel şube kapsamı; diğer personel yalnız genel duyuru. Haftalık gün/saat, İstanbul vade günü sonrası aktif/pasif açık borçlar, 1 saat telafi ve kalıcı çalışma/tek gönderim uygulanıyor. Yerel migration/typecheck/27 test başarılı; demo dağıtımı ve gerçek personel iPhone/takvim testi henüz bekler. [ADR-0007](../50-decisions/ADR-0007-personel-bildirimleri-ve-aidat-ozeti.md). Aşağıdaki ADR-0006 kayıtları tarihçedir.

Last updated: 2026-10-19. Durum: Mevcut kaynak ve tarihli düzeltme kayıtları eşlenmiştir; kapsamlı çalışma zamanı güvenlik doğrulaması değildir.

Bu belge mevcut kaynak davranışını kaydeder; kapsamlı güvenlik denetimi veya güvenli olduğuna dair onay değildir.

## Mevcut erişim

[AuthService](../../src/lib/auth.ts) bcrypt ile parola hash’i (cost 12) ve jsonwebtoken ile 7 günlük JWT kullanır. [Login](../../src/app/api/auth/login/route.ts) aktif kullanıcı/parola/lisans kontrolünden sonra HttpOnly, SameSite=Lax, üretimde Secure çerez yazar. [Middleware](../../middleware.ts) giriş/çıkış istisnaları dışında JWT kontrolü yapar; rol/nesne kontrolü rota düzeyindedir. [me](../../src/app/api/auth/me/route.ts) aktif kullanıcı ve grup izinlerini yeniden okur.

TRAINER için [grup izin yardımcıları](../../src/lib/trainer-permissions.ts) ve liste filtreleri vardır. Tüm yazma/detay uçlarında aynı nesne kapsamının uygulandığı doğrulanmadı; rol yardımcıları hedef yetki politikası kabulü değildir. Lisans yönetimi [API](../../src/app/api/license-admin/route.ts) içinde ADMIN token ve ek yönetim anahtarı bekler; anahtarın query ile de alınması inceleme gerektirir.

## Veriler ve güven sınırları

Sporcu/veli kimlik-iletişim bilgileri, doğum tarihi, kullanıcı parola hash’leri, ödeme ve sağlık türünde notlar [şemada](../../prisma/schema.prisma) bulunur. Tarayıcı, uygulama, ana DB, lisans DB, loglar ve yedekler ayrı değerlendirilmelidir. İlk sürüm çocuk ve yetişkin sporcuları kapsar; yaş eşiği, retention, erişim/audit gereksinimleri TBD.

## Kaynakta görülen riskler

- Login API'sindeki e-posta/parola/hash debug logları ve hassas debug yanıtları 2026-09-15 tarihinde kaldırıldı; mevcut kod yalnız genel hata mesajını logluyor. Bu tamamlanan düzeltme [CHANGELOG](../../CHANGELOG.md) içinde kayıtlıdır.
- AuthService kaynakta secret'ın bir kısmını ve doğrulanan kullanıcının e-postasını `console.log` ile logluyor; sabit secret fallback'i de duruyor. Next production derlemesinde log çağrıları kaldırılacak şekilde yapılandırılmış, error/warn korunuyor. Development veya farklı çalıştırma biçimleri için bu derleme ayarı kalıcı secret/log politikası yerine geçmez. Değerler bu belgeye kopyalanmadı.
- `.env`, `.npmrc` ve yerel SQL dökümü Git tarafından takip ediliyor; gitignore girdileri mevcut takibi kaldırmaz. İçerikler bu bağlam görevinde açılmadı; gerçek hassas veri/erişim kapsamı TBD.
- [Compose](../../docker-compose.yml) içine kimlik bilgisi/anahtar değerleri yazılmış. Bunların canlı kullanımı TBD; değerlere burada yer verilmedi.
- [Yedek API](../../src/app/api/settings/backup/route.ts) users kayıtlarını alan kısıtlaması olmadan JSON’a dahil ediyor. Yedek erişimi/koruması ayrıca karar gerektirir.
- README’deki kapsamlı CSRF/XSS/input-validation iddialarını bu statik inceleme doğrulamadı; güvence olarak kullanılmamalı.

## Karar durumu

ADR-0006 manuel push ilk aşaması: Aktif ADMIN alıcı kimliğini doğrulayarak 24 saatlik tek kullanımlı davet oluşturur; alıcı 7 günlük ayrı HttpOnly/SameSite=Strict oturumla yalnız `/recipient` ekranına erişir. Personel token'ı yerine kullanılamaz. Bildirim yönetimi aktif ADMIN/ACCOUNTING ve şube kapsamıyla sınırlıdır; cihaz kaydı kendi alıcı oturumuna bağlıdır. Mutasyonlarda tam origin doğrulanır. Push için yalnız desteklenen tarayıcı servislerinin HTTPS hostları kabul edilir; arbitrary endpoint/redirect izlenmez. Kilit ekranı yükü genel tutulur. Çıkış/erişim iptali cihazı pasifleştirir; yeni alıcı uçları JWT_SECRET yoksa personel doğrulamasını reddeder. [PUSH_GUIDE](../40-operations/PUSH_GUIDE.md).

VAPID sırları repository dışında yerel runtime dosyasında tutulur; production için ortama özel sırlar gereklidir. `.dockerignore` ortam varyantlarını, kök SQL dökümünü, dump'ları ve çıktı klasörünü build bağlamından çıkarır. Bu, Git'te takip edilen eski dosyalar/anahtar rotasyonu veya genel AuthService sorununun kapatılması değildir. Otomatik retention/purge eklenmedi. web-push 3.6.7/MPL-2.0 ve yalnız demo HTTPS dağıtımı kullanıcı tarafından 2026-10-19 tarihinde onaylandı; ilk gerçek iPhone testi Apple HTTP201 ve kullanıcının bildirim/tıklama onayıyla tamamlandı.

[ADR-0001](../50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) Proposed kalır. Login temizliği önerinin bir kısmıyla örtüşen tamamlanmış ayrı düzeltmedir; AuthService logları, fallback, ortam envanteri ve rotasyon açık kalır. ADR'nin tamamı kabul edilmiş veya uygulanmış değildir. 2026-10-19 yerel başlatıcısının `[Auth]` çıktı filtresi de kaynak düzeltmesi değildir. Rol matrisi, oturum süresi, retention ve veri saklama ayrı açık kararlar; [CHANGE_REQUESTS](../20-execution/CHANGE_REQUESTS.md).
