'use client';
import { useEffect, useRef } from 'react';

type Petal = {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  phase: number;
  spin: number;
  angle: number;
  alpha: number;
  tone: number;
};

// Pétalas caindo devagar sobre a capa (canvas 2D). Poucas, translúcidas, com balanço lateral;
// pausa fora da tela e some com "reduzir movimento".
export function Petals() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const ctx = context;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let petals: Petal[] = [];
    let frame = 0;
    let last = 0;
    let visible = true;

    function make(fromTop: boolean): Petal {
      const size = 6 + Math.random() * 9;
      return {
        x: Math.random() * width,
        y: fromTop ? -size * 2 : Math.random() * height,
        size,
        speed: 14 + Math.random() * 16,
        sway: 10 + Math.random() * 22,
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.8,
        angle: Math.random() * Math.PI,
        alpha: 0.28 + Math.random() * 0.32,
        tone: Math.random(),
      };
    }
    function resize() {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < 700 ? 9 : 15;
      petals = Array.from({ length: count }, () => make(false));
    }
    function drawPetal(p: Petal) {
      const s = p.size;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.tone < 0.5 ? '#f3e9d6' : '#dccbb0';
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.6, s * 0.7, s * 0.7, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.9, -s * 0.6, 0, -s);
      ctx.fill();
      ctx.restore();
    }
    function step(now: number) {
      frame = 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      ctx.clearRect(0, 0, width, height);
      const t = now / 1000;
      for (const p of petals) {
        p.y += p.speed * dt;
        p.x += Math.sin(t * 0.7 + p.phase) * p.sway * dt;
        p.angle += p.spin * dt;
        if (p.y > height + p.size * 2) Object.assign(p, make(true));
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;
        drawPetal(p);
      }
      if (visible && document.visibilityState === 'visible') frame = requestAnimationFrame(step);
    }
    function wake() {
      last = 0;
      if (!frame) frame = requestAnimationFrame(step);
    }

    resize();
    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) wake();
    });
    observer.observe(canvas);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', wake);
    wake();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', wake);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={ref} className="petals" aria-hidden="true" />;
}
