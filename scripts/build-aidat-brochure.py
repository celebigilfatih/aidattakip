"""Build the approved two-page brochure. Demo password is supplied at runtime."""
from pathlib import Path
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
from PIL import Image, ImageDraw, ImageFilter
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf/spormanage-aidat-takip-tanitim.pdf'
ASSETS = ROOT / 'output/brochure/assets'
URL = 'https://aidat.spormanage.com.tr'
EMAIL = 'demo@spormanage.com.tr'
W, H = A4
BG = colors.HexColor('#FBFBFD')
INK = colors.HexColor('#1D1D1F')
GREY = colors.HexColor('#66666E')
ORANGE = colors.HexColor('#FF7A00')
SOFT = colors.HexColor('#FFF0E7')
LINE = colors.HexColor('#E1E1E6')
WHITE = colors.white
FONT = Path('/System/Library/Fonts/Supplemental')
for name, file in [('Arial', 'Arial.ttf'), ('Arial-Bold', 'Arial Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT / file)))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold')


def text(c, s, x, y, width, size=10, leading=None, color=INK, align=0, bold=False, max_h=None):
    st = ParagraphStyle('p', fontName='Arial-Bold' if bold else 'Arial', fontSize=size,
                        leading=leading or size*1.3, textColor=color, alignment=align)
    p = Paragraph(s, st)
    _, h = p.wrap(width, H)
    if max_h is not None and h > max_h:
        raise ValueError(f'Text overflows its box: {s}')
    p.drawOn(c, x, y-h)
    return h


def label(c, s, x, y, size=8, color=INK, bold=False):
    c.setFillColor(color)
    c.setFont('Arial-Bold' if bold else 'Arial', size)
    c.drawString(x, y, s)


def qr(c, x, y, size):
    q = QrCodeWidget(URL, barLevel='M')
    b = q.getBounds()
    d = Drawing(size, size, transform=[size/(b[2]-b[0]), 0, 0, size/(b[3]-b[1]), 0, 0])
    d.add(q)
    c.setFillColor(WHITE)
    c.roundRect(x-5, y-5, size+10, size+10, 8, fill=1, stroke=0)
    c.saveState()
    renderPDF.draw(d, c, x, y)
    c.restoreState()
    c.linkURL(URL, (x-5, y-5, x+size+5, y+size+5), relative=0)


def header(c, second=False):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    if second:
        c.setFillColor(ORANGE)
        c.rect(0, H-5, W, 5, fill=1, stroke=0)
    c.drawImage(str(ASSETS/'spormanage-logo.png'), 42, 788, 23, 23, preserveAspectRatio=True, mask='auto')
    label(c, 'SPOR MANAGE', 73, 800, 8.8, bold=True)
    label(c, 'SPORCU VE AİDAT TAKİBİ', 73, 788, 6.6, GREY)
    c.setFillColor(SOFT)
    c.roundRect(437, 787, 116, 24, 12, fill=1, stroke=0)
    text(c, 'AİDAT TAKİP', 437, 804, 116, 7.4, color=ORANGE, bold=True, align=1)


def icon(c, kind, x, y):
    c.saveState()
    c.translate(x, y)
    c.setStrokeColor(ORANGE)
    c.setFillColor(ORANGE)
    c.setLineWidth(1.35)
    c.setLineCap(1)
    c.setLineJoin(1)
    if kind == 'people':
        c.circle(9, 20, 4, fill=0, stroke=1)
        c.arc(1, 0, 17, 16, 0, 180)
        c.circle(23, 18, 3, fill=0, stroke=1)
        c.arc(17, 1, 29, 13, 0, 180)
    elif kind in ('fee', 'pay'):
        c.roundRect(1, 4, 28, 21, 4, fill=0, stroke=1)
        c.line(1, 18, 29, 18)
        if kind == 'pay':
            c.line(17, 10, 21, 6)
            c.line(21, 6, 28, 14)
        else:
            c.line(6, 10, 13, 10)
    elif kind in ('bulk', 'note', 'attendance'):
        if kind == 'bulk':
            c.roundRect(0, 7, 19, 22, 2, fill=0, stroke=1)
        c.roundRect(6, 1, 21, 25, 2, fill=0, stroke=1)
        if kind == 'attendance':
            c.line(11, 12, 15, 8)
            c.line(15, 8, 23, 18)
        else:
            for yy in [19, 13, 7]:
                c.line(11, yy, 22, yy)
    elif kind == 'groups':
        c.roundRect(10, 20, 10, 8, 2, fill=0, stroke=1)
        c.line(15, 20, 15, 14)
        c.line(5, 14, 25, 14)
        for xx in [1, 21]:
            c.line(xx+4, 14, xx+4, 10)
            c.roundRect(xx, 2, 8, 8, 1, fill=0, stroke=1)
    elif kind == 'calendar':
        c.roundRect(2, 2, 26, 24, 3, fill=0, stroke=1)
        c.line(2, 19, 28, 19)
        for xx in [9, 21]:
            c.line(xx, 23, xx, 29)
        for xx in [9, 16, 23]:
            c.circle(xx, 12, 1, fill=1, stroke=0)
    elif kind == 'report':
        c.line(1, 27, 1, 2)
        c.line(1, 2, 29, 2)
        pts = [(5, 9), (12, 16), (19, 12), (28, 25)]
        for a, b in zip(pts, pts[1:]):
            c.line(*a, *b)
    c.restoreState()


def prepare_screen_assets():
    """Create clean crops and device composites from genuine browser captures."""
    tmp = ROOT/'tmp/pdfs/aidat-brochure'
    tmp.mkdir(parents=True, exist_ok=True)
    dashboard = Image.open(ASSETS/'dashboard-desktop.png').convert('RGB')
    login = Image.open(ASSETS/'login-desktop.png').convert('RGB')
    mobile = Image.open(ASSETS/'payments-mobile.png').convert('RGB')

    # Remove the local Next.js development badge from the lower-left corner.
    dashboard = dashboard.crop((0, 0, dashboard.width, min(dashboard.height, 950)))
    # Keep the product branding and sign-in form, omit the local-only sample credentials panel.
    login = login.crop((70, 170, 1260, 650))
    mobile = mobile.crop((0, 0, mobile.width, min(mobile.height, 820)))

    dashboard_path = tmp/'dashboard-clean.png'
    login_path = tmp/'login-clean.png'
    mobile_path = tmp/'mobile-clean.png'
    dashboard.save(dashboard_path, optimize=True)
    login.save(login_path, optimize=True)
    mobile.save(mobile_path, optimize=True)
    return dashboard_path, login_path, mobile_path


def browser_frame(c, image_path, x, y, width, title):
    with Image.open(image_path) as im:
        iw, ih = im.size
    height = width*ih/iw
    c.setFillColor(colors.HexColor('#E8E8ED'))
    c.roundRect(x+4, y-5, width+2, height+31, 11, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, width, height+24, 9, fill=1, stroke=1)
    for i, col in enumerate(['#FF5F57', '#FEBC2E', '#28C840']):
        c.setFillColor(colors.HexColor(col))
        c.circle(x+13+i*10, y+height+12, 2.2, fill=1, stroke=0)
    text(c, title, x+53, y+height+16, width-106, 5.7, color=GREY, align=1)
    c.drawImage(str(image_path), x, y, width, height)
    return height+24


def product(c):
    dashboard, login, mobile = prepare_screen_assets()
    browser_frame(c, dashboard, 48, 263, 474, 'SporManage · Yönetim Paneli')

    # Login page card: a full, distinct product screen with its own label.
    lx, ly, lw = 61, 226, 226
    c.setFillColor(ORANGE)
    c.roundRect(lx-4, ly-4, lw+8, 18, 8, fill=1, stroke=0)
    text(c, 'GİRİŞ EKRANI', lx, ly+9, lw, 5.8, color=WHITE, bold=True, align=1)
    browser_frame(c, login, lx, ly+12, lw, 'Güvenli giriş')

    # Real mobile viewport from the responsive payments page.
    with Image.open(mobile) as im:
        mw, mh = im.size
    px, py, pw = 429, 222, 94
    ph = pw*mh/mw
    c.setFillColor(colors.HexColor('#222226'))
    c.roundRect(px-6, py-8, pw+12, ph+16, 16, fill=1, stroke=0)
    c.drawImage(str(mobile), px, py, pw, ph)
    c.setFillColor(colors.HexColor('#222226'))
    c.roundRect(px+31, py+ph-1, 32, 4, 2, fill=1, stroke=0)
    c.setFillColor(ORANGE)
    c.roundRect(px+5, py-15, pw-10, 14, 7, fill=1, stroke=0)
    text(c, 'MOBİL ÖDEME', px+5, py-5, pw-10, 5.3, color=WHITE, bold=True, align=1)


def front(c):
    header(c)
    text(c, 'Sporcularınız ve aidatlarınız<br/><b>tek yerde.</b>', 47, 748, 502, 32, 37, align=1)
    text(c, 'Sporcu kayıtlarını, aidatları ve tahsilatları aynı panelden takip edin.<br/>Kulübünüzün günlük işlerini daha kolay yönetin.', 77, 660, 442, 10.2, 14.5, GREY, 1)
    c.setFillColor(SOFT)
    c.roundRect(116, 590, 363, 29, 14.5, fill=1, stroke=0)
    text(c, 'SPORCU  ·  AİDAT  ·  YOKLAMA  ·  RAPOR', 116, 610, 363, 7.7, color=ORANGE, align=1, bold=True)
    product(c)
    text(c, 'Girişten tahsilata kadar gerçek ürün ekranları.', 60, 212, 475, 7.6, color=GREY, align=1)
    c.setStrokeColor(LINE); c.line(56, 195, 539, 195)
    for i, (head, body, kind) in enumerate([
        ('Kaydedin', 'Sporcu ve veli bilgilerini<br/>bir arada tutun.', 'people'),
        ('Takip edin', 'Aidat, tahsilat ve<br/>kalan bakiyeyi görün.', 'pay'),
        ('Yönetin', 'Grupları, antrenmanları<br/>ve yoklamayı düzenleyin.', 'calendar'),
    ]):
        x = 57+i*164
        icon(c, kind, x, 145)
        text(c, head, x+38, 173, 123, 9.2, bold=True)
        text(c, body, x+38, 155, 123, 7.1, 10, GREY)
    c.setFillColor(ORANGE)
    c.rect(0, 0, W, 119, fill=1, stroke=0)
    text(c, 'Kulübünüz için tasarlandı.', 42, 94, 390, 18, bold=True, color=WHITE)
    text(c, 'Sporcu ve aidat takibini şimdi keşfedin.', 42, 65, 390, 9, color=WHITE)
    label(c, 'aidat.spormanage.com.tr', 42, 28, 10, WHITE, True)
    c.linkURL(URL, (42, 22, 285, 42), relative=0)
    qr(c, 481, 37, 60)
    text(c, 'DEMOYU İNCELE', 467, 22, 88, 5.9, color=WHITE, align=1, bold=True)
    c.showPage()


def back(c, password):
    header(c, True)
    text(c, 'Kulübünüzün günlük işleri,<br/><b>tek panelde.</b>', 56, 745, 483, 29, 34)
    text(c, 'Kayıttan tahsilata, antrenmandan yoklamaya tüm süreci takip edin.', 56, 667, 483, 9.4, color=GREY)
    modules = [
        ('Sporcu ve veli', 'Kayıt, iletişim bilgileri,<br/>arama ve aktif/pasif<br/>durum takibi.', 'people'),
        ('Aidat tanımları', 'Ücret türleri, dönemler<br/>ve gruplara bağlı<br/>aidat düzeni.', 'fee'),
        ('Toplu borçlandırma', 'Birden çok sporcu için<br/>aidat kayıtlarını tek<br/>işlemde oluşturma.', 'bulk'),
        ('Tahsilat ve bakiye', 'Tam ve kısmi ödeme,<br/>kalan borç ve geciken<br/>aidatların takibi.', 'pay'),
        ('Grup ve şube', 'Sporcu grupları,<br/>şube ilişkileri ve<br/>antrenör atamaları.', 'groups'),
        ('Antrenman planı', 'Seans, tarih ve saat<br/>planlama; grup bazında<br/>antrenman takibi.', 'calendar'),
        ('Yoklama', 'Katılım, devamsızlık,<br/>geç kalma ve mazeret<br/>durumlarını izleme.', 'attendance'),
        ('Sporcu notları', 'Sporcuya özel notları<br/>ve iletişim geçmişini<br/>bir arada tutma.', 'note'),
        ('Rapor görünümü', 'Tahsilat, sporcu ve<br/>devam bilgilerini<br/>özetlerle inceleme.', 'report'),
    ]
    for i, (heading, body, kind) in enumerate(modules):
        col, row = i%3, i//3
        x, y = 56+col*165, 607-row*108
        icon(c, kind, x, y)
        text(c, heading, x+38, y+27, 121, 8.4, 10.4, bold=True, max_h=22)
        text(c, body, x+38, y+8, 121, 7.7, 10.6, GREY, max_h=43)
        if col < 2:
            c.setStrokeColor(LINE)
            c.setLineWidth(.45)
            c.line(x+157, y-26, x+157, y+31)
    c.setFillColor(SOFT)
    c.roundRect(56, 118, 483, 200, 16, fill=1, stroke=0)
    text(c, 'Demoyu şimdi inceleyin', 76, 296, 420, 15, bold=True)
    text(c, 'Örnek verilerle sporcu ve aidat takibini deneyin.', 76, 271, 420, 8.5, color=GREY)
    label(c, 'DEMO ADRESİ', 76, 234, 7, ORANGE, True)
    label(c, 'aidat.spormanage.com.tr', 76, 216, 9.8, INK, True)
    c.linkURL(URL, (76, 210, 314, 230), relative=0)
    label(c, 'Kullanıcı', 76, 184, 8.3, GREY)
    label(c, EMAIL, 128, 184, 9.1)
    label(c, 'Şifre', 76, 163, 8.3, GREY)
    label(c, password, 128, 163, 10.2, INK, True)
    text(c, 'Yalnızca demo incelemesi içindir.', 76, 146, 340, 7, color=GREY)
    qr(c, 430, 164, 75)
    text(c, 'DEMOYU AÇ', 421, 147, 93, 6.4, color=ORANGE, bold=True, align=1)
    c.setFillColor(ORANGE)
    c.rect(0, 0, W, 80, fill=1, stroke=0)
    text(c, 'Kulübünüzü takipte kalın.', 42, 59, 440, 16, color=WHITE, bold=True)
    label(c, 'aidat.spormanage.com.tr', 42, 22, 9.4, WHITE, True)
    c.linkURL(URL, (42, 16, 298, 33), relative=0)
    label(c, 'SPORMANAGE / AİDAT TAKİP', 385, 22, 7, WHITE)
    c.showPage()


def build():
    password = os.environ.get('AIDAT_BROCHURE_DEMO_PASSWORD')
    if not password:
        raise SystemExit('Set AIDAT_BROCHURE_DEMO_PASSWORD for the approved demo account.')
    for file in ['dashboard-desktop.png', 'login-desktop.png', 'payments-mobile.png', 'spormanage-logo.png']:
        if not (ASSETS/file).is_file():
            raise SystemExit(f'Missing approved asset: {file}')
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle('SporManage Aidat Takip | Ürün Tanıtımı')
    c.setAuthor('SporManage')
    c.setSubject('Spor kulüpleri ve spor okulları için sporcu ve aidat takibi')
    front(c)
    back(c, password)
    c.save()
    print(OUT)


if __name__ == '__main__':
    build()
