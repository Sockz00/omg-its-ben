import { projects } from '../data/projects';
import { DISCIPLINES, journal } from '../data/site';
import type { Cover, Discipline, GenerativeCover, ImageAsset, Project } from '../data/types';

export const byDateDesc = (a: Project, b: Project) => b.published.localeCompare(a.published);

export const allProjects = [...projects].sort(byDateDesc);
export const projectMap = new Map(allProjects.map((p) => [p.slug, p]));
export const getProject = (slug: string) => projectMap.get(slug);
export const getJournal = (slug: string) => journal.find((j) => j.slug === slug);
export const journalSorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));

export const disciplinesOf = (p: Project): Discipline[] => Array.from(new Set([p.category, ...(p.disciplines ?? [])]));
export const allTags = Array.from(new Set(allProjects.flatMap((p) => p.tags))).sort();
export const usedDisciplines = (Object.keys(DISCIPLINES) as Discipline[]).filter((d) => allProjects.some((p) => disciplinesOf(p).includes(d)));
export const countFor = (d: Discipline) => allProjects.filter((p) => disciplinesOf(p).includes(d)).length;

export const isImage = (c: Cover | undefined): c is ImageAsset => !!c && 'src' in c;
export const isGenerative = (c: Cover | undefined): c is GenerativeCover => !!c && 'generative' in c;

/** Archive index number — stable, chronological by creation date. */
const byCreated = [...projects].sort((a, b) => a.created.localeCompare(b.created));
export const indexOf = (slug: string) => String(byCreated.findIndex((p) => p.slug === slug) + 1).padStart(3, '0');

/** Related projects: explicit list first, then scored by shared disciplines/tags/software. */
export function relatedTo(p: Project, n = 4): Project[] {
  const explicit = (p.related ?? []).map(getProject).filter(Boolean) as Project[];
  const scored = allProjects
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

/* ── Relationship graph ── */
export type NodeKind = 'project' | 'discipline' | 'software' | 'equipment' | 'technique' | 'tag';
export interface GNode { id: string; label: string; kind: NodeKind; href?: string; weight: number }
export interface GEdge { a: string; b: string }

export function buildGraph(opts: { include?: NodeKind[] } = {}) {
  const include = new Set<NodeKind>(opts.include ?? ['project', 'discipline', 'software', 'equipment', 'technique']);
  const nodes = new Map<string, GNode>();
  const edges: GEdge[] = [];
  const add = (id: string, label: string, kind: NodeKind, href?: string) => {
    const n = nodes.get(id);
    if (n) n.weight++;
    else nodes.set(id, { id, label, kind, href, weight: 1 });
  };
  for (const p of allProjects) {
    const pid = `p:${p.slug}`;
    add(pid, p.title, 'project', `#/project/${p.slug}`);
    const link = (id: string, label: string, kind: NodeKind) => {
      if (!include.has(kind)) return;
      add(id, label, kind);
      edges.push({ a: pid, b: id });
    };
    disciplinesOf(p).forEach((d) => link(`d:${d}`, DISCIPLINES[d].label, 'discipline'));
    (p.software ?? []).forEach((s) => link(`s:${s}`, s, 'software'));
    (p.equipment ?? []).forEach((s) => link(`e:${s}`, s.replace(/\s*\[EDIT\]/, ''), 'equipment'));
    (p.techniques ?? []).forEach((s) => link(`t:${s}`, s, 'technique'));
    if (include.has('tag')) p.tags.forEach((s) => link(`g:${s}`, `#${s}`, 'tag'));
  }
  return { nodes: [...nodes.values()], edges };
}

export const fmtDate = (iso: string, style: 'short' | 'long' | 'year' = 'short') => {
  if (!/^\d{4}-\d{2}/.test(iso)) return iso;
  const d = new Date(iso.length === 7 ? iso + '-01' : iso);
  if (style === 'year') return String(d.getFullYear());
  return style === 'long'
    ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
};

export const mediaUrl = (src: string) => (src.startsWith('http') ? src : (import.meta.env.VITE_MEDIA_BASE ?? '') + src);
