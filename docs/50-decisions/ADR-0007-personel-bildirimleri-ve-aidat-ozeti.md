# ADR-0007 — Personel bildirimleri ve otomatik aidat özeti

- Status: Accepted
- Date: 2026-10-19
- Decision owner: Proje sahibi
- Approval evidence: Kullanıcı, aynı başlıklı beş bölümlük planın tamamını "PLEASE IMPLEMENT THIS PLAN" talimatıyla uygulamayı onayladı. Personel alıcısı, mevcut mali yetki sınırı, 30 günlük cihaz kaydı, otomatik özet, haftalık gün/saat, aktif/pasif borçlar, vade günü sonrası gecikme ve bir saat telafi tercihleri ayrıca doğrulandı.
- Supersedes: ADR-0006'nın veli/sporcu push işletimi ve giriş süresine bağlı personel cihaz kaydı; geri kalan Web Push/anahtar/gizlilik/teslim sözleşmesi korunur.

## Karar

Yalnız ADMIN tarafından seçilen aktif personel push alır. ADMIN/ACCOUNTING kendi şube kapsamında mali özet yönetir; diğer personel yalnız genel duyuru alır. Veli/sporcu yeni daveti, aboneliği ve gönderimi sunucuda kapatılır, mevcut cihazları pasifleştirilir; geçmiş ve tablolar korunur.

Personel cihazı 30 gün geçerlidir; geçerli giriş, mevcut abonelik ve granted izin doğrulamasıyla yenilenir. İlk cihaz ana cihazdır; otomatik özet tek ana cihaza gider. Çıkış, izin kapatma veya yönetici iptali cihazı pasifleştirir. Giriş oturumu uzatılmaz; mali ayrıntı her zaman geçerli personel girişi ve güncel yetki ister. Uygulama kaldırılması veya izin kapanması uzaktan anında tespit edilemez.

Kurallar kapalı, Pazartesi 09:00 form varsayılanıyla açılır; bir veya daha fazla hafta günü, tek saat ve Europe/Istanbul kullanır. Aylık/iki haftalık tekrar yok. Aktif/pasif tüm dönem borçlarında PENDING/PARTIAL/OVERDUE, max(amount-paidAmount,0)>0 ve İstanbul vade günü bitimi esas alınır. Güncel veri tekrar okunur; bakiye sıfırsa gönderilmez. Kilit ekranı genel kalır; tıklama güncel, kapsamı doğrulanmış listeyi açar.

Mevcut Coolify her dakika container içi işleyici çalıştırır; public cron API yok. Bir saat içinde tek telafi; daha eski slotlar MISSED, birikmiş gönderim yok. Kural/slot benzersizliği ve atomik sahiplenme; bildirim/cihaz delivery benzersizliği korunur. FAILED veya belirsiz PROCESSING otomatik retry edilmez. Çalışma sonuçları kalıcıdır; yeni retention/purge yok.

## Yayın ve kabul

Yeni servis/paket/anahtar yok. Additive migration yalnız yerel ve SporManage demo; ayrı dal/sabit commit, main/Özlüce korunur. Yetki, zaman sınırı, 30 gün/iptal, 200 sporcu, paralellik/kesinti testleri; Docker build ve demo personel iPhone/takvim/durdurma kabulü gerekir. Sonuçlar PUSH_GUIDE, CHANGELOG, PROJECT_BOOT ve SESSION_HANDOFF'a yazılır.
