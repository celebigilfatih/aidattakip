# Security Model

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

Bu belge mevcut kaynak davranışını kaydeder; kapsamlı güvenlik denetimi veya güvenli olduğuna dair onay değildir.

## Mevcut erişim

[AuthService](../../src/lib/auth.ts) bcrypt ile parola hash’i (cost 12) ve jsonwebtoken ile 7 günlük JWT kullanır. [Login](../../src/app/api/auth/login/route.ts) aktif kullanıcı/parola/lisans kontrolünden sonra HttpOnly, SameSite=Lax, üretimde Secure çerez yazar. [Middleware](../../middleware.ts) giriş/çıkış istisnaları dışında JWT kontrolü yapar; rol/nesne kontrolü rota düzeyindedir. [me](../../src/app/api/auth/me/route.ts) aktif kullanıcı ve grup izinlerini yeniden okur.

TRAINER için [grup izin yardımcıları](../../src/lib/trainer-permissions.ts) ve liste filtreleri vardır. Tüm yazma/detay uçlarında aynı nesne kapsamının uygulandığı doğrulanmadı; rol yardımcıları hedef yetki politikası kabulü değildir. Lisans yönetimi [API](../../src/app/api/license-admin/route.ts) içinde ADMIN token ve ek yönetim anahtarı bekler; anahtarın query ile de alınması inceleme gerektirir.

## Veriler ve güven sınırları

Sporcu/veli kimlik-iletişim bilgileri, doğum tarihi, kullanıcı parola hash’leri, ödeme ve sağlık türünde notlar [şemada](../../prisma/schema.prisma) bulunur. Tarayıcı, uygulama, ana DB, lisans DB, loglar ve yedekler ayrı değerlendirilmelidir. İlk sürüm çocuk ve yetişkin sporcuları kapsar; yaş eşiği, retention, erişim/audit gereksinimleri TBD.

## Kaynakta görülen riskler

- Login kodu girilen parolayı debug loguna geçiriyor; AuthService secret’ın bir kısmını logluyor ve sabit yedek değer kullanıyor. Üretim console ayarı error/warn loglarını kaldırmıyor. Değerler bu belgeye kopyalanmadı.
- `.env`, `.npmrc` ve yerel SQL dökümü Git tarafından takip ediliyor; gitignore girdileri mevcut takibi kaldırmaz. İçerikler bu bağlam görevinde açılmadı; gerçek hassas veri/erişim kapsamı TBD.
- [Compose](../../docker-compose.yml) içine kimlik bilgisi/anahtar değerleri yazılmış. Bunların canlı kullanımı TBD; değerlere burada yer verilmedi.
- [Yedek API](../../src/app/api/settings/backup/route.ts) users kayıtlarını alan kısıtlaması olmadan JSON’a dahil ediyor. Yedek erişimi/koruması ayrıca karar gerektirir.
- README’deki kapsamlı CSRF/XSS/input-validation iddialarını bu statik inceleme doğrulamadı; güvence olarak kullanılmamalı.

## Karar durumu

[ADR-0001](../50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) Proposed: secret ve kimlik doğrulama logları için dar kapsamlı öneri. Henüz uygulanmadı veya kabul edilmedi. Rol matrisi, oturum süresi, retention ve veri saklama ayrı açık kararlar; [CHANGE_REQUESTS](../20-execution/CHANGE_REQUESTS.md).
