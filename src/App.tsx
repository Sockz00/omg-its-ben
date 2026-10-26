import { lazy, Suspense, useEffect } from 'react';
import { Shell } from './components/Shell';
import { DISCIPLINES, SITE } from './data/site';
import { getJournal, getProject, isImage } from './lib/content';
import { useRoute } from './lib/router';
import { setMeta } from './lib/store';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const Archive = lazy(() => import('./pages/Archive'));
const Project = lazy(() => import('./pages/Project'));
const Wings = import('./pages/Disciplines');
const Info = import('./pages/Info');
const J = import('./pages/Journal');
const Visual = lazy(() => Wings.then((m) => ({ default: m.Visual })));
const Sound = lazy(() => Wings.then((m) => ({ default: m.Sound })));
const Film = lazy(() => Wings.then((m) => ({ default: m.Film })));
const Lab = lazy(() => Wings.then((m) => ({ default: m.Lab })));
const About = lazy(() => Info.then((m) => ({ default: m.About })));
const MapPage = lazy(() => Info.then((m) => ({ default: m.MapPage })));
const Skills = lazy(() => Info.then((m) => ({ default: m.Skills })));
const Activity = lazy(() => Info.then((m) => ({ default: m.Activity })));
const Contact = lazy(() => Info.then((m) => ({ default: m.Contact })));
const Journal = lazy(() => J.then((m) => ({ default: m.Journal })));
const JournalPost = lazy(() => J.then((m) => ({ default: m.JournalPost })));

const META: Record<string, [string, string]> = {
  '/': ['', SITE.description],
  '/archive': ['Archive', 'Every project in one searchable, filterable index — music, photography, film, art, design, code, AI and security.'],
  '/visual': ['Image', 'Photography, digital art, drawing and design: galleries, lightbox, comparisons and image treatments.'],
  '/sound': ['Sound', 'Music and sound design with a custom player: waveforms, spectrograms, markers, annotations and stems.'],
  '/film': ['Moving image', 'Short films, experimental video and real-time generative pieces.'],
  '/lab': ['Lab', 'Software, AI, cybersecurity research and live creative-coding experiments.'],
  '/map': ['Relationship map', 'An interactive network connecting projects, disciplines, software, equipment and techniques.'],
  '/skills': ['Skills map', 'Tools and techniques inferred from the archive itself.'],
  '/journal': ['Journal', 'Essays, research, notes and technical documentation.'],
  '/activity': ['Activity log', 'A chronological record of projects, experiments and updates.'],
  '/about': ['About', 'About Ben and the idea of one interconnected creative practice.'],
  '/contact': ['Contact', 'Ways to get in touch.'],
};

export default function App() {
  const { path, params } = useRoute();
  const [, seg, slug] = path.split('/');
  const base = `/${seg ?? ''}`;

  useEffect(() => {
    if (seg === 'project' && slug) {
      const p = getProject(slug);
      if (p) setMeta(p.title, `${p.description} — ${DISCIPLINES[p.category].label}${p.demo ? ' (demonstration project)' : ''}`, path, isImage(p.cover) ? p.cover.src : undefined);
      else setMeta('Not found', 'This object is not catalogued.', path);
    } else if (seg === 'journal' && slug) {
      const j = getJournal(slug);
      setMeta(j ? j.title : 'Not found', j ? j.summary : 'This entry does not exist.', path);
    } else {
      const m = META[base];
      setMeta(m ? m[0] : 'Not found', m ? m[1] : 'This page is not catalogued.', path);
    }
  }, [path, seg, slug, base]);

  let page;
  if (path === '/' || path === '') page = <Home />;
  else if (base === '/archive') page = <Archive params={params} />;
  else if (base === '/project' && slug) page = <Project key={slug} slug={slug} />;
  else if (base === '/visual') page = <Visual />;
  else if (base === '/sound') page = <Sound />;
  else if (base === '/film') page = <Film />;
  else if (base === '/lab') page = <Lab />;
  else if (base === '/map') page = <MapPage />;
  else if (base === '/skills') page = <Skills />;
  else if (base === '/activity') page = <Activity />;
  else if (base === '/about') page = <About />;
  else if (base === '/contact') page = <Contact />;
  else if (base === '/journal' && slug) page = <JournalPost key={slug} slug={slug} />;
  else if (base === '/journal') page = <Journal />;
  else page = <NotFound />;

  return (
    <Shell path={path}>
      <Suspense fallback={<div className="loading mono" role="status">Retrieving from the stacks…</div>}>
        <div className="route" key={path}>{page}</div>
      </Suspense>
    </Shell>
  );
}
