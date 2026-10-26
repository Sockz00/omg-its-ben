import { Breadcrumbs, DemoBadge, ProjectTile, Reveal } from '../components/ui';
import type { JournalEntry } from '../data/types';
import { fmtDate, getJournal, getProject, journalSorted } from '../lib/content';
import { Markdown } from '../lib/markdown';
import { Link } from '../lib/router';
import NotFound from './NotFound';

const readTime = (j: JournalEntry) => Math.max(1, Math.round(j.body.split(/\s+/).length / 220));

export function Journal() {
  const list = journalSorted;
  return (
    <div className="page journal">
      <Breadcrumbs trail={[{ label: 'Journal' }]} />
      <header className="phead">
        <h1 className="phead__title"><span>Journal</span> <em className="serif">&amp; notes</em></h1>
        <p className="phead__lede serif">Long-form writing, research, observations, creative notes and technical documentation.</p>
      </header>
      <p className="journal__meta mono">{String(list.length).padStart(2, '0')} entries · notes from the archive</p>
      <ol className="jlist">
        {list.map((j, i) => (
          <Reveal as="li" key={j.slug} delay={i * 50}>
            <Link to={`/journal/${j.slug}`} className="jlist__item">
              <span className="mono jlist__date">{fmtDate(j.date, 'long')}</span>
              <span className="mono jlist__kind">{j.kind} · {readTime(j)} min</span>
              <h2 className="jlist__title serif">{j.title}</h2>
              <p className="jlist__sum">{j.summary} {j.demo && <DemoBadge small />}</p>
            </Link>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

export function JournalPost({ slug }: { slug: string }) {
  const j = getJournal(slug);
  if (!j) return <NotFound />;
  const idx = journalSorted.indexOf(j);
  const newer = journalSorted[idx - 1], older = journalSorted[idx + 1];
  const related = (j.related ?? []).map(getProject).filter(Boolean);
  return (
    <article className="page post">
      <Breadcrumbs trail={[{ label: 'Journal', to: '/journal' }, { label: j.title }]} />
      <header className="post__head">
        <p className="mono">{j.kind} — <time dateTime={j.date}>{fmtDate(j.date, 'long')}</time> — {readTime(j)} min read {j.demo && <DemoBadge small />}</p>
        <h1 className="post__title serif">{j.title}</h1>
        <p className="post__sum">{j.summary}</p>
      </header>
      <Markdown source={j.body} className="prose post__body" />
      <div className="tags-inline mono">{j.tags.map((t) => <span key={t} className="tag">#{t}</span>)}</div>
      {related.length > 0 && (
        <section className="psec">
          <h2 className="rel__h">Referenced <em className="serif">objects</em></h2>
          <div className="grid grid--3">{related.map((p, i) => <ProjectTile key={p!.slug} p={p!} i={i} />)}</div>
        </section>
      )}
      <nav className="pnav" aria-label="Journal navigation">
        {older ? <Link to={`/journal/${older.slug}`} className="pnav__l pnav__l--prev"><span className="mono">← Older</span><span className="serif">{older.title}</span></Link> : <span />}
        <Link to="/journal" className="pnav__all mono">All entries</Link>
        {newer ? <Link to={`/journal/${newer.slug}`} className="pnav__l pnav__l--next"><span className="mono">Newer →</span><span className="serif">{newer.title}</span></Link> : <span />}
      </nav>
    </article>
  );
}
