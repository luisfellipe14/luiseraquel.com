import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { whatsappUrl, remaining } from '../lib/invitation.ts';

await test('routes confirmation to the selected person and preserves accented names and message characters', () => {
  for (const [person, number] of [
    ['luis', '5565981098383'],
    ['raquel', '5565996488383'],
  ] as const) {
    const url = new URL(
      whatsappUrl(person, '  Ana & João  ', 'Até lá! #alegria'),
    );
    assert.equal(url.origin, 'https://wa.me');
    assert.equal(url.pathname, `/${number}`);
    assert.equal(url.hash, '');
    assert.match(url.searchParams.get('text')!, /Sou Ana & João/);
    assert.match(url.searchParams.get('text')!, /confirmo minha presença/);
    assert.match(url.searchParams.get('text')!, /Até lá! #alegria/);
  }
});
await test('rejects whitespace-only names instead of opening a nameless confirmation', () => {
  assert.throws(() => whatsappUrl('luis', '   '), /nome/i);
});
await test('computes countdown at the Cuiaba event instant and never shows negative values', () => {
  assert.deepEqual(remaining(Date.parse('2026-11-13T22:28:57Z')), {
    days: 1,
    hours: 1,
    minutes: 1,
    seconds: 3,
    started: false,
  });
  assert.deepEqual(remaining(Date.parse('2026-11-14T23:30:00Z')), {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    started: true,
  });
  assert.equal(remaining(Date.parse('2026-11-15T00:00:00Z')).days, 0);
});
await test('exports an event at 19h30 Cuiaba in interoperable UTC without an invented end', () => {
  const ics = readFileSync(
    new URL('../public/casamento-luis-raquel.ics', import.meta.url),
    'utf8',
  );
  assert.match(ics, /DTSTART:20261114T233000Z\r\n/);
  assert.match(ics, /SUMMARY:Casamento de Luis e Raquel/);
  assert.match(ics, /LOCATION:Casa Nonna/);
  assert.ok(!ics.includes('DTEND'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
});

import { PIX_PAYLOAD, PIX_KEY, PIX_DESCRIPTION, crc16 } from '../lib/pix.ts';

await test('keeps the bank-generated Pix payload intact (CRC, key and description)', () => {
  assert.equal(crc16(PIX_PAYLOAD.slice(0, -4)), PIX_PAYLOAD.slice(-4));
  assert.equal(PIX_PAYLOAD.slice(0, 6), '000201');
  assert.equal(PIX_PAYLOAD.slice(-8, -4), '6304');
  assert.match(PIX_PAYLOAD, /br\.gov\.bcb\.pix/);
  assert.match(PIX_PAYLOAD, new RegExp(PIX_KEY.replace('+', '\\+')));
  assert.match(PIX_PAYLOAD, new RegExp(PIX_DESCRIPTION));
  assert.ok(PIX_PAYLOAD.length <= 512);
});

import {
  partnerName,
  STORAGE_KEY,
  guestCode,
  lookupRsvp,
  normalizePhone,
  payload,
  readConfirmation,
  saveConfirmation,
  submitRsvp,
} from '../lib/rsvp.ts';

await test('normalizes Brazilian phones the same way the spreadsheet script does', () => {
  assert.equal(normalizePhone('(65) 98109-8383'), '5565981098383');
  assert.equal(normalizePhone('65 3333-4444'), '556533334444');
  assert.equal(normalizePhone('+55 65 98109-8383'), '5565981098383');
  assert.equal(normalizePhone('98109-8383'), '');
  assert.equal(normalizePhone(''), '');
});
await test('builds a bounded payload and reads the family code from the URL', () => {
  const body = JSON.parse(
    payload({ nome: '  Ana   Souza ', telefone: '65 98109-8383', pessoas: '25', recado: ' oi ', codigo: 'AbC123' }),
  );
  assert.deepEqual(body, { nome: 'Ana Souza', telefone: '5565981098383', pessoas: 10, recado: 'oi', codigo: 'abc123' });
  assert.equal(JSON.parse(payload({ nome: 'x', pessoas: 'zero' })).pessoas, 1);
  assert.equal(guestCode('?c=AbC123&x=1'), 'abc123');
  assert.equal(guestCode('?c=../etc'), 'etc');
  assert.equal(guestCode(''), '');
});
await test('posts without custom headers, follows the Apps Script redirect and reads the answer', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fakeFetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ ok: true, nome: 'Ana Souza', pessoas: 2, data: '06/09/2026' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as unknown as typeof fetch;
  const saved = await submitRsvp('https://script.example/exec', { nome: 'Ana Souza', telefone: '65981098383', pessoas: 2 }, fakeFetch);
  assert.deepEqual(saved, { nome: 'Ana Souza', pessoas: 2, data: '06/09/2026' });
  assert.equal(calls[0].init?.method, 'POST');
  assert.equal(calls[0].init?.redirect, 'follow');
  assert.equal(calls[0].init?.headers, undefined);
  const found = await lookupRsvp('https://script.example/exec', { tel: '65 98109-8383' }, fakeFetch);
  assert.equal(found.ok, true);
  assert.equal(new URL(calls[1].url).searchParams.get('tel'), '5565981098383');
  await lookupRsvp('https://script.example/exec', { c: 'abc123' }, fakeFetch);
  assert.equal(new URL(calls[2].url).searchParams.get('cod'), 'abc123');
  assert.equal(new URL(calls[2].url).searchParams.get('c'), null);
  await assert.rejects(
    submitRsvp('https://script.example/exec', { nome: 'x', pessoas: 1 }, (async () => new Response('', { status: 500 })) as unknown as typeof fetch),
    /HTTP 500/,
  );
});
await test('remembers the confirmation on the device and survives a broken storage', () => {
  const memory = new Map<string, string>();
  const store = {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => void memory.set(k, v),
    removeItem: (k: string) => void memory.delete(k),
  };
  saveConfirmation({ nome: 'Ana', pessoas: 2, data: '06/09/2026' }, store);
  assert.ok(memory.has(STORAGE_KEY));
  assert.deepEqual(readConfirmation(store), { nome: 'Ana', pessoas: 2, data: '06/09/2026' });
  const broken = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); }, removeItem: () => {} };
  assert.equal(readConfirmation(broken), null);
  assert.doesNotThrow(() => saveConfirmation({ nome: 'Ana', pessoas: 1, data: '' }, broken));
  assert.equal(readConfirmation(null), null);
});

import { ease } from '../lib/scroll.ts';

await test('eases the scroll from a standstill to a standstill and never leaves 0..1', () => {
  assert.equal(ease(0), 0);
  assert.equal(ease(1), 1);
  assert.equal(ease(0.5), 0.5);
  assert.equal(ease(-3), 0);
  assert.equal(ease(9), 1);
  let previous = -1;
  for (let i = 0; i <= 20; i += 1) {
    const value = ease(i / 20);
    assert.ok(value >= previous, 'a rolagem nunca volta atrás');
    previous = value;
  }
});

await test('reads the partner name even when the sheet says "marido (Junior)"', () => {
  assert.equal(partnerName('marido (Junior)'), 'Junior');
  assert.equal(partnerName('Esposa (Ana Maria)'), 'Ana Maria');
  assert.equal(partnerName('Madu'), 'Madu');
  assert.equal(partnerName('Luan (a confirmar)'), 'Luan');
  assert.equal(partnerName(''), '');
  assert.equal(partnerName(null), '');
});
