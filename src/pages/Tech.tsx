import { useState } from 'react';
import { Breadcrumbs, HoverPreview, ProjectRow } from '../components/ui';
import { techProjects } from '../lib/content';
import type { Project } from '../data/types';

/** Technical project index: a quiet, browseable list view. */
export default function Tech(_props: { params: URLSearchParams }) {
  const [hover, setHover] = useState<Project | null>(null);
  const list = techProjects;

  return (
    <div className="page tech">
      <Breadcrumbs trail={[{ label: 'Tech' }]} />
      <header className="phead">
        <h1 className="phead__title"><span>Tech</span></h1>
        <p className="phead__lede serif">Software, AI, security research, hardware and creative code. Open any entry for the full case study — notes, source, diagrams and live demos.</p>
        <p className="phead__count mono" aria-live="polite"><b>{String(list.length).padStart(2, '0')}</b> / {String(techProjects.length).padStart(2, '0')} projects</p>
      </header>

      <div className="tech__intro mono">{String(list.length).padStart(2, '0')} projects · browse the archive</div>
      <div className="rows__head mono" aria-hidden><span>N°</span><span>Title</span><span>Discipline</span><span>Status</span><span>Published</span></div>
      <ul className="rows">{list.map((p) => <ProjectRow key={p.slug} p={p} onHover={setHover} />)}</ul>
      <HoverPreview p={hover} />
    </div>
  );
}
