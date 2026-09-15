# Coding Standards

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Kaynakta görülen yapı

[tsconfig](../../tsconfig.json): strict=true, noEmit=true, incremental=true, `@/*` → `src/*`; moduleResolution=bundler. [Next config](../../next.config.js): standalone çıktı, geliştirmede webpack cache kapalı, üretimde error/warn dışındaki console çağrılarını kaldırma ayarı.

UI bileşenleri TSX; stiller [Tailwind](../../tailwind.config.js) ve global CSS ile. Formlarda react-hook-form/Zod bağımlılıkları vardır; tüm API girdilerinin aynı doğrulama mekanizmasını kullandığı söylenemez. TypeScript strict yapılandırmasına rağmen kaynaklarda `any` kullanımı var.

## Komutların durumu

| Kontrol | Repository tanımı | Bu oturum sonucu |
|---|---|---|
| Lint | package script: `npm run lint` → `next lint` | Çalıştırılmadı; ESLint config dosyası taramada yok; çalışırlık TBD |
| Build | `npm run build` → `next build` | Çalıştırılmadı |
| Typecheck | Ayrı package script’i yok | Doğrulanmış komut TBD |
| Test | Ayrı package script’i yok | Doğrulanmış otomatik test komutu TBD |

[package.json](../../package.json) komut tanımını kanıtlar; başarılı çalıştığını kanıtlamaz. Yeni lint/test aracı veya refactor yapılmadı. Biçimlendirme ve adlandırma için ayrıca kabul edilmiş proje standardı TBD; mevcut dosyanın biçimi korunmalı, değişiklik CDSK bağlam ve doğrulama kurallarına uymalıdır.

## Güvenlik ve hata yönetimi

Secret/hassas veri repository’ye yazılmaması mevcut CDSK kuralıdır. Mevcut kod riskleri [SECURITY_MODEL](../10-architecture/SECURITY_MODEL.md); önerilen log politikası [ADR-0001](../50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) içindedir, henüz kabul edilmedi.
