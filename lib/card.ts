// Cartão para guardar: desenha o convite num quadro 1080x1920 (formato de story) para a
// pessoa salvar e mandar no WhatsApp. Substitui o PDF, que ninguém abria no celular.
export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;

export type CardFonts = { script: string; serif: string; mono: string };

// Enquadra a foto como object-fit: cover, com o ponto de interesse um pouco acima do centro.
export function coverRect(
  imageWidth: number,
  imageHeight: number,
  boxWidth: number,
  boxHeight: number,
  focusY = 0.5,
): { x: number; y: number; width: number; height: number } {
  const scale = Math.max(boxWidth / imageWidth, boxHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    x: (boxWidth - width) / 2,
    y: Math.min(0, Math.max(boxHeight - height, (boxHeight - height) * focusY)),
    width,
    height,
  };
}

export function fontsFromPage(element: HTMLElement): CardFonts {
  const style = getComputedStyle(element);
  const read = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
  return {
    script: read('--font-script', 'cursive'),
    serif: read('--font-serif', 'Georgia, serif'),
    mono: read('--font-mono', 'monospace'),
  };
}

type Ctx = CanvasRenderingContext2D;
function line(
  ctx: Ctx,
  text: string,
  y: number,
  font: string,
  color: string,
  spacing = '0px',
): void {
  ctx.font = font;
  ctx.fillStyle = color;
  if ('letterSpacing' in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = spacing;
  ctx.fillText(text, CARD_WIDTH / 2, y);
  if ('letterSpacing' in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = '0px';
}

export function drawKeepsake(
  ctx: Ctx,
  photo: CanvasImageSource & { width?: number; height?: number },
  fonts: CardFonts,
  guest: string,
  sizes: { width: number; height: number },
): void {
  const cream = '#f7f1e4';
  const soft = '#e9e0ce';
  const gold = '#c3ac7a';

  ctx.fillStyle = '#29281f';
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  const box = coverRect(sizes.width, sizes.height, CARD_WIDTH, CARD_HEIGHT, 0.45);
  ctx.drawImage(photo, box.x, box.y, box.width, box.height);

  const shade = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  shade.addColorStop(0, 'rgba(31,30,22,0.72)');
  shade.addColorStop(0.32, 'rgba(31,30,22,0.28)');
  shade.addColorStop(0.62, 'rgba(31,30,22,0.42)');
  shade.addColorStop(1, 'rgba(28,27,20,0.94)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.strokeStyle = 'rgba(238,229,206,0.32)';
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, CARD_WIDTH - 88, CARD_HEIGHT - 88);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  let y = 250;
  if (guest) {
    line(ctx, 'PARA', y, `30px ${fonts.mono}`, soft, '10px');
    y += 92;
    line(ctx, guest, y, `400 76px ${fonts.script}`, cream);
    y += 96;
  } else {
    y = 372;
  }

  line(ctx, 'NÓS VAMOS NOS CASAR', y, `30px ${fonts.mono}`, soft, '10px');
  y += 150;
  line(ctx, 'Luis', y, `400 168px ${fonts.script}`, cream);
  y += 118;
  line(ctx, 'e', y, `400 96px ${fonts.script}`, gold);
  y += 148;
  line(ctx, 'Raquel', y, `400 168px ${fonts.script}`, cream);

  y += 150;
  line(ctx, 'E queremos você ao nosso lado.', y, `40px ${fonts.serif}`, '#efe7d6');

  y += 190;
  ctx.font = `400 104px ${fonts.serif}`;
  const parts = ['14', '11', '2026'];
  const widths = parts.map((part) => ctx.measureText(part).width);
  ctx.font = `300 58px ${fonts.serif}`;
  const gapWidth = ctx.measureText('|').width;
  const gap = 34;
  const total = widths.reduce((a, b) => a + b, 0) + 2 * (gapWidth + gap * 2);
  let x = (CARD_WIDTH - total) / 2;
  parts.forEach((part, index) => {
    ctx.textAlign = 'left';
    ctx.font = `400 104px ${fonts.serif}`;
    ctx.fillStyle = cream;
    ctx.fillText(part, x, y);
    x += widths[index];
    if (index < parts.length - 1) {
      x += gap;
      ctx.font = `300 58px ${fonts.serif}`;
      ctx.fillStyle = gold;
      ctx.fillText('|', x, y - 8);
      x += gapWidth + gap;
    }
  });
  ctx.textAlign = 'center';

  y += 120;
  line(ctx, 'SÁBADO · 19H30', y, `30px ${fonts.mono}`, soft, '8px');
  y += 62;
  line(ctx, 'CASA NONNA · CUIABÁ', y, `30px ${fonts.mono}`, soft, '8px');

  y += 60;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CARD_WIDTH / 2 - 70, y);
  ctx.lineTo(CARD_WIDTH / 2 + 70, y);
  ctx.stroke();

  line(ctx, 'LUISERAQUEL.COM', CARD_HEIGHT - 150, `28px ${fonts.mono}`, soft, '9px');
}
