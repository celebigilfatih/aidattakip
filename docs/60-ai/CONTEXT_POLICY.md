# AI Context Policy

## Bağlam yükleme

[AGENTS.md](../../AGENTS.md) içindeki zorunlu okuma sırasını her görevde uygula. İlgili mimari, kabul edilmiş ADR, execution, quality ve operations belgelerini kapsamına göre seç. Değiştirilecek kod ve testleri oku; çalışma ağacını kontrol et.

## Yetki ve kanıt

[CONSTITUTION](../00-product/CONSTITUTION.md) içindeki kaynak hiyerarşisi geçerlidir. Çelişen kaynakları, etkisini ve önerilen çözümü raporla. `TBD` bir karar değildir. Doğrulanmamış gereksinim, teknoloji, sürüm, tarih veya komutu gerçekmiş gibi kullanma.

## Güvenli bağlam

Secret veya hassas bilgileri belgelere kopyalama. Kullanıcı değişikliklerini koru. Kritik kararlar için açık onayı ve ADR durumunu kontrol et. Projeye özel güvenlik, gizlilik ve retention politikaları: TBD.

## Oturum geçişi

Sohbetin tümünü kopyalama. Sonraki oturumun güvenle devamı için yapılan iş, doğrulama sonucu, karar durumu, açık risk ve sonraki adımı [SESSION_HANDOFF](SESSION_HANDOFF.md) içine kaydet; asıl belgelere bağlantı ver.
