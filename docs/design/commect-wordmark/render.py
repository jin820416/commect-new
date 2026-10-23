"""Render the COMMECT wordmark from the project's licensed Inter font."""
from pathlib import Path
import json
import shutil
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
FONT = ROOT / 'vendor/fonts/inter/InterVariable.woff2'
SCALE = 2
COLOR = (7, 35, 64)
WIDTH, HEIGHT = 4096, 1152
MAIN_WIDTH = 3840
LOWER_WIDTH = round(MAIN_WIDTH * 0.98)


def font(size, weight):
    result = ImageFont.truetype(str(FONT), round(size * SCALE))
    result.set_variation_by_axes([32, weight])
    return result


def line(text, size, weight, tracking=0):
    face = font(size, weight)
    advance = face.getlength(text)
    width = round(advance + tracking * SCALE * (len(text) - 1))
    mask = Image.new('L', (width + round(size * SCALE), round(size * SCALE * 2)))
    draw = ImageDraw.Draw(mask)
    baseline = round(size * SCALE * 1.2)
    for i, char in enumerate(text):
        x = face.getlength(text[:i + 1]) - face.getlength(char)
        draw.text((x + i * tracking * SCALE, baseline), char,
                  font=face, fill=255, anchor='ls')
    return mask.crop(mask.getbbox())


upper_raw = line('COMMECT', 900, 750)
ratio = MAIN_WIDTH * SCALE / upper_raw.width
upper = upper_raw.resize((MAIN_WIDTH * SCALE, round(upper_raw.height * ratio)), Image.Resampling.LANCZOS)
lower_size = 900 * ratio * 0.38
lower_raw = line('COMMODITY CONNECT', lower_size, 500)
tracking = (LOWER_WIDTH * SCALE - lower_raw.width) / ((len('COMMODITY CONNECT') - 1) * SCALE)
lower = line('COMMODITY CONNECT', lower_size, 500, tracking)
lower = lower.resize((LOWER_WIDTH * SCALE, lower.height), Image.Resampling.LANCZOS)
gap = round(upper.height * 0.16)
group_height = upper.height + gap + lower.height
top = round((HEIGHT * SCALE - group_height) / 2)
upper_xy = ((WIDTH * SCALE - upper.width) // 2, top)
lower_xy = ((WIDTH * SCALE - lower.width) // 2, top + upper.height + gap)
alpha = Image.new('L', (WIDTH * SCALE, HEIGHT * SCALE))
alpha.paste(upper, upper_xy)
alpha.paste(lower, lower_xy)

colors = {'navy': COLOR, 'white': (255, 255, 255)}
for output_width in [4096, 8192]:
    output_height = HEIGHT * output_width // WIDTH
    output_alpha = alpha if output_width == 8192 else alpha.resize((output_width, output_height), Image.Resampling.LANCZOS)
    for name, color in colors.items():
        result = Image.new('RGBA', output_alpha.size, (*color, 0))
        result.putalpha(output_alpha)
        result.save(HERE / f'commect-{name}-transparent-{output_width}.png', dpi=(300, 300), optimize=True)

# Export matching, tightly framed web assets without changing the approved lettering.
left, top, right, bottom = alpha.getbbox()
padding = 64
web_alpha = alpha.crop((left - padding, top - padding, right + padding, bottom + padding))
web_size = (1024, round(1024 * web_alpha.height / web_alpha.width))
web_alpha = web_alpha.resize(web_size, Image.Resampling.LANCZOS)
web_dir = ROOT / 'images/brand'
web_dir.mkdir(parents=True, exist_ok=True)
for name, color in colors.items():
    result = Image.new('RGBA', web_size, (*color, 0))
    result.putalpha(web_alpha)
    result.save(web_dir / f'commect-wordmark-{name}.png', optimize=True)

# Separate display proof, drawn from the same type masks; the deliverables retain alpha.
proof_size = (1200, 338)
proof_alpha = alpha.resize(proof_size, Image.Resampling.LANCZOS)
proof = Image.new('RGB', proof_size, 'white')
proof.paste(Image.new('RGB', proof_size, COLOR), (0, 0), proof_alpha)
proof.save(HERE / 'preview-white.png', optimize=True)

layout = {
    'color': '#072340', 'background': 'transparent',
    'font': 'Inter Variable', 'optical_size': 32,
    'upper': {'text': 'COMMECT', 'weight': 750, 'width': MAIN_WIDTH},
    'lower': {'text': 'COMMODITY CONNECT', 'weight': 500, 'width': LOWER_WIDTH,
              'tracking_em': round(tracking / lower_size, 4)},
    'lower_to_upper_width_ratio': LOWER_WIDTH / MAIN_WIDTH,
    'outputs': [[4096, 1152], [8192, 2304]],
    'inverse_color': '#FFFFFF', 'web_size': list(web_size),
    'method': 'Native font rendering with supersampled alpha; RGB fixed to requested hex.'
}
(HERE / 'layout.json').write_text(json.dumps(layout, ensure_ascii=False, indent=2) + '\n')
shutil.copyfile(ROOT / 'vendor/fonts/inter/LICENSE.txt', HERE / 'FONT-LICENSE.txt')
print(json.dumps(layout, ensure_ascii=False, indent=2))
