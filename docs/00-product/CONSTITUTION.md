# CDSK Constitution

- Document version: 0.1.0
- CDSK version: TBD
- Last updated: 2026-09-14
- Kaynak: Kullanıcının açıkça verdiği CDSK anayasa ilkeleri ve çalışma kuralları.
- Kapsam: İlk kurulumda yalnızca verilen standart kaydedilmiştir; projeye özel politika eklenmemiştir.

## Anayasa ilkeleri

1. Repository tek doğruluk kaynağıdır.
2. Önce bağlam ve dokümantasyon doğrulanır.
3. Önemli kararlar ADR ile kayıt altına alınır.
4. AI varsayımlarını ve belirsizliklerini açıklar.
5. Repository incelemeden geliştirmeye başlanmaz.
6. Belgeler arasındaki çelişkiler görmezden gelinmez.
7. Tek terim tek anlamla kullanılır.
8. MVP kapsamı açık onay olmadan genişletilmez.
9. Güvenlik ve gizlilik başlangıçtan itibaren tasarlanır.
10. Kalite sonradan eklenmez.
11. CDSK yaşayan ve sürümlenen bir standarttır.
12. Proje sohbet geçmişinden ve kişilerden bağımsız yaşayabilmelidir.
13. Gereksiz karmaşıklık eklenmez.
14. Kararlar geriye dönük izlenebilir olmalıdır.
15. Her projeden çıkan tekrar kullanılabilir ders CDSK’ya geri beslenmelidir.
16. Kod, test, dokümantasyon, CHANGELOG ve AI Handoff aynı iş bütününün parçalarıdır.

## Yetki ve çelişki yönetimi

CONSTITUTION > Kabul edilmiş ADR’ler > PRODUCT_SPEC / SCOPE / ROADMAP > Mimari belgeler > Operasyon ve kalite belgeleri > PROJECT_BOOT özeti > README ve notlar > Sohbet.

Çelişen kaynaklar, etkisi ve önerilen çözüm açıkça raporlanır. Bilinmeyen alanlar `TBD`, uygulanmayan alanlar kısa gerekçeyle `N/A` olur. `TBD` mevcut davranış hakkında hüküm oluşturmaz.

## Değişiklik ve onay

Constitution değişikliği açık kullanıcı onayı gerektirir. Diğer onay kapıları [AGENTS.md](../../AGENTS.md) içindedir. Gerektiğinde [ADR şablonu](../50-decisions/ADR-0000-template.md) ile `Proposed` karar hazırlanır; açık onay olmadan `Accepted` yapılamaz ve karar uygulanamaz.

## Revision History

| Version | Date | Summary |
|---|---|---|
| 0.1.0 | 2026-09-14 | Kullanıcının verdiği CDSK ilkelerinin ilk kaydı. |
