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
| Demo |098b493 / Coolify85qgaypbksguci5jmoekoz4l Success03m28s; pending migration/seed yok. Aile dahil before/verified-after hashleri aynı; Özlüce aynı, worker11:25:06.223 UTC ilerledi. Canlı Ece2/3000, Eren3/4000 ve aile7000; iki filtre ve gerçek Excel2 satır doğrulandı |

Kalıcı borç status alanları değiştirilmez. Aile ve staff-overdue artık aynı paymentBalance işlevini kullanır; SQL field-reference koşulları NULL ve fazla ödeme için test edildi. Özet sayfadaki20 satırla sınırlı değildir; liste ve özet aynı RepeatableRead/saatten alınır. Yeni sağlayıcı/migration/rol kararı yok. Legacy rol/nesne sorunları CR-002/003, lint CR-011 ve restore tatbikatı kapsam dışı kalır. Yerel test logları ve screenshotlar output/cr032* altında Git dışındadır. Demo ve canlı karşılaştırma tamamlandı; ayrıntılar aşağıdadır.

## 2026-10-20 — CR-032 yalnız demo yayını ve canlı kabul

Kullanıcı sayaç/filtre/durumları aile hesabıyla eşleyip yalnız demo yayını istedi. Kaynak codex/club-lifecycle-20261020, sabit098b493aaf55ba7dabe9a9296d0516e4f499f9ac. Coolify85qgaypbksguci5jmoekoz4l **Success/03m28s**; başlangıç11:17:59 UTC (14:17:59 Türkiye), rolling update11:21:27 UTC. Yeni container ab8470ba6eae / oibkjai6tfoeur5gxnx3ekxt-20261020T111759. Nihai demo Docker geçti; startup: No pending migrations, seed atlandı, Ready253ms.37 model/18 migration aynı, paket/anahtar/cron/yetki/model değişmedi; ADR-0007/0009 geçerli, yeni ADR yok.

Yedek /data/coolify/backups/cr032-20261020/demo.dump134593byte/600, pg_restore --list başarılı. Güncellenen guard aile üyeliğini ve aile satırını da kapsar; before.json ve **verified-after.json** birebir aynı:10 kullanıcı/60 sporcu/1 aile/60 veli/300 ödeme/6 grup/17 bildirim/1 kural/3 cihaz/2 alıcı/1 run. İlk after.json yanlış okunmuş kısa container ID nedeniyle boş üretildi; veri farkı sayılmadı, container adıyla yeniden üretim ve cmp başarılı. Özlüce before/after inspect birebir aynı (14c56b463e9e, b024011, StartedAt2026-10-17T21:57:10.916623555Z, Runningtrue); uzak main b024011fd240fc65581eed24469ef88dbb271fe7 aynı. Etkin Pazartesi09:00 tek Demo Kullanıcı/ana iPhone kuralı korunur; worker11:25:06.223 UTC ile yeni runtime sonrasında ilerledi. Yeni push/run/mali hareket yok.

Canlı Ece: sayaç2, gecikmiş bakiye3000; hem kutu hem Gecikmiş durum filtresi aynı2 satır. Gerçek Excel indirmesi yalnız Ece/2 Gecikmiş/kalan3000 doğrulandı. Canlı Eren: sayaç3/bakiye4000,500 kalan ekipman satırı Gecikmiş ve Kısmi ödeme bilgisi taşır. Örnek Kardeş Ailesi iki üye,13250 tahakkuk/6250 ödenen/7000 kalan-geciken olarak aynı. Liste/plan ve rozetler tutarlı; ham DB status alanı değişmedi. Canlı finansal mutasyon/test fixture oluşturulmadı.

Yerel80 test paketi + son9 test (81 benzersiz başarılı test), typecheck, yerel Docker config10cc3dba3dadd02938f8a5fc8b09b7f9f8011e6d9bb061391cd7035649577787 ve UID1001/37 model/artifact probe başarılı. Son ek test kendi disposable fixture’larında legacy bulk iptal filtresini de sınadı. Yerel UI sayfa2→gecikme→sayfa1, durum filtresi ve5 satırlık öğrenci Excel'i geçti. Genel lint(CR-011), yeni gerçek iPhone kabulü ve restore tatbikatı bu dar düzeltmede çalıştırılmadı. Yeni ekran boyutu iddiası yok; yerel screenshot1280px, canlı tarayıcı kendi boyutuyla kontrol edildi. Görüntüler output/cr032/ altında Git dışı.

CR-032 kapalı. Eski geniş rol/nesne sorunlarıCR-002/003 ve ledger/Float konusuCR-009 açık kalır. Ham status kullanan diğer eski modüller bu dar Ödemeler düzeltmesiyle genellenmedi. Sonraki kullanım: aile detayından sporcu ödemeleri → Gecikenleri Göster veya Gecikmiş durum filtresi; aynı açık borçlar/sayı/bakiye görünür.
