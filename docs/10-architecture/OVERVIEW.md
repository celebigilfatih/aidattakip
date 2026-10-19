# Architecture Overview

Last updated: 2026-10-19. Durum: Mevcut kod, yerel doğrulamalar ve onaylı yalnız demo dağıtımı eşlenmiştir. Canlı demo migration/runtime/HTTPS ve ortak PostgreSQL sürümü doğrulandı; Özlüce'de yalnız container/image/StartedAt koruma kontrolü yapıldı.

## Mevcut yapı

Tek repository içinde Next.js App Router arayüzü ve API rotaları bulunur; iş mantığının önemli bölümü route handler’lar içindedir. Bu, mevcut durumun tarifidir; yeni mimari seçim veya kabul edilmiş ADR değildir.

| Katman | Kaynak | Görev |
|---|---|---|
| Sayfalar | [src/app](../../src/app) | 18 page.tsx dosyası |
| API | [src/app/api](../../src/app/api) | 53 route.ts dosyası |
| UI | [components](../../src/components) | Radix tabanlı kontroller, formlar, takvim, yazdırma |
| İstemci bağlamı | [contexts](../../src/contexts) | AuthContext ve SettingsContext |
| Ortak işlevler | [lib](../../src/lib) | JWT, Prisma, izin, bildirim, lisans |
| Veri | [schema.prisma](../../prisma/schema.prisma) | PostgreSQL, 25 model |
| Tipler | [types](../../src/types/index.ts) | Uygulama tip ve enum tanımları |

Veri akışı: React sayfaları → fetch → Next API → Prisma → PostgreSQL. Lisans servisi `pg.Pool` ile ayrıca bağlanır. Kök layout AuthProvider ve SettingsProvider sağlar; oturum middleware ve rota kontrolleriyle işlenir. [layout](../../src/app/layout.tsx), [middleware](../../middleware.ts), [prisma](../../src/lib/prisma.ts), [license](../../src/lib/license.ts).

## Dağıtım topolojisi

2026-10-19 manuel push güncellemesi: Demo ayrı `codex/manual-push-demo-20261019` dalı ve sabit 5e1fd7c ile dağıtıldı; auto deploy manuel, yeni migration yalnız demo DB'sinde applied. Özlüce aynı container/image ile çalışmayı sürdürür. ADR-0005'in demo main kaydı için tarihli istisna ADR-0006 onayındadır; otomatik aidat kuralları kurulmadı.

2026-09-15 tarihli son dağıtım kaydına göre Özlüce production ve SporManage demo iki ayrı Coolify uygulamasıdır. Aynı fiziksel PostgreSQL kaynağını paylaşırlar; `ozlucepay` ile `spormanage_aidat_demo` ayrı mantıksal veritabanları ve ayrı uygulama rolleri kullanır. Demo lisans tablosu kullanıcı kararıyla demo DB içinde tutulur. Alan adı ve veri izolasyonu [ADR-0005](../50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md), işletim ayrıntısı [DEPLOYMENT](../40-operations/DEPLOYMENT.md) içindedir.

| Ortam | PostgreSQL sürüm kanıtı | Veri/lisans yerleşimi |
|---|---|---|
| Windows yerel demo | 2026-10-19 salt okunur `current_setting('server_version')`: **15.19**; imaj `postgres:15-alpine` | Loopback:5477 üzerinde `aidat_takip` ve `license_db` |
| Repository Compose tanımı | `postgres:15-alpine`; çalışan Coolify servisini kanıtlamaz | Dosya modeli; [CR-006](../20-execution/CHANGE_REQUESTS.md) açık |
| Coolify ortak PostgreSQL kaynağı | 2026-10-19 demo rolüyle READ ONLY sorgu: **17.7**; eski 15/17 iddiası tarihli kanıtla ayrıldı | Son kayıtlı topoloji ADR-0005; sürüm doğrulama takibi CR-006 |

## Sürümler

| Paket | package.json aralığı | package-lock.json sürümü |
|---|---|---|
| next | `^15.5.9` | `15.5.9` |
| react | `^19.2.1` | `19.2.3` |
| typescript | `^5.9.2` | `5.9.2` |
| prisma | `^6.17.1` | `6.17.1` |
| tailwindcss | `^3.4.17` | `3.4.17` |
| eslint | `^9.36.0` | `9.36.0` |

Kaynaklar: [package.json](../../package.json), [package-lock.json](../../package-lock.json); paket tablosu 2026-10-19 tarihinde yeniden eşlendi. Windows yerel ortamında Node v24.19.0 ve pnpm üzerinden npm 11.12.1 ile kilitli kurulum doğrulandı; önceki 2026-09-14 kaydı Node v24.15.0 kullanıyordu. Bunlar zorunlu Node sürümü kararı değildir. [RUNBOOK](../40-operations/RUNBOOK.md). Dockerfile Node 20 Alpine tanımlar. Son kayıtlı Coolify dağıtımı repository Dockerfile'ını kullanır; Compose production'da kullanılmaz. Canlı PostgreSQL sürümü yukarıdaki gibi TBD'dir.

## Bütünlük ve sınırlar

2026-10-19 ADR-0006 ilk aşaması: `/recipient` ayrı alıcı oturumu, `/api/push/*` alıcı/davet/cihaz API'leri ve standart Web Push adaptörü eklendi. Personel JWT'si ile alıcı oturumu ayrıdır. Manuel/toplu gönderim ortak servisten geçer; yeni push teslimi ACCEPTED, uygulama içi yayın SENT olur. PWA manifesti ve ağdan okuyan, veri cache'lemeyen service worker kullanılır. Otomatik aidat kuralları/işleyici etkin değildir. [PUSH_GUIDE](../40-operations/PUSH_GUIDE.md).

Merkezi repository/service katmanı veya bağımsız backend paketi görünmüyor. Bazı sayfalarda UI ve veri çağrıları birlikte; bazı auth yardımcıları route’larda tekrar ediyor. Refactor kararı alınmadı. `next-auth` bağımlılığı mevcut olsa da incelenen giriş akışı özel JWT kullanıyor.

## Ayrıntılar ve tarihsel kaynaklar

[BOUNDED_CONTEXTS](BOUNDED_CONTEXTS.md), [DATA_MODEL](DATA_MODEL.md), [API_CONVENTIONS](API_CONVENTIONS.md), [SECURITY_MODEL](SECURITY_MODEL.md), [INTEGRATIONS](INTEGRATIONS.md), [DEPLOYMENT](../40-operations/DEPLOYMENT.md).

[Antrenman tasarım belgesi](../../TRAINING_ATTENDANCE_SYSTEM_DESIGN.md) eski tasarım kaynağıdır; içindeki tüm uçlar ve takvim mevcut uygulamayla eşitlenmedi, kabul edilmiş ADR olarak aktarılmadı. Ürün içi AI durumu [AI_ARCHITECTURE](AI_ARCHITECTURE.md) içinde.
