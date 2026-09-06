'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  Copy,
  Gift,
  MapPin,
  MessageCircle,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MAP_URL, remaining, whatsappUrl } from '@/lib/invitation';
import {
  PIX_DESCRIPTION,
  PIX_KEY,
  PIX_KEY_DISPLAY,
  PIX_PAYLOAD,
  PIX_RECEIVER,
  copyText,
} from '@/lib/pix';
import { siteConfig } from '@/site.config';

function Countdown() {
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);
  useEffect(() => {
    const update = () => setTime(remaining(Date.now()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  if (time?.started)
    return <p className="celebration">Um dia para guardar para sempre.</p>;
  return (
    <div
      className="countdown"
      role="timer"
      aria-label="Contagem regressiva para o casamento"
    >
      {(
        [
          ['days', 'dias'],
          ['hours', 'horas'],
          ['minutes', 'minutos'],
          ['seconds', 'segundos'],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <span>{time ? String(time[key]).padStart(2, '0') : '—'}</span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}
function Rsvp() {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  function send(recipient: 'luis' | 'raquel') {
    if (!name.trim()) {
      setError('Conte para nós o seu nome.');
      nameRef.current?.focus();
      return;
    }
    setError('');
    setOpened(true);
    window.location.assign(whatsappUrl(recipient, name, note));
  }
  return (
    <form
      className="rsvp-form"
      onSubmit={(event) => {
        event.preventDefault();
        send('luis');
      }}
    >
      <label htmlFor="guest-name">Seu nome</label>
      <Input
        ref={nameRef}
        id="guest-name"
        name="name"
        autoComplete="name"
        placeholder="Nome e sobrenome"
        maxLength={120}
        required
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setError('');
          setOpened(false);
        }}
        aria-invalid={!!error}
        aria-describedby={error ? 'name-error' : undefined}
      />
      {error && (
        <p id="name-error" className="form-error" role="alert">
          {error}
        </p>
      )}
      <label htmlFor="guest-note">
        Um recado para nós <span>(opcional)</span>
      </label>
      <Textarea
        id="guest-note"
        name="note"
        placeholder="Deixe seu carinho aqui…"
        maxLength={600}
        rows={3}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <p className="form-instruction">
        Escolha um de nós para receber sua confirmação.
      </p>
      <div className="recipient-buttons">
        <Button type="submit" className="action recipient">
          <MessageCircle aria-hidden="true" />
          Enviar para Luis
          <ArrowUpRight aria-hidden="true" />
        </Button>
        <Button
          type="button"
          className="action recipient secondary-action"
          onClick={() => send('raquel')}
        >
          <MessageCircle aria-hidden="true" />
          Enviar para Raquel
          <ArrowUpRight aria-hidden="true" />
        </Button>
      </div>
      <p className="form-note">
        A mensagem abrirá no WhatsApp. Toque em <strong>Enviar</strong> para
        concluir.
      </p>
      {opened && (
        <output className="form-status">
          Conclua o envio na conversa do WhatsApp. Sua confirmação chega
          diretamente a nós.
        </output>
      )}
    </form>
  );
}
function Pix() {
  const [copied, setCopied] = useState<'payload' | 'key' | ''>('');
  const [failed, setFailed] = useState(false);
  async function copy(kind: 'payload' | 'key') {
    const ok = await copyText(kind === 'payload' ? PIX_PAYLOAD : PIX_KEY);
    setFailed(!ok);
    setCopied(ok ? kind : '');
    if (ok) window.setTimeout(() => setCopied(''), 2500);
  }
  return (
    <div className="pix-card">
      <Image
        className="pix-qr"
        src={`${siteConfig.basePath}/images/pix-qr.svg`}
        alt="QR code do Pix de Luis e Raquel"
        width="200"
        height="200"
        loading="lazy"
        unoptimized
      />
      <div className="pix-details">
        <p className="pix-label">Chave Pix (celular)</p>
        <p className="pix-key">{PIX_KEY_DISPLAY}</p>
        <p className="pix-meta">
          {PIX_RECEIVER}
          <br />
          {PIX_DESCRIPTION}
        </p>
        <div className="pix-actions">
          <Button
            type="button"
            className="pix-button"
            onClick={() => copy('payload')}
          >
            {copied === 'payload' ? <Check size={16} /> : <Copy size={16} />}
            {copied === 'payload' ? 'Copiado' : 'Copiar Pix copia e cola'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="pix-button secondary-action"
            onClick={() => copy('key')}
          >
            {copied === 'key' ? <Check size={16} /> : <Copy size={16} />}
            {copied === 'key' ? 'Copiada' : 'Copiar só a chave'}
          </Button>
        </div>
        {failed && (
          <p className="form-error" role="alert">
            Não deu para copiar automaticamente. Selecione a chave acima e copie.
          </p>
        )}
      </div>
    </div>
  );
}
export default function Invitation() {
  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    )
      return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.classList.add('will-reveal');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <a className="skip-link" href="#convite">
        Pular para o convite
      </a>
      <main>
        <section className="hero" id="inicio" aria-labelledby="couple-name">
          <Image
            className="hero-image"
            src={`${siteConfig.basePath}/images/flores.webp`}
            alt=""
            width="1280"
            height="1920"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <header className="topbar">
            <a
              href="#inicio"
              className="monogram"
              aria-label="Luis e Raquel, início"
            >
              L<span>&</span>R
            </a>
            <a className="top-rsvp" href="#presenca">
              Confirmar presença <ArrowUpRight size={16} />
            </a>
          </header>
          <div className="hero-content">
            <p className="eyebrow hero-reveal">Nós vamos nos casar</p>
            <h1 id="couple-name" className="hero-reveal">
              <span>Luis</span>
              <em>e</em>
              <span>Raquel</span>
            </h1>
            <p className="hero-invitation hero-reveal">
              E queremos você ao nosso lado.
            </p>
            <div className="hero-date hero-reveal">
              <span>14</span>
              <i />
              <span>11</span>
              <i />
              <span>2026</span>
            </div>
            <a className="open-invitation hero-reveal" href="#convite">
              Abrir convite <ArrowDown size={18} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-bottom">
            <span>Casa Nonna · Cuiabá</span>
            <span>Sábado · 19h30</span>
          </div>
        </section>
        <section id="convite" className="blessing section-pad">
          <h2 className="sr-only">Com a bênção de Deus e de nossos pais</h2>
          <div className="blessing-composition" data-reveal>
            <p className="blessing-side">
              Com a<br />
              bênção de
              <br />
              Deus
            </p>
            <Image
              className="blessing-flower"
              src={`${siteConfig.basePath}/images/flor-central.jpg`}
              alt="Botão de flor em tons sépia, como no convite original"
              width="640"
              height="800"
              loading="lazy"
            />
            <p className="blessing-side">
              E de
              <br />
              nossos
              <br />
              pais
            </p>
          </div>
          <blockquote className="verse" data-reveal>
            <p>
              “Este é o dia que o Senhor fez;
              <br className="desktop-break" /> regozijemo-nos e alegremo-nos
              nele.”
            </p>
            <cite>Salmos 118:24 · ARA</cite>
          </blockquote>
        </section>
        <section
          className="day-section section-pad"
          id="grande-dia"
          aria-labelledby="day-title"
        >
          <div className="day-heading" data-reveal>
            <p className="eyebrow">Reserve esse dia</p>
            <h2 id="day-title">Nosso grande dia</h2>
          </div>
          <div className="day-details" data-reveal>
            <div className="date-block">
              <span className="date-day">14</span>
              <div>
                <strong>novembro</strong>
                <span>2026 · sábado</span>
                <span>às 19h30</span>
              </div>
            </div>
            <div className="venue-block">
              <MapPin size={23} strokeWidth={1.2} aria-hidden="true" />
              <h3>Casa Nonna</h3>
              <p>
                Rua 24 de Outubro, 788
                <br />
                Popular · Cuiabá, MT
              </p>
              <a
                className="text-link"
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Como chegar <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          <a
            className="calendar-link"
            href={`${siteConfig.basePath}/casamento-luis-raquel.ics`}
            download
          >
            <CalendarDays size={18} aria-hidden="true" />
            Salvar na minha agenda
          </a>
          <div className="waiting" data-reveal>
            <p className="eyebrow">Cada dia mais perto</p>
            <Countdown />
          </div>
        </section>
        <section
          className="rsvp section-pad"
          id="presenca"
          aria-labelledby="rsvp-title"
        >
          <div className="rsvp-copy" data-reveal>
            <p className="eyebrow">Você faz parte desse momento</p>
            <h2 id="rsvp-title">
              Vamos celebrar
              <br />
              <em>juntos?</em>
            </h2>
            <p>
              Ter você com a gente
              <br />
              tornará esse dia ainda mais especial.
            </p>
            <div className="rsvp-signature">
              Com carinho,
              <br />
              <span>Luis e Raquel</span>
            </div>
          </div>
          <div className="rsvp-panel" data-reveal>
            <h3>Confirme sua presença</h3>
            <Rsvp />
          </div>
        </section>
        <section
          className="gifts section-pad"
          id="presentes"
          aria-labelledby="gifts-title"
        >
          <div className="gifts-grid">
            <Image
              className="gifts-flower"
              src={`${siteConfig.basePath}/images/flor-central.jpg`}
              alt="Botão de flor em tons sépia"
              width="640"
              height="800"
              loading="lazy"
              data-reveal
            />
            <div className="gifts-copy" data-reveal>
              <p className="eyebrow">
                <Gift size={14} strokeWidth={1.5} aria-hidden="true" /> Presentes
              </p>
              <h2 id="gifts-title">
                Sua presença é o nosso
                <br />
                <em>maior presente</em>
              </h2>
              <p>
                Se quiser nos ajudar a começar essa nova fase, deixamos aqui a
                nossa chave Pix. Qualquer valor chega com muito carinho.
              </p>
              <p className="gifts-hint">
                Aponte a câmera para o QR ou copie o código e cole no app do seu
                banco em <strong>Pix copia e cola</strong>. O valor é livre; a
                descrição que aparece no pagamento é “{PIX_DESCRIPTION}”.
              </p>
              <Pix />
            </div>
          </div>
        </section>
      </main>
      <footer>
        <span className="footer-names">Luis e Raquel</span>
        <span>14 de novembro de 2026</span>
        <a href={`${siteConfig.basePath}/Convite-Luis-e-Raquel.pdf`} download>
          Baixar convite em PDF <ArrowDown size={15} />
        </a>
        <a href="#inicio">
          Voltar ao início <ArrowUpRight size={15} />
        </a>
        <Heart size={14} strokeWidth={1} aria-hidden="true" />
      </footer>
    </>
  );
}
