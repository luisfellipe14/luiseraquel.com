// Confirmação de presença gravada numa planilha do Google (Apps Script publicado como App da Web).
// Com `siteConfig.rsvpEndpoint` vazio o site segue só com o WhatsApp; com a URL /exec preenchida,
// o formulário grava na planilha, lembra a confirmação no aparelho e reconhece o convidado
// por telefone (`?tel=`) ou pelo código do link da família (`?c=` no site, enviado como `cod` ao script).
export type RsvpInput = {
  nome: string;
  telefone?: string;
  pessoas: number | string;
  recado?: string;
  codigo?: string;
};
export type Confirmation = { nome: string; pessoas: number; data: string };
export type Lookup = {
  ok: boolean;
  confirmado?: boolean;
  nome?: string;
  pessoas?: number;
  data?: string;
  convidado?: { nome: string; acompanhante: string } | null;
};

export const STORAGE_KEY = 'luiseraquel:presenca';

// Mesma regra do Apps Script: só dígitos; DDD + número (10 ou 11 dígitos) ganha o 55 do Brasil.
export function normalizePhone(value: string): string {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length >= 12 && digits.length <= 13 ? digits : '';
}

export function guestCode(search: string): string {
  const raw = new URLSearchParams(search).get('c') ?? '';
  return raw.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
}

export function payload(input: RsvpInput): string {
  const pessoas = Math.min(10, Math.max(1, Number.parseInt(String(input.pessoas), 10) || 1));
  return JSON.stringify({
    nome: input.nome.trim().replace(/\s+/g, ' ').slice(0, 120),
    telefone: normalizePhone(input.telefone ?? ''),
    pessoas,
    recado: (input.recado ?? '').trim().slice(0, 500),
    codigo: (input.codigo ?? '').trim().toLowerCase().slice(0, 16),
  });
}

// POST sem cabeçalho próprio: o navegador manda text/plain, sem preflight, e segue o
// redirecionamento do Apps Script até a resposta JSON (que já vem com CORS liberado).
export async function submitRsvp(
  endpoint: string,
  input: RsvpInput,
  fetchImpl: typeof fetch = fetch,
): Promise<Confirmation> {
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    body: payload(input),
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = (await response.json()) as {
    ok: boolean;
    erro?: string;
    nome?: string;
    pessoas?: number;
    data?: string;
  };
  if (!data.ok) throw new Error(data.erro || 'Falha ao registrar.');
  return { nome: data.nome ?? input.nome.trim(), pessoas: Number(data.pessoas) || 1, data: data.data ?? '' };
}

export async function lookupRsvp(
  endpoint: string,
  query: { tel?: string; c?: string },
  fetchImpl: typeof fetch = fetch,
): Promise<Lookup> {
  const url = new URL(endpoint);
  const tel = normalizePhone(query.tel ?? '');
  if (tel) url.searchParams.set('tel', tel);
  if (query.c) url.searchParams.set('cod', query.c); // o Google rejeita o parâmetro "c" na URL do script
  if (!tel && !query.c) throw new Error('Informe o telefone ou o código.');
  const response = await fetchImpl(url.toString(), { redirect: 'follow' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as Lookup;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
function storage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
export function readConfirmation(store: StorageLike | null = storage()): Confirmation | null {
  try {
    const raw = store?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Confirmation>;
    if (!parsed.nome) return null;
    return { nome: parsed.nome, pessoas: Number(parsed.pessoas) || 1, data: parsed.data ?? '' };
  } catch {
    return null;
  }
}
export function saveConfirmation(value: Confirmation, store: StorageLike | null = storage()): void {
  try {
    store?.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // sem armazenamento (modo privado etc.): a confirmação já está na planilha
  }
}
export function clearConfirmation(store: StorageLike | null = storage()): void {
  try {
    store?.removeItem(STORAGE_KEY);
  } catch {
    // idem
  }
}

// A capa e o formulário perguntam pelo mesmo código: uma consulta só, compartilhada.
const guestCache = new Map<string, Promise<Lookup>>();
export function lookupGuest(endpoint: string, code: string): Promise<Lookup> {
  const key = `${endpoint}|${code}`;
  let pending = guestCache.get(key);
  if (!pending) {
    pending = lookupRsvp(endpoint, { c: code }).catch(() => ({ ok: false }) as Lookup);
    guestCache.set(key, pending);
  }
  return pending;
}

// Nome do par para a saudação da capa. A planilha às vezes traz "marido (Junior)":
// nesse caso vale o nome entre parênteses, não a palavra genérica.
export function partnerName(raw: string | null | undefined): string {
  const value = String(raw ?? '').trim();
  const inside = value.match(/^(?:marido|esposa|mulher|noivo|noiva|acompanhante)\s*\((.+)\)\s*$/i);
  if (inside) return inside[1].trim();
  return value.replace(/\s*\(.*\)\s*$/, '').trim();
}
