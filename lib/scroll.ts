// Rolagem animada por conta própria. A rolagem suave nativa é cancelada quando a página muda
// de altura no meio do caminho (a dobra abrindo, as fotos de baixo carregando), então aqui o
// alvo é recalculado a cada quadro e cada passo é aplicado como salto instantâneo.
export function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}

export function glideTo(target: () => number, duration = 850): () => void {
  if (typeof window === 'undefined') return () => {};
  const from = window.scrollY;
  const start = performance.now();
  let frame = 0;
  let stopped = false;
  const stop = () => {
    stopped = true;
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
  };
  function step(now: number) {
    if (stopped) return;
    const t = (now - start) / duration;
    const to = target();
    window.scrollTo({ top: from + (to - from) * ease(t), behavior: 'instant' as ScrollBehavior });
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  }
  // um gesto do visitante cancela a animação: ninguém fica brigando com a página
  window.addEventListener('wheel', stop, { passive: true, once: true });
  window.addEventListener('touchstart', stop, { passive: true, once: true });
  frame = requestAnimationFrame(step);
  return stop;
}
