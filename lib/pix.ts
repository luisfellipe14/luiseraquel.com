// Pix "copia e cola" gerado no app do banco em 06/09/2026 (BR Code estático, sem valor fixo).
// Campo 26-02 leva a descrição que aparece no app de quem paga; 62-05 é o identificador do banco.
// O CRC (últimos 4 caracteres) é conferido pelo teste em tests/invitation.test.ts.
export const PIX_PAYLOAD =
  '00020126750014br.gov.bcb.pix0114+55659810983830235Presente de casamento Luis e Raquel5204000053039865802BR5925LUIS FELLIPE FERREIRA REI6006CUIABA62580520SAN2026090617331074950300017br.gov.bcb.brcode01051.0.063045C89';
export const PIX_KEY = '+5565981098383';
export const PIX_KEY_DISPLAY = '+55 65 98109-8383';
export const PIX_RECEIVER = 'Luis Fellipe Ferreira Reis';
export const PIX_DESCRIPTION = 'Presente de casamento Luis e Raquel';

export function crc16(text: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(text)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// O site é servido em HTTPS, onde a Clipboard API existe em todo navegador atual;
// sem ela (ou sem permissão) a seção mostra a chave selecionável para copiar à mão.
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
