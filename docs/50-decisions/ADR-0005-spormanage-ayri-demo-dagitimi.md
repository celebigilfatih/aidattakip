# ADR-0005 — SporManage Ayrı Demo Dağıtımı

- Status: Accepted
- Date: 2026-09-15
- Decision owner: Kullanıcı
- Approval record: Kullanıcı, `aidat.spormanage.com.tr` için ayrı Coolify proje/uygulaması ve ayrı mantıksal demo veritabanı planını onayladı; ardından yeni PostgreSQL servisi yerine mevcut PostgreSQL kaynağında ayrı veritabanı kullanılmasını açıkça seçti ve alan adı geçişini ayrıca onayladı.
- Supersedes: [ADR-0004](ADR-0004-brosur-demo-admin-hesabi.md)

## Context

Broşür hesabı önce mevcut Özlüce production uygulamasında ADMIN olarak oluşturulmuştu. Ortak bir broşür hesabının gerçek production kayıtlarını görmesi ve değiştirebilmesi veri bütünlüğü ile gizlilik riski doğuruyordu. Demo verisinin doğrulanmış yerel snapshot'ı hazırdı ve `aidat.spormanage.com.tr` alan adının bu veriyle çalışan ayrı bir uygulamaya yönelmesi istendi.

2026-09-15 tarihli ilk kayıt, birden fazla mantıksal veritabanını barındıran sunucu kaynağını PostgreSQL 15 olarak tanımlıyordu. Kullanıcı, ikinci bir PostgreSQL servisinin gereksiz olduğunu belirterek aynı fiziksel kaynak içinde ayrı veritabanı ve rol izolasyonunu seçti.

Belge eşleme notu (2026-10-19): Eski OVERVIEW metnindeki 17 Alpine ifadesiyle sürüm çelişkisi bulundu. Canlı sunucu sürümü bu görevde sorgulanmadığından güncel doğrulanmış sürüm **TBD** olarak izlenir; [CR-006](../20-execution/CHANGE_REQUESTS.md). Yerelde doğrulanan 15.19 canlı ortamın kanıtı değildir. Bu not kabul edilmiş izolasyon kararını veya onay kapsamını değiştirmez.

## Decision

- Coolify'da `SporManage Aidat Demo` adlı ayrı proje ve `production` ortamında `spormanage-aidat-demo` uygulaması çalışır.
- Uygulama `celebigilfatih/aidattakip` deposunun `main` dalını, repository Dockerfile'ını ve container port 3000'i kullanır.
- Mevcut PostgreSQL kaynağında yalnız demo uygulamasına ayrılmış `spormanage_aidat_demo` veritabanı ve kısıtlı `spormanage_demo` rolü kullanılır. Özlüce'nin `ozlucepay` veritabanıyla tablo veya kullanıcı kaydı paylaşılmaz.
- Demo veritabanı doğrulanmış yerel sentetik snapshot ile kurulur. Demo lisans kaydı da kullanıcının seçtiği tek demo veritabanında tutulur; ikinci lisans/PostgreSQL servisi kurulmaz.
- `aidat.spormanage.com.tr` yalnız yeni demo uygulamasına bağlanır. `www` varyantı kullanılmaz. `aidat.ozlucespor.com` mevcut Özlüce uygulamasında kalır.
- Broşür ADMIN hesabı yeni demo veritabanında aktiftir. Aynı hesap Özlüce veritabanında silinmeden pasifleştirilir.
- Runtime secret'ları yalnız Coolify ortamında tutulur. `RUN_SEED=false` kalır; canlı başlangıçta genel seed çalışmaz.

## Consequences

2026-10-19 dar test uygulaması: Kullanıcının ADR-0006 kapsamındaki yalnız demo dağıtım onayıyla demo uygulaması `codex/manual-push-demo-20261019` dalı ve sabit 5e1fd7c commit'ine alındı; auto deploy manuel. Bu, yukarıdaki demo `main` seçiminin manuel push testi için tarihli istisnasıdır. Aynı hostta ayrı DB/rol/uygulama ve canonical domain kararı korunur; Özlüce kaynağı/DB'si değiştirilmedi. Sonraki otomatik main geçişi veya iki uygulamaya dağıtım onaylanmadı.

- Broşür kullanıcısının ADMIN işlemleri yalnız sentetik demo verisini etkiler; Özlüce kayıtlarına erişemez.
- Uygulamalar aynı fiziksel PostgreSQL servisinin erişilebilirliği ve kaynak kapasitesini paylaşır. Mantıksal veritabanı ve rol izolasyonu servis seviyesindeki arızaya karşı izolasyon sağlamaz.
- Demo ADMIN sentetik veriyi değiştirebilir. Otomatik sıfırlama, zamanlanmış yedek, RPO/RTO ve parola rotasyon tarihi bu kararın kapsamında değildir.
- Lisans verisinin demo DB ile birlikte tutulması yalnız bu dağıtım için kabul edilen sadeleştirmedir; genel lisans mimarisi kararı değildir.

## Alternatives considered

- Ayrı PostgreSQL servisi: Daha güçlü kaynak izolasyonu sağlar; kullanıcı mevcut serviste ayrı veritabanını yeterli bulduğu için seçilmedi.
- Özlüce production uygulamasını demo olarak kullanmak: Ortak ADMIN'in gerçek verilere erişmesi nedeniyle reddedildi.
- Salt okunur yeni demo rolü: Şema ve yetkilendirme değişikliği gerektirir; bu kurulum mevcut ADMIN davranışını sentetik veriye sınırlar.

## Validation

- Yeni veritabanında 10 migration ile 2 şube, 6 grup, 60 sporcu, 300 ödeme, 78 seans ve 378 yoklama doğrulandı; broşür hesabıyla toplam kullanıcı sayısı 10'dur.
- Yeni alan adı geçerli TLS ile `/login` için HTTP 200 verdi; broşür ADMIN'i yeni verilerle `/dashboard` sayfasına girdi.
- `aidat.ozlucespor.com/login` HTTP 200 vermeye devam etti. Broşür hesabı Özlüce veritabanında pasifleştirildikten sonra eski uygulama girişi “Hesabınız aktif değil” yanıtı verdi.
- Yeni runtime loglarında parola veya hash kaydı görülmedi.

## Follow-up

- Demo veritabanı için doğrulanmış yedek/geri yükleme ve isteğe bağlı deterministik sıfırlama prosedürü belirlenmeli.
- Ortak ADMIN parolasının rotasyon/iptal tarihi belirlenmeli.
- Paylaşılan PostgreSQL servisinin kapasite ve erişilebilirlik etkisi izlenmeli.
