'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { startWind, type WindOptions } from '@/lib/wind';

type Props = WindOptions & {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

// Foto com vento: o <img> continua sendo a base (SEO, fallback, primeira pintura);
// o canvas WebGL cobre a foto e passa a balançá-la quando estiver pronto.
export function WindImage({ src, alt, width, height, className, priority, focusY, amplitude, speed, maxDpr }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    // o Image do framework não repassa ref de forma confiável; o <img> é o irmão do canvas
    const image = canvas?.parentElement?.querySelector('img') ?? imageRef.current;
    if (!image || !canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stop: (() => void) | null = null;
    let cancelled = false;
    void image
      .decode()
      .catch(() => {})
      .then(() => {
        if (cancelled || !image.naturalWidth) return;
        stop = startWind(canvas, image, { focusY, amplitude, speed, maxDpr });
        setReady(true);
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [focusY, amplitude, speed, maxDpr]);

  return (
    <span className={`wind${className ? ` ${className}` : ''}`}>
      <Image
        ref={imageRef}
        className="wind-img"
        src={src}
        alt={alt}
        width={width}
        height={height}
        fetchPriority={priority ? 'high' : undefined}
        loading={priority ? undefined : 'lazy'}
      />
      <canvas ref={canvasRef} className={`wind-canvas${ready ? ' is-ready' : ''}`} aria-hidden="true" />
    </span>
  );
}
