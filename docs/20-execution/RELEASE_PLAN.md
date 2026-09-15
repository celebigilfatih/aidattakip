# Release Plan

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Mevcut kayıt

[package.json](../../package.json) sürümü 1.0.0; bunun yayınlanmış sürüm veya üretim dağıtımı olduğu doğrulanmadı. Hedef sürüm, yayın tarihi, ortam, sorumlu ve kullanıcı kabulü TBD.

## Yayın önkoşulları

CDSK [Definition of Done](../30-quality/DEFINITION_OF_DONE.md) geçerli. Çekirdek akışlar, rol sınırları ve kayıt/tahsilat doğruluğu için beklenen sonuçlar netleşmeli. [TEST_STRATEGY](../30-quality/TEST_STRATEGY.md) senaryoları öneridir. Bu oturum hiçbir ürün testini başarılı ilan etmez.

## Operasyon ve açık kararlar

[DEPLOYMENT](../40-operations/DEPLOYMENT.md) mevcut dosyaları tarif eder; [BACKUP_RECOVERY](../40-operations/BACKUP_RECOVERY.md) geri yükleme kanıtının eksik olduğunu gösterir. [CR-007](CHANGE_REQUESTS.md) ve [ADR-0001](../50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) değerlendirilmelidir. Dağıtım değişikliği, veri/migration ve güvenlik kararları onaylı değildir. Geri alma komutu ve prova sonucu TBD.
