'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Download, ImageDown, X } from 'lucide-react';
import { CARD_HEIGHT, CARD_WIDTH, drawKeepsake, fontsFromPage } from '@/lib/card';
import { siteConfig } from '@/site.config';

// Gera o cartão na hora, no próprio aparelho: nada é enviado para lugar nenhum.
export function Keepsake({ guest }: { guest: string }) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // showModal cuida de foco, fundo e tecla Esc sem código próprio
    if (url && !dialog.open) dialog.showModal();
    if (!url && dialog.open) dialog.close();
  }, [url]);

  async function build() {
    setBusy(true);
    setFailed(false);
    try {
      // document.createElement: o Image importado aqui é o componente, não o do navegador
      const photo = document.createElement('img');
      photo.decoding = 'sync';
      photo.src = `${siteConfig.basePath}/images/flores.webp`;
      await photo.decode();
      if (document.fonts?.ready) await document.fonts.ready;
      const canvas = document.createElement('canvas');
      canvas.width = CARD_WIDTH;
      canvas.height = CARD_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('sem canvas');
      drawKeepsake(ctx, photo, fontsFromPage(document.body), guest, {
        width: photo.naturalWidth,
        height: photo.naturalHeight,
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('sem imagem');
      setUrl(URL.createObjectURL(blob));
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="keepsake-link" onClick={() => void build()} disabled={busy}>
        <ImageDown size={15} aria-hidden="true" />
        {busy ? 'Preparando…' : 'Guardar o convite'}
      </button>
      {failed && <span className="keepsake-failed">Não deu para gerar a imagem neste aparelho.</span>}
      <dialog
        ref={dialogRef}
        className="keepsake-dialog"
        aria-label="Cartão do convite"
        onClose={() => setUrl('')}
      >
        {url && (
          <div className="keepsake-card">
            <Image
              src={url}
              alt="Cartão do convite de Luis e Raquel para salvar"
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              unoptimized
            />
            <p>No celular, toque e segure a imagem para salvar ou compartilhar.</p>
            <div className="keepsake-actions">
              <a className="keepsake-save" href={url} download="convite-luis-e-raquel.png">
                <Download size={16} aria-hidden="true" />
                Salvar imagem
              </a>
              <button type="button" className="keepsake-close" onClick={() => setUrl('')}>
                <X size={16} aria-hidden="true" />
                Fechar
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
