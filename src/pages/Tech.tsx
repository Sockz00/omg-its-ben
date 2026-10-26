import { useState } from 'react';
import { Breadcrumbs, HoverPreview, ProjectRow } from '../components/ui';
import type { Project } from '../data/types';
import { techProjects } from '../lib/content';

/** A focused index of the technical work, without filtering chrome. */
export default function Tech() {
  const [hover, setHover] = useState<Project | null>(null);

  return (
    <div className="page tech">
      <Breadcrumbs trail={[{ label: 'Tech' }]} />
      <header className="phead tech__head">
        <div>
          <p className="mono phead__eyebrow">Selected systems / {String(techProjects.length).padStart(2, '0')} entries</p>
          <h1 className="phead__title"><span>Tech</span></h1>
        </div>
        <p className="phead__lede serif">Software, AI, security research, hardware and creative code. A working archive of experiments, tools and systems.</p>
      </header>
      <div className="tech__rule" />
      <div className="rows__head mono" aria-hidden><span>N°</span><span>Project</span><span>Discipline</span><span>Status</span><span>Published</span></div>
      <ul className="rows">{techProjects.map((p) => <ProjectRow key={p.slug} p={p} onHover={setHover} />)}</ul>
      <HoverPreview p={hover} />
    </div>
  );
}
