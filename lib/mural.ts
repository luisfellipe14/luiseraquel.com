export type Recado = { nome: string; recado: string };

// Tratamentos que sozinhos não são nome: "Pastor Felipe" e "Tia Lene" precisam da palavra seguinte.
const TITULOS = new Set([
  'pastor', 'pastora', 'pr', 'pra', 'obr', 'obreiro', 'obreira', 'irmao', 'irma',
  'tia', 'tio', 'vo', 'vovo', 'dona', 'dom', 'seu', 'dr', 'dra', 'sr', 'sra', 'prof', 'profa',
]);

// Nome curto para o mural, sem expor o nome completo de ninguém.
export function firstName(value: string): string {
  const words = String(value ?? '').trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
  if (!words.length) return '';
  const head = words[0]
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z]/g, '');
  if (TITULOS.has(head) && words[1]) return `${words[0]} ${words[1]}`;
  return words[0];
}

export function cleanRecados(rows: unknown, limit = 12): Recado[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const item = row as { nome?: unknown; recado?: unknown };
      const text = (value: unknown) => (typeof value === 'string' ? value : '');
      return {
        nome: firstName(text(item?.nome)),
        recado: text(item?.recado).trim().slice(0, 400),
      };
    })
    .filter((item) => item.nome && item.recado)
    .slice(0, limit);
}

export async function fetchMural(
  endpoint: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Recado[]> {
  try {
    const url = new URL(endpoint);
    url.searchParams.set('mural', '1');
    const response = await fetchImpl(url.toString(), { redirect: 'follow' });
    if (!response.ok) return [];
    const data = (await response.json()) as { ok?: boolean; recados?: unknown };
    return data?.ok ? cleanRecados(data.recados) : [];
  } catch {
    return [];
  }
}
