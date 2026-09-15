"""Create a compact two-page JPEG preview from final 300 DPI renders."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
brochure = root/'output/brochure'
pages = [Image.open(brochure/f'spormanage-aidat-takip-tanitim-{n}.png').convert('RGB') for n in (1, 2)]
preview_width = 900
thumbs = []
for page in pages:
    height = round(preview_width * page.height / page.width)
    thumbs.append(page.resize((preview_width, height), Image.Resampling.LANCZOS))
gutter = 28
preview = Image.new('RGB', (preview_width*2+gutter, max(p.height for p in thumbs)), '#E9E9ED')
preview.paste(thumbs[0], (0, 0))
preview.paste(thumbs[1], (preview_width+gutter, 0))
preview.save(brochure/'spormanage-aidat-takip-tanitim-preview.jpg', quality=90, optimize=True)
print(brochure/'spormanage-aidat-takip-tanitim-preview.jpg')
