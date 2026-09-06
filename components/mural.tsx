'use client';
import { useEffect, useState } from 'react';
import { siteConfig } from '@/site.config';
import { fetchMural, type Recado } from '@/lib/mural';

// Mural de recados: só aparecem os recados que os noivos marcaram como aprovados na planilha.
// Sem nenhum aprovado, a seção inteira não existe.
export function Mural() {
  const [recados, setRecados] = useState<Recado[]>([]);

  useEffect(() => {
    const endpoint = siteConfig.rsvpEndpoint;
    if (!endpoint) return;
    let cancelled = false;
    void fetchMural(endpoint).then((found) => {
      if (!cancelled) setRecados(found);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!recados.length) return null;
  return (
    <section className="mural section-pad torn-top" aria-labelledby="mural-title">
      <div className="mural-heading" data-reveal>
        <p className="eyebrow">Recados de quem já confirmou</p>
        <h2 id="mural-title">
          Palavras que
          <br />
          <em>guardamos</em>
        </h2>
      </div>
      <ul className="mural-slips">
        {recados.map((recado, index) => (
          <li
            key={`${recado.nome}-${index}`}
            className="mural-slip"
            data-reveal
            style={{ '--tilt': `${(index % 2 ? 1 : -1) * (1 + (index % 3) * 0.6)}deg` } as React.CSSProperties}
          >
            <p className="mural-text">{recado.recado}</p>
            <p className="mural-name">{recado.nome}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
