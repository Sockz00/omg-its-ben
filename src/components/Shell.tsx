import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SITE } from '../data/site';
import { allProjects, randomProject } from '../lib/content';
import { Link, navigate } from '../lib/router';
import { prefersReducedMotion, toggleTheme, useTheme } from '../lib/store';
import { CommandPalette, PAGES } from './CommandPalette';

export const NAV = [
  { no: '01', label: 'Archive', to: '/archive' },
  { no: '02', label: 'Image', to: '/visual' },
  { no: '03', label: 'Sound', to: '/sound' },
  { no: '04', label: 'Moving', to: '/film' },
  { no: '05', label: 'Lab', to: '/lab' },
  { no: '06', label: 'Map', to: '/map' },
  { no: '07', label: 'Journal', to: '/journal' },
  { no: '08', label: 'About', to: '/about' },
];

function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <span>{t.toLocaleTimeString('en-GB')}</span>;
}

export function Shell({ path, children }: { path: string; children: ReactNode }) {
  const theme = useTheme();
  const [menu, setMenu] = useState(false);
  const [cmd, setCmd] = useState(false);
  const [wipe, setWipe] = useState<string | null>(null);
  const [scroll, setScroll] = useState(0);
  const [help, setHelp] = useState(false);
  const gPressed = useRef(0);
  const first = useRef(true);
  const main = useRef<HTMLElement>(null);

  // page wipe + scroll reset + focus management on route change
  useEffect(() => {
    setMenu(false);
    if (first.current) { first.current = false; return; }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    main.current?.focus({ preventScroll: true });
    if (prefersReducedMotion()) return;
    setWipe(path);
    const t = setTimeout(() => setWipe(null), 720);
    return () => clearTimeout(t);
  }, [path]);

  useEffect(() => {
    const on = () => { const h = document.documentElement.scrollHeight - innerHeight; setScroll(h > 0 ? Math.round((scrollY / h) * 100) : 0); };
    window.addEventListener('scroll', on, { passive: true });
    on();
    return () => window.removeEventListener('scroll', on);
  }, [path]);

  // global keyboard shortcuts
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.closest('input, textarea, select, [contenteditable="true"]');
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmd((v) => !v); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey || cmd) return;
      if (e.key === 'Escape') { setMenu(false); setHelp(false); return; }
      if (document.querySelector('.lb')) return;
      const k = e.key.toLowerCase();
      if (Date.now() - gPressed.current < 900) {
        const p = PAGES.find((x) => x.key === k);
        gPressed.current = 0;
        if (p) { navigate(p.to); e.preventDefault(); }
        return;
      }
      if (k === '/') { e.preventDefault(); setCmd(true); }
      else if (k === 'g') gPressed.current = Date.now();
      else if (k === 'r') navigate(`/project/${randomProject(path.split('/')[2]).slug}`);
      else if (k === 't') toggleTheme();
      else if (k === '?') setHelp((v) => !v);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [cmd, path]);

  const section = '/' + (path.split('/')[1] ?? '');
  return (
    <>
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); main.current?.focus(); }}>Skip to content</a>
      <header className="hdr">
        <Link to="/" className="hdr__mark" aria-label="OMG, IT'S BEN — home">
          <span className="hdr__omg">OMG,</span>
          <span className="hdr__ben serif">it’s Ben</span>
        </Link>
        <nav className="hdr__nav" aria-label="Primary">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} aria-current={section === n.to ? 'page' : undefined}><sup className="mono">{n.no}</sup>{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hdr__tools mono">
          <button type="button" className="hdr__search" onClick={() => setCmd(true)} aria-label="Open search and command palette (Ctrl+K)">
            <svg viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></svg>
            <span>Search</span><kbd>⌘K</kbd>
          </button>
          <button type="button" onClick={() => navigate(`/project/${randomProject(path.split('/')[2]).slug}`)} aria-label="Random project (R)" title="Random project (R)">
            <svg viewBox="0 0 24 24" aria-hidden><rect x="4" y="4" width="16" height="16" /><circle cx="9" cy="9" r="1.3" /><circle cx="15" cy="15" r="1.3" /><circle cx="15" cy="9" r="1.3" /><circle cx="9" cy="15" r="1.3" /></svg>
          </button>
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme (T)`} title="Toggle theme (T)">
            <svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="7" /><path d="M12 5a7 7 0 0 1 0 14z" className="fill" /></svg>
          </button>
          <button type="button" className="hdr__menu" onClick={() => setMenu(true)} aria-expanded={menu} aria-controls="mmenu">Menu</button>
        </div>
      </header>

      <div id="mmenu" className={`mmenu ${menu ? 'is-open' : ''}`} aria-hidden={!menu} inert={!menu}>
        <div className="mmenu__top mono"><span>Index of sections</span><button type="button" onClick={() => setMenu(false)}>Close ✕</button></div>
        <ul>
          {[...NAV, { no: '09', label: 'Activity', to: '/activity' }, { no: '10', label: 'Contact', to: '/contact' }].map((n, i) => (
            <li key={n.to} style={{ transitionDelay: `${menu ? 60 + i * 35 : 0}ms` }}><Link to={n.to}><span className="mono">{n.no}</span>{n.label}</Link></li>
          ))}
        </ul>
        <button type="button" className="mmenu__search mono" onClick={() => { setMenu(false); setCmd(true); }}>Search the archive →</button>
      </div>

      <main id="main" ref={main} tabIndex={-1} className="main">{children}</main>

      <Footer />

      <div className="status mono" aria-hidden>
        <span>§ {path === '/' ? '/index' : path}</span>
        <span>{allProjects.length} objects</span>
        <span className="status__bar"><i style={{ width: `${scroll}%` }} /></span>
        <span>{String(scroll).padStart(2, '0')}%</span>
        <Clock />
        <button type="button" onClick={() => setHelp(true)} tabIndex={-1}>? keys</button>
      </div>

      {wipe && <div className="wipe" aria-hidden><span className="mono">→ {wipe === '/' ? 'index' : wipe.slice(1)}</span></div>}
      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
      {help && (
        <div className="keys" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={() => setHelp(false)}>
          <div className="keys__box mono" onClick={(e) => e.stopPropagation()}>
            <h2 className="serif">Keyboard</h2>
            <dl>
              <div><dt>⌘K / Ctrl K / /</dt><dd>Command palette</dd></div>
              <div><dt>R</dt><dd>Random project</dd></div>
              <div><dt>T</dt><dd>Toggle theme</dd></div>
              {PAGES.map((p) => <div key={p.key}><dt>G then {p.key.toUpperCase()}</dt><dd>{p.label.split(' —')[0]}</dd></div>)}
              <div><dt>← → + − I</dt><dd>Lightbox navigation / zoom / info</dd></div>
              <div><dt>Space ← →</dt><dd>Audio waveform: play / seek</dd></div>
            </dl>
            <button type="button" className="btn" onClick={() => setHelp(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr__big" aria-hidden>
        <span>OMG,</span>
        <span className="serif">it’s Ben.</span>
      </div>
      <div className="ftr__cols">
        <div>
          <h2 className="mono">Archive</h2>
          <ul>{NAV.slice(0, 5).map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="mono">Discover</h2>
          <ul>
            <li><Link to="/map">Relationship map</Link></li>
            <li><Link to="/skills">Skills map</Link></li>
            <li><Link to="/activity">Activity log</Link></li>
            <li><Link to="/journal">Journal</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mono">Elsewhere</h2>
          <ul>{SITE.socials.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label} ↗</a></li>)}</ul>
        </div>
        <div className="ftr__colophon">
          <h2 className="mono">Colophon</h2>
          <p>Set in Instrument Serif, Archivo &amp; JetBrains Mono (SIL OFL). Built as a static archive: no trackers, no cookies — theme and recently viewed are kept in your browser’s local storage only.</p>
          <p className="mono">Projects marked <span className="demo demo--s">Demo</span> are demonstration content.</p>
        </div>
      </div>
      <div className="ftr__base mono">
        <span>© {new Date().getFullYear()} Ben [EDIT surname]</span>
        <span>{SITE.location}</span>
        <Link to="/contact">Contact →</Link>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}>Back to top ↑</button>
      </div>
    </footer>
  );
}
