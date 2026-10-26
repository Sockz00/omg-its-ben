import { projects } from '../data/projects';
import { DISCIPLINES, journal } from '../data/site';
import type { Cover, Discipline, ImageAsset, Project } from '../data/types';

export const byDateDesc = (a: Project, b: Project) => b.published.localeCompare(a.published);

export const allProjects = projects.filter((p) => !p.draft).sort(byDateDesc);
export const projectMap = new Map(allProjects.map((p) => [p.slug, p]));
export const getProject = (slug: string) => projectMap.get(slug);
export const getJournal = (slug: string) => journal.find((j) => j.slug === slug);
export const journalSorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));

export const disciplinesOf = (p: Project): Discipline[] => Array.from(new Set([p.category, ...(p.disciplines ?? [])]));
export const usedDisciplines = (Object.keys(DISCIPLINES) as Discipline[]).filter((d) => allProjects.some((p) => disciplinesOf(p).includes(d)));
export const countFor = (d: Discipline) => allProjects.filter((p) => disciplinesOf(p).includes(d)).length;

export const isImage = (c: Cover | undefined): c is ImageAsset => !!c && 'src' in c;

/** Archive index number — stable, chronological by creation date. */
const byCreated = [...projects].sort((a, b) => a.created.localeCompare(b.created));
export const indexOf = (slug: string) => String(byCreated.findIndex((p) => p.slug === slug) + 1).padStart(3, '0');

/** Related projects: explicit list first, then scored by shared disciplines/tags/software.
 *  Pass `pool` to keep suggestions inside one section. */
export function relatedTo(p: Project, n = 4, pool: Project[] = allProjects): Project[] {
  const explicit = (p.related ?? []).map(getProject).filter((x): x is Project => !!x && pool.includes(x));
  const scored = pool
    .filter((q) => q.slug !== p.slug && !explicit.includes(q))
    .map((q) => {
      let s = 0;
      disciplinesOf(q).forEach((d) => disciplinesOf(p).includes(d) && (s += 3));
      q.tags.forEach((t) => p.tags.includes(t) && (s += 2));
      (q.software ?? []).forEach((t) => p.software?.includes(t) && (s += 1));
      return { q, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.q);
  return [...explicit, ...scored].slice(0, n);
}

export function searchProjects(q: string, list = allProjects): Project[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return list;
  return list.filter((p) => {
    const hay = [p.title, p.description, p.category, ...p.tags, ...(p.software ?? []), ...(p.equipment ?? []), ...(p.techniques ?? []), ...disciplinesOf(p).map((d) => DISCIPLINES[d].label)]
      .join(' ')
      .toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

export const randomProject = (exclude?: string) => {
  const pool = allProjects.filter((p) => p.slug !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
};

/* ── Sections ──────────────────────────────────────────────────
   The site has three work sections. A project belongs to a section
   through its disciplines, so nothing has to be assigned by hand.
   ─────────────────────────────────────────────────────────────── */
export const PHOTO_DISCIPLINES: Discipline[] = ['photography', 'digital-art', 'drawing', 'design'];
export const MUSIC_DISCIPLINES: Discipline[] = ['music', 'sound'];
export const TECH_DISCIPLINES: Discipline[] = ['code', 'ai', 'security', 'creative-coding', 'research'];

export type SectionId = 'photo' | 'music' | 'tech';
export const SECTIONS: Record<SectionId, { label: string; to: string; disciplines: Discipline[] }> = {
  photo: { label: 'Photo', to: '/photo', disciplines: PHOTO_DISCIPLINES },
  music: { label: 'Music', to: '/music', disciplines: MUSIC_DISCIPLINES },
  tech: { label: 'Tech', to: '/tech', disciplines: TECH_DISCIPLINES },
};

const inAny = (p: Project, ds: Discipline[]) => disciplinesOf(p).some((d) => ds.includes(d));
export const isPhoto = (p: Project) => inAny(p, PHOTO_DISCIPLINES);
export const isMusic = (p: Project) => inAny(p, MUSIC_DISCIPLINES);
export const isTech = (p: Project) => inAny(p, TECH_DISCIPLINES);

export const photoProjects = allProjects.filter(isPhoto);
export const musicProjects = allProjects.filter((p) => p.audio);
export const techProjects = allProjects.filter(isTech);

/** Which section owns a discipline, and where its index lives. */
export function sectionFor(d: Discipline): { id: SectionId; label: string; to: string } {
  const id: SectionId = TECH_DISCIPLINES.includes(d) ? 'tech' : MUSIC_DISCIPLINES.includes(d) ? 'music' : 'photo';
  const s = SECTIONS[id];
  return { id, label: s.label, to: id === 'tech' ? `/tech?d=${d}` : s.to };
}

/** Index page a project belongs to — used for breadcrumbs and "back to" links. */
export function sectionOf(p: Project): { id: SectionId; label: string; to: string } {
  return sectionFor(p.category);
}

export const projectsInSection = (id: SectionId) =>
  id === 'photo' ? photoProjects : id === 'music' ? musicProjects : techProjects;

export const fmtDate = (iso: string, style: 'short' | 'long' | 'year' = 'short') => {
  if (!/^\d{4}-\d{2}/.test(iso)) return iso;
  const d = new Date(iso.length === 7 ? iso + '-01' : iso);
  if (style === 'year') return String(d.getFullYear());
  return style === 'long'
    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
};

export const mediaUrl = (src: string) => (src.startsWith('http') ? src : (import.meta.env.VITE_MEDIA_BASE ?? '') + src);
