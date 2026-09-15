# Architecture Decision Records

Önemli kararlar gerekçesi, alternatifleri, sonuçları ve açık onay kaydıyla burada tutulur. Kararların özeti Project Boot içinde bağlantıyla gösterilir; tam gerekçe kopyalanmaz.

## Kullanım

1. [ADR-0000-template.md](ADR-0000-template.md) şablonunu yeni, benzersiz bir `ADR-NNNN-kisa-baslik.md` dosyasına kopyala. `0000` şablon için ayrılmıştır.
2. Yeni öneriyi `Proposed` olarak kaydet. Bilinmeyenleri `TBD` bırak.
3. [AGENTS.md](../../AGENTS.md) içindeki onay kapılarını değerlendir.
4. Açık kullanıcı onayı olmadan `Accepted` yapma ve onay gerektiren kararı uygulama.
5. Onaylayan, tarih ve onayın kapsamını repository’de kaydet. Ret veya sonraki karar nedeniyle değişen durumu tarihçesiyle koru.

## Karar dizini

Üç proje ADR’si vardır. ADR-0001 ve ADR-0002 Proposed kalır; rapor dışa aktarım kararı ADR-0003 ile kullanıcı onayı üzerine Accepted durumundadır.

| ADR | Başlık | Durum | Onay kaydı | Yerine geçen karar |
|---|---|---|---|---|
| [ADR-0001](ADR-0001-secret-ve-kimlik-dogrulama-loglari.md) | Secret ve kimlik doğrulama logları | Proposed | TBD | N/A — ilk öneri |
| [ADR-0002](ADR-0002-cocuk-yetiskin-sporcu-kaydi.md) | Çocuk ve yetişkin sporcu kaydı | Proposed | TBD | N/A — ilk öneri |
| [ADR-0003](ADR-0003-rapor-disa-aktarim-ve-yetki.md) | Rapor dışa aktarımı ve yetki kapsamı | Accepted | Kullanıcı, 2026-09-15 | CR-010 rapor biçimi |

## Açık karar ihtiyaçları

Rol/nesne erişim matrisi, para hassasiyeti ve tahsilat kuralları, yedek/retention, üretim dağıtımı ve lisans durumu [CHANGE_REQUESTS](../20-execution/CHANGE_REQUESTS.md) içinde izlenir. Bu alanlar için karar alınmadı.
