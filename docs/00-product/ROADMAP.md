# Roadmap

2026-10-20 CR-030 uygulanıyor: ADR-0008 onaylı kural arşivleme/geri alma ve kalıcı gönderim geçmişi. Yerel migration/generate/typecheck ve63 test başarılı; gerçek UI/Docker/demo yayını sürüyor. [CR-030](../20-execution/CHANGE_REQUESTS.md).

2026-10-19 CR-029 tamamlandı: Mevcut kuralı aynı personel formundan ad/gün/saat/alıcılarla düzenleme; typecheck/55 test ve yerel Docker başarılı. Yerel UI kaydet/yenile/uygunsuz alıcı/409 doğrulandı; yalnız demo6f11cf1 Success/3m08s. Canlı form ve mevcut etkin Pazartesi09:00/Demo Kullanıcı/veriler/geçmiş korundu. [CR-029](../20-execution/CHANGE_REQUESTS.md).

2026-10-19 CR-028 tamamlandı: Personel ekranında gün/saat/alıcılarla yeni kapalı kural oluşturma; typecheck/51 test, yerel UI oluştur/yenile/iptal ve Docker başarılı. Yalnız demo3b7ebcc Success/3m12s; canlı form ve mevcut etkin Pazartesi09:00/Demo Kullanıcı tercihi/veriler/geçmiş korundu. [CR-028](../20-execution/CHANGE_REQUESTS.md).

2026-10-19 CR-027 tamamlandı: Personel ekranından Etkinleştir/Durdur,51 test/typecheck/Docker ve yerel UI başarılı; yalnız demo6c4ee5b Success/2m55s. Canlı kart ve mevcut etkin Pazartesi09:00/Demo Kullanıcı tercihi/veriler/geçmiş korundu. [CR-027](../20-execution/CHANGE_REQUESTS.md).

2026-10-19 CR-026 tamamlandı: Personel ve Cihazlar bölümünde mevcut haftalık aidat takviminin gün/saat düzenlemesi ve tüm personel seçimlerinde güncel takvim gösterimi yalnız demo ec5e2dc ile yayımlandı. Mevcut etkin Pazartesi09:00/Demo Kullanıcı tercihi korundu;47 test/typecheck/Docker ve canlı UI doğrulandı. [CR-026](../20-execution/CHANGE_REQUESTS.md).

## Güncel personel bildirim kapsamı

2026-10-19 ADR-0007 Accepted: Kullanıcı personel odaklı bildirim ve otomatik aidat özeti planının tümünü uygulamayı onayladı. Yeni veli/sporcu push kapalı; ADMIN seçili personel, ana cihaz ve 30 günlük yenilenebilir kayıt. Mali özet ADMIN/ACCOUNTING ve güncel şube kapsamı; diğer personel yalnız genel duyuru. Haftalık gün/saat, İstanbul vade günü sonrası aktif/pasif açık borçlar, 1 saat telafi ve kalıcı çalışma/tek gönderim uygulanıyor. Yalnız demo dbc329d0 dağıtımı, gerçek personel iPhone manuel/otomatik özet kabulü ve kapalı kural testi tamamlandı. 30 test/typecheck/Docker build başarılı; haftalık kural Pazartesi09:00 ve kapalı bırakıldı. [ADR-0007](../50-decisions/ADR-0007-personel-bildirimleri-ve-aidat-ozeti.md). Aşağıdaki ADR-0006 kayıtları tarihçedir.

Last updated: 2026-10-19. Durum: Kullanıcı hedefleri, tarihli tamamlanan işler ve açık kabul/karar adımları ayrılmıştır.

## Mevcut odak

Kullanıcının ilk hedefi sporcu ve aidat takibi. CDSK bağlamı belgelenmiş, demo/rapor çalışmaları ve dağıtım yapılmıştır; ayrıntılı MVP kabulü hâlâ açıktır.

| Aşama | Durum | Tarih / kabul |
|---|---|---|
| CDSK iskeleti | Tamamlandı | 2026-09-14; CHANGELOG ve handoff kaydı mevcut |
| Repository’den bağlam doldurma | Belgelendi | 2026-09-14; uygulama kabulü değildir |
| Rapor dışa aktarımı ve demo dağıtımı | Tamamlandı; ADR-0003/0005 Accepted, ADR-0004 Superseded | 2026-09-15 tarihli [DEPLOYMENT](../40-operations/DEPLOYMENT.md) ve [DEMO_VALIDATION](../30-quality/DEMO_VALIDATION.md); genel MVP kabulü değildir |
| Windows yerel demo ve CDSK belge eşlemesi | Yerel kurulum doğrulandı; CR-019 belge kapsamı kapalı | 2026-10-19; [RUNBOOK](../40-operations/RUNBOOK.md), [CHANGE_REQUESTS](../20-execution/CHANGE_REQUESTS.md) |
| Manuel push ve ayrı alıcı kaydı | ADR-0006 Accepted; yerel ilk aşama/test ve onaylı ayrı HTTPS demo dağıtımı tamamlandı; ilk gerçek iPhone servis/görünüm/tıklama testi başarılı | 2026-10-19; [PUSH_GUIDE](../40-operations/PUSH_GUIDE.md). Otomatik kurallar sonraki aşama |
| MVP ayrıntıları ve kritik kararların netleşmesi | Önerilen sonraki adım | TBD; kullanıcı kararları gerekli |
| Sporcu/aidat ürün kabul senaryoları | Demo/test/smoke kanıtı var; kesin iş kuralı ve kapsamlı kabul açık | TBD; [TEST_STRATEGY](../30-quality/TEST_STRATEGY.md) |
| Kalan düzeltmeler ve sonraki yayın hazırlığı | Öneri; mevcut dağıtımın yapılmadığı anlamına gelmez | TBD; açık bulgu ve onaylara bağlı |

Aşamalar teslim tarihi veya ek kapsam taahhüdü değildir. Kaynaklar: [SCOPE](SCOPE.md), [BACKLOG](../20-execution/BACKLOG.md), [CHANGELOG](../../CHANGELOG.md).

## Öncelik gerekçesi ve tarihsel planlar

Çekirdek akışların doğruluğu ilk hedefe hizmet eder. README’deki mobil uygulama, muhasebe entegrasyonu ve çok dil gibi fikirler onaylı roadmap olarak aktarılmadı. [Eski antrenman tasarımındaki](../../TRAINING_ATTENDANCE_SYSTEM_DESIGN.md) haftalık planın güncel onayı ve gerçekleşme durumu TBD; kabul edilmiş ADR sayılmaz.

## Takvim ve kaynaklar

Sprint, teslim tarihi, ekip kapasitesi, bütçe ve kabul sorumlusu: TBD.
