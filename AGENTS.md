# CDSK — Agent Çalışma Kuralları

Bu repository Çelebigil Development Standard Kit (CDSK) kullanır. Repository tek doğruluk kaynağıdır; sohbetler geçicidir. Bilgi ve kararlar doğru repository belgesine işlendiğinde kalıcı kabul edilir.

## Her görevin başında zorunlu okuma sırası

1. [AGENTS.md](AGENTS.md)
2. [CONSTITUTION](docs/00-product/CONSTITUTION.md)
3. [PROJECT_BOOT](PROJECT_BOOT.md)
4. [README](README.md)
5. [PRODUCT_SPEC](docs/00-product/PRODUCT_SPEC.md)
6. [SCOPE](docs/00-product/SCOPE.md)
7. [ROADMAP](docs/00-product/ROADMAP.md)
8. İlgili [mimari belgeler](docs/10-architecture/OVERVIEW.md)
9. Kabul edilmiş ilgili [ADR’ler](docs/50-decisions/README.md)
10. İlgili execution, quality ve operations belgeleri
11. [CHANGELOG](CHANGELOG.md)
12. Değiştirilecek mevcut kod ve testler

Bu sırayı kendin uygula; kullanıcıdan yeniden hatırlatmasını isteme. Çalışma ağacını incele, mevcut dosya ve kullanıcı değişikliklerini koru. Önce kısa plan oluştur; küçük, doğrulanabilir ve geri döndürülebilir adımlarla ilerle.

## Yetki hiyerarşisi

CONSTITUTION > Kabul edilmiş ADR’ler > PRODUCT_SPEC / SCOPE / ROADMAP > Mimari belgeler > Operasyon ve kalite belgeleri > PROJECT_BOOT özeti > README ve notlar > Sohbet.

Çelişkiyi sessizce çözme. Çelişen kaynakları, etkisini ve önerilen çözümü raporla; [CHANGE_REQUESTS](docs/20-execution/CHANGE_REQUESTS.md) içinde izle. `TBD` bir karar veya mevcut davranışı geçersiz kılan bir gereksinim değildir.

## Belirsizlik ve kapsam

- Repository’den doğrulanabilen bilgiyi tekrar sorma.
- Yalnızca projeye özel, sonucu anlamlı şekilde değiştiren eksik bilgileri sor.
- Bilinmeyen gereksinim, teknoloji, sürüm, tarih ve komutu `TBD` bırak.
- Geçerli olmayan bölümleri kısa gerekçeyle `N/A` işaretle.
- İskelet kurulumunda projeye özel alanları doldurma; sonraki bağlam doldurma işi ayrı ele alınır.

## Açık kullanıcı onayı gerektiren kararlar

- Mimari veya dağıtım modeli değişikliği.
- Ana teknoloji veya framework seçimi/değişimi.
- Dış servis veya entegrasyon eklenmesi.
- Veri modeli veya migration değişikliği.
- Geriye uyumsuz API/sözleşme değişikliği.
- Güvenlik, gizlilik, yetkilendirme veya retention kararı.
- MVP kapsamının genişletilmesi veya non-goal değişikliği.
- Yeni maliyet veya lisans yükü; vendor bağımlılığı.
- Geri döndürülmesi zor işlem.
- Constitution değişikliği.

Gerekirse önce `Proposed` ADR hazırla. Açık kullanıcı onayı olmadan `Accepted` yapma ve kararı uygulama. Güvenli iskelet kurulumu için verilmiş yetki bu kararları kapsamaz.

## Yasaklar

- Repository ve bağlayıcı belgeleri okumadan kod yazmak.
- Bilinmeyen gereksinimi gerçekmiş gibi kabul etmek veya kritik kararı kullanıcı adına almak.
- Belge çelişkisini görmezden gelmek.
- Kullanıcının mevcut değişikliklerini silmek, destructive işlem yapmak veya mevcut dosyaların üzerine kontrolsüz yazmak.
- Secret veya hassas bilgiyi repository’ye yazmak.
- Çalıştırılmayan testi geçmiş gibi raporlamak.
- Dokümantasyon güncellenmeden işi tamamlandı saymak.
- Sohbeti kalıcı proje hafızası olarak kullanmak.

## Her anlamlı işin kapanışı

İlgili kod, test, belgeler, ADR, CHANGELOG ve AI Handoff aynı iş bütünüdür. Doğrulamaları değişikliğin kapsamına göre seç; çalıştırılmayanları ve nedenlerini açıkça kaydet. Ayrıntılı handoff için [SESSION_HANDOFF](docs/60-ai/SESSION_HANDOFF.md), kısa özet için [PROJECT_BOOT](PROJECT_BOOT.md) güncellenir.

Kapanış raporu: yapılan iş; değiştirilen dosyalar; çalıştırılan doğrulamalar ve sonuçları; alınan/önerilen ADR’ler; açık sorular; kalan riskler; önerilen sonraki adım.
