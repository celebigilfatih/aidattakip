# Definition of Done

## Definition of Ready

- [ ] Amaç ve kabul kriterleri açık.
- [ ] İlgili belgeler, mevcut kod ve testler incelendi.
- [ ] Belirsizlikler ve onay kapıları işaretlendi.
- [ ] ADR ihtiyacı değerlendirildi.
- [ ] Doğrulama yöntemi tanımlandı.

## Definition of Done

- [ ] Kabul kriterleri karşılandı.
- [ ] Değişikliğe uygun lint, typecheck, test ve build kontrolleri geçti.
- [ ] Çalıştırılmayan kontroller ve gerekçeleri açıkça kaydedildi; çalıştırılmayan test geçmiş sayılmadı.
- [ ] Güvenlik, gizlilik ve veri etkileri değerlendirildi.
- [ ] İlgili dokümantasyon güncellendi.
- [ ] ADR ve açık onay gereksinimleri tamamlandı.
- [ ] CHANGELOG ve AI Handoff güncellendi.
- [ ] Repository tutarlılığı ve kullanıcı değişikliklerinin korunduğu doğrulandı.
- [ ] Açık riskler ve sonraki adım kaydedildi.

## Yalnızca belge değişikliklerinde doğrulama

Dosya envanteri, yerel bağlantılar, yapılandırma sözdizimi ve mevcut dosyaların korunması kontrol edilir. Uygulama kontrollerinin çalıştırılmaması gerekçesiyle raporlanır; uygulanmayan kontroller başarılı gösterilmez.

## Projeye özel kabul ve kalite kapıları

Sporcu ve aidat takibi ilk hedeftir; çocuk/yetişkin kapsamı kullanıcı tarafından doğrulanmıştır. Kesin ürün kabul kriterleri TBD; [REQUIREMENTS](../00-product/REQUIREMENTS.md). Mevcut test/komut boşlukları [TEST_STRATEGY](TEST_STRATEGY.md) içinde; tanımlanmamış veya çalıştırılmamış kontrol geçmiş kabul edilemez.
