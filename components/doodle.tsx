// Desenhos de linha à mão que se traçam quando entram na tela (stroke-dashoffset),
// dentro de um elemento com data-reveal (a classe is-visible dispara a animação).
const DOODLES: Record<string, { viewBox: string; paths: string[] }> = {
  sprig: {
    viewBox: '0 0 80 120',
    paths: [
      'M40,118 C42,90 36,60 44,30 C46,20 50,12 56,4',
      'M41,88 c-10,-2 -18,-10 -18,-22 c10,4 16,12 18,22',
      'M40,64 c10,-4 16,-12 15,-24 c-9,4 -14,13 -15,24',
      'M43,44 c-9,-1 -15,-8 -15,-18 c8,3 13,9 15,18',
      'M47,28 c8,-3 12,-9 12,-17 c-7,3 -11,9 -12,17',
    ],
  },
  grass: {
    viewBox: '0 0 200 60',
    paths: [
      'M10,60 q4,-26 12,-48',
      'M26,60 q-2,-24 6,-44',
      'M44,60 q6,-20 16,-40',
      'M62,60 q-4,-22 2,-50',
      'M84,60 q5,-18 14,-34',
      'M102,60 q-3,-24 4,-46',
      'M124,60 q6,-24 18,-42',
      'M146,60 q-2,-20 5,-38',
      'M168,60 q5,-26 14,-50',
      'M186,60 q-3,-18 3,-36',
    ],
  },
  birds: {
    viewBox: '0 0 120 40',
    paths: ['M6,24 c6,-9 12,-9 18,0 c6,-9 12,-9 18,0', 'M72,14 c4,-6 9,-6 13,0 c4,-6 9,-6 13,0'],
  },
};

export function Doodle({ name, className }: { name: keyof typeof DOODLES; className?: string }) {
  const { viewBox, paths } = DOODLES[name];
  return (
    <svg className={`doodle${className ? ` ${className}` : ''}`} viewBox={viewBox} aria-hidden="true" focusable="false">
      {paths.map((d, i) => (
        <path key={d} d={d} style={{ '--i': i } as React.CSSProperties} />
      ))}
    </svg>
  );
}
