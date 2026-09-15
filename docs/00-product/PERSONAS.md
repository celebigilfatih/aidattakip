# Personas

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Mevcut rol envanteri

| Rol | Kaynakta görülen işlev | Persona doğrulaması |
|---|---|---|
| ADMIN | Yönetim; kullanıcı, ayar ve yedekleme işlemleri | Gerçek kullanıcı araştırması TBD |
| ACCOUNTING | Aidat yönetimi yardımcı fonksiyonunda yetkili | Gerçek iş akışı TBD |
| SECRETARY | Sporcu yönetimi yardımcı fonksiyonunda yetkili | Gerçek iş akışı TBD |
| TRAINER | Sporcu/aidat/antrenman yönetimi yardımcı fonksiyonlarında yer alıyor; grup izinleri var | Hedef yetki kapsamı TBD |

Kaynaklar: [UserRole](../../prisma/schema.prisma), [AuthService](../../src/lib/auth.ts), [grup izinleri](../../src/lib/trainer-permissions.ts). Bu tablo tüm API uçlarının yetki denetimi değildir; README rol tablosuyla çelişki [CR-002](../20-execution/CHANGE_REQUESTS.md) içinde.

## Sporcu ve veli

Mevcut kullanıcı rol enum’unda sporcu/veli rolü bulunmuyor; ayrı giriş portalı bu incelemede doğrulanmadı. İlk sürüm çocuk ve yetişkin sporcuları kapsar; kullanıcı açıklaması [PRODUCT_SPEC](PRODUCT_SPEC.md) içinde kayıtlıdır. Yaş eşiği ve veli/iletişim kuralları [ADR-0002](../50-decisions/ADR-0002-cocuk-yetiskin-sporcu-kaydi.md) ile öneri aşamasındadır. Demografik ayrıntılar, müşteri sayısı, kullanım sıklığı ve iş yükü tahmin edilmedi.
