# CR-033 — Makbuz hesaplama doğrulaması

2026-10-20 kullanıcı CR-033 düzeltmesini ve yalnız SporManage demo yayınını açıkça istedi. ADR-0009 geçerli; yeni ADR/model/migration/paket/API/yetki/retention kararı yok.

## Sözleşme

API'nin ödeme kaydı yanıtı tahsilat **sonrası birikimli** paidAmount içerir. Tahsilat makbuzunda önceki=toplam ödenen−bu tahsilat; kalan=max(tutar−toplam ödenen,0). Önceki0 ve kalan0 da açıkça gösterilir; açık bakiye KISMİ ÖDEME, kapanmış bakiye ÖDENDİ olur. Ortak receiptAmounts yardımcısı ve collection/summary ayırıcı tipi kullanılır. Mevcut borç ve tahsilat yazma rotası değiştirilmez.

Listeden yeniden açma borcun **Ödeme Özeti** görünümüdür. Eski model ayrı tahsilat geçmişi tutmadığından önceki/son tahsilat tutarı uydurulmaz; toplam ödenen/kalan ve kayıtlı son tarih/yöntem gösterilir. Eksik tarih/yöntem bugünün tarihi veya Nakit ile doldurulmaz. Kısmi tahsilatlı satırda da özet düğmesi açılır; iptal satırında kapalıdır. Belgenin yazdırma kaynağı ekrandaki aynı içeriktir; fiziksel baskı testi yapılmadı.

## Çalıştırılan kontroller

| Kontrol | Sonuç |
|---|---|
| Yeni helper ve gerçek React belge render testleri | 7 başarılı: ilk/ikinci kısmi/tam, yeniden açma, null/fazla ödeme, sıfır bakiye/önceki ve metinler |
| Ortak bakiye + DB/HTTP okuma regresyonu | Yeni testlerle birlikte 16 test başarılı; loopback5477/aidat_takip kendi fixture'larını temizledi |
| Typecheck | Başarılı |
| Yerel Docker | Başarılı; aidat-cr033:local config c676c8fdee49ed133fd540d1ff96befffdb87af141bae58a9ad5b42e9245b7f4 |
| Image probe | UID1001/37 model/worker mevcut; .env ve output image dışında |
| Yerel gerçek UI | İzole1500 TL borçta500→300→700 tahsilat: önceki0/500/800, toplam500/800/1500, kalan1000/700/0. Kısmi/tam etiketleri ve yeniden açma özeti doğru |
| Yerel fixture temizliği | Tek test borcu/sporcusu kimlik+reference guard ile silindi;60 sporcu/300 ödeme ve eski ödeme hash'i birebir aynı |

Başlangıçta eski Next vendor-chunk önbellek hatası görüldü; yerel3077 süreci doğrulanıp yeniden başlatıldı, .next güvenli workspace içi .next-cr033-before adıyla korundu. Son UI kontrolleri temiz derlemede geçti. Genel lint(CR-011), eski geniş rol sorunları(CR-002/003), ledger/Float(CR-009) ve yeni iPhone testi bu dar düzeltmede çözülmedi/çalıştırılmadı.

## Demo yayın hazırlığı

Yedek /data/coolify/backups/cr033-20261020/demo.dump,135536byte/mode600; pg_restore --list başarılı. Guard sezon/yenileme ve ödeme tarih/yöntem/kaynak alanlarını da hash'ler. Başlangıç10 kullanıcı/60 sporcu/1 aile/306 ödeme/1 sezon/2 sezon kaydı/17 bildirim/1 kural/3 cihaz/2 alıcı/1 run. Eski demo098b493; Özlüce14c56b463e9e/b024011/StartedAt2026-10-17T21:57:10.916623555Z/Runningtrue. Demo Git Source aynı codex/club-lifecycle-20261020/manuel sabit ref olarak korundu. Kanıt/loglar output/cr033 Git dışında.

## Yalnız demo yayını ve canlı kabul — tamamlandı

Kaynak34a3221f66a5b93a124326de3af3f21fb497a4a3, Coolify1jtvxmeivsnf2c9iiegnx1kv **Success/03m26s**, başlangıç12:02:49 UTC (15:02:49 Türkiye), rolling update12:06:15 UTC. Demo container a7aefb097bcf / oibkjai6tfoeur5gxnx3ekxt-20261020T120249; nihai remote Docker build/type kontrolü başarılı. Startup18 migration/No pending migrations/seed atlandı/Next Ready367ms.

Canlı Ece31.01.2027 satırı1500/500/1000/Kısmi ve yeni Ödeme Özeti düğmesi; açılan belge toplam1500/toplam ödenen500/kalan1000/KISMİ ÖDEME gösterir, eski çift düşüm ve tam ödendi ifadesi yok. Bu görünüm tarihsel tahsilat makbuzu değil güncel özettir; önceki ödeme uydurulmaz. İlk/sonraki tahsilatın önceki0/500/800 hesapları yerel gerçek kayıt akışında sınandı; canlıda ek tahsilat yapılmadı. Aile23000 tahakkuk/6750 ödenen/16250 kalan/7000 geciken aynı.

before.json/after.json ve ozluce-before.txt/ozluce-after.txt cmp birebir aynı; sayım/hash'ler, Ece500 TL kaydı, sezon ve üyelikler korundu. Uzak main b024011 aynı; Özlüce'ye yayın yok. Kural enabledtrue, Pazartesi09:00, tek Demo Kullanıcı/ana iPhone aynı; lastEvaluatedAt12:07:06.763 UTC ile yeni runtime sonrası ilerledi. Yeni run/push yok. Kanıt demo-deployment.png, demo-runtime-guard.png ve live-ece-summary.png. CR-033 kapalı; mevcut ledger yokluğu nedeniyle ayrı geçmiş tahsilatların makbuzlarını yeniden kurma bu değişiklikle sağlanmaz. Gerçek iPhone/baskı/restore tatbikatı yapılmadı; önceki hazırlık kayıtları tarihçedir.
