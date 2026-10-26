import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DISCIPLINES } from '../data/site';
import type { Diagram as DiagramT, Project } from '../data/types';
import { disciplinesOf, fmtDate, indexOf, isImage } from '../lib/content';
import { Link } from '../lib/router';
import { prefersReducedMotion } from '../lib/store';
import { Cover, Picture } from './Cover';

/* ── Scramble text (decodes on mount / hover) ── */
const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABEN§◐∿';
export function Scramble({ text, className, as: Tag = 'span', trigger = 'mount' }: { text: string; className?: string; as?: 'span' | 'h1' | 'h2' | 'strong'; trigger?: 'mount' | 'hover' }) {
  const [out, setOut] = useState(trigger === 'mount' ? '' : text);
  const raf = useRef(0);
  const run = () => {
    if (prefersReducedMotion()) { setOut(text); return; }
    let f = 0;
    cancelAnimationFrame(raf.current);
    const step = () => {
      f++;
      const reveal = f / 1.6;
      setOut(text.split('').map((ch, i) => (ch === ' ' ? ' ' : i < reveal ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(''));
      if (reveal < text.length) raf.current = requestAnimationFrame(step);
    };
    step();
  };
  useEffect(() => { if (trigger === 'mount') run(); return () => cancelAnimationFrame(raf.current); }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Tag className={className} aria-label={text} onMouseEnter={trigger === 'hover' ? run : undefined}><span aria-hidden>{out || '\u00a0'}</span></Tag>;
}

/* ── Reveal on scroll ── */
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'li' }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect(); } }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref as never} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</Tag>;
}

export const DemoBadge = ({ small }: { small?: boolean }) => <span className={`demo ${small ? 'demo--s' : ''}`} title="Demonstration content — not a real project">Demo</span>;

export function Breadcrumbs({ trail }: { trail: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs mono">
      <ol>
        <li><Link to="/">Index</Link></li>
        {trail.map((t, i) => <li key={i}>{t.to ? <Link to={t.to}>{t.label}</Link> : <span aria-current="page">{t.label}</span>}</li>)}
      </ol>
    </nav>
  );
}

export function SectionHead({ no, title, kicker, action }: { no: string; title: ReactNode; kicker?: string; action?: ReactNode }) {
  return (
    <header className="shead">
      <span className="shead__no mono">{no}</span>
      <h2 className="shead__title">{title}</h2>
      {kicker && <p className="shead__kicker mono">{kicker}</p>}
      {action && <div className="shead__action">{action}</div>}
    </header>
  );
}

export const DisciplineChips = ({ p }: { p: Project }) => (
  <span className="chips mono">
    {disciplinesOf(p).map((d) => <Link key={d} to={`/archive?d=${d}`} className="chip" title={DISCIPLINES[d].blurb}><i>{DISCIPLINES[d].glyph}</i>{DISCIPLINES[d].label}</Link>)}
  </span>
);

/* ── Project entries in three archive views ── */
export function ProjectTile({ p, i = 0 }: { p: Project; i?: number }) {
  return (
    <article className="tile" style={{ ['--i' as string]: i, ['--pa' as string]: p.accent ?? 'var(--accent)' }}>
      <Link to={`/project/${p.slug}`} className="tile__link" aria-label={`${p.title} — ${p.description}`}>
        <div className="tile__media"><Cover cover={p.cover} sizes="(max-width: 700px) 100vw, 33vw" /></div>
        <div className="tile__meta mono">
          <span>N°{indexOf(p.slug)}</span>
          <span>{DISCIPLINES[p.category].short}</span>
          <span>{fmtDate(p.published, 'year')}</span>
        </div>
        <h3 className="tile__title serif">{p.title}</h3>
        <p className="tile__desc">{p.description}</p>
        <span className="tile__flags mono">{p.featured && <b>★ Featured</b>}{p.status !== 'complete' && <em>{p.status}</em>}{p.demo && <DemoBadge small />}</span>
      </Link>
    </article>
  );
}

export function ProjectRow({ p, onHover }: { p: Project; onHover?: (p: Project | null) => void }) {
  return (
    <li className="row" onMouseEnter={() => onHover?.(p)} onMouseLeave={() => onHover?.(null)} onFocus={() => onHover?.(p)} onBlur={() => onHover?.(null)} style={{ ['--pa' as string]: p.accent ?? 'var(--accent)' }}>
      <Link to={`/project/${p.slug}`} className="row__link">
        <span className="row__no mono">{indexOf(p.slug)}</span>
        <span className="row__title serif">{p.title}{p.featured && <sup>★</sup>}</span>
        <span className="row__cat mono">{DISCIPLINES[p.category].label}</span>
        <span className="row__tags mono">{p.tags.slice(0, 3).join(' / ')}</span>
        <span className="row__status mono">{p.status}</span>
        <span className="row__date mono">{fmtDate(p.published)}</span>
      </Link>
    </li>
  );
}

export function ProjectEditorial({ p, i }: { p: Project; i: number }) {
  const side = i % 3;
  return (
    <Reveal as="div" className={`ed ed--${side}`}>
      <article style={{ ['--pa' as string]: p.accent ?? 'var(--accent)' }}>
        <Link to={`/project/${p.slug}`} className="ed__link">
          <div className="ed__media"><Cover cover={p.cover} sizes="60vw" /></div>
          <div className="ed__text">
            <span className="mono ed__meta">N°{indexOf(p.slug)} — {DISCIPLINES[p.category].label} — {fmtDate(p.published, 'long')} {p.demo && <DemoBadge small />}</span>
            <h3 className="ed__title">{p.title}</h3>
            <p className="ed__desc serif">{p.description}</p>
            <span className="mono ed__more">Enter project →</span>
          </div>
        </Link>
      </article>
    </Reveal>
  );
}

/** Floating hover preview that follows the cursor (list view). */
export function HoverPreview({ p }: { p: Project | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = (e: PointerEvent) => { if (ref.current) ref.current.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 90}px)`; };
    window.addEventListener('pointermove', on);
    return () => window.removeEventListener('pointermove', on);
  }, []);
  return (
    <div ref={ref} className={`hp ${p ? 'is-on' : ''}`} aria-hidden>
      {p && (isImage(p.cover) ? <Picture image={{ ...p.cover, effect: 'none' }} sizes="280px" /> : <Cover cover={p.cover} />)}
      {p && <span className="mono">{p.title}</span>}
    </div>
  );
}

/* ── Architecture diagram (SVG) ── */
export function Diagram({ d }: { d: DiagramT }) {
  const pos = new Map(d.nodes.map((n) => [n.id, n]));
  return (
    <figure className="diagram">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`Architecture diagram: ${d.nodes.map((n) => n.label).join(', ')}`}>
        <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor" /></marker></defs>
        {d.edges.map((e, i) => { const a = pos.get(e.from)!, b = pos.get(e.to)!; return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="diagram__edge" markerEnd="url(#arr)" vectorEffect="non-scaling-stroke" />; })}
      </svg>
      {d.edges.map((e, i) => { const a = pos.get(e.from)!, b = pos.get(e.to)!; return e.label ? <span key={i} className="diagram__elabel mono" style={{ left: `${(a.x + b.x) / 2}%`, top: `${(a.y + b.y) / 2}%` }}>{e.label}</span> : null; })}
      {d.nodes.map((n) => <span key={n.id} className={`diagram__node diagram__node--${n.kind ?? 'process'} mono`} style={{ left: `${n.x}%`, top: `${n.y}%` }}>{n.label}</span>)}
    </figure>
  );
}

export function Timeline({ items }: { items: { date: string; label: string }[] }) {
  return (
    <ol className="tl mono">
      {items.map((t, i) => <li key={i} className={t.date.startsWith('[') ? 'is-next' : ''}><span>{t.date}</span><b>{t.label}</b></li>)}
    </ol>
  );
}

/* ── Marquee strip ── */
export function Marquee({ items }: { items: string[] }) {
  const row = items.join('  ✳  ') + '  ✳  ';
  return <div className="marquee mono" aria-hidden><div className="marquee__inner"><span>{row}</span><span>{row}</span></div></div>;
}
