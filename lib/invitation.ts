export const EVENT_TIME = '2026-11-14T19:30:00-04:00';
export const MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=Casa+Nonna+Unidade+Popular%2C+Rua+24+de+Outubro%2C+788%2C+Cuiab%C3%A1%2C+MT';
const recipients = { luis: '5565981098383', raquel: '5565996488383' };
export function whatsappUrl(
  recipient: 'luis' | 'raquel',
  name: string,
  note = '',
): string {
  const guest = name.trim().replace(/\s+/g, ' ');
  if (!guest) throw new Error('Informe seu nome.');
  const message = `Olá, ${recipient === 'luis' ? 'Luis' : 'Raquel'}! Sou ${guest} e confirmo minha presença no casamento de vocês, em 14/11/2026, às 19h30, na Casa Nonna.${note.trim() ? `\n\n${note.trim()}` : ''}`;
  return `https://wa.me/${recipients[recipient]}?text=${encodeURIComponent(message)}`;
}
export function remaining(now: number) {
  const delta = Date.parse(EVENT_TIME) - now;
  const s = Math.max(0, Math.floor(delta / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    started: delta <= 0,
  };
}
