import { lazy, Suspense, useEffect } from 'react';
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

export default function App() {
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

  return (
    <Shell path={path}>
      <Suspense fallback={<div className="loading mono" role="status">Retrieving from the stacks…</div>}>
        <div className="route" key={path}>{page}</div>
      </Suspense>
    </Shell>
  );
}
