import { useEffect, useRef, useState } from 'react';
import { Cover } from '../components/Cover';
import { Marquee, Reveal, SectionHead } from '../components/ui';
import { activity, DISCIPLINES, NOW, SITE } from '../data/site';
import type { Discipline } from '../data/types';
import { allProjects, countFor, fmtDate, indexOf, sectionFor, usedDisciplines } from '../lib/content';
import { Link } from '../lib/router';
import { makeNoise, useReducedMotion, useTheme } from '../lib/store';
import { palette } from '../lib/palette';

/* Generative hero: a signal topography that bends toward the cursor. */
function SignalField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const theme = useTheme();
  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext('2d')!;
    const n = makeNoise(11);
    const m = { x: 0.7, y: 0.5, tx: 0.7, ty: 0.5 };
    let raf = 0, t = 0, visible = true;
    const resize = () => { const d = Math.min(1.5, devicePixelRatio); c.width = Math.round(c.clientWidth * d); c.height = Math.round(c.clientHeight * d); };
    resize();
    const ro = new ResizeObserver(() => { resize(); start(); }); ro.observe(c);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); });
    io.observe(c);
    const onMove = (e: PointerEvent) => { const r = c.getBoundingClientRect(); m.tx = (e.clientX - r.left) / r.width; m.ty = (e.clientY - r.top) / r.height; };
    window.addEventListener('pointermove', onMove, { passive: true });
    const start = () => { if (!raf && visible && !document.hidden && !reduced) raf = requestAnimationFrame(draw); };
    const draw = () => {
      raf = 0;
      if (!visible || document.hidden) return;
      const w = c.width, h = c.height;
      m.x += (m.tx - m.x) * 0.07; m.y += (m.ty - m.y) * 0.07;
      t += 0.004;
      g.clearRect(0, 0, w, h);
      const { ink3: ink, accent: acc } = palette();
      const rows = Math.round(h / 17);
      const step = 9;
      g.lineWidth = 1;
      for (let i = 0; i < rows; i++) {
        const y0 = (h * (i + 1)) / (rows + 1);
        const hot = i === Math.round(rows * m.y);
        g.strokeStyle = hot ? acc : ink;
        g.globalAlpha = hot ? 1 : 0.5;
        g.beginPath();
        for (let x = 0; x <= w; x += step) {
          const fx = x / w;
          const dx = fx - m.x, dy = i / rows - m.y;
          const bump = Math.exp(-(dx * dx * 30 + dy * dy * 14)) * h * 0.09;
          const y = y0 - Math.max(0, n(fx * 3 + t, i * 0.09 - t * 0.5) + 0.15) * h * 0.035 - bump;
          x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.stroke();
      }
      g.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', start);
    start();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', onMove); };
  }, [reduced, theme]);
  return <canvas ref={ref} className="hero__field" aria-hidden />;
}

/* Split-flap readout cycling through disciplines. */
function SplitFlap({ words }: { words: string[] }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [disp, setDisp] = useState(words[0]);
  const len = Math.max(...words.map((w) => w.length));
  useEffect(() => { if (reduced) return; const id = setInterval(() => setI((x) => (x + 1) % words.length), 2600); return () => clearInterval(id); }, [reduced, words.length]);
  useEffect(() => {
    const target = words[i].toUpperCase().padEnd(len, ' ');
    if (reduced) { setDisp(target); return; }
    let f = 0;
    const A = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ-&';
    const id = setInterval(() => {
      f++;
      setDisp(target.split('').map((ch, k) => (f > k * 0.8 + 4 ? ch : A[(f + k * 3) % A.length])).join(''));
      if (f > len + 6) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [i, len, reduced, words]);
  return (
    <span className="flap mono" aria-live="off" aria-label={words[i]}>
      {disp.padEnd(len, ' ').split('').map((ch, k) => <span key={k} className="flap__c" aria-hidden>{ch}</span>)}
    </span>
  );
}

export default function Home() {
  const featured = allProjects.filter((p) => p.featured);
  const [hd, setHd] = useState<Discipline | null>(null);
  const discProject = hd ? allProjects.find((p) => p.category === hd || p.disciplines?.includes(hd)) : null;

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero" aria-labelledby="hero-title">
        <SignalField />
        <div className="hero__meta mono">
          <span>Archive vol. 01 — updated {fmtDate(NOW.updated)}</span>
          <span>{allProjects.length} objects / {usedDisciplines.length} disciplines</span>
        </div>
        <h1 id="hero-title" className="hero__title">
          <span className="hero__omg">OMG,</span>
          <span className="hero__its serif">it’s</span>
          <span className="hero__ben">BEN</span>
        </h1>
        <div className="hero__intro">
          <p className="serif">
            A working archive of someone who refuses to pick one thing — <em>photographs, records, drawings, software, machine learning and security research</em>, kept together because they were never really separate.
          </p>
          <p className="hero__flapline mono">Now indexing → <SplitFlap words={usedDisciplines.map((d) => DISCIPLINES[d].label)} /></p>
          <div className="hero__cta">
            <Link to="/photo" className="btn btn--solid">Photo</Link>
            <Link to="/music" className="btn">Music</Link>
            <Link to="/tech" className="btn">Tech</Link>
          </div>
        </div>
        <ol className="hero__index mono" aria-label="Featured objects">
          {featured.slice(0, 4).map((p) => <li key={p.slug}><Link to={`/project/${p.slug}`}><span>N°{indexOf(p.slug)}</span>{p.title}</Link></li>)}
        </ol>
        <p className="hero__scroll mono" aria-hidden>Scroll ↓</p>
      </section>

      <Marquee items={usedDisciplines.map((d) => DISCIPLINES[d].label.toUpperCase())} />

      {/* ── DISCIPLINES ── */}
      <section className="sect disc" aria-labelledby="disc-h">
        <SectionHead no="§1" title={<span id="disc-h">{usedDisciplines.length} ways <em className="serif">into</em> one practice</span>} kicker="Choose a discipline — it opens the section that holds it" />
        <div className="disc__wrap">
          <ul className="disc__list">
            {usedDisciplines.map((d, i) => (
              <li key={d} onMouseEnter={() => setHd(d)} onMouseLeave={() => setHd(null)}>
                <Link to={sectionFor(d).to} onFocus={() => setHd(d)} onBlur={() => setHd(null)}>
                  <span className="mono disc__no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="disc__name">{DISCIPLINES[d].label}<i className="disc__glyph" aria-hidden>{DISCIPLINES[d].glyph}</i></span>
                  <span className="mono disc__blurb">{DISCIPLINES[d].blurb}</span>
                  <span className="mono disc__count">{String(countFor(d)).padStart(2, '0')}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="disc__peek" aria-hidden>{discProject && <><Cover cover={discProject.cover} sizes="30vw" /><span className="mono">{discProject.title}</span></>}</div>
        </div>
      </section>

      {/* ── LAB + NOW ── */}
      <section className="sect split" aria-labelledby="now-h">
        <aside className="now" aria-labelledby="now-h">
          <h2 id="now-h" className="mono now__h"><i className="pulse" /> Currently</h2>
          <dl className="now__dl">
            <div><dt className="mono">Making</dt><dd><ul>{NOW.making.map((m) => <li key={m} className="serif">{m}</li>)}</ul></dd></div>
            <div><dt className="mono">Listening</dt><dd>{NOW.listening}</dd></div>
            <div><dt className="mono">Based in</dt><dd>{SITE.location}</dd></div>
          </dl>
          <h3 className="mono now__h">Latest activity</h3>
          <ol className="now__log mono">{activity.slice(0, 4).map((a) => <li key={a.date + a.text}><span>{a.date}</span><a href={a.href}>{a.text}</a></li>)}</ol>
        </aside>
      </section>

      {/* ── ABOUT TEASER ── */}
      <section className="sect manifesto" aria-label="About">
        <Reveal>
          <p className="manifesto__text">
            <span className="mono">Who —</span> Ben works between sound, image and code. <em className="serif">[EDIT: one-line description]</em> The archive is the work, the notes, and the tissue between them.
          </p>
          <div className="manifesto__links">
            <Link to="/about" className="btn">About</Link>
            <Link to="/journal" className="btn">Journal</Link>
            {SITE.email.includes('[')
              ? <span className="btn" aria-disabled="true">{SITE.email}</span>
              : <a className="btn" href={`mailto:${SITE.email}`}>Email</a>}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
