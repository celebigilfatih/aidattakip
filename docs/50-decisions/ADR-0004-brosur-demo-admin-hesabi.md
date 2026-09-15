# ADR-0004 — Broşür Demo Hesabına Production ADMIN Yetkisi

- Status: Superseded by [ADR-0005](ADR-0005-spormanage-ayri-demo-dagitimi.md)
- Date: 2026-09-15
- Decision owner: Kullanıcı
- Approval record: Kullanıcı `demo@spormanage.com.tr` hesabının broşür alıcılarının girişi için oluşturulmasını istedi ve takip eden mesajda rolü açıkça `ADMIN` olarak onayladı.

## Context

Broşürde paylaşılan ziyaretçilerin canlı SporManage uygulamasına girebilmesi için ortak bir demo hesabı gereklidir. Mevcut veri modelinde salt okunur `DEMO` rolü yoktur. ADMIN tüm menüleri açar; kullanıcı, ayar, öğrenci, ödeme ve diğer yönetim işlemlerine erişebilir.

## Decision

- `demo@spormanage.com.tr` e-postalı, `Demo Kullanıcı` adlı aktif production kullanıcısı `ADMIN` rolüyle oluşturulur.
- Kullanıcının verdiği parola bcrypt cost 12 ile hashlenir. Düz parola repository, log veya dokümantasyona yazılmaz.
- Aynı e-posta varsa otomatik üzerine yazılmaz; bu ilk kurulumda e-posta boşta doğrulanmış ve yeni kayıt oluşturulmuştur.
- Hesap canlı girişle doğrulanır ve doğrulama oturumu kapatılır.
- Mevcut kullanıcı, rol, parola ve production verileri değiştirilmez.

## Consequences

- Broşür alıcısı uygulamadaki tüm ADMIN menülerini görebilir.
- Ortak kimlik tüm alıcılara veri görüntüleme, değiştirme ve yönetici işlemleri yapma yetkisi verir. Kişi bazlı audit ayrımı yoktur.
- Hesabın sona erme tarihi, parola rotasyonu ve iptal tetikleyicisi TBD’dir.
- Production ortamında mevcut kayıtlar bulunduğu için bu yetki gizlilik ve veri bütünlüğü riski taşır. Salt okunur ayrı demo ortamı/rolü gelecekte değerlendirilmelidir; bu ADR onu uygulamaz.

## Alternatives considered

- `SECRETARY`: Daha dar kapsam önerildi; kullanıcı tam ADMIN rolünü seçti.
- Yeni salt okunur `DEMO` rolü veya ayrı demo veritabanı: Şema, yetkilendirme ve deployment değişikliği gerektirir; bu görevde onaylanmadı veya uygulanmadı.

## Validation

- Production veritabanında hesap aktif `ADMIN` olarak oluşturuldu ve bcrypt karşılaştırması geçti.
- Canlı uygulamada login `/dashboard` sayfasına yönlendirdi; ADMIN menüleri göründü.
- Test oturumu kapatıldı. Başka kayıt mutasyonu yapılmadı.

## Follow-up

- Broşür dağıtım süresi için parola rotasyonu/iptal tarihi belirlenmeli.
- Ortak hesabın değiştirme yetkisini kaldıracak ayrı, salt okunur demo rolü veya izole demo veritabanı için yeni karar hazırlanmalı.
- Broşür URL’si ile çalışan production domain uyuşmazlığı CR-018 kapsamında çözülmeli.

## Supersession

2026-09-15 tarihinde kullanıcı onayıyla broşür hesabı ve alan adı ayrı sentetik demo dağıtımına taşındı. Özlüce production hesabı silinmeden pasifleştirildi. Güncel karar [ADR-0005](ADR-0005-spormanage-ayri-demo-dagitimi.md) içindedir; bu belge ilk production ADMIN kararının tarihsel kaydıdır.
