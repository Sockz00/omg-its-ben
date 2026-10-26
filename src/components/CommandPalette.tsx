import { useEffect, useMemo, useRef, useState } from 'react';
import { DISCIPLINES } from '../data/site';
import { allProjects, getProject, journalSorted, randomProject, sectionOf } from '../lib/content';
import { navigate } from '../lib/router';
import { getRecent, toggleTheme } from '../lib/store';

export const PAGES = [
  { label: 'Index', to: '/', key: 'h' },
  { label: 'Photo — photography & visual work', to: '/photo', key: 'p' },
  { label: 'Music — releases & sound', to: '/music', key: 'm' },
  { label: 'Tech — software, AI, security, hardware', to: '/tech', key: 't' },
  { label: 'Journal', to: '/journal', key: 'j' },
  { label: 'About', to: '/about', key: 'b' },
];

interface Item { id: string; group: string; label: string; hint?: string; run: () => void }

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const items = useMemo<Item[]>(() => {
    const go = (to: string) => () => { navigate(to); onClose(); };
    const recent = getRecent().map(getProject).filter(Boolean).slice(0, 4).map((p) => ({ id: `r-${p!.slug}`, group: 'Recently viewed', label: p!.title, hint: DISCIPLINES[p!.category].label, run: go(`/project/${p!.slug}`) }));
    return [
      ...(open ? recent : []),
      { id: 'a-random', group: 'Actions', label: 'Random project', hint: 'R', run: () => { navigate(`/project/${randomProject().slug}`); onClose(); } },
      { id: 'a-theme', group: 'Actions', label: 'Toggle light / dark', hint: 'T', run: () => { toggleTheme(); onClose(); } },
      { id: 'a-copy', group: 'Actions', label: 'Copy link to this page', run: () => { navigator.clipboard?.writeText(location.href); onClose(); } },
      ...PAGES.map((p) => ({ id: `p-${p.to}`, group: 'Pages', label: p.label, hint: `G ${p.key.toUpperCase()}`, run: go(p.to) })),
      ...allProjects.map((p) => ({ id: `pr-${p.slug}`, group: 'Projects', label: p.title, hint: `${sectionOf(p).label} · ${DISCIPLINES[p.category].label}`, run: go(`/project/${p.slug}`) })),
      ...journalSorted.map((j) => ({ id: `j-${j.slug}`, group: 'Journal', label: j.title, hint: j.kind, run: go(`/journal/${j.slug}`) })),
    ];
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items
      .filter((i) => i.group !== 'Recently viewed')
      .map((i) => {
        const hay = `${i.label} ${i.hint ?? ''} ${i.group}`.toLowerCase();
        const score = hay.startsWith(t) ? 3 : i.label.toLowerCase().includes(t) ? 2 : t.split(/\s+/).every((w) => hay.includes(w)) ? 1 : 0;
        return { i, score };
      })
      .filter((x) => x.score)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.i);
  }, [q, items]);

  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => input.current?.focus(), 10); } }, [open]);
  useEffect(() => setSel(0), [q]);
  useEffect(() => { list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [sel]);

  if (!open) return null;
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { setSel((s) => Math.min(filtered.length - 1, s + 1)); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { setSel((s) => Math.max(0, s - 1)); e.preventDefault(); }
    else if (e.key === 'Enter') filtered[sel]?.run();
    else if (e.key === 'Escape') onClose();
    else if (e.key === 'Tab') e.preventDefault();
  };
  let lastGroup = '';
  return (
    <div className="cmdk" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cmdk__box" onKeyDown={onKey}>
        <div className="cmdk__in">
          <span className="mono">⌘K</span>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, pages, journal…"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={filtered[sel] ? `cmdk-${filtered[sel].id}` : undefined}
          />
          <kbd className="mono">esc</kbd>
        </div>
        <ul className="cmdk__list" id="cmdk-list" role="listbox" ref={list}>
          {filtered.length === 0 && <li className="cmdk__empty mono">No results for “{q}”. Try a tool, tag or discipline.</li>}
          {filtered.map((it, idx) => {
            const head = it.group !== lastGroup ? it.group : null;
            lastGroup = it.group;
            return (
              <li key={it.id} role="presentation">
                {head && <span className="cmdk__group mono">{head}</span>}
                <div id={`cmdk-${it.id}`} role="option" aria-selected={idx === sel} className="cmdk__item" onMouseMove={() => setSel(idx)} onClick={it.run}>
                  <span className="serif">{it.label}</span>
                  {it.hint && <span className="mono">{it.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="cmdk__foot mono"><span>↑↓ move</span><span>↵ open</span><span>/ or ⌘K open</span><span>R random · T theme · G+key go</span></div>
      </div>
    </div>
  );
}
