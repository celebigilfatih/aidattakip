# Backlog

Last updated: 2026-09-15. Durum: Repository kaynakları ve tarihli uygulama/doğrulama kayıtları birlikte izlenir.

Bu liste önerilen çalışma sırasıdır; uygulama veya kritik karar onayı değildir. Kaynak: [CHANGE_REQUESTS](CHANGE_REQUESTS.md).

| İş | Öncelik önerisi | Kaynak | Kabul/çıkış koşulu | Durum/onay |
|---|---|---|---|---|
| B-001 Secret/log iyileştirme planı | Önce değerlendirme | CR-007, ADR-0001 | Sentetik kimlik doğrulama testlerinde hassas değer loglanmaması; ortam geçiş planı | Proposed; kullanıcı onayı bekliyor |
| B-002 Çocuk/yetişkin kayıt kuralı | İlk hedef | REQ-003, CR-013, ADR-0002 | Yaş eşiği/iletişim/veli kuralları net; sınır ve eksik bilgi senaryoları tanımlı | Proposed; kural onayı bekliyor |
| B-003 Rol ve nesne erişimi | Çekirdek kalite | CR-002/003/014 | Her çekirdek rota için aktör/nesne matrisi ve izinli/izinsiz örnekler | Gereksinimler TBD; auth değişikliği onaylı değil |
| B-004 Aidat dönemleri ve tahsilat | Çekirdek kalite | REQ-002, CR-008/009 | Tekil/toplu dönem, kısmi/tam, tekrar/eşzamanlı tahsilat senaryoları | Öneri; veri değişikliği onaylı değil |
| B-005 Kurulum/test altyapısı doğrulaması | Geliştirme önkoşulu | CR-001/006/011 | İzole ortamda doğrulanmış komutlar ve gerçek sonuç kaydı | Öneri; çalışma ortamı TBD |
| B-006 Yedek/restore kapsamı | Operasyon | CR-005 | Tüm modeller/ilişkiler ve ayrı lisans verisi için kapsam; izole geri yükleme kanıtı | Öneri; retention/restore kararı onaylı değil |
| B-007 Bildirim/lisans açıklıkları | Kapsam netleşince | CR-004/012 | Kapsam kararı ve gerçekle uyumlu özellik açıklamaları | Rapor bölümü ADR-0003 ile tamamlandı; diğerleri açık |
| B-008 Otomatik lint yapılandırması | Kalite | CR-011 | Etkileşimsiz lint komutu, repository yapılandırması ve doğrulanmış temiz sonuç | Ayrı iş; bu çalışma kapsamına alınmadı |

Sorumlular, tahminler, sprint ve tarihler TBD. Kalite adayları [TEST_STRATEGY](../30-quality/TEST_STRATEGY.md) içindedir.
