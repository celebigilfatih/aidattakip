"""Inspect the brochure's structure, text, links and embedded fonts."""
from pathlib import Path
import os
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
reader = PdfReader(root/'output/pdf/spormanage-aidat-takip-tanitim.pdf')
assert len(reader.pages) == 2, 'Expected two pages'
password = os.environ['AIDAT_BROCHURE_DEMO_PASSWORD']
text = '\n'.join(p.extract_text() for p in reader.pages)
assert 'demo@spormanage.com.tr' in text
assert password in text
assert 'Yalnızca demo incelemesi içindir.' in text
assert all(s in text for s in ['Sporcularınız ve aidatlarınız', 'tek yerde.', 'Kaydedin', 'Takip edin', 'Yönetin'])
assert all(s in text for s in ['Sporcu ve veli', 'Aidat tanımları', 'Toplu borçlandırma', 'Tahsilat ve bakiye', 'Grup ve şube', 'Antrenman planı', 'Yoklama', 'Sporcu notları', 'Rapor görünümü'])
assert not any(s in text for s in ['TFF', 'demo.spormanage.com.tr', 'admin123', 'localhost', '127.0.0.1', 'Veli hesabı'])
links = []
embedded = set()
for page in reader.pages:
    assert abs(float(page.mediabox.width)-595.276) < .1
    assert abs(float(page.mediabox.height)-841.89) < .1
    page_links = []
    for item in page.get('/Annots', []):
        action = item.get_object().get('/A', {})
        if '/URI' in action:
            page_links.append(str(action['/URI']))
    assert len(page_links) >= 2
    assert all(url == 'https://aidat.spormanage.com.tr' for url in page_links)
    links.extend(page_links)
    for font in page['/Resources']['/Font'].values():
        font = font.get_object()
        descriptor = font.get('/FontDescriptor')
        if descriptor:
            assert '/FontFile2' in descriptor.get_object()
            assert '/ToUnicode' in font
            embedded.add(str(font['/BaseFont']))
page_one_images = reader.pages[0]['/Resources'].get('/XObject', {})
image_count = sum(1 for obj in page_one_images.values() if obj.get_object().get('/Subtype') == '/Image')
assert image_count >= 4, f'Expected logo plus three real product screens; got {image_count} images'
assert len(embedded) >= 2
print(f'PASS: 2 A4 pages; 3 product screens; exact demo credentials; 9 modules; {len(links)} demo links; {len(embedded)} embedded Unicode fonts')
