# Tam Demo — Doğrulama Kaydı

Tarih: 2026-09-15. Ortam: mevcut yerel PostgreSQL 15, `aidat_takip`, loopback:5477; Next geliştirme sunucusu 127.0.0.1:3077. Kapsam: kullanıcının onayladığı mevcut model üzerinde tam futbol demosu. [DEMO_GUIDE](../40-operations/DEMO_GUIDE.md).

## SporManage sunum ve rapor tamamlama — 2026-09-15

| Kontrol | Sonuç / kanıt |
|---|---|
| `npm run demo:refresh-presentation -- --dry-run` | PASS; 564 beklenen eski sunum değeri, sıfır çakışma ve sıfır özelleştirilmiş alan raporlandı; yazma yapılmadı. |
| `npm run demo:refresh-presentation` | COMMITTED; yalnız beklenen eski şube/grup/saha/tesis, personel/e-posta, veli, ücret, ödeme, antrenman, not ve bildirim alanları tek transaction içinde yenilendi. Parola hashleri korundu. |
| İkinci `demo:refresh-presentation` | PASS; bütün model güncelleme sayıları 0, parola hashleri aynı. |
| `npm run demo:check` | PASS; 2 şube/saha/tesis, 6 antrenör/grup/izin, 8 personel, 60 veli/sporcu/geçmiş, 8 ücret, 300 ödeme, 78 seans, 378 yoklama, 108 analitik, 18 not ve 12 bildirim. |
| `npm run demo:test`, `npm run report:test` | PASS; sırasıyla 6/6 ve 4/4 test. |
| Typecheck | PASS; `npx tsc -p prisma/tsconfig.demo.json` ve `npx tsc --noEmit --incremental false`. |
| Production build | PASS; çalışan geliştirme sunucusu durduruldu, `.next` temizlendi ve `npm run build` tamamlandı. Google font ağ isteği kaldırılarak sistem fontu kullanıldı; `/_not-found` dahil 53 statik sayfa üretildi. |
| Rapor API | PASS; oturumsuz export 401, SECRETARY 403, ADMIN PDF 410, bilinmeyen format 400, ACCOUNTING XLSX 200, ADMIN overview 200. |
| XLSX | PASS; ZIP/XLSX `PK` imzası; `Özet`, `Gruplar`, `Tahsilat`, `Devam`, `Bildirimler` sayfaları ve beklenen özet hücreleri doğrulandı. |
| Rapor değerleri | PASS; 60 toplam / 54 aktif sporcu, 89.250 TL dönem tahsilatı, 12.000 TL geciken bakiye, 42 tamamlanan seans ve %58,73 devam oranı. |
| Tarayıcı | PASS; yeni yönetici e-postasıyla giriş, dashboard, öğrenci, grup, kullanıcı, ayar, not, bildirim, ödeme, teknik kadro ve rapor ekranları kontrol edildi. Bu ekranlarda görünür eski Demo/Futbol Okulu metni bulunmadı. |

Bu bölüm, aşağıdaki önceki aşama kayıtlarının güncel sonucudur. Önceki satırlarda geçen eski görünen adlar o aşamadaki doğrulama kanıtı olarak tutulur; güncel çalışma durumu bu bölüm ve [DEMO_GUIDE](../40-operations/DEMO_GUIDE.md) ile belirlenir.

## Kulüp görünen adı — 2026-09-15

| Kontrol | Sonuç / kanıt |
|---|---|
| `npm run demo:refresh-brand -- --dry-run` | PASS; yerel hedefte `Demo Futbol Kulübü` değerinin `SporManage` olacağı görüldü. |
| `npm run demo:refresh-brand` | COMMITTED; yalnızca `SystemSetting.schoolName`, `Demo Futbol Kulübü` değerinden `SporManage` değerine güncellendi. |
| `npx tsc -p prisma/tsconfig.demo.json`, `npm run demo:test` | PASS; demo typecheck ve 6/6 saf test geçti. |
| Tarayıcı: `/dashboard` | PASS; sol üstte `SporManage` başlığı göründü. Şube ve grup etiketleri kapsam gereği `Demo Merkez` / `Demo Sahil` olarak kaldı. |

Yenileme komutu yalnızca `Futbol Okulu` veya `Demo Futbol Kulübü` adlarını kabul eder. Başka bir özel kulüp adı varsa hata ile durur ve kayıt değiştirmez.

## Kişi adı yenilemesi — 2026-09-15

| Kontrol | Sonuç / kanıt |
|---|---|
| `npm run demo:refresh-people -- --dry-run` | PASS; 60 sporcu ve 60 veli için eski `Demo` adını tespit etti, başka adlandırılmış kayıt yoktu. |
| `npm run demo:refresh-people` | COMMITTED; yalnızca bu 120 kişi adı gerçekçi, tamamen kurgusal Türkçe adlarla güncellendi. |
| `npm run demo:check` | PASS; ilişkiler, ücret/ödeme, antrenman/yoklama ve analitik sayıları değişmeden doğrulandı. |
| `npx tsc --noEmit --incremental false`, `npm run demo:test` | PASS; tüm proje typecheck ve 6/6 saf test geçti. |
| Tarayıcı: `/students` | PASS; yenileme sonrası 54 aktif sporcu listesinde Aras Acar / Volkan Acar, Eren Aksoy / Oğuz Aksoy ve Duru Aydın / Emine Aydın gibi yeni kişi adları göründü. |
| `demo:refresh-people` (teknik kadro) | PASS; dry-run altı eski antrenör adını buldu, yazma komutu yalnızca bu altı kaydı güncelledi. |
| Tarayıcı: `/trainers` | PASS; altı aktif antrenör Murat Akın, Selin Yalçın, Önder Kılıç, Burcu Toprak, Hakan Çetin ve Derya Uçar olarak göründü. |

Kişi isimleri yeni seed kurulumunda doğrudan üretilir. Yenileme komutu yalnızca adında `Demo` bulunan eski satırları seçer; elle değiştirilmiş isimlere dokunmaz. Tarayıcıda yenileme sonrasında sporcu listesinde yeni adlar görünür.

## Çalıştırılan kontroller

| Kontrol | Sonuç / kanıt |
|---|---|
| `npm run demo:seed -- --dry-run` | PASS; mevcut bir yönetici korundu, çakışma yok, yazma/parola üretimi yok. Dry-run 14 Eylül'de; ilk gerçek yazma 15 Eylül'de olduğundan kurulum günü EXTRA_SESSION kayıtları eklendi. |
| `npm run demo:seed` | COMMITTED; 2 şube, 2 saha, 2 konum, 6 antrenör, 8 yeni kullanıcı, 6 grup/izin, 60 veli/sporcu/geçmiş, 8 ücret, 300 ödeme, 6 program, 18 istisna, 78 seans, 378 yoklama, 108 analitik, 18 not, 12 bildirim. |
| `npm run demo:check` | PASS; fixture alanları, ilişkiler, bcrypt biçimi ve DB kayıtlarından bağımsız hesaplanan yoklama özeti doğru. |
| İkinci `npm run demo:seed` | COMMITTED; tüm modellerde create=0, credentials=[], referans tarih aynı. |
| `npm run demo:test` | 6/6 PASS; hedef engelleme, dört farklı tarih/ay/yıl sınırı, sayılar/ilişkiler/ödeme tarihleri, eksik satır tamamlama ve mevcut düzenleme/parola koruma. Son senaryo bellekteki Prisma adaptörüyle test edilir. |
| `npm run demo:test:db` | 1/1 PASS; PostgreSQL READ ONLY transaction içinde kontrol ve gerçek install yolu. Öncesi/sonrası tüm satırlar, zaman damgaları, ayarlar ve parola hashleri SHA-256 özeti aynı; hiçbir yazma denenmedi. Hash/parola çıktıya yazılmadı. |
| `npx tsc -p prisma/tsconfig.demo.json` | PASS; demo dosyaları. |
| `npx tsc --noEmit --incremental false` | PASS; tüm proje. İlk denemede demo dosyalarında mevcut ES5 hedefiyle iterator uyumsuzluğu bulundu; Array.from kullanılarak düzeltildi ve kontrol tekrar geçti. |
| Yönetici + 8 personel girişi | Dokuz hesabın login ve auth/me HTTP 200. Mevcut yönetici parolası çalışıyor; yeni hesaplar ilk kurulum parolalarıyla ikinci seed sonrasında giriş yaptı. |
| Antrenör grup listesi | Altı TRAINER hesabının `/api/groups` yanıtında yalnızca kendi tek grubu; ADMIN/ACCOUNTING/SECRETARY için altı grup. Yeni izin davranışı eklenmedi. |

## İlk tam demo tarayıcı incelemesi

Yönetici oturumunda canlı veri gösterimi kontrol edildi; ödeme/yoklama kaydetme, silme, gönderim veya export düğmeleri kullanılmadı.

| Ekran | Gözlenen sonuç |
|---|---|
| Dashboard | Demo Futbol Kulübü, 54 aktif sporcu, altı grup ve iki şube; şube başına 27 aktif. Bazı mevcut özet kartları `-`. |
| Öğrenciler | Varsayılan aktif filtrede 54; sporcu/veli/grup ve beş ödeme bağlantısı. |
| Gruplar | Altı grup, grup başına 10 toplam / 9 aktif, antrenör ve ücret ilişkisi. |
| Ayarlar | Sekiz ücret tanımı, grup/periyot; iki şube, saha ve konum. Özel ayarlar korunmuş. Tutar listede gösterilmiyor (mevcut davranış). |
| Ödemeler | Kayıtlar ve tahsilat/kalan tutarlar gösteriliyor; varsayılan iptal hariç sayı 276. |
| Antrenmanlar | Eylül geçmiş ve planlı seanslar; 15 Eylül ekstra seansı. Ağustos: 20 Ağustos İPTAL EDİLDİ, 24 Ağustos 16:15–17:45 saat değişikliği görüldü. |
| Yoklama | 15 Eylül, seçilen grup için BEKLİYOR seansı ve dokuz aktif sporcu. Formda varsayılan katıldı işaretleri kaydedilmedi. |
| Yoklama Analizi | Eylül Demo Merkez U10: dört seans, dokuz sporcu, %63,9 grup ortalaması, bir uyarı. |
| Notlar | 18 kurgusal not, öğrenci/grup/yazar ve sabitlenmiş/önemli örnekleri. |
| Bildirimler | Kurgusal IN_APP kayıtlar; SENT/PENDING durumları ve gönderim yapılmadığını açıklayan metin. |

## Belge ve çalışma ağacı kontrolü

`git diff --check` geçti. İlgili sekiz belgede 109 yerel bağlantı tarandı; 108 hedef mevcut. README’nin değişiklik öncesinde de bulunan `LICENSE` bağlantısının hedefi repository’de yok; bu demo çalışmasında lisans belgesi/politikası oluşturulmadı. Yeni demo bağlantıları geçerli.

## Sınırlar ve çalışma notları

- İlk `tsx --test` sandbox IPC hatası verdi; saf test komutu `node --import tsx --test` ile çalıştırıldı.
- Bazı izin incelemeleri ağ/zaman aşımı nedeniyle tamamlanmadı; izin verilen tekrarlar ve daha güvenli alternatifler kullanıldı. Canlı DB'de geçici yazma/rollback denemesi yapılmadı; entegrasyon testi READ ONLY olarak daraltıldı ve geçti. Gerçek transaction hata enjeksiyonu test edilmedi; kurulumun atomikliği Prisma/PostgreSQL transaction yapısına dayanır.
- Lint çalıştırılmadı: mevcut `next lint` etkileşimli yapılandırma ister. Bu geçiş CR-011/B-008 altında ayrı iş olarak tutulur.
- Production build, rapor ve sunum tamamlama aşamasında temiz `.next` ile çalıştırıldı ve geçti.
- Üretim deploy’u, restore, kapsamlı rol/nesne güvenlik matrisi, para yuvarlama/yarış koşulları ve gerçek bildirim gönderimi doğrulanmadı.
- Repository’ye parola/token/hash veya gerçek kişisel veri yazılmadı. Şema/migration değişmedi ve yeni paket bağımlılığı eklenmedi.

## Değişen / eklenen dosyalar

- `package.json`: dört demo komutu; bağımlılıklar değişmedi.
- `prisma/demo-data.ts`, `demo-store.ts`, `demo-install.ts`, `demo-seed.ts`, `demo-check.ts`: fixture, yerel hedef/çakışma/doğrulama ve kurulum CLI.
- `prisma/demo.test.ts`, `demo.integration.test.ts`, `tsconfig.demo.json`: saf test, salt okunur DB testi ve kapsamlı demo typecheck yapılandırması.
- `README.md`, `PROJECT_BOOT.md`, `CHANGELOG.md`.
- `docs/40-operations/DEMO_GUIDE.md`, `RUNBOOK.md`; `docs/30-quality/DEMO_VALIDATION.md`, `TEST_STRATEGY.md`; `docs/60-ai/SESSION_HANDOFF.md`.

Önceki CDSK dosyaları çalışma ağacında zaten untracked, README zaten modified idi; bu değişiklikler korundu. Git commit/stage yapılmadı.
