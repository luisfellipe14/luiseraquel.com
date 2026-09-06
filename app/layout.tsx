import type { Metadata } from 'next';
import { Pinyon_Script, Quattrocento, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/site.config';
const script = Pinyon_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});
const serif = Quattrocento({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});
const mono = Roboto_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});
const origin = `${siteConfig.origin}${siteConfig.basePath}`;
const previewImage = {
  url: `${origin}/og-capa-1080-v3.jpg`,
  width: 1080,
  height: 1920,
  type: 'image/jpeg',
  alt: 'Primeira página do convite de Luis e Raquel, com flores em sépia e os nomes do casal.',
};
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: 'Luis e Raquel | 14 de novembro de 2026',
  description:
    'Com a bênção de Deus e de nossos pais, convidamos você para celebrar nosso casamento. 14 de novembro de 2026, às 19h30, na Casa Nonna, Cuiabá.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Luis e Raquel — Você é nosso convidado',
    description:
      '14 de novembro de 2026 · 19h30 · Casa Nonna, Cuiabá. Abra o convite e confirme sua presença.',
    type: 'website',
    locale: 'pt_BR',
    url: origin,
    images: [previewImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luis e Raquel — Você é nosso convidado',
    description:
      '14 de novembro de 2026 · 19h30 · Casa Nonna, Cuiabá. Abra o convite e confirme sua presença.',
    images: [{ url: previewImage.url, alt: previewImage.alt }],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${script.variable} ${serif.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
