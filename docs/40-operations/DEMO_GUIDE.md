# SporManage — Yerel Gösterim Rehberi

Kurulum tarihi: **15 Eylül 2026**. Yerel uygulama: [127.0.0.1:3077](http://127.0.0.1:3077/dashboard). Bütün sporcu, iletişim, ücret ve işlem bilgileri kurgusaldır; gerçek kişileri veya ticari tarifeyi temsil etmez. Teknik `demo-v1-` kimlikleri tekrar çalıştırma güvenliği için korunur ve arayüzde gösterilmez.

## Gruplar ve ücretler

| Şube | Grup | Sporcu | Aktif / pasif | Yaş örnekleri | Aylık aidat |
|---|---|---:|---|---|---:|
| Merkez Şube | Merkez U10 | 10 | 9 / 1 | 8–9 | 1.500 TL |
| Merkez Şube | Merkez U16 | 10 | 9 / 1 | 13–15 | 1.750 TL |
| Merkez Şube | Merkez Yetişkin | 10 | 9 / 1 | 22–40 | 2.000 TL |
| Sahil Şube | Sahil U10 | 10 | 9 / 1 | 8–9 | 1.500 TL |
| Sahil Şube | Sahil U16 | 10 | 9 / 1 | 13–15 | 1.750 TL |
| Sahil Şube | Sahil Yetişkin | 10 | 9 / 1 | 22–40 | 2.000 TL |

Altı gruba özel aylık tarife ile ortak 750 TL kayıt ve 1.000 TL ekipman bedeli vardır. Her şubede bir saha ve tesis, her grupta bir antrenör bulunur. Teknik kadro Murat Akın, Selin Yalçın, Önder Kılıç, Burcu Toprak, Hakan Çetin ve Derya Uçar adlı kurgusal kişilerden oluşur.

40 çocuk/genç için Anne/Baba, 20 yetişkin için `Diğer` yakınlık türünde birincil ve acil iletişim kişisi vardır. Bu fixture mevcut yetişkin kayıt kuralını değiştirmez. Her sporcu için grup geçmişi ve beş ödeme kaydı bulunur; pasif sporculara yeni yoklama eklenmez.

## Hesaplar

Mevcut yönetici hesabının adı ve parolası korunmuştur. Giriş e-postası `admin@spormanage.example` olarak yenilenmiştir. Yeni personel parolaları ilk kurulumda bir kez gösterilir, yeniden çalıştırmada değişmez ve repository’ye yazılmaz.

| E-posta | Görünen ad | Rol | Antrenör grup erişimi |
|---|---|---|---|
| `muhasebe@spormanage.example` | Aylin Karaca | ACCOUNTING | N/A — mevcut muhasebe izinleri |
| `sekreter@spormanage.example` | Cem Yıldız | SECRETARY | N/A — mevcut sekreter izinleri |
| `merkez-u10@spormanage.example` | Murat Akın | TRAINER | Merkez U10 |
| `merkez-u16@spormanage.example` | Selin Yalçın | TRAINER | Merkez U16 |
| `merkez-yetiskin@spormanage.example` | Önder Kılıç | TRAINER | Merkez Yetişkin |
| `sahil-u10@spormanage.example` | Burcu Toprak | TRAINER | Sahil U10 |
| `sahil-u16@spormanage.example` | Hakan Çetin | TRAINER | Sahil U16 |
| `sahil-yetiskin@spormanage.example` | Derya Uçar | TRAINER | Sahil Yetişkin |

## Gezilecek senaryolar

1. **Ana Sayfa:** 54 aktif sporcu, altı grup ve iki şube. Grup kartları pasif kayıtlarla birlikte 10 gösterir.
2. **Öğrenciler:** Aktif filtrede 54, tüm durumlarda 60 kurgusal sporcu; gerçekçi sporcu/veli adları, grup geçmişleri, notlar ve ödeme bağlantıları.
3. **Gruplar / Teknik Kadro / Ayarlar:** Şube, saha, tesis, antrenör ve sekiz ücret tanımı. Programlar pazartesi/perşembe; U10 16:00, U16 18:00, yetişkin 20:00 başlar.
4. **Ödemeler:** Sporcu başına önceki, mevcut ve sonraki ay aidatı, kayıt ve ekipman bedeli; toplam 300 kayıt. PAID, PARTIAL, OVERDUE, PENDING ve CANCELLED örnekleri tutar/tarihleriyle uyumludur.
5. **Antrenmanlar / Yoklama:** Dört hafta geçmiş ve iki hafta gelecek dönemde 78 seans, 378 yoklama. İptal, saat değişikliği ve kurulum günü ekstra seansı bulunur.
6. **Notlar / Bildirimler:** 18 kurgusal not ve 12 IN_APP bildirim. E-posta/SMS gönderilmez; SENT kurgusal uygulama içi geçmiş durumudur.
7. **Raporlar:** Genel Bakış, Mali Durum, Devam Durumu ve Sporcu Analizi seçimi görünür bölümleri sınırlar. Grup ve dönem filtreleri hesaplara uygulanır. Tahsilat `paidAmount`, geciken bakiye vadesi geçmiş açık tutar, devam oranı `(PRESENT + EXCUSED) / yoklama kaydı` kuralıyla hesaplanır.
8. **Dışa aktarım:** ADMIN ve ACCOUNTING gerçek XLSX indirebilir ve `Yazdır / PDF Kaydet` düğmesini görür. PDF, tarayıcının yazdırma penceresinden kaydedilir; eski `format=pdf` API çağrısı `410 Gone` döndürür.

## Tekrar çalıştırma ve doğrulama

Repository kökünde:

```sh
npm run demo:seed -- --dry-run
npm run demo:seed
npm run demo:refresh-presentation -- --dry-run
npm run demo:refresh-presentation
npm run demo:check
npm run demo:test
npm run demo:test:db
npm run report:test
npx tsc -p prisma/tsconfig.demo.json
npx tsc --noEmit --incremental false
```

`demo:seed` ve `demo:refresh-presentation` yalnızca loopback PostgreSQL, port **5477**, veritabanı **aidat_takip** ve `public` şemasını kabul eder. Yenileme; yalnız beklenen eski sunum değerlerini değiştirir, çakışma veya elle özelleştirilmiş alanları raporlar, parolaları korur ve tek transaction kullanır. İkinci çalıştırma sıfır değişiklik üretmelidir.

Referans tarih ilk `demo-v1-branch-merkez` kaydında korunur; tekrar seed tarihçeyi ileri taşımaz. Genel `db:seed` bu ortam için kullanılmaz; SHA-256/bcrypt uyuşmazlığı CR-015 altında açıktır.

## Bilinen sınırlar

- Dashboard’un bazı özet kartlarında mevcut `-` yer tutucuları ve sabit sistem/aktivite metinleri vardır.
- Ücret listesi tarife adını/periyodunu/grubunu gösterir; tutarı listelemeyebilir. Tutarlar FeeType ve Payment kayıtlarında tanımlıdır.
- Bildirim gönderim yollarında simülasyon/TODO bulunur; bu kurulum dış kanala bildirim göndermez.
- Mevcut auth kaynağında hassas log riski sürer; [ADR-0001](../50-decisions/ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) Proposed durumundadır.
- Yetişkin kayıt kuralı [ADR-0002](../50-decisions/ADR-0002-cocuk-yetiskin-sporcu-kaydi.md) kapsamında açıktır.
- Otomatik lint yapılandırması CR-011/B-008 altında ayrı iştir.

Rapor kararı: [ADR-0003](../50-decisions/ADR-0003-rapor-disa-aktarim-ve-yetki.md). Doğrulama: [DEMO_VALIDATION](../30-quality/DEMO_VALIDATION.md). Açık riskler: [CHANGE_REQUESTS](../20-execution/CHANGE_REQUESTS.md).
