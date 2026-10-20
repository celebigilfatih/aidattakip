# Deployment

## 2026-10-20 — Nihai yerel aday; demo henüz yayımlanmadı

Nihai kaynak 8cd9f72e1ab4ca8a576bb70c009cda2a27530f95 uzak codex/club-lifecycle-20261020 dalına push edildi. aidat-club-lifecycle:8cd9f72e1ab4 Docker exit0, config sha256:04448a20e21a3334d37c4f16fc57bb383dd18db385fc260939d593d883220175. Image probe UID1001/37 model/mevcut worker, .env/output/cache backup hariç. Son ilgili16 test ve typecheck başarılı; toplam79 test kanıtı korunur. Yerel60 sporcu/300 ödeme ve18 applied migration doğrulandı. Demo CF Git Source salt okunur kontrolünde hâlâ codex/staff-summary-20261019 / 7f5710cb0d7f0a9ca5467f8055c3a6ca84c4efbe; alanlar kaydedilmedi, Deploy başlatılmadı. Uzak main b024011fd240fc65581eed24469ef88dbb271fe7. CF kaynak paneli sekme21 handoff olarak işaretlendi; geçici viewport override'ları reset edildi. Teknolojik onay eksiği yok; yalnız test tarayıcı kontrolü ve son UI/deployment kabulü açık. Kalan iş önceki maddelerde, CR-031 açık.

## 2026-10-20 — ADR-0009 yayın hazırlığı (henüz dağıtılmadı)

Demo hostunda /data/coolify/backups/club-lifecycle-20261020/demo.dump,108679 byte/600; pg_restore --list başarılı. Aynı dizinde before.json mevcut veri hash/sayımları (10 kullanıcı/60 sporcu/60 veli/300 ödeme/6 grup/17 bildirim/1 kural/3 cihaz/2 alıcı/1 run) ve ozluce-before.txt saklanır. Özlüce14c56b463e9e / image b024011 / StartedAt2026-10-17T21:57:10.916623555Z/Runningtrue. Demo runtime hâlâ7f5710c; kaynak ve dağıtım ayarı değiştirilmedi. Restore tatbikatı yapılmadı.

Yeni kaynak codex/club-lifecycle-20261020;37 model/18 migration, beş additive dosya yerelde applied. Son doğrulanmış demo hâlâ13 migration/28 modeldir. Kullanıcının plan onayı demo yayınını kapsar; ek onay beklenmiyor. Tarayıcı yerel test onayında takıldığı için Git Source/Deploy henüz uygulanmadı. Önce UI onay/görüşme kontrolü, sonra yalnız demo branch+commit pin/manuel Deploy,18 migration/noseed ve guard/worker/Özlüce karşılaştırması tamamlanmalı. Beş migration tek adayda birikmiştir; modüller henüz ayrı demo yayınlarından geçmiş sayılmaz. [Doğrulama](../30-quality/CLUB_LIFECYCLE_VALIDATION.md).

## 2026-10-20 — Kural arşivleme/geri alma yalnız demo (CR-030)

Yalnız demo7f5710cb0d7f0a9ca5467f8055c3a6ca84c4efbe, Coolify h9qsg4wutnqewcyyn5vgtrdl Success/04m43s; başlangıç07:09:58 UTC, bitiş07:14:41 UTC. Nihai Docker başarılı; runtime sabit7f5710c/branch codex/staff-summary-20261019 ve manuel dağıtım aynı. 20261020100000_archive_staff_summary_rules startup logunda applied,13 migration başarılı/seed atlandı; yeni archivedAt API alanı doğrulandı. Main b024011/Özlüce'ye işlem yapılmadı.

Canlı production sayfası yenileme ve Personel ve Cihazlar kartında Kaldır/etkin kural için önce Durdur açıklaması, Arşivlenen kurallar(0)/boş durum;559px scrollWidth559, yatay taşma yok. Mevcut tercih değiştirilmeden10 personel/17 bildirim, aynı alıcı/ana iPhone/aktiflik/geçerlilik/delivery sonucu, etkin Pazartesi09:00 tek Demo Kullanıcı kuralı/sahibi ve tek eski run korundu (tüm salt okunur guard true). Worker07:15:06.363 UTC ile yayın sonrasında ilerledi; yeni run/push yok. Canlı yeni test kuralı/kişi oluşturulmadı. Screenshot output/staff-rule-archive/live-rule-archive-controls.png kaydedilip görüntülendi; secret/oturum içermeyen metadata repository dışında staff-rule-archive-release.json.

Aşağıdaki hazırlık kaydı tarihçedir.

Yerel1280px UI: Kaldır onayı/iptali, günlük listeden çıkma, yeniden giriş/navigasyon sonrası arşivde kalma, salt okunur geçmişte aynı SKIPPED run, Geri al/kapalı kart ve Yenile doğrulandı. Kendi tek kural/run fixture'ı local DB+ID/prefix/owner/state guard ile temizlendi;0 yeni bildirim. Yerel Docker adayı exit0/config2c6f1e95a440cc7e429c29362de0b62dcea6c9999c67284e4b2efda26f6059eb son etkin-restore409 korumasından öncedir; nihai kaynak demo Docker'da doğrulanacak. Son kaynak typecheck ve63 test tekrar geçti.

ADR-0008 ve yerel/demo additive migration/yayını açık kullanıcı onaylı. Yerel 20261020100000_archive_staff_summary_rules applied ve Prisma generate başarılı;63 test/typecheck geçti. Docker ve UI sürüyor, canlı yayına henüz geçilmedi. Mevcut ayrı branch/sabit ref, cron ve VAPID korunacak; main/Özlüce kapsam dışında. Arşivi tanımayan eski runtime'a dönüş güvenli sayılmaz; kolon DROP/purge yok. [ADR-0008](../50-decisions/ADR-0008-aidat-ozeti-kurallarini-arsivleme.md).

## 2026-10-19 — Mevcut kuralı personel formundan düzenleme (CR-029)

Yalnız demo6f11cf162b79935d1cf14ff9b457c5d676675072; Coolify kqujvbkdflazvphrjv5m7970 Success/03m08s, başlangıç14:13:50 UTC, bitiş14:16:58 UTC. Nihai demo Docker başarılı, manuel/sabit ref ve branch codex/staff-summary-20261019 korunur. Main b024011/Özlüce'ye işlem yok.

Canlı559px/scrollWidth559,512px dialogda güncel kural adı/Pazartesi09:00/işaretli Demo Kullanıcı/ana cihaz ve Değişiklikleri kaydet doğrulandı; Vazgeç ile kapatıldı, canlı tercih değiştirilmedi. Önce/sonra guard:10 personel/17 bildirim, aynı alıcı/ana iPhone/aktiflik/geçerlilik, etkin Pazartesi09:00 tek alıcılı kural/sahibi ve tek eski run aynı. Worker14:17:05.206 UTC ile yayın sonrasında ilerledi; yeni run/push yok. Kanıt output/staff-rule-edit/live-edit-form.png ve live-edit-actions.png (Git dışında), secret/oturum içermeyen metadata repository dışında staff-rule-edit-release.json.

Aşağıdaki yerel hazırlık kaydı tarihçedir.

Yerel typecheck/55 test ve Docker exit0/config832fda71898a5e86605bad0d62df05b82698a435117201487c2fa897bb80acab başarılı. Kaynak codex/staff-summary-20261019; yalnız demo sabit ref yayını hazırlanıyor. Model/migration/paket/anahtar/cron/dağıtım modeli değişmez. Canlı etkin Pazartesi09:00/Demo Kullanıcı/ana iPhone/geçmiş için önce guard alındı; canlı tercihe kayıt yapılmayacak. Main b024011/Özlüce kapsam dışında. [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md).

## 2026-10-19 — Personel ekranında yeni aidat kuralı yalnız demo (CR-028)

Kaynak codex/staff-summary-20261019, sabit3b7ebcceef8ce5a3a3397fa876565f1cf652066f. Yalnız demo Coolify uy5h59frb20iukwqm89ueafv Success/03m12s; başlangıç13:55:50 UTC. Manuel/sabit ref modeli aynı. Typecheck/51 test ve yerel UI oluştur/yenile/iptal/arama Enter başarılı. Yerel Docker adayı exit0/config2f9c97d0fea3e0eae409803e38924005f0788f7795cf60ab3f7f3ed895342414 son Enter korumasından öncedir; nihai kaynak demo Docker derlemesinden geçti. Backend/model/migration/paket/anahtar/cron değişmedi; main b024011/Özlüce'ye işlem yok.

Canlı559px/scrollWidth559,512px dialogda varsayılan Pazartesi09:00/boş alıcı, Demo Kullanıcı/ana cihaz hazır; form içi alıcı seçimiyle Kapalı kural oluştur düğmesi açıldı, kayıt yapılmadan Vazgeç kullanıldı. Yeni canlı kural/hesap/push yok. API öncesi/sonrası10 personel/17 bildirim, aynı ana iPhone/aktiflik, etkin Pazartesi09:00 tek Demo Kullanıcı kuralı/sahibi/tek eski run korundu. Worker lastEvaluatedAt14:00:12.271 UTC ile yayın sonrası ilerledi. Kanıt output/staff-rule-create/live-create-form.png ve live-create-recipients.png; guard metadata repository dışında staff-rule-create-release.json. [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md).

## 2026-10-19 — Personel ekranında Etkinleştir/Durdur yalnız demo (CR-027)

Kaynak codex/staff-summary-20261019, sabit6c4ee5bc4ac61ef1bf2e512a3d4ba4a840fc639f. Yalnız demo Coolify cgkadbvpctgupn7m0gjghe52 Success/02m55s, başlangıç13:32:12 UTC. Manuel/sabit ref modeli aynı. Typecheck/51 test, yerel/nihai Docker ve yerel UI başarılı; yerel config274ee5d4e76e4c67ee8ca8bca6e4869d51eff94ff4ede4aa779c97ccbd7bcb74, exit0. Model/migration/paket/anahtar/cron değişmedi; main b024011/Özlüce'ye işlem yok.

Gerçek işleyici cursor13:36:05.312 UTC ile yayın tamamlandıktan sonra ilerledi; tek önceki run korundu, yeni çalışma/push yok.

Canlı559px/scrollWidth559 Personel ve Cihazlar → Aidat özeti takvimi kartında mevcut etkin kural/Durdur ve gün/saat düğmeleri doğrulandı. Canlı Durdur tıklanmadı; kullanıcı bu görevde yetenek istedi, mevcut tercihi kapatmayı istemedi. Önce/sonra10 personel/17 bildirim/aynı seçili kişi ve ana cihaz, etkin Pazartesi09:00 tek Demo Kullanıcı kuralı/sahibi/tek eski run korundu; yeni kural/hesap/push yok. Etkinleştir/yenile/durdur/yenile yalnız yerel fixture ile çalıştırıldı ve0 run ile temizlendi. Kanıt output/staff-rule-state/live-rule-controls.png ve live-rule-and-person.png kaydedilip görüntülendi; guard metadata repository dışında staff-rule-state-release.json. [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md).

## 2026-10-19 — Personel ekranında aidat takvimi yalnız demo (CR-026)

Kaynak codex/staff-summary-20261019, sabit ec5e2dc66d79d7ddec577593c3fded5c4148ac27. Yalnız SporManage demo Coolify orvnvpbspsfgvcihnbbkzuxk Success/03m06s; başlangıç13:18:48 UTC. Manuel/sabit ref modeli aynı. Typecheck/47 test ve yerel Docker exit0 (config aca0c39d30b9aa7aff7ca9121e8dfbfdab8fe964ed6b46ac3d6e6ac1d15c97c1); nihai demo Docker derlemesi başarılı. Model/migration/paket/anahtar/cron değişmedi. Main b024011/Özlüce'ye işlem yapılmadı.

Canlı takvim kartı ve dialogda Pazartesi09:00/tek kişi/Türkiye saati;559px scrollWidth559, dialog512px ve kaydet/vazgeç görüldü. Canlı takvim değiştirilmedi; yeni staff-summary/staff GET aynı güncel takvimi döndürdü. Önce/sonra10 personel/17 bildirim, aynı seçili kişi/ana cihaz ve etkin Pazartesi09:00 tek Demo Kullanıcı kuralı/sahibi/tek eski run korundu. Ana iPhone'un geçerliliği mevcut sessiz yenileme politikasıyla18.11.2026 13:21:27.355 UTC'ye ilerlemiş; aynı cihaz ID/aktiflik korunur. Worker cursor13:22:04.316 UTC ile yayın sonrasında ilerledi, yeni run/push yok. Yerel kapalı fixture ile Salı/Perşembe10:31 kaydet/yenile/vazgeç ve kart/yeni form senaryosu doğrulandı, fixture temizlendi. Kanıt output/staff-calendar/live-calendar-dialog.png ve live-personnel-calendar.png (Git dışında); guard metadata repository dışında staff-calendar-release.json. [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md).

## 2026-10-19 — Mevcut personel kartından özet seçimi yalnız demo

Kaynak codex/staff-summary-20261019, sabit27bd03c140d92fe75b07face72f8c734825e1177. Coolify pfdbu078e4nhvndgkpegxwj2 Success/03m03s; başlangıç13:01:05 UTC. Nihai Docker build başarılı; yerel Docker config7b9f25d22e40ba12ce2d1717a50b2f8d69c4738e666fbf3e216859e224c0c9a0 exit0. Yalnız demo pini güncellendi; branch/manuel dağıtım modeli korundu. Yeni model/migration/paket/anahtar veya main/Özlüce işlemi yok.

Canlı Personel ve Cihazlar→Demo aramasında mevcut Pazartesi09:00 kutusu işaretli ve düzenlenebilir; yeni GET endpoint üyeliği aynı. Canlı tercihi değiştirmeden öncesi/sonrası10 personel/17 bildirim, aynı ana iPhone, tek Demo Kullanıcı alıcılı etkin Pazartesi09:00 kuralı/tek eski run korundu. Worker cursor13:05:07.881 UTC ile yeni container sonrası ilerledi; yeni push yok. Yerelde sentetik kart aç/yenile/kapat testi yapıldı ve fixture temizlendi. Kanıt output/existing-staff-summary/live-demo-card.png;559px scrollWidth559. CR-025 kapalı. [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md).

## 2026-10-19 — Personel formunda Pazartesi09:00 özet seçimi yalnız demo

Kaynak codex/staff-summary-20261019, sabit fed6e335ae17497a6069d541f9ed0d9f7cd9b1f4. Coolify lxbzx3wb5myozldlmekoab6i Success,03m03s; başlangıç12:46:43 UTC. Nihai Docker build geçti; yerel image config d53848d6c58d0fb1eaf3d9d92a38c7b37d4b7e871923853e6055f6ebdee8b49b, exit0. Demo pin güncellendi, branch/manuel dağıtım modeli korundu; main/Özlüce'ye işlem yok. Migration/model/paket/anahtar değişmedi.

Canlı formda varsayılan Sekreter/özet kapalı, Muhasebe seçimiyle tek mevcut etkin kural ve Oluştur ve özete ekle; alıcı kapatma/şube değişiminde seçim temizliği doğrulandı. Ölçülen559px görünümde yatay taşma yok. Demoya yeni hesap/kural/bildirim eklemeden GET karşılaştırması:10 personel,17 bildirim, aynı ana iPhone, tek Demo Kullanıcı alıcılı etkin Pazartesi09:00 kuralı ve tek eski run korundu. Worker cursor12:51:04.122 UTC ile yayın sonrasında ilerledi. output/staff-summary-onboarding/live-summary-choice.png ve live-summary-mobile.png kaydedildi; ölçülen genişlik559px,390px iddiası yok. CR-024 kapalı. [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md).

## 2026-10-19 — Bildirim ekranından personel ekleme yalnız demo

Kaynak codex/staff-summary-20261019, sabit48d55af2b32b4e769dedda9d13cfe246b1e6b0e6. Coolify4mwc4uzb1ateelgbalszgryd Success/Finished,03m40s; başlangıç12:32:42 UTC. Nihai kaynak Docker build geçti. Yalnız demo kaynak pini güncellendi; dal ve manuel dağıtım modeli korunur. Yeni model/migration/paket/secret yok; main veya Özlüce'ye işlem yapılmadı.

Canlı ADMIN ekranında yeni personel formu, Sekreter varsayılanı/alıcı kutusu açık, şube seçenekleri ve Demo araması doğrulandı;1280px taşma yok. Yeni GET staff endpoint'i form seçeneklerini döndürdü. Yeni hesap oluşturma yalnız yerel sentetik entegrasyonda sınandı; demoya deneme personeli eklenmedi. Yayın öncesi/sonrası10 personel/17 bildirim/54 sporcu150 gecikmiş aidat201.000 bakiye, Demo Kullanıcı'nın etkin ana iPhone'u ve mevcut Pazartesi09:00 etkin tek alıcılı/tek geçmiş çalışmalı kural korundu. Worker lastEvaluatedAt12:37:08.290 UTC ile yayından sonra ilerledi; yeni push yok. output/staff-onboarding/live-personnel.png ve live-create-personnel.png kaydedilip incelendi (Git dışında). CR-023 kapalı; ayrıntı [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md).

## 2026-10-19 — Geciken aidat UI/UX yalnız demo yayını tamamlandı

Kaynak codex/staff-summary-20261019, sabit1db9776f823bef9e7cf7a8457e267b0d1e077c86. Coolify yslyduhrhiazinxddvlpv1e4 Success/Finished,03m09s; rolling update12:06:09 UTC /15:06:09 İstanbul tamamlandı. Yeni container adı oibkjai6tfoeur5gxnx3ekxt-20261019T120300, image SHA968736093f0490bc052e5742295d02c466a2696d89a798411e89dcc2b327dd46. Nihai kaynak gerçek demo Docker üretim derlemesi/tip kontrolünden geçti. Yerel Docker adayı da tamamlandı (config eae84b299d14010fbee6ebe3af9b286335948ff4e572c58fde8c36e122ac74d5); son responsive sınıf düzeltmelerinden önceki adaydır, nihai kaynak kanıtı remote build'dir.

Yayın öncesi/sonrası normal ADMIN API kontrolleri:54 sporcu/150 gecikmiş aidat/201.000 açık bakiye ve toplam17 bildirim aynı; tek kural Pazartesi09:00/kapalı ve tek eski otomatik run korundu. Liste/özet/kural/bildirim/config HTTP200; mevcut demo public VAPID aynı. Yeni API, schema, migration, secret veya paket yok; yeni push gönderilmedi. Yeni container sonrası gerçek Coolify12:07:02 UTC işleyicisi Success, evaluatedRules0/claimedRuns0. Main/Özlüce'ye dağıtım yapılmadı; runtime ayrı sabit pin ve manual deploy olarak kalır.

Canlı tarayıcıda mobil kartlar ve masaüstü tablo doğrulandı. SAHIN araması Arda Şahin'in3 aidatını/3.500 tutarını buldu, genel toplam201.000 kaldı. Sayfa geçişi/geri dönüş; klavye Tab odağı etiketli sporcu durumu alanına geçti, kontrol44px. Yerel320/390/768/1280 genişliklerinde taşma yok; tablet bakiye kartı ilk incelemede bölündüğü için tam satıra alınıp yeniden kontrol edildi. output/overdue-ux/10-live-mobile-after.png ve11-live-desktop-after.png canlı kanıt; yerel görüntülerdeki59.250 farklı yerel veri setidir. Görüntüler kaydedilip açıldı; Git dışında tutulur. Gerçek iPhone Safari/VoiceOver yeni UI kabulü ayrıca kullanıcıya bırakılır; önceki gerçek push/tıklama kabulü korunur. [İnceleme](../30-quality/OVERDUE_UX_REVIEW.md).

## 2026-10-19 — Personel iPhone ve otomatik özet kabulü tamamlandı

- Manuel test 14:35 İstanbul: cmvf6h3tg0007qq010x6b9l9i, Apple HTTP201/ACCEPTED; kullanıcı bildirimi gördüğünü ve Demo Kullanıcı personel ekranını açtığını doğruladı.
- Gerçek Coolify 14:39:02 çalışması Success, evaluatedRules1/claimedRuns1. Run cmvf6lobv0001qqjngod4dh9r, tek bildirim cmvf6locv0003qqjn2wxgjual, yalnız ana iPhone cihazı; Apple HTTP201/ACCEPTED. Kullanıcı ikinci bildirimin güncel geciken aidat listesini açtığını doğruladı. Canlı 54 sporcu/150 gecikmiş aidat/201.000 açık bakiye için tek push üretildi; demo bildirim sayısı toplam17. Servis kabulü ve kullanıcı gözlemi ayrı kanıtlardır.
- Durdur PATCH HTTP200; kapalı kontrol saati14:42'de gerçek Coolify çalışması 14:42:05 Success, evaluatedRules0/claimedRuns0. Saat geçtikten sonra run sayısı1/bildirim sayısı17 ve cursor değişmedi. Kural standart Pazartesi09:00, yalnız Demo Kullanıcı ve kapalı durumuna geri alındı; geçmiş silinmedi. İşleyici her dakika etkin kalır, kapalı kural gönderim üretmez.
- Yeni iPhone ana cihazı 30 gün geçerli; eski pasif personel/veli cihazları korunur. Runtime pin dbc329d0 ve ayrı demo dalı sürer; yeni kaynak yayını yapılmadı. Typecheck/30 test/Docker kanıtı önceki uygulama aşamasındandır; bu kabul adımında API ve gerçek cihaz/cron kontrolleri yapıldı, aynı kod testleri gereksiz tekrar edilmedi.

## 2026-10-19 — Personel özeti yalnız demo dağıtımı ve işleyici hazır

- Kaynak: `codex/staff-summary-20261019`, sabit `dbc329d0ab24fd9900f26e5fbf498e7d60e5d515`. Coolify `tyc0xe2aajlja5eyzvrncm4j` Success/Finished, 3m02s; rolling update 11:19:58 UTC tamamlandı. Önceki `brnxohzlxg6swgbjpf3vdrgc` adayı service worker aktivasyon düzeltmesi için migration/runtime geçişinden önce iptal edildi; yayımlanmış sürüm sayılmaz.
- Container `69fca1f6d5b1`, image commit etiketi yukarıdaki pin; build image SHA `0d3163ef86e3ae3d8eeaf2d12f38a9aea09fdb214854c19434117e4427bffb15`. UID1001, runtime VAPID format/fingerprint aynı; yeni secret/servis yok. Image içinde .env/dump yok. Yeni additive migration applied; 10 kullanıcı/60 sporcu/60 veli/300 ödeme ve başlangıçtaki 15 bildirim/2 alıcı/2 cihaz korundu. Veli cihazları politika gereği pasifleştirildi.
- HTTPS recipient/overdue/config/personel/kural/önizleme kontrolleri başarılı. Uzak main hâlâ b024011; Özlüce container `14c56b463e9e1bbf9d549fe816050a749ec0f137c6b4732d586566be6213db3b`, image b024011 ve StartedAt 2026-10-17T21:57:10.916623555Z dağıtım sonrası da aynı. Demo auto deploy yalnız manuel; sonraki belge commit'leri runtime pinini değiştirmez.
- Demo Scheduled Task `yybczzxmkxknwvcndbffmgmv`: etkin, her dakika, timeout300, uygulamanın güncel container'ında `node --import tsx /app/scripts/staff-summary-worker.ts`. İlk gerçek otomatik çalışma 11:21:02 UTC Success/2s, çıktı evaluatedRules0/claimedRuns0. Dış cron API yok. Haftalık aidat özeti kuralı Pazartesi09:00 ve kapalı oluşturuldu; alıcı yalnız Demo Kullanıcı.
- Gerçek personel iPhone ve kısa takvim/durdurma kabulü henüz tamamlanmadı. Kullanıcı cihaz kaydı mesajı bildirdi; sunucu kontrolü mevcut iPhone cihazını pasif/ana cihaz yok gösterdi. Bu nedenle personel push gönderimi başlatılmadı; telefondaki güncel kayıt adımı beklenir. Önceki Volkan Acar kabulü yeni personel testinin yerine geçmez.

## 2026-10-19 — Personel özeti demo yayın ön kontrolü

Demo 7605b37de3a9 / 5e1fd7c runtime başlangıcı: 10 kullanıcı, 60 sporcu, 60 veli, 300 ödeme, 15 bildirim, 2 alıcı/2 cihaz. Runtime VAPID fingerprint 5ca9f29071797f80 valid; yeni key yok. Özlüce ID/image/StartedAt önceki guard ile aynı. Demo auto deploy Manual deployments only. Yerel yeni dal codex/staff-summary-20261019; main değişmez.

Yalnız demo custom backup: /data/coolify/backups/aidattakip-manual-push/spormanage-before-staff-summary-20261019.dump, 98.228 byte, izin600, SHA-256 7dbd76b56b5eba71358fe461bce2edc23edef93214a3b79c67517d6c99f2ca63. PostgreSQL container pg_restore --list başarılı; restore tatbikatı/retention seçimi değildir. Yeni migration ve kaynak dağıtımı sonraki adım.


## 2026-10-19 — Güncel demo sürümü ve iPhone kabulü başarılı

Yalnız SporManage demo `5e1fd7c5164f58043537c56e1f70a6d5dea47c08` dağıtıldı: Coolify `jvjrrs7wqdpzdiai7nzxywje` Success/Finished, 2m44s; rolling update 10:34:53 UTC. Container `7605b37de3a9`, image aynı commit etiketi. Runtime UID1001, VAPID fingerprint/format, migration applied ve image ortam/dump dışlaması doğrulandı. 10 kullanıcı/60 sporcu/60 veli/300 ödeme korundu; iki başarısız testten sonra bildirim sayısı 14, başarılı testle 15 oldu. Özlüce container ID/image/StartedAt değişmedi; main değişmedi, demo auto deploy manuel ve kaynak sabit kaldı.

Yeni normal API testi `cmvf4c11n0001o401vul843he`, tek PARENT Volkan Acar ve kayıtlı tek iPhone cihazını hedefledi. Gönderim API HTTP200/ACCEPTED; Apple delivery HTTP201, 2026-10-19 10:35:35.410 UTC (13:35 İstanbul). Kullanıcı açıkça “Bildirim geldi, dokununca Volkan Acar ekranı açıldı” yanıtıyla fiziksel bildirim görünümünü ve doğru alıcı ekranı açılışını doğruladı. Bu bir kullanıcı gözlemidir; otomatik read receipt veya diğer cihazların kabulü değildir. İki eski FAILED kayıt korunur, otomatik tekrar yok. Telefon cihaz izni korunur; otomatik aidat kuralları/scheduler/e-posta/SMS kurulmadı.

[Doğrulama ve kalan sınırlar](../60-ai/SESSION_HANDOFF.md). Aşağıdaki sürümler tarihsel dağıtım kayıtlarıdır; güncel pin 5e1fd7c, otomatik dağıtım manuel kalır.

## 2026-10-19 — Davet ekranı güncellemesi ve iPhone testi

Yalnız demo `86105c39e0dedece2e4adfcc867142245f0b7964`, Coolify `urf7fi3z4gfwjq8lcug5s5ih` Success/2m52s; 10:19:55 UTC rolling update tamamlandı. Container `87948fff7aab`. Runtime, migration, 60 sporcu/300 ödeme ve Özlüce koruması yeniden doğrulandı. Kullanıcının iPhone veli kaydı etkinleşti. İlk normal ve ayrı kontrollü tanılama gönderimleri HTTP 400/FAILED; Apple nedeni `BadWebPushTopic`. Topic düzeltmesi 5e1fd7c aynı demo dalından dağıtılıyor; gerçek teslim henüz başarılı değildir. [SESSION_HANDOFF](../60-ai/SESSION_HANDOFF.md).

## 2026-10-19 — Manuel push yalnız demo dağıtımı başarılı

| Alan | Doğrulanan sonuç |
|---|---|
| Kaynak | `codex/manual-push-demo-20261019`, sabit `6b1e1c285867658eeb516242cf9dac918c6f2920` |
| Coolify deployment | `19les87jazptcvfqxsroietk`, Success/Finished, 4m15s; rolling update 10:03:57 UTC tamamlandı |
| Demo container/image | `8f6f6b2a8d64`, `oibkjai6tfoeur5gxnx3ekxt:6b1e1c285867658eeb516242cf9dac918c6f2920` |
| Runtime | UID 1001; demo VAPID validate başarılı, public key özeti `5ca9f29071797f80`; origin/subject canonical HTTPS; RUN_SEED true değil |
| Migration/veri | `20261019120000_add_manual_web_push` applied; 10 kullanıcı/60 sporcu/60 veli/300 ödeme/12 bildirim korunmuş |
| HTTPS/API | recipient, manifest, SW, ikon, config 200; public key demo ile eşleşiyor, private key dönmüyor. ADMIN notifications/recipients 200; scheduled GET 405; oturumsuz recipient session 401; yanlış origin POST 403 |
| Özlüce koruma | Önceki aynı container ID, image ve StartedAt doğrulandı; main uzak SHA hâlâ b024011, production dağıtımı tetiklenmedi |

Chrome'da eski geçerli JWT'nin kullanıcı bağlamı API'de reddedildi; mevcut belgelenmiş demo yöneticisiyle normal giriş yenilendi ve yeni panel/test alıcısı doğrulandı. Parola/rol değiştirilmedi. Sentetik Volkan Acar veli kaydı için bir test daveti oluşturuldu; token yalnız kullanıcıya verildi ve repository'ye yazılmadı. İlk postflight'ta cihaz 0; iPhone Ana Ekran/davet/izin adımı ve gerçek push kabulü henüz bekler. Dağıtım başarısı cihazda bildirim görüldüğü anlamına gelmez. Otomatik kurallar/scheduler kapalıdır.

Demo kaynak commit'i sabit, auto deploy manuel kalır. Sonraki belge commit'leri runtime'ı kendiliğinden değiştirmez. Yeni kod dağıtımı için demo commit sabiti bilinçli güncellenmelidir; `main` üzerine birleşim veya Özlüce'ye dağıtım bu onayın kapsamında değildir. Geri dönüş için önceki image mevcut, additive migration otomatik geri alınmaz; gerçek rollback denenmedi. Aşağıdaki hazırlık/önceki durumlar tarihsel kayıt olarak korunur.

## 2026-10-19 — Demo push dağıtım ön hazırlığı

Kullanıcı paket/yalnız demo dağıtımını ve ayrıca tarayıcı üzerinden demo VAPID runtime kaydını onayladı. Coolify v4.4.6 paneli `https://coolify.webmahsul.com.tr`; demo projesi `rtm2rg3oq1r0gzynacainabz`, environment `pznrtz0nys4vptuwt3wqkbsj`, uygulama `oibkjai6tfoeur5gxnx3ekxt`. Demo auto deploy **Manual deployments only**, branch `codex/manual-push-demo-20261019` olarak kaydedildi. Bu dar test için ADR-0005'in demo `main` kaydının yerine ADR-0006 onaylı ayrı ref kullanılır; Özlüce source/config değişmez.

Yalnız demo DB hedefi/rolü doğrulandı; server_version 17.7 ve dağıtım öncesi 10 kullanıcı/60 sporcu/60 veli/300 ödeme/12 bildirim sayıldı. Demo yedeği hostta `/data/coolify/backups/aidattakip-manual-push/spormanage-before-push-20261019.dump`, 80.587 byte ve izin 600; SHA-256 `14ceb630db88e79057f1f20f85bb2bb558258bfd407e2b372a8316df3398d530`. Arşiv listesi okunabildi; restore/retention kabulü değildir. Runtime origin/subject demo HTTPS, VAPID anahtarları demo için ayrı; buildtime kapalı doğrulandı. Yeni uygulama/migration dağıtım sonucu bu kayıttan ayrı izlenecek.

## 2026-10-19 — Manuel push dağıtım adayı

ADR-0006 ilk aşaması yalnız yerelde uygulanıp additive migration yerel DB'ye işlendi. Yeni kaynak için Git push veya canlı Coolify deployment yapılmadı. `web-push` 3.6.7 MPL-2.0 somut paket lisansı ve iPhone testi için yalnız ayrı sentetik demo uygulamasına dağıtım 2026-10-19 tarihinde kullanıcı tarafından açıkça onaylandı. Demo için `codex/manual-push-demo-20261019` dalı hazırlanır; canlı çalıştırma sonuçları ayrıca kaydedilir. `main` push'u iki uygulamayı da tetikleyebildiğinden demo için ayrı incelenmiş ref/image kullanılmalıdır. Özlüce uygulaması/DB'si hedef değildir. Ortama özel runtime VAPID anahtarları, APP_ORIGIN, migration ve iPhone adımları [PUSH_GUIDE](PUSH_GUIDE.md) içindedir. Otomatik aidat işi/scheduler yoktur; önceki canlı durum kayıtları aşağıda tarihsel bağlamıyla korunmuştur.

Last updated: 2026-10-19. Durum: Mevcut dosya modeli ve 2026-09-15 tarihli son Coolify doğrulaması eşlenmiştir. Canlı ortam bu belge güncellemesinde yeniden sorgulanmadı.

## Güncel başvuru ve sürüm kanıtı

Esas alınan dağıtım kararı [ADR-0005](../50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md): Özlüce production ve SporManage demo ayrı uygulama/DB/rol kullanır, fiziksel PostgreSQL servisini paylaşır. Aşağıdaki ayrı demo bölümü bu kararın son kayıtlı uygulama kanıtıdır. Daha eski ortak domain/ADMIN bölümleri tarihsel kayıttır.

Coolify PostgreSQL sunucu sürümü **17.7**: 2026-10-19 demo uygulamasının spormanage_demo rolüyle READ ONLY transaction içinde current_database/current_user/server_version sorgusu spormanage_aidat_demo / spormanage_demo / 17.7 döndürdü. Eski 15/17 kayıtları tarihsel bağlamdır. Sürüm doğrulama işi [CR-006](../20-execution/CHANGE_REQUESTS.md) altında açık kalır. Windows yerel PostgreSQL'i 2026-10-19 tarihinde salt okunur sorguda **15.19** döndürdü (`postgres:15-alpine`); bu, Coolify sürümünü doğrulamaz. Yerel kurulum [RUNBOOK](RUNBOOK.md) içindedir.

## SporManage ayrı demo kurulumu — 2026-09-15

| Alan | Doğrulanan değer |
|---|---|
| Coolify project/environment | `SporManage Aidat Demo` / `production` |
| Application | `spormanage-aidat-demo` (`oibkjai6tfoeur5gxnx3ekxt`) |
| Git/build | `celebigilfatih/aidattakip`, `main`, repository Dockerfile, port 3000 |
| Canonical URL | [aidat.spormanage.com.tr](https://aidat.spormanage.com.tr) |
| PostgreSQL | Mevcut kaynak `f4gwswcwo48cww88c80s8sg8`; ayrı DB `spormanage_aidat_demo`, ayrı kısıtlı rol |
| Seed | `RUN_SEED=false`; restore edilmiş doğrulanmış sentetik snapshot |

Bu dağıtım Özlüce production uygulamasından ayrıdır. Fiziksel PostgreSQL servisi paylaşılır; `ozlucepay` ve `spormanage_aidat_demo` mantıksal veritabanları ile roller ayrıdır. Demo lisans kaydı aynı demo DB'de tutulur; yeni PostgreSQL/lisans servisi kurulmadı. Runtime bağlantıları ve secret'lar yalnız Coolify environment içinde bulunur ve buildtime kapsamına açılmaz.

Alan adı eski uygulamadan kaldırılıp yeni uygulamaya bağlandı; Coolify'ın otomatik oluşturduğu kullanılmayan `www` kaydı kaldırıldı. Yeni `/login` geçerli TLS ile HTTP 200 verdi ve broşür ADMIN'i demo dashboard'a girdi. `aidat.ozlucespor.com/login` HTTP 200 vermeye devam eder; aynı broşür hesabı Özlüce DB'de pasiftir. Karar ve sonuçlar [ADR-0005](../50-decisions/ADR-0005-spormanage-ayri-demo-dagitimi.md) içindedir.

Bu bölüm son kayıtlı topolojidir; bugünkü canlı erişilebilirlik ölçümü değildir. Aşağıdaki “Tarihsel Coolify production kurulumu” bölümü Özlüce uygulamasının ilk kurulum kaydını içerir; broşür domain'inin aynı uygulamaya bağlandığını söyleyen kayıt ADR-0005 öncesindeki geçici durumu anlatır.

## Tarihsel Coolify production kurulumu — 2026-09-15, ADR-0005 öncesi

Kullanıcının verdiği Coolify projesindeki mevcut production kaynakları korunarak uygulama kuruldu. Bu bölümdeki iki domain/ortak ADMIN ve `www` açıklamaları geçiş öncesine aittir; güncel işletim için yukarıdaki ayrı demo bölümünü kullanın.

| Alan | Doğrulanan değer |
|---|---|
| Coolify project/environment | `Aidat_Takip` / `production` |
| Application resource | `rccowokc40kkgss0s0c4440c` |
| Canonical Git source | `celebigilfatih/aidattakip`, `main`, `HEAD` |
| Build/runtime | Repository `Dockerfile`, Next standalone, container port `3000` |
| Public URLs | [aidat.spormanage.com.tr](https://aidat.spormanage.com.tr) (broşür/canonical), [aidat.ozlucespor.com](https://aidat.ozlucespor.com) (korunan mevcut adres) |
| PostgreSQL resource | Mevcut özel Coolify kaynağı `f4gwswcwo48cww88c80s8sg8`; mevcut `ozlucepay` veritabanı |

`833a17d` commit’i GitHub’a gönderildi. Push webhook’u ve aynı commit için ayrıca başlatılan manuel tekrar dağıtım başarıyla tamamlandı; son iki kayıt aynı kaynak içeriğini çalıştırdı. Rolling update yeni konteyneri başlattıktan sonra önceki konteyneri kaldırdı. `/login` dış URL’den HTTP 200 döndürdü ve SporManage arayüzü tarayıcıda doğrulandı.

Broşürde kullanılan `aidat.spormanage.com.tr`, kullanıcının 2026-09-15 tarihli açık onayıyla aynı Coolify uygulamasına ikinci HTTPS domain olarak eklendi. Coolify DNS kontrolü eşleşti; yapılandırmayı uygulayan `3ebc3ef` manuel deployment’ı 10 saniyede başarıyla tamamlandı. Yeni domain’in geçerli TLS ile `/login` HTTP 200 verdiği, SporManage giriş ekranını açtığı ve ortak ADMIN hesabını `/dashboard` sayfasına yönlendirdiği doğrulandı; test oturumu kapatıldı. Önceki `aidat.ozlucespor.com` adresi korunmuştur ve aynı kontrolde HTTP 200 vermeye devam etmiştir. Coolify’ın otomatik eklediği `www.aidat.spormanage.com.tr` varyantı için DNS eşleşmesi yoktur; broşür ve canonical erişim bu `www` adresini kullanmaz.

Startup mevcut 10 migration için `prisma migrate deploy` çalıştırır. `RUN_SEED` ayarlanmadığından genel seed çalışmadı; mevcut production verisi, kullanıcıları, rolleri, parolaları ve veritabanı korunmuştur. SQL restore, demo seed, şema/migration değişikliği veya yıkıcı veri işlemi yapılmadı.

Yerel Docker doğrulamasında build aşamasında `DATABASE_URL` bulunmadığında Prisma istemcisine `undefined` datasource gönderen hata düzeltildi. Runtime’da tanımlı bağlantı yine Prisma tarafından kullanılır; production veritabanı secret’ı image build için gerekli değildir.

### İlk kurulumda kaydedilen riskler ve takipleri

Secret/buildtime, başlangıç kimliği, healthcheck ve yedek/restore işleri ilgili CR'lerde açıktır. Bu listedeki domain/`www` maddesi ADR-0005 öncesi gözlemdir; ayrı demo geçişinde kullanılmayan `www` kaldırılmıştır.

- Coolify build logu, secret nitelikli bazı environment değerlerinin build argümanı olarak sunulduğunu uyardı. Değerler bu belgeye veya komut çıktısına alınmadı. Buildtime erişimini kaldırma ve secret rotasyonu [CR-007](../20-execution/CHANGE_REQUESTS.md) ile birlikte güvenlik onayı gerektirir.
- `SEED_ADMIN_*` adıyla tanımlı başlangıç kimliği mevcut veritabanında aktif `TRAINER` rolüne bağlıdır; ayrıca ayrı bir aktif ADMIN vardır. Hiçbir rol/parola değiştirilmedi. Çelişki [CR-016](../20-execution/CHANGE_REQUESTS.md) içinde izlenir.
- Coolify kaynak görünen adı eski repository adını taşıyor ve panelde “configuration changes not applied” bildirimi kalıyor. Kaydedilen canonical kaynak, yeniden yükleme ve dağıtım loguyla doğrulandı; bilinmeyen panel farkı sıfırlanmadı.
- Uygulama için Coolify healthcheck yapılandırması doğrulanmadı. `/api/health` kimlik doğrulaması istediği ve tam bağımlılık sağlığı vermediği için public readiness kontrolü olarak kullanılamaz; [CR-011](../20-execution/CHANGE_REQUESTS.md).
- Coolify veritabanı yedeği veya restore denemesi bu kurulumda doğrulanmadı; [BACKUP_RECOVERY](BACKUP_RECOVERY.md).
- Coolify’ın otomatik eklediği `www.aidat.spormanage.com.tr` varyantı DNS ile eşleşmiyor. Broşür `www` kullanmaz; ana `aidat.spormanage.com.tr` TLS/HTTP/login kontrollerini geçmiştir. Önceki broşür domain uyuşmazlığı [CR-018](../20-execution/CHANGE_REQUESTS.md) kapsamında kapatıldı.

## Tarihsel broşür demo hesabı — 2026-09-15, ADR-0004

Kullanıcının açık onayıyla `demo@spormanage.com.tr` hesabı mevcut production veritabanında aktif ADMIN olarak oluşturuldu. E-posta önceden boşta doğrulandı; diğer kullanıcıların üzerine yazılmadı. Parola bcrypt cost 12 hash olarak saklandı, repository’ye yazılmadı. Canlı login `/dashboard` yönlendirmesi ve ADMIN menüleriyle geçti; doğrulama oturumu kapatıldı. Yetki kararı ve sonuçları [ADR-0004](../50-decisions/ADR-0004-brosur-demo-admin-hesabi.md) içindedir.

Sonraki durum: ADR-0004 Superseded; hesap ayrı sentetik demo DB'sinde aktiftir, Özlüce DB'sindeki aynı hesap pasifleştirilmiştir. Güncel kayıt ADR-0005'tir.

## Mevcut dosya modeli

[Dockerfile](../../Dockerfile): çok aşamalı Node 20 Alpine build, npm ci, Prisma generate, Next standalone; runtime non-root kullanıcı ve PostgreSQL client paketini içerir. [startup](../../scripts/startup.sh): önce `prisma migrate deploy`; yalnızca `RUN_SEED=true` ise seed; sonra `node server.js`.

[Compose](../../docker-compose.yml): PostgreSQL 15 Alpine ve frontend servisleri; host 5477 → PostgreSQL 5432, host 3177 → uygulama 3000. Dosyada DB volume ve ayrı lisans DB bağlantısı tanımlanır; Compose'un bunları uçtan uca kurduğu doğrulanmış değildir. 2026-10-19 Windows yerel ortamında uygulama/lisans DB'leri ayrıca kurulmuştur; bu, Compose kurulum testi değildir. Coolify host/domain/TLS ve ayrı demo topolojisinin son kayıtları yukarıdadır; müşteri başına genel dağıtım modeli ve işletim sahibi TBD. Compose production'da kullanılmaz.

## Açık bağımlılıklar

Compose `init.sql` dosyasına referans veriyor fakat çalışma ağacında yok. Coolify kurulumu Compose kullanmaz. Dockerfile `.npmrc` kopyalıyor; dosyada registry/auth satırı bulunmadığı biçimsel olarak doğrulandı, ancak paket yapılandırması yine image kapsamındadır. [CR-006/007](../20-execution/CHANGE_REQUESTS.md).

[deploy-production.sh](../../deploy-production.sh) durdurma/yeniden build ile başlatma komutları içeriyor; bu dosyanın varlığı güncel ve güvenle çalıştırılabilir prosedür olduğunu göstermez. Bu oturum çalıştırılmadı.

## Yayın doğrulaması ve geri alma

2026-09-15 kaydında production Docker build, migration başlangıcı, rolling update, dış HTTP 200 ve giriş görünümü doğrulandı. Bu kontroller ürün kabulü veya bugünkü canlı durumun doğrulaması değildir. Yetkili production iş akışları ve zamanlanmış yedek/olağanüstü durum restore tatbikatı kanıtı eksiktir; demo ilk kurulumundaki snapshot aktarımı bu tatbikatın yerine geçmez. Geri alma için Coolify'da önceki başarılı image/deployment kaydını seçme prosedürü çalışma zamanı üzerinde denenmedi; rollback gerektiğinde veritabanı migration uyumluluğu ayrıca kontrol edilmelidir. Model, migration ve operasyon politikası değişiklikleri açık onay gerektirir.
