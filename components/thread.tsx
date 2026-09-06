'use client';
import { useEffect, useRef } from 'react';
import { smoothPath } from '@/lib/wind';

// Fio dourado que costura a página: começa embaixo da capa, alterna as margens a cada
// seção e vai se desenhando conforme a rolagem. Fica acima do conteúdo, mas só nas margens.
export function Thread() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    const main = svg?.parentElement;
    const path = svg?.querySelector('path');
    if (!svg || !main || !path) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let length = 0;
    let frame = 0;
    let height = 1;

    function layout() {
      const w = main!.clientWidth;
      height = main!.scrollHeight;
      svg!.setAttribute('viewBox', `0 0 ${w} ${height}`);
      svg!.style.width = `${w}px`;
      svg!.style.height = `${height}px`;
      const gutter = w < 700 ? 12 : Math.max(24, w * 0.045);
      const sections = Array.from(main!.querySelectorAll<HTMLElement>('section'));
      const points: Array<[number, number]> = [];
      sections.forEach((section, index) => {
        const top = section.offsetTop;
        const h = section.offsetHeight;
        if (index === 0) {
          // nasce à direita do rodapé da capa e desce até a emenda
          points.push([w * 0.78, top + h - 150]);
          points.push([w * 0.62, top + h - 60]);
          return;
        }
        // cruza o meio só na emenda (faixa rasgada) e corre pela margem o resto da seção
        const x = index % 2 ? gutter : w - gutter;
        points.push([w / 2, top + 6]);
        points.push([x, top + 100]);
        points.push([x, top + h * 0.5]);
        points.push([x, top + h - 100]);
      });
      points.push([w / 2, height - 20]);
      path!.setAttribute('d', smoothPath(points));
      length = path!.getTotalLength();
      path!.style.strokeDasharray = `${length}`;
      progress();
    }

    function progress() {
      frame = 0;
      const seen = window.scrollY + window.innerHeight * 0.85 - main!.offsetTop;
      const fraction = Math.min(1, Math.max(0, seen / height));
      path!.style.strokeDashoffset = `${length * (1 - fraction)}`;
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(progress);
    }
    function onResize() {
      if (!frame) frame = requestAnimationFrame(layout);
    }

    layout();
    // a página muda de altura quando fontes e fotos carregam
    const settle = window.setTimeout(layout, 1200);
    const observer = 'ResizeObserver' in window ? new ResizeObserver(onResize) : null;
    observer?.observe(main);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(settle);
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg ref={ref} className="thread" aria-hidden="true" focusable="false">
      <path d="" fill="none" />
    </svg>
  );
}
