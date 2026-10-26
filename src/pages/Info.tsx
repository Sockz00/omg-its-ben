import { useMemo, useState } from 'react';
import { Generative } from '../components/Cover';
import { RelationMap } from '../components/RelationMap';
import { Breadcrumbs, Reveal, SectionHead } from '../components/ui';
import { activity, DISCIPLINES, NOW, SITE } from '../data/site';
import type { ActivityItem } from '../data/types';
import { allProjects, countFor, fmtDate, usedDisciplines } from '../lib/content';
import { Link } from '../lib/router';

export function About() {
  return (
    <div className="page about">
      <Breadcrumbs trail={[{ label: 'About' }]} />
      <header className="phead">
        <h1 className="phead__title"><span>About</span> <em className="serif">Ben</em></h1>
        <p className="phead__lede serif">This page is a frame. Everything in brackets is an editable placeholder — no biography has been invented.</p>
      </header>
      <div className="about__grid">
        <figure className="about__portrait">
          <Generative cover={{ generative: 'contour', seed: 7, label: 'PORTRAIT' }} />
          <figcaption className="mono">[EDIT] Replace with a portrait — /public/images/about/portrait.jpg</figcaption>
        </figure>
        <div className="about__text prose">
          <p className="about__big serif">Ben is a <mark>[EDIT: one-line description]</mark> based in <mark>{SITE.location}</mark>, working across sound, image and code.</p>
          <h2>Practice</h2>
          <p>The archive treats music, photography, film, drawing, design, software, AI and security research as one practice rather than many careers. Projects cross-reference each other on purpose: a field recording becomes a plotter drawing; a synth module becomes a piece of code; a dither algorithm becomes a way of looking at photographs.</p>
          <h2>Philosophy</h2>
          <blockquote>[EDIT: a sentence you believe about making things.]</blockquote>
          <p><mark>[EDIT: two or three paragraphs on how you work, what you are curious about, and why the disciplines belong together.]</mark></p>
          <h2>Background</h2>
          <p><mark>[EDIT: education, training, places, communities — only what you want public.]</mark></p>
          <h2>Interests</h2>
          <ul>
            <li>[EDIT] Interest one</li>
            <li>[EDIT] Interest two</li>
            <li>[EDIT] Interest three</li>
          </ul>
        </div>
        <aside className="about__side">
          <h2 className="mono">Disciplines in the archive</h2>
          <ul className="about__disc">
            {usedDisciplines.map((d) => <li key={d}><Link to={`/archive?d=${d}`}><span>{DISCIPLINES[d].glyph}</span>{DISCIPLINES[d].label}<b className="mono">{countFor(d)}</b></Link></li>)}
          </ul>
          <h2 className="mono">Now</h2>
          <ul className="about__now">{NOW.making.map((m) => <li key={m} className="serif">{m}</li>)}</ul>
          <div className="about__links">
            <Link to="/skills" className="btn">Skills map →</Link>
            <Link to="/contact" className="btn">Contact →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function MapPage() {
  return (
    <div className="page mappage">
      <Breadcrumbs trail={[{ label: 'Relationship map' }]} />
      <header className="phead">
        <h1 className="phead__title"><span>How it</span> <em className="serif">connects</em></h1>
        <p className="phead__lede serif">Projects, disciplines, software, equipment and techniques as one network. Pull a thread; see what comes with it.</p>
      </header>
      <RelationMap height={Math.max(520, Math.min(760, window.innerHeight - 220))} />
    </div>
  );
}

export function Skills() {
  const tools = useMemo(() => {
    const m = new Map<string, { n: number; kind: string; ds: Set<string> }>();
    allProjects.forEach((p) => {
      const add = (s: string, kind: string) => { const e = m.get(s) ?? { n: 0, kind, ds: new Set() }; e.n++; e.ds.add(DISCIPLINES[p.category].label); m.set(s, e); };
      p.software?.forEach((s) => add(s, 'software'));
      p.techniques?.forEach((s) => add(s, 'technique'));
    });
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n);
  }, []);
  return (
    <div className="page skills">
      <Breadcrumbs trail={[{ label: 'About', to: '/about' }, { label: 'Skills map' }]} />
      <header className="phead">
        <h1 className="phead__title"><span>Skills</span> <em className="serif">map</em></h1>
        <p className="phead__lede serif">Skills are inferred from the archive itself — every tool and technique listed here is attached to at least one project, so the map stays honest as the archive grows.</p>
      </header>
      <RelationMap kinds={['project', 'discipline', 'software', 'technique']} height={560} title="Skills map" />
      <section className="sect">
        <SectionHead no="§2" title={<>Tools & <em className="serif">techniques</em></>} kicker="Ranked by number of projects" />
        <table className="skilltable">
          <thead className="mono"><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Used in</th><th scope="col">Projects</th></tr></thead>
          <tbody>
            {tools.map(([name, t]) => (
              <tr key={name}>
                <th scope="row" className="serif"><a href={`#/archive?q=${encodeURIComponent(name)}`}>{name}</a></th>
                <td className="mono">{t.kind}</td>
                <td className="mono">{[...t.ds].join(', ')}</td>
                <td><span className="skillbar" style={{ ['--n' as string]: t.n }} aria-hidden /> <span className="mono">{t.n}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

const TYPES: ActivityItem['type'][] = ['now', 'project', 'experiment', 'note', 'update'];
export function Activity() {
  const [type, setType] = useState<ActivityItem['type'] | null>(null);
  const items = activity.filter((a) => !type || a.type === type);
  const byYear = items.reduce<Record<string, ActivityItem[]>>((acc, a) => { (acc[a.date.slice(0, 4)] ??= []).push(a); return acc; }, {});
  return (
    <div className="page activity">
      <Breadcrumbs trail={[{ label: 'Activity log' }]} />
      <header className="phead">
        <h1 className="phead__title"><span>Activity</span> <em className="serif">log</em></h1>
        <p className="phead__lede serif">A running record of projects, experiments, updates and notes. Newest first.</p>
      </header>
      <div className="filters__disc" role="group" aria-label="Filter by type">
        <button type="button" className="fchip" aria-pressed={!type} onClick={() => setType(null)}>All</button>
        {TYPES.map((t) => <button type="button" key={t} className="fchip" aria-pressed={type === t} onClick={() => setType(type === t ? null : t)}>{t}</button>)}
      </div>
      {Object.entries(byYear).sort((a, b) => b[0].localeCompare(a[0])).map(([y, list]) => (
        <section key={y} className="log">
          <h2 className="log__year">{y}</h2>
          <ol className="log__list">
            {list.map((a) => (
              <Reveal as="li" key={a.date + a.text} className={`log__item log__item--${a.type}`}>
                <time className="mono" dateTime={a.date}>{fmtDate(a.date, 'long')}</time>
                <span className="mono log__type">{a.type}</span>
                {a.href ? <a href={a.href} className="serif">{a.text}</a> : <span className="serif">{a.text}</span>}
              </Reveal>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="page contact">
      <Breadcrumbs trail={[{ label: 'Contact' }]} />
      <h1 className="contact__title">
        <span>Say</span>
        <em className="serif">hello,</em>
        <span>Ben.</span>
      </h1>
      <div className="contact__grid">
        <section className="contact__main">
          <p className="mono">Email — the most reliable channel</p>
          <a className="contact__email serif" href={SITE.email.includes('[') ? undefined : `mailto:${SITE.email}`}>{SITE.email}</a>
          <button type="button" className="btn" onClick={() => navigator.clipboard?.writeText(SITE.email).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}>{copied ? 'Copied ✓' : 'Copy address'}</button>
          <p className="contact__note">There is deliberately no contact form here: a static site can’t deliver form submissions without a backend, and a form that silently discards messages would be worse than none. To add one later, wire it to a service of your choice and document it in the README.</p>
        </section>
        <section className="contact__side">
          <p className="mono">Open to — [EDIT]</p>
          <ul className="contact__open serif">
            <li>[EDIT] Collaborations</li>
            <li>[EDIT] Commissions</li>
            <li>[EDIT] Talks &amp; workshops</li>
          </ul>
          <p className="mono">Elsewhere</p>
          <ul className="contact__socials">
            {SITE.socials.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer"><span>{s.label}</span><span className="mono">{s.handle} ↗</span></a></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
