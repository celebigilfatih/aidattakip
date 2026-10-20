# Architecture Decision Records

Önemli kararlar gerekçesi, alternatifleri, sonuçları ve açık onay kaydıyla burada tutulur. Kararların özeti Project Boot içinde bağlantıyla gösterilir; tam gerekçe kopyalanmaz.

## Kullanım

1. [ADR-0000-template.md](ADR-0000-template.md) şablonunu yeni, benzersiz bir `ADR-NNNN-kisa-baslik.md` dosyasına kopyala. `0000` şablon için ayrılmıştır.
2. Yeni öneriyi `Proposed` olarak kaydet. Bilinmeyenleri `TBD` bırak.
3. [AGENTS.md](../../AGENTS.md) içindeki onay kapılarını değerlendir.
4. Açık kullanıcı onayı olmadan `Accepted` yapma ve onay gerektiren kararı uygulama.
5. Onaylayan, tarih ve onayın kapsamını repository’de kaydet. Ret veya sonraki karar nedeniyle değişen durumu tarihçesiyle koru.

## Karar dizini

Dokuz proje ADR'si vardır. ADR-0001/0002 Proposed; ADR-0003/0005/0006/0007/0008/0009 kullanıcı onayıyla Accepted. ADR-0006 ilk uygulama adımı manuel push/alıcı kaydıdır; ilk iPhone gerçek teslimi tamamlandı; personel odaklı otomasyon ADR-0007 ile ayrıca onaylandı. ADR-0004, ADR-0005 tarafından Superseded durumundadır.

| ADR | Başlık | Durum | Onay kaydı | Yerine geçen karar |
|---|---|---|---|---|
| [ADR-0001](ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) | Secret ve kimlik doğrulama logları | Proposed | TBD | N/A — ilk öneri |
| [ADR-0002](ADR-0002-cocuk-yetiskin-sporcu-kaydi.md) | Çocuk ve yetişkin sporcu kaydı | Proposed | TBD | N/A — ilk öneri |
| [ADR-0003](ADR-0003-rapor-disa-aktarim-ve-yetki.md) | Rapor dışa aktarımı ve yetki kapsamı | Accepted | Kullanıcı, 2026-09-15 | CR-010 rapor biçimi |
| [ADR-0004](ADR-0004-brosur-demo-admin-hesabi.md) | Broşür demo hesabına production ADMIN yetkisi | Superseded | Kullanıcı, 2026-09-15 | [ADR-0005](ADR-0005-spormanage-ayri-demo-dagitimi.md) |
| [ADR-0005](ADR-0005-spormanage-ayri-demo-dagitimi.md) | SporManage ayrı demo dağıtımı | Accepted | Kullanıcı, 2026-09-15 | ADR-0004 ve CR-017/CR-018 dağıtım kararı |
| [ADR-0006](ADR-0006-web-push-ve-aidat-hatirlatma-kurallari.md) | Web Push ve aidat hatırlatma kuralları | Accepted | Kullanıcı, 2026-10-19; önce manuel push ve alıcı kaydı. web-push 3.6.7/MPL-2.0 ve yalnız demo HTTPS dağıtımı ayrıca onaylandı; uygulama/cihaz sonucu tarihli kayıtta izlenir | N/A — yeni karar |
| [ADR-0007](ADR-0007-personel-bildirimleri-ve-aidat-ozeti.md) | Personel bildirimleri ve otomatik aidat özeti | Accepted | Kullanıcı, 2026-10-19; beş bölümlük planı uygula talimatı | ADR-0006 alıcı/cihaz işletimi |
| [ADR-0008](ADR-0008-aidat-ozeti-kurallarini-arsivleme.md) | Aidat özeti kurallarını geçmişi koruyarak kaldırma | Accepted | Kullanıcı, 2026-10-20; ADR-0008 ve yalnız demo migration/yayını açık onayı | N/A — ADR-0007 politikası korunur |

| [ADR-0009](ADR-0009-aile-sezon-aday-takip.md) | Aile, sezon, aday kayıt ve sporcu takibi | Accepted | Kullanıcı, 2026-10-20; beş bölümlük planı uygula talimatı | N/A — dört modül ve additive demo kapsamı |

## Açık karar ihtiyaçları

Rol/nesne erişim matrisi, para hassasiyeti ve tahsilat kuralları, yedek/retention ve yasal lisans durumu [CHANGE_REQUESTS](../20-execution/CHANGE_REQUESTS.md) içinde açıktır. Ayrı demo dağıtımı ADR-0005 ile kabul edilmiştir; bu karar diğer dağıtım veya işletim politikalarının genel onayı değildir. Canlı PostgreSQL 17.7 doğrulandı; CR-006 Compose taşınabilirliği açıktır. ADR-0001 Proposed kalır; login log temizliği tamamlanmış olsa da kalan AuthService/fallback/secret maddeleri açık olduğundan tüm öneri uygulanmış sayılmaz.
