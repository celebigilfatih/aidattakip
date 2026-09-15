# Architecture Overview

Last updated: 2026-09-15. Durum: Repository kaynakları ve tarihli deployment doğrulaması birlikte belgelenmiştir. Öneriler ayrıca işaretlenmiştir.

## Mevcut yapı

Tek repository içinde Next.js App Router arayüzü ve API rotaları bulunur; iş mantığının önemli bölümü route handler’lar içindedir. Bu, mevcut durumun tarifidir; yeni mimari seçim veya kabul edilmiş ADR değildir.

| Katman | Kaynak | Görev |
|---|---|---|
| Sayfalar | [src/app](../../src/app) | 17 page.tsx dosyası |
| API | [src/app/api](../../src/app/api) | 48 route.ts dosyası |
| UI | [components](../../src/components) | Radix tabanlı kontroller, formlar, takvim, yazdırma |
| İstemci bağlamı | [contexts](../../src/contexts) | AuthContext ve SettingsContext |
| Ortak işlevler | [lib](../../src/lib) | JWT, Prisma, izin, bildirim, lisans |
| Veri | [schema.prisma](../../prisma/schema.prisma) | PostgreSQL, 20 model |
| Tipler | [types](../../src/types/index.ts) | Uygulama tip ve enum tanımları |

Veri akışı: React sayfaları → fetch → Next API → Prisma → PostgreSQL. Lisans servisi `pg.Pool` ile ayrıca bağlanır. Kök layout AuthProvider ve SettingsProvider sağlar; oturum middleware ve rota kontrolleriyle işlenir. [layout](../../src/app/layout.tsx), [middleware](../../middleware.ts), [prisma](../../src/lib/prisma.ts), [license](../../src/lib/license.ts).

## Dağıtım topolojisi

Özlüce production ve SporManage demo iki ayrı Coolify uygulamasıdır. İkisi aynı fiziksel PostgreSQL 15 kaynağını paylaşır; `ozlucepay` ile `spormanage_aidat_demo` ayrı mantıksal veritabanları ve ayrı uygulama rolleri kullanır. Demo lisans tablosu kullanıcı kararıyla demo DB içinde tutulur. Alan adı ve veri izolasyonu [ADR-0005](../50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md), işletim ayrıntısı [DEPLOYMENT](../40-operations/DEPLOYMENT.md) içindedir.

## Sürümler

| Paket | package.json aralığı | package-lock.json sürümü |
|---|---|---|
| next | `^15.5.9` | `15.5.9` |
| react | `^19.2.1` | `19.2.3` |
| typescript | `^5.9.2` | `5.9.2` |
| prisma | `^6.17.1` | `6.17.1` |
| tailwindcss | `^3.4.17` | `3.4.17` |
| eslint | `^9.36.0` | `9.36.0` |

Kaynaklar: [package.json](../../package.json), [package-lock.json](../../package-lock.json). İlk statik incelemede node_modules yoktu. Yerel çalıştırma oturumunda Node v24.15.0/npm 11.12.1 doğrulandı ve kilit dosyasından bağımlılıklar kuruldu; [RUNBOOK](../40-operations/RUNBOOK.md). Docker Node 20 Alpine tanımlar. 2026-09-15 production kurulumu Coolify üzerinde repository Dockerfile’ı ve mevcut özel PostgreSQL 17 Alpine kaynağını kullanır; Compose production’da kullanılmaz. [DEPLOYMENT](../40-operations/DEPLOYMENT.md).

## Bütünlük ve sınırlar

Merkezi repository/service katmanı veya bağımsız backend paketi görünmüyor. Bazı sayfalarda UI ve veri çağrıları birlikte; bazı auth yardımcıları route’larda tekrar ediyor. Refactor kararı alınmadı. `next-auth` bağımlılığı mevcut olsa da incelenen giriş akışı özel JWT kullanıyor.

## Ayrıntılar ve tarihsel kaynaklar

[BOUNDED_CONTEXTS](BOUNDED_CONTEXTS.md), [DATA_MODEL](DATA_MODEL.md), [API_CONVENTIONS](API_CONVENTIONS.md), [SECURITY_MODEL](SECURITY_MODEL.md), [INTEGRATIONS](INTEGRATIONS.md), [DEPLOYMENT](../40-operations/DEPLOYMENT.md).

[Antrenman tasarım belgesi](../../TRAINING_ATTENDANCE_SYSTEM_DESIGN.md) eski tasarım kaynağıdır; içindeki tüm uçlar ve takvim mevcut uygulamayla eşitlenmedi, kabul edilmiş ADR olarak aktarılmadı. Ürün içi AI durumu [AI_ARCHITECTURE](AI_ARCHITECTURE.md) içinde.
