import { useEffect } from 'react';
import { AudioPlayer } from '../components/AudioPlayer';
import { Cover } from '../components/Cover';
import { Experiment } from '../components/experiments';
import { Compare, Gallery } from '../components/Gallery';
import { Breadcrumbs, DemoBadge, Diagram, DisciplineChips, ProjectTile, Reveal, Scramble, Timeline } from '../components/ui';
import { Video } from '../components/Video';
import { DISCIPLINES } from '../data/site';
import type { Project as P } from '../data/types';
import { CodeBlock } from '../lib/highlight';
import { allProjects, fmtDate, getProject, indexOf, relatedTo } from '../lib/content';
import { Markdown } from '../lib/markdown';
import { Link } from '../lib/router';
import { pushRecent } from '../lib/store';
import NotFound from './NotFound';

const MetaList = ({ title, items }: { title: string; items?: string[] }) =>
  items?.length ? (
    <div className="spec__group">
      <h3 className="mono">{title}</h3>
      <ul>{items.map((i) => <li key={i}><a href={`#/archive?q=${encodeURIComponent(i.replace(/\s*\[EDIT.*\]/, ''))}`}>{i}</a></li>)}</ul>
    </div>
  ) : null;

export default function Project({ slug }: { slug: string }) {
  const p = getProject(slug);
  useEffect(() => { if (p) pushRecent(p.slug); }, [p]);
  if (!p) return <NotFound />;

  const chrono = [...allProjects].sort((a, b) => a.created.localeCompare(b.created));
  const ci = chrono.findIndex((x) => x.slug === p.slug);
  const prev = chrono[ci - 1], next = chrono[ci + 1];
  const related = relatedTo(p, 3);
  let sec = 0;
  const S = (label: string) => <span className="psec__no mono">{String(++sec).padStart(2, '0')} — {label}</span>;

  return (
    <article className="page project" style={{ ['--accent' as string]: p.accent ?? undefined }}>
      <Breadcrumbs trail={[{ label: 'Archive', to: '/archive' }, { label: DISCIPLINES[p.category].label, to: `/archive?d=${p.category}` }, { label: p.title }]} />

      <header className="proj__head">
        <div className="proj__index mono" aria-hidden>N°{indexOf(p.slug)}</div>
        <h1 className="proj__title"><Scramble text={p.title} /></h1>
        <p className="proj__lede serif">{p.description}</p>
        <dl className="proj__meta mono">
          <div><dt>Category</dt><dd>{DISCIPLINES[p.category].label}</dd></div>
          <div><dt>Created</dt><dd><time dateTime={p.created}>{fmtDate(p.created, 'long')}</time></dd></div>
          <div><dt>Published</dt><dd><time dateTime={p.published}>{fmtDate(p.published, 'long')}</time></dd></div>
          <div><dt>Status</dt><dd><span className={`status-dot status-dot--${p.status}`} />{p.status}</dd></div>
          {p.featured && <div><dt>Flag</dt><dd>★ Featured</dd></div>}
          {p.demo && <div><dt>Content</dt><dd><DemoBadge /></dd></div>}
        </dl>
        <DisciplineChips p={p} />
      </header>

      {!p.audio && !p.video && !p.experiment && (
        <Reveal className="proj__cover"><Cover cover={p.cover} sizes="100vw" eager /></Reveal>
      )}

      {p.experiment && <section className="psec psec--wide" aria-label="Live experiment">{S('Live')}<Experiment id={p.experiment} /></section>}
      {p.audio && <section className="psec psec--wide" aria-label="Listen">{S('Listen')}<AudioPlayer release={p.audio} title={p.title} /></section>}
      {p.video && <section className="psec psec--wide" aria-label="Watch">{S('Watch')}<div className="vids">{p.video.map((v) => <Video key={v.title} video={v} />)}</div></section>}

      <div className="proj__body">
        <div className="proj__text">
          {S('Text')}
          <Markdown source={p.body} />
          <div className="tags-inline mono">{p.tags.map((t) => <Link key={t} to={`/archive?t=${t}`} className="tag">#{t}</Link>)}</div>
        </div>
        <aside className="spec" aria-label="Project information">
          {p.technical && (
            <div className="spec__group">
              <h3 className="mono">Technical</h3>
              <dl>{p.technical.map((t) => <div key={t.label}><dt>{t.label}</dt><dd>{t.value}</dd></div>)}</dl>
            </div>
          )}
          {p.credits && (
            <div className="spec__group">
              <h3 className="mono">Credits</h3>
              <dl>{p.credits.map((c) => <div key={c.role}><dt>{c.role}</dt><dd>{c.name}</dd></div>)}</dl>
            </div>
          )}
          <MetaList title="Collaborators" items={p.collaborators} />
          <MetaList title="Software" items={p.software} />
          <MetaList title="Equipment" items={p.equipment} />
          <MetaList title="Techniques" items={p.techniques} />
          {(p.links?.length || p.github) && (
            <div className="spec__group">
              <h3 className="mono">Links</h3>
              <ul>
                {p.github && <li><a href={p.github} target="_blank" rel="noopener noreferrer">Source on GitHub ↗</a></li>}
                {p.links?.map((l) => <li key={l.href}><a href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a></li>)}
              </ul>
            </div>
          )}
          {p.downloads && (
            <div className="spec__group">
              <h3 className="mono">Downloads</h3>
              <ul>{p.downloads.map((d) => <li key={d.href}><a href={d.href} download>↓ {d.label} {d.size && <span className="mono">{d.size}</span>}</a></li>)}</ul>
            </div>
          )}
        </aside>
      </div>

      {p.gallery && <section className="psec psec--wide" aria-label="Gallery">{S('Plates')}<Gallery images={p.gallery} layout={p.galleryLayout} /></section>}
      {p.compare && <section className="psec" aria-label="Comparison">{S('Before / after')}<Compare {...p.compare} /></section>}
      {p.diagram && <section className="psec" aria-label="Architecture">{S('Architecture')}<Diagram d={p.diagram} /></section>}
      {p.code && <section className="psec" aria-label="Code">{S('Source')}{p.code.map((c) => <CodeBlock key={c.filename} {...c} />)}</section>}
      {(p.timeline || p.process) && (
        <section className="psec proc" aria-label="Process">
          {S('Process')}
          {p.timeline && <Timeline items={p.timeline} />}
          {p.process && <ol className="proc__steps">{p.process.map((s, i) => <li key={s.title}><span className="mono">{String(i + 1).padStart(2, '0')}</span><h3 className="serif">{s.title}</h3><p>{s.text}</p></li>)}</ol>}
        </section>
      )}

      <nav className="pnav" aria-label="Chronological navigation">
        {prev ? <PNav p={prev} dir="prev" /> : <span />}
        <Link to="/archive" className="pnav__all mono">All objects</Link>
        {next ? <PNav p={next} dir="next" /> : <span />}
      </nav>

      {related.length > 0 && (
        <section className="psec psec--wide" aria-labelledby="rel-h">
          <h2 id="rel-h" className="rel__h">Related <em className="serif">objects</em></h2>
          <div className="grid grid--3">{related.map((r, i) => <ProjectTile key={r.slug} p={r} i={i} />)}</div>
        </section>
      )}
    </article>
  );
}

function PNav({ p, dir }: { p: P; dir: 'prev' | 'next' }) {
  return (
    <Link to={`/project/${p.slug}`} className={`pnav__l pnav__l--${dir}`} rel={dir}>
      <span className="mono">{dir === 'prev' ? '← Earlier' : 'Later →'} · {fmtDate(p.created)}</span>
      <span className="serif">{p.title}</span>
    </Link>
  );
}
