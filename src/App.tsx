import { lazy, Suspense, useEffect, useState } from 'react';
import { Shell } from './components/Shell';
import { DISCIPLINES, SITE } from './data/site';
import { getJournal, getProject, isImage } from './lib/content';
import { useRoute } from './lib/router';
import { setMeta } from './lib/store';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const Tech = lazy(() => import('./pages/Tech'));
const Project = lazy(() => import('./pages/Project'));
const About = lazy(() => import('./pages/About'));
const Sections = import('./pages/Sections');
const J = import('./pages/Journal');
const Photo = lazy(() => Sections.then((m) => ({ default: m.Photo })));
const Music = lazy(() => Sections.then((m) => ({ default: m.Music })));
const Journal = lazy(() => J.then((m) => ({ default: m.Journal })));
const JournalPost = lazy(() => J.then((m) => ({ default: m.JournalPost })));

const META: Record<string, [string, string]> = {
  '/': ['', SITE.description],
  '/photo': ['Photo', 'Photography, digital art, drawing and design: galleries, lightbox, comparisons and image treatments.'],
  '/music': ['Music', 'Releases and sound design with a custom player: waveforms, spectrograms, markers, annotations and stems.'],
  '/tech': ['Tech', 'Software, AI, cybersecurity, hardware and creative coding — searchable case studies with source, diagrams and live demos.'],
  '/journal': ['Journal', 'Essays, research, notes and technical documentation.'],
  '/about': ['About', 'About Ben and the idea of one interconnected creative practice.'],
};

const SITE_PASSWORD = 'sixlongleopardslovelounging';
const ACCESS_KEY = 'ben-site-access';

function UnderConstruction({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password === SITE_PASSWORD) {
      sessionStorage.setItem(ACCESS_KEY, 'true');
      onUnlock();
    } else {
      setError(true);
    }
  }

  return (
    <main className="under-construction" aria-labelledby="construction-title">
      <div className="under-construction__content">
        <h1 id="construction-title" className="under-construction__message">
          <em>shit</em> is <strong>BROKEN rn</strong>
        </h1>
        <div className={`under-construction__access${showPassword ? ' is-open' : ''}`}>
          <button className="btn under-construction__reveal" type="button" onClick={() => setShowPassword(true)} aria-expanded={showPassword} aria-controls="site-password-form">
            let me in anyway
          </button>
          <form id="site-password-form" className="under-construction__form" onSubmit={handleSubmit} aria-hidden={!showPassword}>
            <label className="sr-only" htmlFor="site-password">Password</label>
            <input
              id="site-password"
              type="password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); setError(false); }}
              placeholder="Enter secret password..."
              autoComplete="current-password"
              aria-invalid={error}
              tabIndex={showPassword ? 0 : -1}
            />
            <button className="btn" type="submit" tabIndex={showPassword ? 0 : -1}>let me in</button>
          </form>
        </div>
        {error && <p className="under-construction__error" role="alert">That password didn&apos;t work.</p>}
      </div>
    </main>
  );
}


export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(ACCESS_KEY) === 'true');
  const { path, params } = useRoute();
  const [, seg, slug] = path.split('/');
  const base = `/${seg ?? ''}`;

  useEffect(() => {
    if (seg === 'project' && slug) {
      const p = getProject(slug);
      if (p) setMeta(p.title, `${p.description} — ${DISCIPLINES[p.category].label}${p.demo ? ' (demonstration project)' : ''}`, path, isImage(p.cover) ? p.cover.src : undefined);
      else setMeta('Not found', 'This project is not catalogued.', path);
    } else if (seg === 'journal' && slug) {
      const j = getJournal(slug);
      setMeta(j ? j.title : 'Not found', j ? j.summary : 'This entry does not exist.', path);
    } else {
      const m = META[base];
      setMeta(m ? m[0] : 'Not found', m ? m[1] : 'This page is not part of the site.', path);
    }
  }, [path, seg, slug, base]);

  let page;
  if (path === '/' || path === '') page = <Home />;
  else if (base === '/photo') page = <Photo />;
  else if (base === '/music') page = <Music />;
  else if (base === '/tech') page = <Tech params={params} />;
  else if (base === '/project' && slug) page = <Project key={slug} slug={slug} />;
  else if (base === '/journal' && slug) page = <JournalPost key={slug} slug={slug} />;
  else if (base === '/journal') page = <Journal />;
  else if (base === '/about') page = <About />;
  else page = <NotFound />;

  if (!unlocked) return <UnderConstruction onUnlock={() => setUnlocked(true)} />;

  return (
    <Shell path={path}>
      <Suspense fallback={<div className="loading mono" role="status">Retrieving from the stacks…</div>}>
        <div className="route" key={path}>{page}</div>
      </Suspense>
    </Shell>
  );
}
