import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ImageAsset } from '../data/types';
import { mediaUrl } from '../lib/content';
import { EffectImage, Picture } from './Cover';

const full = (im: ImageAsset) => mediaUrl(im.variants ? im.src.replace(/\.(jpe?g|png)$/i, '-1600.webp') : im.src);

/* ── Lightbox ── */
export function Lightbox({ images, index, onClose, onIndex }: { images: ImageAsset[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [info, setInfo] = useState(false);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const im = images[index];
  const go = useCallback((d: number) => { onIndex((index + d + images.length) % images.length); setZoom(1); setPan({ x: 0, y: 0 }); }, [index, images.length, onIndex]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    root.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; prev?.focus(); };
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(4, z + 0.5));
      else if (e.key === '-') setZoom((z) => { const nz = Math.max(1, z - 0.5); if (nz === 1) setPan({ x: 0, y: 0 }); return nz; });
      else if (e.key === '0') { setZoom(1); setPan({ x: 0, y: 0 }); }
      else if (e.key.toLowerCase() === 'i') setInfo((v) => !v);
      else return;
      e.stopPropagation();
    };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  }, [go, onClose]);

  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-label={`Image viewer: ${im.alt}`} ref={root} tabIndex={-1}>
      <div className="lb__top mono">
        <span>{String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
        <span className="lb__hint">← → navigate · + − zoom · drag pan · I info · Esc close</span>
        <div className="lb__btns">
          <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} aria-label="Zoom out">−</button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(4, z + 0.5))} aria-label="Zoom in">+</button>
          <button type="button" onClick={() => setInfo((v) => !v)} aria-pressed={info}>Info</button>
          <button type="button" onClick={onClose} aria-label="Close viewer">Close ✕</button>
        </div>
      </div>
      <div
        className={`lb__stage ${zoom > 1 ? 'is-zoomed' : ''}`}
        onWheel={(e) => setZoom((z) => { const nz = Math.min(4, Math.max(1, z - e.deltaY * 0.002)); if (nz === 1) setPan({ x: 0, y: 0 }); return nz; })}
        onDoubleClick={() => { setZoom((z) => (z > 1 ? 1 : 2.5)); setPan({ x: 0, y: 0 }); }}
        onPointerDown={(e) => { if (zoom <= 1) return; (e.target as HTMLElement).setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; }}
        onPointerMove={(e) => { if (!drag.current) return; setPan({ x: drag.current.px + (e.clientX - drag.current.x) / zoom, y: drag.current.py + (e.clientY - drag.current.y) / zoom }); }}
        onPointerUp={() => (drag.current = null)}
        onClick={(e) => { if (e.target === e.currentTarget && zoom === 1) onClose(); }}
      >
        <img key={im.src} src={full(im)} alt={im.alt} style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }} draggable={false} />
      </div>
      <button type="button" className="lb__nav lb__nav--prev" onClick={() => go(-1)} aria-label="Previous image">←</button>
      <button type="button" className="lb__nav lb__nav--next" onClick={() => go(1)} aria-label="Next image">→</button>
      <div className="lb__cap">
        <p className="serif">{im.caption ?? im.alt}</p>
        {info && (
          <dl className="exif mono">
            <div><dt>Dimensions</dt><dd>{im.width} × {im.height}</dd></div>
            {im.exif && Object.entries(im.exif).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>)}
            {!im.exif && <div><dt>EXIF</dt><dd>Not recorded</dd></div>}
          </dl>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* ── Gallery layouts ── */
export function Gallery({ images, layout = 'masonry' }: { images: ImageAsset[]; layout?: 'masonry' | 'asymmetric' | 'sequence' | 'horizontal' }) {
  const [open, setOpen] = useState<number | null>(null);
  const [seq, setSeq] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const Item = ({ im, i, sizes }: { im: ImageAsset; i: number; sizes?: string }) => (
    <figure className="gal__item" style={{ ['--ar' as string]: `${im.width}/${im.height}` }}>
      <button type="button" className="gal__open" onClick={() => setOpen(i)} aria-label={`Open image ${i + 1}: ${im.alt}`}>
        {im.effect && im.effect !== 'none' ? <EffectImage image={im} sizes={sizes} /> : <Picture image={im} sizes={sizes} />}
      </button>
      <figcaption className="mono"><span>{String(i + 1).padStart(2, '0')}</span>{im.caption ?? im.alt}</figcaption>
    </figure>
  );

  return (
    <div className={`gal gal--${layout}`}>
      {layout === 'sequence' ? (
        <div className="gal__seq">
          <Item im={images[seq]} i={seq} sizes="90vw" />
          <div className="gal__seqnav mono">
            <button type="button" onClick={() => setSeq((seq - 1 + images.length) % images.length)} aria-label="Previous frame">← Prev</button>
            <div className="gal__dots" role="tablist" aria-label="Frames">
              {images.map((_, i) => <button type="button" role="tab" aria-selected={i === seq} key={i} onClick={() => setSeq(i)} aria-label={`Frame ${i + 1}`} />)}
            </div>
            <span>Frame {seq + 1}/{images.length}</span>
            <button type="button" onClick={() => setSeq((seq + 1) % images.length)} aria-label="Next frame">Next →</button>
          </div>
        </div>
      ) : layout === 'horizontal' ? (
        <div className="gal__h" ref={track} tabIndex={0} aria-label="Horizontal gallery — scroll sideways">
          {images.map((im, i) => <Item key={i} im={im} i={i} sizes="80vw" />)}
        </div>
      ) : (
        images.map((im, i) => <Item key={i} im={im} i={i} sizes={layout === 'asymmetric' && i === 0 ? '90vw' : '45vw'} />)
      )}
      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}

/* ── Before / after comparison ── */
export function Compare({ before, after, beforeFilter, label }: { before: ImageAsset; after: ImageAsset; beforeFilter?: string; label?: string }) {
  const [v, setV] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const set = (clientX: number) => { const r = ref.current!.getBoundingClientRect(); setV(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))); };
  return (
    <figure className="cmp">
      <div
        className="cmp__stage"
        ref={ref}
        style={{ aspectRatio: `${after.width}/${after.height}` }}
        onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); set(e.clientX); }}
        onPointerMove={(e) => e.buttons && set(e.clientX)}
      >
        <Picture image={after} sizes="90vw" />
        <div className="cmp__before" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }}>
          <Picture image={before} sizes="90vw" style={{ filter: beforeFilter }} />
        </div>
        <div className="cmp__handle" style={{ left: `${v}%` }} aria-hidden><span>◀ ▶</span></div>
        <span className="cmp__lbl cmp__lbl--l mono">Before</span>
        <span className="cmp__lbl cmp__lbl--r mono">After</span>
      </div>
      <input className="cmp__range" type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)} aria-label="Comparison position" />
      {label && <figcaption className="mono">{label}</figcaption>}
    </figure>
  );
}
