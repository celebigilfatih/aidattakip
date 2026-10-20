# CR-032 — Ortak gecikme hesabı doğrulaması

2026-10-20 kullanıcı talebi yalnız SporManage demo düzeltme/yayınını kapsar; ADR-0007/0009 değişmedi.

| Kontrol | Gerçek sonuç |
|---|---|
| Yeni testler | Son9 test geçti: durum/null/kısmi/sıfır/fazla/iptal, İstanbul gece yarısı ve yıl/ay sınırı; SQL predicate ile ortak hesap eşitliği; sayfalama/toplamlar, filtre kesişimi, GET yazmaması; sadece sahipli fixture’da bulk iptal |
| Regresyon |80 lib testi başarılı; son ek bulk testiyle81 benzersiz test kanıtı |
| Typecheck |Başarılı |
| Yerel Docker |Başarılı, config10cc3dba3dadd02938f8a5fc8b09b7f9f8011e6d9bb061391cd7035649577787; UID1001/37 model/yeni helper mevcut/.env-output hariç probe geçti. Son değişiklik yalnız ek test/guard belgesidir; çalışma kodu aynı |
| Yerel UI |Sayfa2’den gecikme filtresi ilk sayfaya döner; tüm gecikmiş satırlar aynı rozet, kısmi bilgisi korunur. Seçili Ece5 kayıt/kalan3000,1 gecikmiş1500; yerel seed tarihleri canlıdan farklı |
| Excel |Gerçek tarayıcı indirmesinde5 satır yalnız Ece Arslan, kalan3000 ve1 Gecikmiş; öğrenci filtresi aktarımda korunur |
| Demo |Yayın bekliyor; mevcut runtime8cd9f72, aile1/sporcu60/ödeme300/bildirim17/kural1/cihaz3/alıcı2/run1 before guard,134593byte/600 dump ve pg_restore --list başarılı |

Kalıcı borç status alanları değiştirilmez. Aile ve staff-overdue artık aynı paymentBalance işlevini kullanır; SQL field-reference koşulları NULL ve fazla ödeme için test edildi. Özet sayfadaki20 satırla sınırlı değildir; liste ve özet aynı RepeatableRead/saatten alınır. Yeni sağlayıcı/migration/rol kararı yok. Legacy rol/nesne sorunları CR-002/003, lint CR-011 ve restore tatbikatı kapsam dışı kalır. Yerel test logları ve screenshotlar output/cr032* altında Git dışındadır. Demo sonucu ve canlı Ece/Eren karşılaştırması yayın sonrasında kaydedilecek.
