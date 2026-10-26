import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import type { Cover as CoverT, GenerativeCover, ImageAsset } from '../data/types';
import { isImage, mediaUrl } from '../lib/content';
import { makeNoise, mulberry32, useReducedMotion, useTheme } from '../lib/store';

/* ── Responsive picture: WebP variants + JPEG fallback, lazy + async ── */
export function Picture({ image, sizes = '(max-width: 800px) 100vw, 50vw', eager, className, style }: { image: ImageAsset; sizes?: string; eager?: boolean; className?: string; style?: CSSProperties }) {
  const base = image.src.replace(/\.(jpe?g|png)$/i, '');
  return (
    <picture className={className}>
      {image.variants && <source type="image/webp" srcSet={`${mediaUrl(base)}-640.webp 640w, ${mediaUrl(base)}-1600.webp 1600w`} sizes={sizes} />}
      <img
        src={mediaUrl(image.src)}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={style}
        draggable={false}
      />
    </picture>
  );
}

const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

/* ── Generative cover (deterministic per seed, theme-aware) ── */
export function Generative({ cover, className }: { cover: GenerativeCover; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const draw = () => {
      const w = (c.width = c.clientWidth * Math.min(2, devicePixelRatio));
      const h = (c.height = c.clientHeight * Math.min(2, devicePixelRatio));
      if (!w || !h) return;
      const g = c.getContext('2d')!;
      const ink = cssVar('--ink'), bg = cssVar('--bg-2'), acc = cssVar('--accent');
      const r = mulberry32(cover.seed);
      const n = makeNoise(cover.seed);
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = Math.max(1, w / 500);
      const s = Math.min(w, h);
      switch (cover.generative) {
        case 'contour': {
          const rows = 46;
          for (let i = 0; i < rows; i++) {
            const y0 = (h * (i + 2)) / (rows + 4);
            g.beginPath();
            g.strokeStyle = i === Math.floor(rows * 0.62) ? acc : ink;
            for (let x = 0; x <= w; x += w / 160) {
              const mid = 1 - Math.abs(x / w - 0.5) * 2;
              const y = y0 - Math.max(0, n(x / w * 4, i * 0.13) + 0.25) * mid * mid * h * 0.12;
              x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
            }
            g.stroke();
          }
          break;
        }
        case 'grid': {
          const cols = 14, cell = w / cols;
          for (let y = 0; y < h / cell; y++) for (let x = 0; x < cols; x++) {
            const v = n(x * 0.22, y * 0.22);
            const sz = cell * (0.15 + Math.abs(v) * 0.9);
            g.fillStyle = r() > 0.97 ? acc : ink;
            if (v > 0.1) g.fillRect(x * cell + (cell - sz) / 2, y * cell + (cell - sz) / 2, sz, sz);
            else { g.beginPath(); g.arc(x * cell + cell / 2, y * cell + cell / 2, sz / 4, 0, 7); g.fill(); }
          }
          break;
        }
        case 'orbit': {
          const cx = w * (0.4 + r() * 0.2), cy = h * 0.5;
          for (let i = 0; i < 38; i++) {
            g.beginPath();
            g.strokeStyle = i % 9 === 4 ? acc : ink;
            g.ellipse(cx, cy, s * 0.03 * i, s * 0.012 * i * (1.6 + Math.sin(i * 0.3)), r() * 0.3 + i * 0.04, 0, Math.PI * 2);
            g.stroke();
          }
          break;
        }
        case 'noise': {
          const px = Math.max(2, Math.floor(w / 140));
          const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
          for (let y = 0; y < h; y += px) for (let x = 0; x < w; x += px) {
            const v = (n(x / w * 3, y / h * 3) + n(x / w * 9, y / h * 9) * 0.4 + 1) / 2;
            const t = bayer[((y / px) % 4) * 4 + ((x / px) % 4)] / 16;
            if (v > t + 0.12) { g.fillStyle = v > 0.86 ? acc : ink; g.fillRect(x, y, px, px); }
          }
          break;
        }
        case 'bars': {
          const bars = 64, bw = w / bars;
          for (let i = 0; i < bars; i++) {
            const v = Math.abs(n(i * 0.09, 1.7)) * 0.9 + r() * 0.15;
            const bh = v * h * 0.75;
            g.fillStyle = i === 21 ? acc : ink;
            g.fillRect(i * bw + bw * 0.2, h / 2 - bh / 2, bw * 0.6, bh);
          }
          break;
        }
      }
      if (cover.label) {
        g.fillStyle = bg; const fs = s * 0.09;
        g.font = `500 ${fs}px "JetBrains Mono", monospace`;
        const tw = g.measureText(cover.label).width;
        g.fillRect(w * 0.06 - fs * 0.3, h - fs * 2.2, tw + fs * 0.6, fs * 1.4);
        g.fillStyle = ink; g.fillText(cover.label, w * 0.06, h - fs * 1.15);
      }
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, [cover, theme]);
  return <canvas ref={ref} className={`gen ${className ?? ''}`} role="img" aria-label={`Generative cover pattern (${cover.generative})`} />;
}

/* ── Optional treatments (cursor dissolves the effect to reveal the source) ── */
export function EffectImage({ image, sizes }: { image: ImageAsset; sizes?: string }) {
  const effect = image.effect ?? 'none';
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const reduced = useReducedMotion();
  const fid = useId().replace(/:/g, '');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!['halftone', 'dither', 'pixel'].includes(effect)) return;
    const c = canvas.current!;
    const im = new Image();
    im.src = mediaUrl(image.src.replace(/\.(jpe?g|png)$/i, image.variants ? '-640.webp' : '.$1'));
    let alive = true;
    const run = () => {
      if (!alive) return;
      const W = 640, H = Math.round((640 * image.height) / image.width);
      const ink = cssVar('--ink'), paper = cssVar('--bg-2');
      c.width = W; c.height = H;
      const g = c.getContext('2d', { willReadFrequently: true })!;
      g.drawImage(im, 0, 0, W, H);
      if (effect === 'pixel') {
        const s = 14;
        const tmp = document.createElement('canvas'); tmp.width = Math.ceil(W / s); tmp.height = Math.ceil(H / s);
        tmp.getContext('2d')!.drawImage(im, 0, 0, tmp.width, tmp.height);
        g.imageSmoothingEnabled = false; g.drawImage(tmp, 0, 0, W, H);
      } else {
        const d = g.getImageData(0, 0, W, H).data;
        const lum = (x: number, y: number) => { const i = (y * W + x) * 4; return (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255; };
        g.fillStyle = paper; g.fillRect(0, 0, W, H); g.fillStyle = ink;
        if (effect === 'halftone') {
          const step = 7;
          for (let y = 0; y < H; y += step) for (let x = (y / step) % 2 ? step / 2 : 0; x < W; x += step) {
            const l = lum(Math.min(W - 1, x | 0), Math.min(H - 1, y | 0));
            const rr = (1 - l) * step * 0.62;
            if (rr > 0.3) { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
          }
        } else {
          const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
          const px = 2;
          for (let y = 0; y < H; y += px) for (let x = 0; x < W; x += px) {
            if (lum(x, y) < (bayer[((y / px) % 4) * 4 + ((x / px) % 4)] + 0.5) / 16) g.fillRect(x, y, px, px);
          }
        }
      }
      setReady(true);
    };
    im.onload = run;
    return () => { alive = false; };
  }, [effect, image, theme]);

  const onMove = (e: React.PointerEvent) => {
    const el = wrap.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    if (effect === 'parallax' && !reduced) el.style.setProperty('--tx', `${(0.5 - x) * 4}%`), el.style.setProperty('--ty', `${(0.5 - y) * 4}%`), el.style.setProperty('--rx', `${(y - 0.5) * -6}deg`), el.style.setProperty('--ry', `${(x - 0.5) * 6}deg`);
    if (effect === 'distort' && !reduced) {
      document.getElementById(`dm-${fid}`)?.setAttribute('scale', String(22 + Math.hypot(x - 0.5, y - 0.5) * 40));
      document.getElementById(`dt-${fid}`)?.setAttribute('baseFrequency', `${0.008 + x * 0.012} ${0.02 + y * 0.03}`);
    }
  };
  const onLeave = () => {
    const el = wrap.current!;
    el.style.removeProperty('--mx'); el.style.removeProperty('--my');
    ['--tx', '--ty', '--rx', '--ry'].forEach((p) => el.style.removeProperty(p));
    document.getElementById(`dm-${fid}`)?.setAttribute('scale', '0');
  };

  return (
    <div ref={wrap} className={`fx fx--${effect} ${ready ? 'is-ready' : ''}`} onPointerMove={onMove} onPointerLeave={onLeave} style={{ aspectRatio: `${image.width} / ${image.height}` }}>
      {effect === 'distort' && (
        <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
          <filter id={`f-${fid}`}>
            <feTurbulence id={`dt-${fid}`} type="fractalNoise" baseFrequency="0.01 0.03" numOctaves={2} seed={3} />
            <feDisplacementMap id={`dm-${fid}`} in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      <Picture image={image} sizes={sizes} style={effect === 'distort' ? { filter: `url(#f-${fid})` } : undefined} />
      {['halftone', 'dither', 'pixel'].includes(effect) && <canvas ref={canvas} className="fx__layer" aria-hidden />}
      {effect !== 'none' && <span className="fx__tag">{effect}</span>}
    </div>
  );
}

/* ── Cover dispatcher ── */
export function Cover({ cover, sizes, eager, className }: { cover: CoverT; sizes?: string; eager?: boolean; className?: string }) {
  if (isImage(cover)) {
    if (cover.effect && cover.effect !== 'none') return <div className={className}><EffectImage image={cover} sizes={sizes} /></div>;
    return <div className={className}><Picture image={cover} sizes={sizes} eager={eager} /></div>;
  }
  return <div className={className}><Generative cover={cover} /></div>;
}
