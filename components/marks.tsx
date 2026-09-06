// Marquinhas de margem à mão (×, +, espiral, pontinhos, onda) em cores desbotadas,
// como anotações no caderno. Posições fixas por seção; no celular só as marcadas ficam.
const SETS: Record<string, Array<{ k: string; c: string; top?: string; bottom?: string; left?: string; right?: string; r?: number; desk?: boolean }>> = {
  blessing: [
    { k: 'x', c: 'red', top: '9%', left: '6%', r: 12 },
    { k: 'spiral', c: 'ink', top: '52%', right: '5%', r: -20, desk: true },
    { k: 'dots', c: 'blue', bottom: '14%', left: '9%', r: -6, desk: true },
    { k: 'plus', c: 'ochre', bottom: '10%', right: '8%' },
  ],
  day: [
    { k: 'spiral', c: 'blue', top: '12%', left: '5%', r: 15 },
    { k: 'wave', c: 'ink', top: '40%', right: '4%', desk: true },
    { k: 'x', c: 'ochre', bottom: '16%', left: '8%', r: -8, desk: true },
    { k: 'dots', c: 'red', bottom: '8%', right: '7%', r: 10 },
  ],
  rsvp: [
    { k: 'plus', c: 'ochre', top: '10%', right: '5%', r: 8 },
    { k: 'x', c: 'red', bottom: '12%', left: '5%', r: 18, desk: true },
    { k: 'wave', c: 'blue', bottom: '7%', right: '9%', desk: true },
  ],
  gifts: [
    { k: 'dots', c: 'blue', top: '8%', left: '7%', r: -12 },
    { k: 'spiral', c: 'red', top: '46%', right: '4%', r: 25, desk: true },
    { k: 'x', c: 'ink', bottom: '9%', left: '5%', r: -14 },
    { k: 'plus', c: 'ochre', bottom: '13%', right: '6%', desk: true },
  ],
};

export function Marks({ set }: { set: keyof typeof SETS }) {
  return (
    <div className="marks" aria-hidden="true">
      {SETS[set].map((m, i) => (
        <span
          key={`${set}-${i}`}
          className={`mark ${m.k} ${m.c}${m.desk ? ' desk' : ''}`}
          style={{
            top: m.top,
            bottom: m.bottom,
            left: m.left,
            right: m.right,
            transform: m.r ? `rotate(${m.r}deg)` : undefined,
          }}
        />
      ))}
    </div>
  );
}
