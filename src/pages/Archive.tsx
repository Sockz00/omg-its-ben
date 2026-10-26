import { useEffect, useMemo, useRef, useState } from 'react';
import { Breadcrumbs, HoverPreview, ProjectEditorial, ProjectRow, ProjectTile } from '../components/ui';
import { DISCIPLINES } from '../data/site';
import type { Discipline, Project } from '../data/types';
import { allProjects, allTags, countFor, disciplinesOf, randomProject, searchProjects, usedDisciplines } from '../lib/content';
import { navigate, setQuery } from '../lib/router';
import { usePersisted } from '../lib/store';

type View = 'grid' | 'list' | 'editorial';
type Sort = 'new' | 'old' | 'az' | 'created';

export default function Archive({ params }: { params: URLSearchParams }) {
  const [q, setQ] = useState(params.get('q') ?? '');
  const [disc, setDisc] = useState<Discipline | null>((params.get('d') as Discipline) || null);
  const [tags, setTags] = useState<string[]>(params.get('t')?.split(',').filter(Boolean) ?? []);
  const [year, setYear] = useState<string | null>(params.get('y'));
  const [featured, setFeatured] = useState(params.get('featured') === '1');
  const [sort, setSort] = useState<Sort>((params.get('sort') as Sort) || 'new');
  const [savedView, setSavedView] = usePersisted<View>('oib:view', 'grid');
  const [view, setViewState] = useState<View>((params.get('view') as View) || savedView);
  const [hover, setHover] = useState<Project | null>(null);
  const [showTags, setShowTags] = useState(tags.length > 0);
  const searchRef = useRef<HTMLInputElement>(null);
  const setView = (v: View) => { setViewState(v); setSavedView(v); };

  // react to external navigation (e.g. discipline chips)
  useEffect(() => {
    setDisc((params.get('d') as Discipline) || null);
    if (params.get('featured')) setFeatured(true);
    if (params.get('view')) setViewState(params.get('view') as View);
    if (params.get('t')) setTags(params.get('t')!.split(','));
  }, [params]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (disc) p.set('d', disc);
    if (tags.length) p.set('t', tags.join(','));
    if (year) p.set('y', year);
    if (featured) p.set('featured', '1');
    if (sort !== 'new') p.set('sort', sort);
    if (view !== savedView) p.set('view', view);
    setQuery(p);
  }, [q, disc, tags, year, featured, sort, view, savedView]);

  const years = useMemo(() => {
    const m = new Map<string, number>();
    allProjects.forEach((p) => m.set(p.published.slice(0, 4), (m.get(p.published.slice(0, 4)) ?? 0) + 1));
    return [...m.entries()].sort();
  }, []);

  const list = useMemo(() => {
    let l = searchProjects(q);
    if (disc) l = l.filter((p) => disciplinesOf(p).includes(disc));
    if (tags.length) l = l.filter((p) => tags.every((t) => p.tags.includes(t)));
    if (year) l = l.filter((p) => p.published.startsWith(year));
    if (featured) l = l.filter((p) => p.featured);
    const s = [...l];
    if (sort === 'old') s.reverse();
    if (sort === 'az') s.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'created') s.sort((a, b) => b.created.localeCompare(a.created));
    return s;
  }, [q, disc, tags, year, featured, sort]);

  const toggleTag = (t: string) => setTags((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
  const clear = () => { setQ(''); setDisc(null); setTags([]); setYear(null); setFeatured(false); };
  const active = q || disc || tags.length || year || featured;
  const key = `${view}-${q}-${disc}-${tags.join()}-${year}-${featured}-${sort}`;

  return (
    <div className="page archive">
      <Breadcrumbs trail={[{ label: 'Archive' }]} />
      <header className="phead">
        <h1 className="phead__title"><span>The</span> <em className="serif">Archive</em></h1>
        <p className="phead__lede serif">Every object in one index — sortable, searchable, cross-referenced. Filters combine; the URL remembers them.</p>
        <p className="phead__count mono" aria-live="polite"><b>{String(list.length).padStart(3, '0')}</b> / {String(allProjects.length).padStart(3, '0')} objects</p>
      </header>

      <div className="filters" role="search">
        <label className="filters__search">
          <span className="mono">Search</span>
          <input ref={searchRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="title, tool, tag, technique…" />
        </label>
        <div className="filters__disc" role="group" aria-label="Filter by discipline">
          <button type="button" aria-pressed={!disc} onClick={() => setDisc(null)} className="fchip">All <sup>{allProjects.length}</sup></button>
          {usedDisciplines.map((d) => (
            <button type="button" key={d} aria-pressed={disc === d} onClick={() => setDisc(disc === d ? null : d)} className="fchip">
              {DISCIPLINES[d].label} <sup>{countFor(d)}</sup>
            </button>
          ))}
        </div>
        <div className="filters__row mono">
          <button type="button" className="fctl" aria-expanded={showTags} onClick={() => setShowTags((v) => !v)}>Tags {tags.length ? `(${tags.length})` : ''} {showTags ? '−' : '+'}</button>
          <button type="button" className="fctl" aria-pressed={featured} onClick={() => setFeatured((v) => !v)}>★ Featured only</button>
          <label className="fctl fctl--sel">Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="new">Newest published</option>
              <option value="old">Oldest published</option>
              <option value="created">Recently created</option>
              <option value="az">A → Z</option>
            </select>
          </label>
          <button type="button" className="fctl" onClick={() => navigate(`/project/${randomProject().slug}`)}>⚄ Random</button>
          {active && <button type="button" className="fctl fctl--clear" onClick={clear}>Clear ✕</button>}
          <div className="views" role="group" aria-label="View mode">
            {(['grid', 'list', 'editorial'] as View[]).map((v) => <button type="button" key={v} aria-pressed={view === v} onClick={() => setView(v)}>{v}</button>)}
          </div>
        </div>
        {showTags && (
          <div className="filters__tags" role="group" aria-label="Filter by tags (all selected must match)">
            {allTags.map((t) => <button type="button" key={t} aria-pressed={tags.includes(t)} onClick={() => toggleTag(t)} className="tag">#{t}</button>)}
          </div>
        )}
        <div className="years mono" role="group" aria-label="Filter by year">
          {years.map(([y, n]) => (
            <button type="button" key={y} aria-pressed={year === y} onClick={() => setYear(year === y ? null : y)} style={{ ['--h' as string]: n }}>
              <i aria-hidden />{y}<sup>{n}</sup>
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <p className="serif">Nothing in the archive matches that combination.</p>
          <button type="button" className="btn" onClick={clear}>Clear filters</button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid" key={key}>{list.map((p, i) => <ProjectTile key={p.slug} p={p} i={i} />)}</div>
      ) : view === 'list' ? (
        <>
          <div className="rows__head mono" aria-hidden><span>N°</span><span>Title</span><span>Discipline</span><span>Tags</span><span>Status</span><span>Published</span></div>
          <ul className="rows" key={key}>{list.map((p) => <ProjectRow key={p.slug} p={p} onHover={setHover} />)}</ul>
          <HoverPreview p={hover} />
        </>
      ) : (
        <div className="eds" key={key}>{list.map((p, i) => <ProjectEditorial key={p.slug} p={p} i={i} />)}</div>
      )}
    </div>
  );
}
