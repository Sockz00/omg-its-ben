import { useEffect, useMemo, useState } from 'react';
import { Breadcrumbs, HoverPreview, ProjectRow } from '../components/ui';
import { DISCIPLINES } from '../data/site';
import type { Discipline, Project } from '../data/types';
import { disciplinesOf, searchProjects, TECH_DISCIPLINES, techProjects } from '../lib/content';
import { setQuery } from '../lib/router';

const STATUSES: Project['status'][] = ['complete', 'ongoing', 'concept', 'archived'];

/** Technical project index: search + discipline + status + tags, one list view. */
export default function Tech({ params }: { params: URLSearchParams }) {
  const [q, setQ] = useState(params.get('q') ?? '');
  const [disc, setDisc] = useState<Discipline | null>((params.get('d') as Discipline) || null);
  const [status, setStatus] = useState<Project['status'] | null>((params.get('s') as Project['status']) || null);
  const [tags, setTags] = useState<string[]>(params.get('t')?.split(',').filter(Boolean) ?? []);
  const [hover, setHover] = useState<Project | null>(null);

  // react to links from elsewhere (discipline chips, project sidebars)
  useEffect(() => {
    setQ(params.get('q') ?? '');
    setDisc((params.get('d') as Discipline) || null);
    setStatus((params.get('s') as Project['status']) || null);
    setTags(params.get('t')?.split(',').filter(Boolean) ?? []);
  }, [params]);

  // keep the URL shareable without adding history entries
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (disc) p.set('d', disc);
    if (status) p.set('s', status);
    if (tags.length) p.set('t', tags.join(','));
    setQuery(p);
  }, [q, disc, status, tags]);

  const techDisciplines = useMemo(
    () => TECH_DISCIPLINES.filter((d) => techProjects.some((p) => disciplinesOf(p).includes(d))),
    [],
  );
  const techTags = useMemo(() => Array.from(new Set(techProjects.flatMap((p) => p.tags))).sort(), []);
  const techStatuses = useMemo(() => STATUSES.filter((s) => techProjects.some((p) => p.status === s)), []);
  const countFor = (d: Discipline) => techProjects.filter((p) => disciplinesOf(p).includes(d)).length;

  const list = useMemo(() => {
    let l = searchProjects(q, techProjects);
    if (disc) l = l.filter((p) => disciplinesOf(p).includes(disc));
    if (status) l = l.filter((p) => p.status === status);
    if (tags.length) l = l.filter((p) => tags.every((t) => p.tags.includes(t)));
    return l;
  }, [q, disc, status, tags]);

  const toggleTag = (t: string) => setTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
  const clear = () => { setQ(''); setDisc(null); setStatus(null); setTags([]); };
  const active = !!(q || disc || status || tags.length);

  return (
    <div className="page tech">
      <Breadcrumbs trail={[{ label: 'Tech' }]} />
      <header className="phead">
        <h1 className="phead__title"><span>Tech</span></h1>
        <p className="phead__lede serif">Software, AI, security research, hardware and creative code. Open any entry for the full case study — notes, source, diagrams and live demos.</p>
        <p className="phead__count mono" aria-live="polite"><b>{String(list.length).padStart(2, '0')}</b> / {String(techProjects.length).padStart(2, '0')} projects</p>
      </header>

      <div className="filters" role="search">
        <label className="filters__search">
          <span className="mono">Search</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="title, tool, tag, technique…" />
        </label>

        <div className="filters__disc" role="group" aria-label="Filter by discipline">
          <button type="button" aria-pressed={!disc} onClick={() => setDisc(null)} className="fchip">All <sup>{techProjects.length}</sup></button>
          {techDisciplines.map((d) => (
            <button type="button" key={d} aria-pressed={disc === d} onClick={() => setDisc(disc === d ? null : d)} className="fchip">
              {DISCIPLINES[d].label} <sup>{countFor(d)}</sup>
            </button>
          ))}
        </div>

        <div className="filters__row mono">
          <span className="filters__label">Status</span>
          <div className="filters__disc" role="group" aria-label="Filter by status">
            {techStatuses.map((s) => (
              <button type="button" key={s} aria-pressed={status === s} onClick={() => setStatus(status === s ? null : s)} className="fchip fchip--status">
                <span className={`status-dot status-dot--${s}`} />{s}
              </button>
            ))}
          </div>
          {active && <button type="button" className="fctl fctl--clear" onClick={clear}>Clear ✕</button>}
        </div>

        <div className="filters__tags" role="group" aria-label="Filter by tags (all selected must match)">
          {techTags.map((t) => <button type="button" key={t} aria-pressed={tags.includes(t)} onClick={() => toggleTag(t)} className="tag">#{t}</button>)}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <p className="serif">No technical project matches that combination.</p>
          <button type="button" className="btn" onClick={clear}>Clear filters</button>
        </div>
      ) : (
        <>
          <div className="rows__head mono" aria-hidden><span>N°</span><span>Title</span><span>Discipline</span><span>Status</span><span>Published</span></div>
          <ul className="rows">{list.map((p) => <ProjectRow key={p.slug} p={p} onHover={setHover} />)}</ul>
          <HoverPreview p={hover} />
        </>
      )}
    </div>
  );
}
