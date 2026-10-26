import { useEffect, useMemo, useRef, useState } from 'react';
import { AudioPlayer } from '../components/AudioPlayer';
import { Cover, EffectImage, Picture } from '../components/Cover';
import { Experiment } from '../components/experiments';
import { Gallery, Lightbox } from '../components/Gallery';
import { Breadcrumbs, DemoBadge, ProjectRow, ProjectTile, Reveal, SectionHead, HoverPreview } from '../components/ui';
import { Video } from '../components/Video';
import { IMAGES } from '../data/projects';
import { DISCIPLINES } from '../data/site';
import type { Discipline, ExperimentId, ImageAsset, Project } from '../data/types';
import { allProjects, disciplinesOf, fmtDate, indexOf } from '../lib/content';
import { Link } from '../lib/router';
import { useReducedMotion } from '../lib/store';

const inDisc = (ds: Discipline[]) => allProjects.filter((p) => disciplinesOf(p).some((d) => ds.includes(d)));

function WingHead({ no, title, em, lede, ds }: { no: string; title: string; em: string; lede: string; ds: Discipline[] }) {
  return (
    <header className="phead phead--wing">
      <span className="phead__wing mono">Wing {no}</span>
      <h1 className="phead__title"><span>{title}</span> <em className="serif">{em}</em></h1>
      <p className="phead__lede serif">{lede}</p>
      <p className="phead__count mono">{ds.map((d) => <Link key={d} to={`/archive?d=${d}`} className="chip"><i>{DISCIPLINES[d].glyph}</i>{DISCIPLINES[d].label}</Link>)}</p>
    </header>
  );
}

/* Scroll-driven image expansion */
function ScrollExpand({ image }: { image: ImageAsset }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) { ref.current?.style.setProperty('--p', '1'); return; }
    const on = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      el.style.setProperty('--p', p.toFixed(3));
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
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
    const on = () => {
      const el = wrap.current, tr = track.current; if (!el || !tr) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      tr.style.transform = `translate3d(${-p * (tr.scrollWidth - innerWidth)}px,0,0)`;
    };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', measure);
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

export function Visual() {
  const ds: Discipline[] = ['photography', 'digital-art', 'drawing', 'design'];
  const projects = inDisc(ds).filter((p) => p.category !== 'film' && !p.experiment);
  const plates = useMemo(() => {
    const seen = new Set<string>();
    return projects.flatMap((p) => p.gallery ?? []).filter((im) => !seen.has(im.src) && seen.add(im.src)).map((im) => ({ ...im, effect: undefined }));
  }, [projects]);
  const [open, setOpen] = useState<number | null>(null);
  const treatments: ImageAsset[] = [
    { ...IMAGES.fog, effect: 'dither' }, { ...IMAGES.market, effect: 'halftone' }, { ...IMAGES.ink, effect: 'pixel' }, { ...IMAGES.stair, effect: 'distort' }, { ...IMAGES.night, effect: 'parallax' },
  ];
  return (
    <div className="page wing wing--visual">
      <Breadcrumbs trail={[{ label: 'Image' }]} />
      <WingHead no="02" title="Image" em="& surface" lede="Photography, digital art, drawing and design — galleries, plates and optional treatments. Every image opens full-screen with zoom, keyboard navigation and metadata." ds={ds} />
      <ScrollExpand image={IMAGES.night} />
      <section className="sect">
        <SectionHead no="§1" title={<>The <em className="serif">wall</em></>} kicker={`${plates.length} plates · click to open`} />
      </section>
      <HorizontalScroll images={plates} onOpen={setOpen} />
      {open !== null && <Lightbox images={plates} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
      <section className="sect">
        <SectionHead no="§2" title={<>Masonry <em className="serif">index</em></>} kicker="All plates, original presentation" />
        <Gallery images={plates} layout="masonry" />
      </section>
      <section className="sect">
        <SectionHead no="§3" title={<>Optional <em className="serif">treatments</em></>} kicker="Hover — the source surfaces under the cursor" />
        <div className="treat">
          {treatments.map((im) => <figure key={im.effect} className="treat__item"><EffectImage image={im} sizes="30vw" /><figcaption className="mono">{im.effect} — {im.effect === 'parallax' ? '3D depth on pointer' : im.effect === 'distort' ? 'SVG displacement on pointer' : 'canvas render, cursor reveal'}</figcaption></figure>)}
        </div>
      </section>
      <section className="sect">
        <SectionHead no="§4" title={<>Visual <em className="serif">projects</em></>} />
        <div className="grid">{projects.map((p, i) => <ProjectTile key={p.slug} p={p} i={i} />)}</div>
      </section>
    </div>
  );
}

export function Sound() {
  const ds: Discipline[] = ['music', 'sound'];
  const releases = allProjects.filter((p) => p.audio);
  const others = inDisc(ds).filter((p) => !p.audio);
  const [sel, setSel] = useState(releases[0]?.slug);
  const current = releases.find((r) => r.slug === sel)!;
  return (
    <div className="page wing wing--sound">
      <Breadcrumbs trail={[{ label: 'Sound' }]} />
      <WingHead no="03" title="Sound" em="& signal" lede="Albums, EPs, singles, sound design and breakdowns. Waveforms, live spectrograms, section markers, annotations and multitrack stems — and nothing ever plays until you ask." ds={ds} />
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
      {others.length > 0 && (
        <section className="sect">
          <SectionHead no="§2" title={<>Sound <em className="serif">elsewhere</em></>} kicker="Projects where audio is one layer of many" />
          <div className="grid">{others.map((p, i) => <ProjectTile key={p.slug} p={p} i={i} />)}</div>
        </section>
      )}
    </div>
  );
}

export function Film() {
  const films = allProjects.filter((p) => p.video);
  return (
    <div className="page wing wing--film">
      <Breadcrumbs trail={[{ label: 'Moving image' }]} />
      <WingHead no="04" title="Moving" em="image" lede="Short films, experimental video, real-time pieces and animation. Embeds stay dormant until you press play — no third-party requests before that." ds={['film']} />
      {films.map((p, i) => (
        <Reveal as="section" key={p.slug} className={`reel reel--${i % 2}`}>
          <div className="reel__meta">
            <span className="mono">Reel {String(i + 1).padStart(2, '0')} · N°{indexOf(p.slug)} · {fmtDate(p.published, 'long')}</span>
            <h2 className="reel__title"><Link to={`/project/${p.slug}`}>{p.title}</Link></h2>
            <p className="serif">{p.description}</p>
            {p.credits && <dl className="reel__credits mono">{p.credits.map((c) => <div key={c.role}><dt>{c.role}</dt><dd>{c.name}</dd></div>)}</dl>}
            {p.technical && <dl className="reel__credits mono">{p.technical.map((c) => <div key={c.label}><dt>{c.label}</dt><dd>{c.value}</dd></div>)}</dl>}
            <Link to={`/project/${p.slug}`} className="ulink mono">Full project →</Link>
          </div>
          <div className="reel__vids">{p.video!.map((v) => <Video key={v.title} video={v} />)}</div>
        </Reveal>
      ))}
    </div>
  );
}

const EXPS: { id: ExperimentId; label: string }[] = [
  { id: 'flowfield', label: 'Flowfield' }, { id: 'typefield', label: 'Type Field' }, { id: 'shader', label: 'Interference' }, { id: 'markov', label: 'Markov text' }, { id: 'entropy', label: 'Entropy' },
];

export function Lab() {
  const ds: Discipline[] = ['code', 'ai', 'security', 'creative-coding', 'research'];
  const projects = inDisc(ds);
  const [exp, setExp] = useState<ExperimentId>('flowfield');
  const [hover, setHover] = useState<Project | null>(null);
  const expProject = allProjects.find((p) => p.experiment === exp);
  const stack = useMemo(() => {
    const m = new Map<string, number>();
    projects.forEach((p) => p.software?.forEach((s) => m.set(s, (m.get(s) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);
  return (
    <div className="page wing wing--lab">
      <Breadcrumbs trail={[{ label: 'Lab' }]} />
      <WingHead no="05" title="The" em="Lab" lede="Software, hardware, machine learning, security research and creative code. Experiments here run live in your browser — one at a time, paused when off-screen." ds={ds} />
      <section className="sect bench">
        <div className="bench__tabs mono" role="tablist" aria-label="Experiments">
          {EXPS.map((e, i) => <button type="button" role="tab" key={e.id} aria-selected={exp === e.id} onClick={() => setExp(e.id)}><span>{String(i + 1).padStart(2, '0')}</span>{e.label}</button>)}
        </div>
        <div className="bench__stage" role="tabpanel">
          <Experiment key={exp} id={exp} />
          {expProject && <p className="bench__cap"><span className="serif">{expProject.title}</span> — {expProject.description} <Link to={`/project/${expProject.slug}`} className="ulink mono">Notes & source →</Link></p>}
        </div>
      </section>
      <section className="sect">
        <SectionHead no="§2" title={<>Technical <em className="serif">index</em></>} kicker="Hover a row" />
        <ul className="rows">{projects.map((p) => <ProjectRow key={p.slug} p={p} onHover={setHover} />)}</ul>
        <HoverPreview p={hover} />
      </section>
      <section className="sect">
        <SectionHead no="§3" title={<>Tool <em className="serif">frequency</em></>} kicker="Across lab projects" />
        <ul className="stack mono">{stack.map(([s, n]) => <li key={s} style={{ ['--n' as string]: n }}><a href={`#/archive?q=${encodeURIComponent(s)}`}><span>{s}</span><i aria-hidden /><b>{n}</b></a></li>)}</ul>
      </section>
    </div>
  );
}
