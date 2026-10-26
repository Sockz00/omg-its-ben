import { useEffect, useMemo, useRef, useState } from 'react';
import { rafThrottle, scrollProgress } from '../lib/raf';
import { AudioPlayer } from '../components/AudioPlayer';
import { Cover, EffectImage, Picture } from '../components/Cover';
import { Gallery, Lightbox } from '../components/Gallery';
import { Breadcrumbs, DemoBadge, ProjectTile, SectionHead } from '../components/ui';
import { IMAGES } from '../data/projects';
import { DISCIPLINES } from '../data/site';
import type { Discipline, ImageAsset } from '../data/types';
import { fmtDate, MUSIC_DISCIPLINES, PHOTO_DISCIPLINES, photoProjects, musicProjects } from '../lib/content';
import { Link } from '../lib/router';
import { useReducedMotion } from '../lib/store';

function SectionHead0({ no, title, em, lede, ds }: { no: string; title: string; em: string; lede: string; ds: Discipline[] }) {
  return (
    <header className="phead phead--wing">
      <span className="phead__wing mono">Section {no}</span>
      <h1 className="phead__title"><span>{title}</span> <em className="serif">{em}</em></h1>
      <p className="phead__lede serif">{lede}</p>
      <p className="phead__count mono">{ds.map((d) => <span key={d} className="chip chip--static"><i>{DISCIPLINES[d].glyph}</i>{DISCIPLINES[d].label}</span>)}</p>
    </header>
  );
}

/* Scroll-driven image expansion */
function ScrollExpand({ image }: { image: ImageAsset }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) { ref.current?.style.setProperty('--p', '1'); return; }
    const on = rafThrottle(() => { const el = ref.current; if (el) el.style.setProperty('--p', scrollProgress(el).toFixed(3)); });
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, [reduced]);
  return (
    <div className="sx" ref={ref}>
      <div className="sx__sticky">
        <div className="sx__frame"><Picture image={image} sizes="100vw" eager /></div>
        <p className="sx__cap mono">{image.caption}</p>
        <p className="sx__word serif" aria-hidden>looking</p>
      </div>
    </div>
  );
}

/* Horizontal gallery driven by vertical scroll */
function HorizontalScroll({ images, onOpen }: { images: ImageAsset[]; onOpen: (i: number) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [h, setH] = useState(0);
  useEffect(() => {
    const measure = () => setH(track.current ? track.current.scrollWidth - innerWidth + innerHeight : 0);
    measure();
    const on = rafThrottle(() => {
      const el = wrap.current, tr = track.current; if (!el || !tr) return;
      const p = scrollProgress(el);
      tr.style.transform = `translate3d(${(-p * (tr.scrollWidth - innerWidth)).toFixed(1)}px,0,0)`;
    });
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', () => { measure(); on(); }, { passive: true });
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', measure); };
  }, []);
  if (reduced || innerWidth < 760) {
    return <div className="gal gal--horizontal"><div className="gal__h" tabIndex={0}>{images.map((im, i) => <button type="button" key={i} className="hs__item" onClick={() => onOpen(i)}><Picture image={im} sizes="80vw" /></button>)}</div></div>;
  }
  return (
    <div className="hs" ref={wrap} style={{ height: h || '300vh' }}>
      <div className="hs__sticky">
        <div className="hs__track" ref={track}>
          <div className="hs__intro"><span className="mono">Plates in sequence</span><p className="serif">Scroll to move through the wall.</p></div>
          {images.map((im, i) => (
            <button type="button" key={i} className="hs__item" onClick={() => onOpen(i)} aria-label={`Open ${im.alt}`} style={{ ['--ar' as string]: `${im.width}/${im.height}` }}>
              <Picture image={im} sizes="60vw" />
              <span className="mono">{String(i + 1).padStart(2, '0')} — {im.caption ?? im.alt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Photo() {
  const projects = photoProjects.filter((p) => !p.experiment);
  const plates = useMemo(() => {
    const seen = new Set<string>();
    return projects.flatMap((p) => p.gallery ?? []).filter((im) => !seen.has(im.src) && seen.add(im.src)).map((im) => ({ ...im, effect: undefined }));
  }, [projects]);
  const [open, setOpen] = useState<number | null>(null);
  const [masonry, setMasonry] = useState(false);
  const treatments: ImageAsset[] = [
    { ...IMAGES.fog, effect: 'dither' }, { ...IMAGES.market, effect: 'halftone' }, { ...IMAGES.ink, effect: 'pixel' }, { ...IMAGES.stair, effect: 'distort' }, { ...IMAGES.night, effect: 'parallax' },
  ];
  return (
    <div className="page wing wing--photo">
      <Breadcrumbs trail={[{ label: 'Photo' }]} />
      <SectionHead0 no="01" title="Photo" em="& surface" lede="Photography, digital art, drawing and design. Every plate opens full-screen with zoom, keyboard navigation and metadata." ds={PHOTO_DISCIPLINES} />
      <ScrollExpand image={IMAGES.night} />
      <section className="sect">
        <SectionHead no="§1" title={<>The <em className="serif">wall</em></>} kicker={`${plates.length} plates · click to open`} />
      </section>
      <HorizontalScroll images={plates} onOpen={setOpen} />
      {open !== null && <Lightbox images={plates} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
      <section className="sect">
        <SectionHead
          no="§2"
          title={<>Plate <em className="serif">index</em></>}
          kicker={`${plates.length} frames · click any to open full screen`}
          action={
            <span className="views" role="group" aria-label="Index layout">
              <button type="button" aria-pressed={!masonry} onClick={() => setMasonry(false)}>Sheet</button>
              <button type="button" aria-pressed={masonry} onClick={() => setMasonry(true)}>Masonry</button>
            </span>
          }
        />
        {masonry ? (
          <Gallery images={plates} layout="masonry" />
        ) : (
          <div className="sheet">
            {plates.map((im, i) => (
              <button type="button" key={i} onClick={() => setOpen(i)} aria-label={`Open frame ${i + 1}: ${im.alt}`}>
                <Picture image={im} sizes="160px" />
                <span>{String(i + 1).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        )}
      </section>
      <section className="sect">
        <SectionHead no="§3" title={<>Optional <em className="serif">treatments</em></>} kicker="Hover — the source surfaces under the cursor" />
        <div className="treat">
          {treatments.map((im) => <figure key={im.effect} className="treat__item"><EffectImage image={im} sizes="30vw" /><figcaption className="mono">{im.effect} — {im.effect === 'parallax' ? '3D depth on pointer' : im.effect === 'distort' ? 'SVG displacement on pointer' : 'canvas render, cursor reveal'}</figcaption></figure>)}
        </div>
      </section>
      <section className="sect">
        <SectionHead no="§4" title={<>Photo <em className="serif">projects</em></>} />
        <div className="grid">{projects.map((p, i) => <ProjectTile key={p.slug} p={p} i={i} />)}</div>
      </section>
    </div>
  );
}

export function Music() {
  const releases = musicProjects;
  const [sel, setSel] = useState(releases[0]?.slug);
  const current = releases.find((r) => r.slug === sel) ?? releases[0];
  return (
    <div className="page wing wing--music">
      <Breadcrumbs trail={[{ label: 'Music' }]} />
      <SectionHead0 no="02" title="Music" em="& signal" lede="Albums, EPs, sound design and breakdowns — waveforms, spectrograms, markers and stems. Nothing plays until you ask." ds={MUSIC_DISCIPLINES} />
      {!current ? (
        <p className="empty serif">No releases yet — add one with an <span className="mono">audio</span> field in <span className="mono">src/data/projects.ts</span>.</p>
      ) : (
        <section className="sect shelf">
          <div className="shelf__list" role="tablist" aria-label="Releases">
            {releases.map((r) => (
              <button type="button" role="tab" key={r.slug} aria-selected={sel === r.slug} onClick={() => setSel(r.slug)} className="shelf__item">
                <span className="shelf__art"><Cover cover={r.audio!.artwork ?? r.cover} sizes="120px" /></span>
                <span className="shelf__txt"><span className="mono">{r.audio!.format.replace('-', ' ')} · {fmtDate(r.published, 'year')}</span><strong className="serif">{r.title}</strong><span className="mono">{r.audio!.tracks.length} tracks {r.demo && <DemoBadge small />}</span></span>
              </button>
            ))}
          </div>
          <div className="shelf__player" role="tabpanel">
            <AudioPlayer key={current.slug} release={current.audio!} title={current.title} />
            <Link to={`/project/${current.slug}`} className="ulink mono">Liner notes, credits & equipment →</Link>
          </div>
        </section>
      )}
    </div>
  );
}
