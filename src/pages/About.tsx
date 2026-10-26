import { Generative } from '../components/Cover';
import { Breadcrumbs } from '../components/ui';
import { DISCIPLINES, NOW, SITE } from '../data/site';
import { countFor, sectionFor, usedDisciplines } from '../lib/content';
import { Link } from '../lib/router';

export default function About() {
  const email = SITE.email.includes('[') ? null : SITE.email;
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
          <p>The archive treats music, photography, drawing, design, software, AI and security research as one practice rather than many careers. Projects cross-reference each other on purpose: a field recording becomes a plotter drawing; a synth module becomes a piece of code; a dither algorithm becomes a way of looking at photographs.</p>
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
            {usedDisciplines.map((d) => <li key={d}><Link to={sectionFor(d).to}><span>{DISCIPLINES[d].glyph}</span>{DISCIPLINES[d].label}<b className="mono">{countFor(d)}</b></Link></li>)}
          </ul>
          <h2 className="mono">Now</h2>
          <ul className="about__now">{NOW.making.map((m) => <li key={m} className="serif">{m}</li>)}</ul>
          <div className="about__links">
            <Link to="/journal" className="btn">Journal →</Link>
            {email
              ? <a className="btn" href={`mailto:${email}`}>Contact →</a>
              : <span className="btn" aria-disabled="true">Contact [EDIT email]</span>}
          </div>
        </aside>
      </div>
    </div>
  );
}
