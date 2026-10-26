import { useEffect, useRef, useState } from 'react';
import { Cover } from '../components/Cover';
import { FlowField } from '../components/experiments';
import { DemoBadge, HoverPreview, Marquee, ProjectRow, Reveal, Scramble, SectionHead } from '../components/ui';
import { activity, DISCIPLINES, NOW, SITE } from '../data/site';
import type { Discipline, Project } from '../data/types';
import { allProjects, countFor, fmtDate, indexOf, usedDisciplines } from '../lib/content';
import { Link } from '../lib/router';
import { makeNoise, useReducedMotion, useTheme } from '../lib/store';

const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

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
    const resize = () => { const d = Math.min(2, devicePixelRatio); c.width = c.clientWidth * d; c.height = c.clientHeight * d; };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !reduced) { cancelAnimationFrame(raf); draw(); } });
    io.observe(c);
    const onMove = (e: PointerEvent) => { const r = c.getBoundingClientRect(); m.tx = (e.clientX - r.left) / r.width; m.ty = (e.clientY - r.top) / r.height; };
    window.addEventListener('pointermove', onMove, { passive: true });
    const draw = () => {
      const w = c.width, h = c.height;
      m.x += (m.tx - m.x) * 0.06; m.y += (m.ty - m.y) * 0.06;
      t += 0.004;
      g.clearRect(0, 0, w, h);
      const ink = cssVar('--ink-3'), acc = cssVar('--accent');
      const rows = Math.round(h / (14 * Math.min(2, devicePixelRatio)));
      g.lineWidth = Math.min(2, devicePixelRatio) * 0.9;
      for (let i = 0; i < rows; i++) {
        const y0 = (h * (i + 1)) / (rows + 1);
        const hot = i === Math.round(rows * m.y);
        g.strokeStyle = hot ? acc : ink;
        g.globalAlpha = hot ? 1 : 0.55;
        g.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const fx = x / w;
          const dx = fx - m.x, dy = i / rows - m.y;
          const bump = Math.exp(-(dx * dx * 30 + dy * dy * 14)) * h * 0.09;
          const y = y0 - Math.max(0, n(fx * 3 + t, i * 0.09 - t * 0.5) + 0.15) * h * 0.035 - bump;
          x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.stroke();
      }
      g.globalAlpha = 1;
      if (!reduced && visible) raf = requestAnimationFrame(draw);
    };
    draw();
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
  const recent = allProjects.slice(0, 6);
  const [hover, setHover] = useState<Project | null>(null);
  const [hd, setHd] = useState<Discipline | null>(null);
  const discProject = hd ? allProjects.find((p) => p.category === hd || p.disciplines?.includes(hd)) : null;

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero" aria-labelledby="hero-title">
        <SignalField />
        <div className="hero__meta mono">
          <span>Archive vol. 01</span>
          <span>{allProjects.length} objects / {usedDisciplines.length} disciplines</span>
          <span>Updated {fmtDate(NOW.updated, 'long')}</span>
        </div>
        <h1 id="hero-title" className="hero__title">
          <span className="hero__omg">OMG,</span>
          <span className="hero__its serif">it’s</span>
          <span className="hero__ben">BEN</span>
        </h1>
        <div className="hero__intro">
          <p className="serif">
            A working archive of someone who refuses to pick one thing — <em>music, sound, photographs, films, drawings, type, software, machine learning and security research</em>, kept together because they were never really separate.
          </p>
          <p className="hero__flapline mono">Now indexing → <SplitFlap words={usedDisciplines.map((d) => DISCIPLINES[d].label)} /></p>
          <div className="hero__cta">
            <Link to="/archive" className="btn btn--solid">Enter the archive</Link>
            <Link to="/map" className="btn">See how it connects</Link>
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
        <SectionHead no="§1" title={<span id="disc-h">Twelve ways <em className="serif">into</em> one practice</span>} kicker="Choose a discipline — or let them overlap" />
        <div className="disc__wrap">
          <ul className="disc__list">
            {usedDisciplines.map((d, i) => (
              <li key={d} onMouseEnter={() => setHd(d)} onMouseLeave={() => setHd(null)}>
                <Link to={`/archive?d=${d}`} onFocus={() => setHd(d)} onBlur={() => setHd(null)}>
                  <span className="mono disc__no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="disc__name">{DISCIPLINES[d].label}</span>
                  <span className="disc__glyph" aria-hidden>{DISCIPLINES[d].glyph}</span>
                  <span className="mono disc__blurb">{DISCIPLINES[d].blurb}</span>
                  <span className="mono disc__count">{String(countFor(d)).padStart(2, '0')}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="disc__peek" aria-hidden>{discProject && <><Cover cover={discProject.cover} sizes="30vw" /><span className="mono">{discProject.title}</span></>}</div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section className="sect feat" aria-labelledby="feat-h">
        <SectionHead no="§2" title={<span id="feat-h">Selected <em className="serif">objects</em></span>} kicker="Curated from the archive" action={<Link to="/archive?featured=1" className="ulink mono">All featured →</Link>} />
        <div className="feat__grid">
          {featured.map((p, i) => (
            <Reveal key={p.slug} className={`feat__item feat__item--${i % 5}`} delay={i * 60}>
              <Link to={`/project/${p.slug}`} style={{ ['--pa' as string]: p.accent ?? 'var(--accent)' }}>
                <div className="feat__media"><Cover cover={p.cover} sizes={i === 0 ? '60vw' : '35vw'} /></div>
                <div className="feat__cap">
                  <span className="mono">N°{indexOf(p.slug)} · {DISCIPLINES[p.category].label} · {fmtDate(p.published, 'year')} {p.demo && <DemoBadge small />}</span>
                  <h3><Scramble text={p.title} trigger="hover" /></h3>
                  <p className="serif">{p.description}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── RECENT ── */}
      <section className="sect" aria-labelledby="recent-h">
        <SectionHead no="§3" title={<span id="recent-h">Recently <em className="serif">added</em></span>} kicker="Newest first" action={<Link to="/archive?view=list" className="ulink mono">Full index →</Link>} />
        <ul className="rows">{recent.map((p) => <ProjectRow key={p.slug} p={p} onHover={setHover} />)}</ul>
        <HoverPreview p={hover} />
      </section>

      {/* ── LAB + NOW ── */}
      <section className="sect split" aria-labelledby="lab-h">
        <div className="split__lab">
          <SectionHead no="§4" title={<span id="lab-h">A live <em className="serif">instrument</em></span>} kicker="Not a video. Move your cursor." />
          <div className="split__exp"><FlowField compact /></div>
          <Link to="/lab" className="ulink mono">Five experiments in the Lab →</Link>
        </div>
        <aside className="now" aria-labelledby="now-h">
          <h2 id="now-h" className="mono now__h"><i className="pulse" /> Currently</h2>
          <dl className="now__dl">
            <div><dt className="mono">Making</dt><dd><ul>{NOW.making.map((m) => <li key={m} className="serif">{m}</li>)}</ul></dd></div>
            <div><dt className="mono">Listening</dt><dd>{NOW.listening}</dd></div>
            <div><dt className="mono">Reading</dt><dd>{NOW.reading}</dd></div>
            <div><dt className="mono">Based in</dt><dd>{SITE.location}</dd></div>
          </dl>
          <h3 className="mono now__h">Latest activity</h3>
          <ol className="now__log mono">{activity.slice(0, 5).map((a) => <li key={a.date + a.text}><span>{a.date}</span><a href={a.href}>{a.text}</a></li>)}</ol>
          <Link to="/activity" className="ulink mono">Full activity log →</Link>
        </aside>
      </section>

      {/* ── ABOUT TEASER ── */}
      <section className="sect manifesto" aria-label="About">
        <Reveal>
          <p className="manifesto__text">
            <span className="mono">Who —</span> Ben is a <em className="serif">[EDIT: one-line description]</em> working between sound, image and code. The archive is the work, the notes and the connective tissue between them.
          </p>
          <div className="manifesto__links">
            <Link to="/about" className="btn">About</Link>
            <Link to="/skills" className="btn">Skills map</Link>
            <Link to="/contact" className="btn">Contact</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
