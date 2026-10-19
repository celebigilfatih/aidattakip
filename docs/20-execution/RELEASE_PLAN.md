# Release Plan

Last updated: 2026-10-19. Durum: Mevcut paket sürümü, tarihli dağıtım/doğrulama kayıtları ve açık kabul koşulları eşlenmiştir.

## Mevcut kayıt

[package.json](../../package.json) sürümü 1.0.0'dır; bu numaranın sürüm etiketi, release paketi veya kullanıcı kabulüyle eşlendiği doğrulanmadı. Bununla birlikte üretim/demo dağıtımı yapılmıştır: [DEPLOYMENT](../40-operations/DEPLOYMENT.md) 2026-09-15 tarihli Coolify build, migration başlangıcı, HTTP ve login kanıtlarını içerir.

| Ortam | Son kayıt ve karar | Kabul sınırı |
|---|---|---|
| Özlüce production | 2026-09-15; `aidat.ozlucespor.com`, mevcut `ozlucepay` DB'si korunmuştur | Dış HTTP/login kaydı var; kapsamlı ürün kabulü TBD |
| SporManage demo | 2026-09-15; ayrı uygulama ve `spormanage_aidat_demo` DB'si, [ADR-0005](../50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md) Accepted | Sentetik demo ve broşür ADMIN doğrulanmış; ADR-0004 Superseded |
| Windows yerel demo | 2026-10-19; loopback:3077/5477, 10 migration, demo check ve 7 test başarılı; [RUNBOOK](../40-operations/RUNBOOK.md) | Yerel çalışma kanıtıdır; production veya ürün kabulü değildir |

2026-10-19 belge eşlemesinde canlı ortam yeniden doğrulanmadı. Sonraki hedef sürüm/tarih, yayın sorumlusu ve kesin ürün kabulü TBD.

## Yayın önkoşulları

CDSK [Definition of Done](../30-quality/DEFINITION_OF_DONE.md) geçerli. Çekirdek akışlar, rol sınırları ve kayıt/tahsilat doğruluğu için beklenen sonuçlar netleşmeli. [TEST_STRATEGY](../30-quality/TEST_STRATEGY.md) tamamlanan demo/rapor kontrolleri ile henüz tamamlanmamış ürün kabul senaryolarını ayırır. Dağıtımın tamamlanmış olması bu açık koşulları kapatmaz.

## Operasyon ve açık kararlar

[DEPLOYMENT](../40-operations/DEPLOYMENT.md) dosya modelini ve tarihli Coolify uygulamasını birlikte kaydeder. Ayrı demo topolojisi ADR-0005 ile onaylıdır; yeni dağıtım, veri/migration ve güvenlik değişiklikleri için onay kapıları sürer. Canlı PostgreSQL sürümü TBD ve CR-006 takibindedir.

[BACKUP_RECOVERY](../40-operations/BACKUP_RECOVERY.md) ilk demo aktarımındaki başarılı dump/restore ile henüz kanıtlanmamış zamanlanmış yedek/olağanüstü durum restore tatbikatını ayırır. [CR-007](CHANGE_REQUESTS.md) ve [ADR-0001](../50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) login temizliği dışındaki secret/log konularında açıktır. Geri alma prosedürünün prova sonucu TBD.
