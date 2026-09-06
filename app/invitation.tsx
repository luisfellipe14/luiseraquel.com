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
  clearConfirmation,
  guestCode,
  lookupGuest,
  lookupRsvp,
  normalizePhone,
  partnerName,
  readConfirmation,
  saveConfirmation,
  submitRsvp,
  type Confirmation,
} from '@/lib/rsvp';
import {
  PIX_DESCRIPTION,
  PIX_KEY,
  PIX_KEY_DISPLAY,
  PIX_PAYLOAD,
  PIX_RECEIVER,
  copyText,
} from '@/lib/pix';
import { siteConfig } from '@/site.config';
import { glideTo } from '@/lib/scroll';
import { Doodle } from '@/components/doodle';
import { Keepsake } from '@/components/keepsake';
import { MapDrawing } from '@/components/map-drawing';
import { Mural } from '@/components/mural';
import { Marks } from '@/components/marks';
import { Petals } from '@/components/petals';
import { Thread } from '@/components/thread';
import { WindImage } from '@/components/wind-image';

function HeroGreeting({ onGuest }: { onGuest?: (name: string) => void }) {
  const [who, setWho] = useState('');
  useEffect(() => {
    const endpoint = siteConfig.rsvpEndpoint;
    if (!endpoint) return;
    const c = guestCode(window.location.search);
    if (!c) return;
    let cancelled = false;
    void lookupGuest(endpoint, c).then((found) => {
      if (cancelled) return;
      const nome = found.convidado?.nome || (found.confirmado ? found.nome : '');
      if (!nome) return;
      const par = partnerName(found.convidado?.acompanhante);
      const completo = par ? `${nome} e ${par}` : nome;
      setWho(completo);
      onGuest?.(completo);
    });
    return () => {
      cancelled = true;
    };
  }, [onGuest]);
  if (!who) return null;
  return (
    <p className="hero-greeting">
      Para <span className="written">{who}</span>
    </p>
  );
}
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
          <span>
            {time ? (
              <em className="tick" key={time[key]}>
                {String(time[key]).padStart(2, '0')}
              </em>
            ) : (
              '—'
            )}
          </span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}
function Rsvp() {
  const endpoint = siteConfig.rsvpEndpoint;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [people, setPeople] = useState('1');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [fallback, setFallback] = useState(!endpoint);
  const [done, setDone] = useState<Confirmation | null>(null);
  const [code, setCode] = useState('');
  const [greeting, setGreeting] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!endpoint) return;
    // Lê o aparelho e a URL depois da hidratação (o HTML pré-renderizado não os conhece).
    const timer = window.setTimeout(() => {
      const saved = readConfirmation();
      if (saved) setDone(saved);
      const c = guestCode(window.location.search);
      if (!c) return;
      setCode(c);
      lookupGuest(endpoint, c)
        .then((found) => {
          if (found.confirmado && found.nome) {
            const value = { nome: found.nome, pessoas: found.pessoas ?? 1, data: found.data ?? '' };
            saveConfirmation(value);
            setDone(value);
          } else if (found.convidado?.nome) {
            const par = partnerName(found.convidado.acompanhante);
            const casa = par ? `${found.convidado.nome} e ${par}` : found.convidado.nome;
            setGreeting(casa);
            // preenche só o que a pessoa ainda não digitou
            setName((atual) => atual || casa);
            setPeople((atual) => (par && atual === '1' ? '2' : atual));
          }
        })
        .catch(() => {});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [endpoint]);

  function sendWhatsapp(recipient: 'luis' | 'raquel') {
    const guest = (done?.nome ?? name).trim();
    if (!guest) {
      setError('Conte para nós o seu nome.');
      nameRef.current?.focus();
      return;
    }
    setError('');
    setOpened(true);
    window.location.assign(whatsappUrl(recipient, guest, note));
  }

  async function confirm() {
    if (!name.trim()) {
      setError('Conte para nós o seu nome.');
      nameRef.current?.focus();
      return;
    }
    if (!normalizePhone(phone)) {
      setError('Confira o WhatsApp: DDD e número, como 65 99999-9999.');
      phoneRef.current?.focus();
      return;
    }
    setError('');
    setBusy(true);
    try {
      const value = await submitRsvp(endpoint, {
        nome: name,
        telefone: phone,
        pessoas: people,
        recado: note,
        codigo: code,
      });
      saveConfirmation(value);
      setDone(value);
    } catch {
      setError(
        'Não conseguimos registrar agora. Confirme pelo WhatsApp logo abaixo.',
      );
      setFallback(true);
    } finally {
      setBusy(false);
    }
  }

  async function check() {
    if (!normalizePhone(phone)) {
      setError('Digite o WhatsApp usado na confirmação para conferir.');
      phoneRef.current?.focus();
      return;
    }
    setError('');
    setChecking(true);
    try {
      const found = await lookupRsvp(endpoint, { tel: phone });
      if (found.confirmado && found.nome) {
        const value = { nome: found.nome, pessoas: found.pessoas ?? 1, data: found.data ?? '' };
        saveConfirmation(value);
        setDone(value);
      } else {
        setError('Não achamos confirmação com esse número. Preencha e confirme aqui.');
      }
    } catch {
      setError('Não deu para conferir agora. Tente de novo em instantes.');
    } finally {
      setChecking(false);
    }
  }

  function reset() {
    clearConfirmation();
    setDone(null);
    setOpened(false);
  }

  if (done) {
    return (
      <div className="rsvp-form rsvp-done">
        <output className="form-status confirmed">
          <Check aria-hidden="true" />
          <span>
            Presença confirmada, <strong className="written">{done.nome}</strong>
            {done.pessoas > 1 ? ` (${done.pessoas} pessoas)` : ''}
            {done.data ? `, em ${done.data}` : ''}. Obrigado!
          </span>
        </output>
        <p className="form-instruction">
          Quer nos mandar um oi? Escolha um de nós no WhatsApp.
        </p>
        <div className="recipient-buttons">
          <Button
            type="button"
            className="action recipient"
            onClick={() => sendWhatsapp('luis')}
          >
            <MessageCircle aria-hidden="true" />
            Falar com Luis
            <ArrowUpRight aria-hidden="true" />
          </Button>
          <Button
            type="button"
            className="action recipient secondary-action"
            onClick={() => sendWhatsapp('raquel')}
          >
            <MessageCircle aria-hidden="true" />
            Falar com Raquel
            <ArrowUpRight aria-hidden="true" />
          </Button>
        </div>
        <button type="button" className="link-button" onClick={reset}>
          Mudou algo? Refazer a confirmação
        </button>
      </div>
    );
  }

  return (
    <form
      className="rsvp-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (fallback) sendWhatsapp('luis');
        else void confirm();
      }}
    >
      {greeting && (
        <p className="rsvp-greeting">
          Olá, <strong>{greeting}</strong>! Este convite é seu.
        </p>
      )}
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
      {endpoint && (
        <div className="field-row">
          <div>
            <label htmlFor="guest-phone">Seu WhatsApp</label>
            <Input
              ref={phoneRef}
              id="guest-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="65 99999-9999"
              maxLength={20}
              required={!fallback}
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setError('');
              }}
            />
          </div>
          <div>
            <label htmlFor="guest-people">Quantas pessoas</label>
            <Input
              id="guest-people"
              name="people"
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              value={people}
              onChange={(event) => setPeople(event.target.value)}
            />
          </div>
        </div>
      )}
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
        aria-describedby="note-hint"
      />
      <p className="field-hint" id="note-hint">
        Com o seu primeiro nome, seu recado pode aparecer no mural do site.
      </p>
      {fallback ? (
        <>
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
              onClick={() => sendWhatsapp('raquel')}
            >
              <MessageCircle aria-hidden="true" />
              Enviar para Raquel
              <ArrowUpRight aria-hidden="true" />
            </Button>
          </div>
          <p className="form-note">
            A mensagem abrirá no WhatsApp. Toque em <strong>Enviar</strong>{' '}
            para concluir.
          </p>
          {opened && (
            <output className="form-status">
              Conclua o envio na conversa do WhatsApp. Sua confirmação chega
              diretamente a nós.
            </output>
          )}
        </>
      ) : (
        <>
          <div className="recipient-buttons">
            <Button type="submit" className="action recipient" disabled={busy}>
              <Check aria-hidden="true" />
              {busy ? 'Registrando…' : 'Confirmar presença'}
              <ArrowUpRight aria-hidden="true" />
            </Button>
          </div>
          <p className="form-note">
            Sua confirmação fica registrada com a gente na hora. O WhatsApp
            serve só para reconhecer você se voltar por outro aparelho.{' '}
            <button
              type="button"
              className="link-button inline"
              onClick={() => void check()}
              disabled={checking}
            >
              {checking ? 'Conferindo…' : 'Já confirmei antes'}
            </button>
          </p>
        </>
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
  const [sealed, setSealed] = useState(true);
  const [guest, setGuest] = useState('');
  const openTimer = useRef<number>(0);
  function openInvitation(scrollTo?: string) {
    setSealed(false);
    try {
      sessionStorage.setItem('luiseraquel:aberto', '1');
    } catch {
      // sem armazenamento: só não lembra entre páginas
    }
    if (scrollTo) {
      window.clearTimeout(openTimer.current);
      openTimer.current = window.setTimeout(() => {
        const target = document.querySelector<HTMLElement>(scrollTo);
        if (!target) return;
        glideTo(() => target.getBoundingClientRect().top + window.scrollY);
      }, 1150);
    }
  }
  useEffect(() => {
    // quem já abriu nesta sessão, chegou por um link com âncora ou prefere menos movimento vê tudo aberto
    let remembered = false;
    try {
      remembered = sessionStorage.getItem('luiseraquel:aberto') === '1';
    } catch {
      remembered = false;
    }
    const direct = !!window.location.hash || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (remembered || direct) {
      const timer = window.setTimeout(() => setSealed(false), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);
  useEffect(() => {
    if (!sealed) return;
    // qualquer gesto de rolar também abre: ninguém fica preso na capa
    let startY = 0;
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) openInvitation();
    };
    const onTouchStart = (event: TouchEvent) => {
      startY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? startY;
      if (startY - y > 24) openInvitation();
    };
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) openInvitation();
    };
    // link de âncora (topo, "pular para o convite") abre e só depois rola
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest('a[href^="#"]');
      if (!link) return;
      event.preventDefault();
      openInvitation(link.getAttribute('href') || undefined);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [sealed]);
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
      <main className={sealed ? 'is-sealed' : 'is-open'}>
        <noscript>
          <style>{'.is-sealed .folded{grid-template-rows:1fr}.is-sealed .seal-label{display:none}'}</style>
        </noscript>
        <Thread />
        <section className="hero" id="inicio" aria-labelledby="couple-name">
          <WindImage
            className="hero-image"
            src={`${siteConfig.basePath}/images/flores.webp`}
            alt=""
            width={1280}
            height={1920}
            priority
            focusY={0.53}
            amplitude={0.0055}
          />
          <div className="hero-shade" />
          <Petals />
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
            <HeroGreeting onGuest={setGuest} />
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
            <button
              type="button"
              className="seal hero-reveal"
              onClick={() => openInvitation('#convite')}
            >
              <span className="seal-ring" aria-hidden="true">
                <span className="seal-mono">
                  L<i>&amp;</i>R
                </span>
              </span>
              <span className="seal-label">
                {sealed ? 'Abrir convite' : 'Ver convite'}{' '}
                <ArrowDown size={14} aria-hidden="true" />
              </span>
            </button>
          </div>
          <div className="hero-bottom">
            <span>Casa Nonna · Cuiabá</span>
            <span>Sábado · 19h30</span>
          </div>
        </section>
        <div className="folded">
          <div className="folded-inner">
        <section id="convite" className="blessing section-pad torn-top">
          <Marks set="blessing" />
          <h2 className="sr-only">Com a bênção de Deus e de nossos pais</h2>
          <div className="blessing-composition" data-reveal>
            <p className="blessing-side">
              Com a<br />
              bênção de
              <br />
              Deus
            </p>
            <WindImage
              className="blessing-flower"
              src={`${siteConfig.basePath}/images/flor-central.jpg`}
              alt="Botão de flor em tons sépia, como no convite original"
              width={640}
              height={800}
              focusY={0.5}
              amplitude={0.004}
              speed={0.7}
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
          className="day-section section-pad torn-top"
          id="grande-dia"
          aria-labelledby="day-title"
        >
          <Marks set="day" />
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
              <MapDrawing />
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
            <Doodle name="sprig" className="doodle-sprig" />
            <p className="eyebrow">Cada dia mais perto</p>
            <Countdown />
          </div>
        </section>
        <section
          className="rsvp section-pad torn-top"
          id="presenca"
          aria-labelledby="rsvp-title"
        >
          <Marks set="rsvp" />
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
            <Doodle name="grass" className="doodle-grass" />
          </div>
          <div className="rsvp-panel" data-reveal>
            <h3>Confirme sua presença</h3>
            <Rsvp />
          </div>
        </section>
        <Mural />
        <section
          className="gifts section-pad torn-top"
          id="presentes"
          aria-labelledby="gifts-title"
        >
          <Marks set="gifts" />
          <div className="gifts-grid">
            <div data-reveal>
              <WindImage
                className="gifts-flower"
                src={`${siteConfig.basePath}/images/flor-central.jpg`}
                alt="Botão de flor em tons sépia"
                width={640}
                height={800}
                focusY={0.5}
                amplitude={0.004}
                speed={0.6}
              />
            </div>
            <div className="gifts-copy" data-reveal>
              <Doodle name="birds" className="doodle-birds" />
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
          </div>
        </div>
      </main>
      <footer className="torn-top">
        <span className="footer-names">Luis e Raquel</span>
        <span>14 de novembro de 2026</span>
        <Keepsake guest={guest} />
        <a href="#inicio">
          Voltar ao início <ArrowUpRight size={15} />
        </a>
        <Heart size={14} strokeWidth={1} aria-hidden="true" />
      </footer>
    </>
  );
}
