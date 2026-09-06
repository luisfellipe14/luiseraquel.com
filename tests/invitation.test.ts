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
