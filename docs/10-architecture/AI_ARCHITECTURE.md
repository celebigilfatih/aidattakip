# AI Architecture

Last updated: 2026-09-14. Durum: Repository kaynaklarından statik olarak belgelenen mevcut durum; çalışma zamanı doğrulaması değildir. Öneriler ayrıca işaretlenmiştir.

## Ürün içi AI

N/A — İncelenen [package.json](../../package.json) ve [src](../../src) içinde ürün içi LLM/AI entegrasyonu bulunmadı. OpenAI/Anthropic/LangChain/AI SDK bağımlılık ve çağrı araması eşleşme vermedi. Bu ifade dışarıda çalışan bilinmeyen servisleri kapsamaz.

Ürün içi model, sağlayıcı, inference veri akışı ve değerlendirme hattı: N/A, mevcut kaynaklarda bileşen yok. Gelecekte AI ekleme hedefi/onayı: TBD; ilk sporcu/aidat hedefinin parçası olarak varsayılmadı.

## Geliştirme ajanı hafızası

CDSK belgeleri geliştirme bağlamını korur; ürün içi AI değildir. [MEMORY_STRATEGY](../60-ai/MEMORY_STRATEGY.md), [CONTEXT_POLICY](../60-ai/CONTEXT_POLICY.md) ve [AGENTS](../../AGENTS.md) geçerlidir. Yeni ürün AI entegrasyonu mimari, gizlilik, vendor ve maliyet kararları için açık onay gerektirir.
