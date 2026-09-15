# SporManage Aidat Takip — PDF Tanıtımı

Tarih: 2026-09-15. Kullanıcı iki sayfalık A4 dikey PDF planını ve yerel demo ekranlarının kullanımını onayladı. Hedef kitle spor kulübü ve spor okulu yöneticileridir.

## Tasarım ve içerik kaynakları

- Referans: futbolcms projesindeki `spormanage-keynote-turuncu-brosuru-v3.pdf`; turuncu/beyaz tasarım, iki sayfa, ürün ekranları, ikonlu özellikler ve demo kutusu.
- Palet: turuncu `#FF7A00`, yumuşak turuncu `#FFF0E7`, zemin `#FBFBFD`, metin `#1D1D1F`.
- Ürün: [PRODUCT_SPEC](../00-product/PRODUCT_SPEC.md), [SCOPE](../00-product/SCOPE.md), [DEMO_GUIDE](DEMO_GUIDE.md).
- Mevcut ekranlar: sporcu, ödeme, grup, antrenman, yoklama, notlar ve rapor sayfaları. İşlevler mevcut gösterim envanteridir; bu broşür MVP genişlemesi veya yeni özellik kabulü değildir.
- Rapor davranışı: [ADR-0003](../50-decisions/ADR-0003-rapor-disa-aktarim-ve-yetki.md). Eski demo notlarındaki export sınırlamalarının güncel durumu bu kabul edilmiş karar ve mevcut kodla birlikte okunmalıdır.
- Logo, önceki onaylı futbolcms broşüründeki mevcut SporManage marka varlığından alınmıştır.
- TFF/web sitesi, fiyatlandırma, veli hesabı ve gerçek SMS/e-posta teslimatı iddiaları bu ürüne taşınmamıştır. Yeni dış servis, lisans veya ürün politikası seçilmemiştir.

## Demo ve ekranların ayrımı

Kullanıcının belirttiği demo adresi: [aidat.spormanage.com.tr](https://aidat.spormanage.com.tr). Bütün PDF bağlantıları ve iki QR bu adresi kullanır. 2026-09-15 production kurulumu [aidat.ozlucespor.com](https://aidat.ozlucespor.com) üzerinde doğrulandı; broşür alan adı ise güvenilir TLS/DNS bağlantısı kurmadı. Bu uyuşmazlık CR-018 çözülmeden dağıtılan QR/link erişimi doğrulanmış sayılmaz.

Ekranlar, kullanıcının seçtiği yerel `127.0.0.1:3077` demosundan alınır. Demo rehberi buradaki sporcu, veli ve finansal kayıtların kurgusal olduğunu açıklar. Masaüstü ve mobil için ayrı tarayıcı görünümü kullanılır; masaüstü görüntüsü mobil diye kırpılmaz.

PDF’de kullanıcı tarafından sunum için açıkça verilen demo hesabı yer alır. Parola kaynak koduna, manifestlere veya bu belgelere yazılmaz; oluşturucuya yalnızca çalışma anında `AIDAT_BROCHURE_DEMO_PASSWORD` ortam değişkeniyle sağlanır. PDF ile türetilmiş sayfa PNG/önizleme dosyaları, tasarım gereği aynı demo giriş kutusunu içerir. Hesap 2026-09-15 tarihinde production’da aktif ADMIN olarak oluşturuldu ve canlı login geçti; yetki sonuçları [ADR-0004](../50-decisions/ADR-0004-brosur-demo-admin-hesabi.md) içindedir.

## Yeniden üretim

- Oluşturucu: [build-aidat-brochure.py](../../scripts/build-aidat-brochure.py), ReportLab ve sistemdeki Arial fontlarını kullanır.
- Varlık dizini: `output/brochure/assets/`; gerçek yerel demodan `dashboard-desktop.png`, `login-desktop.png`, `payments-mobile.png` ve SporManage logosu.
- PDF: `output/pdf/spormanage-aidat-takip-tanitim.pdf`.
- PNG ve birleşik önizleme: `output/brochure/`.
- Codex PDF becerisinin artifact başlangıç işaretleyicisi ilk üretimden önce çalıştırılır. Ardından, kullanıcı tarafından sağlanan parola yalnızca süreç ortamında mevcutken, bundled Python ile oluşturucu çalıştırılır.
- Son PDF Poppler ile 300 DPI PNG olarak render edilir. Her sayfa görsel açıdan incelenir.
- [check-aidat-brochure.py](../../scripts/check-aidat-brochure.py): iki A4 sayfa, metin, dokuz özellik, demo hesabı, bağlantılar ve gömülü Unicode fontları denetler; parolayı çıktıya yazmaz.
- [check-brochure-qr.swift](../../scripts/check-brochure-qr.swift): macOS Vision kullanarak son PNG sayfalarındaki QR kodlarını çözer ve hedef adresi doğrular.

## Doğrulama kaydı

- Kullanıcının sade taslak geri bildirimiyle ön sayfa yeniden tasarlandı. Giriş ekranı, gerçek yönetim paneli ve gerçek mobil ödeme görünümü aynı ürün vitrini içinde kullanıldı. Yerel örnek hesap kutusu, canlı demo hesabıyla karışmaması için giriş ekranı kırpımına dahil edilmedi.
- Nihai PDF iki A4 sayfa ve 3.967.029 bayt olarak doğrulandı. Metin seçilebilir; Arial/Arial Bold Unicode fontları gömülü. Ön sayfada logo dışında üç gerçek ürün ekranı, arka sayfada dokuz modül bulunur.
- Beş tıklanabilir bağlantının tamamı `https://aidat.spormanage.com.tr` hedefini kullanır. İki 300 DPI sayfa PNG'sinden QR kodları ayrı ayrı çözüldü; her ikisi de aynı doğru hedefi verdi.
- PDF metin kontrolü demo hesabını, kullanım notunu ve dokuz modülü doğruladı; TFF, eski demo alan adı, localhost veya yerel örnek parola metni PDF metninde yoktur.
- Her iki sayfa ve birleşik önizleme görsel olarak incelendi; taşma, kırpılmış metin, siyah kare, hizalama veya okunabilirlik sorunu görülmedi. Canlı demo alan adının erişimi bu ortamda doğrulanamadı.
- Python sözdizimi ve `git diff --check` başarılı. QR doğrulama aracı macOS Vision revision 1 nedeniyle deprecation uyarısı verdi ancak iki sayfada PASS döndürdü.
- Uygulama kodu/API/veri modeli değişikliği olmadığı için uygulama lint, typecheck, test ve build bu belge üretimi kapsamında yeniden çalıştırılmadı.
