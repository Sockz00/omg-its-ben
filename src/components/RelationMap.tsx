import { useEffect, useMemo, useRef, useState } from 'react';
import { buildGraph, type GNode, type NodeKind } from '../lib/content';
import { navigate } from '../lib/router';
import { useReducedMotion, useTheme } from '../lib/store';

const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const KIND_LABEL: Record<NodeKind, string> = { project: 'Projects', discipline: 'Disciplines', software: 'Software', equipment: 'Equipment', technique: 'Techniques', tag: 'Tags' };

interface SimNode extends GNode { x: number; y: number; vx: number; vy: number; r: number; fixed?: boolean }

export function RelationMap({ kinds = ['project', 'discipline', 'software', 'equipment', 'technique'] as NodeKind[], height = 640, title = 'Relationship map' }: { kinds?: NodeKind[]; height?: number; title?: string }) {
  const [on, setOn] = useState<Set<NodeKind>>(new Set(kinds));
  const graph = useMemo(() => buildGraph({ include: [...on] }), [on]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const theme = useTheme();
  const reduced = useReducedMotion();
  const sim = useRef<{ nodes: SimNode[]; idx: Map<string, SimNode>; adj: Map<string, Set<string>>; drag: SimNode | null; alpha: number; view: { s: number } }>(null as never);

  const adj = useMemo(() => {
    const m = new Map<string, Set<string>>();
    graph.nodes.forEach((n) => m.set(n.id, new Set()));
    graph.edges.forEach((e) => { m.get(e.a)!.add(e.b); m.get(e.b)!.add(e.a); });
    return m;
  }, [graph]);

  useEffect(() => {
    const c = canvas.current!;
    const w = c.clientWidth, h = c.clientHeight;
    const prev = sim.current?.idx;
    const nodes: SimNode[] = graph.nodes.map((n, i) => {
      const p = prev?.get(n.id);
      const a = (i / graph.nodes.length) * Math.PI * 2;
      return { ...n, x: p?.x ?? w / 2 + Math.cos(a) * w * 0.3, y: p?.y ?? h / 2 + Math.sin(a) * h * 0.3, vx: 0, vy: 0, r: n.kind === 'project' ? 7 : n.kind === 'discipline' ? 5 + n.weight * 0.9 : 3 + Math.min(4, n.weight) };
    });
    sim.current = { nodes, idx: new Map(nodes.map((n) => [n.id, n])), adj, drag: null, alpha: 1, view: { s: 1 } };
  }, [graph, adj]);

  useEffect(() => {
    const c = canvas.current!;
    const g = c.getContext('2d')!;
    let raf = 0;
    const tick = () => {
      const S = sim.current;
      if (!S) return;
      const dpr = Math.min(2, devicePixelRatio);
      const w = c.clientWidth, h = c.clientHeight;
      if (c.width !== w * dpr) { c.width = w * dpr; c.height = h * dpr; }
      // physics
      if (S.alpha > 0.005) {
        const ns = S.nodes;
        for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
          const a = ns[i], b = ns[j];
          let dx = b.x - a.x, dy = b.y - a.y; const d2 = dx * dx + dy * dy + 0.01; const d = Math.sqrt(d2);
          const f = (Math.min(w, h) * 9) / d2; dx /= d; dy /= d;
          a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
        }
        graph.edges.forEach((e) => {
          const a = S.idx.get(e.a)!, b = S.idx.get(e.b)!;
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
          const target = a.kind === 'project' && b.kind === 'discipline' ? 70 : 52;
          const f = (d - target) * 0.012;
          a.vx += (dx / d) * f; a.vy += (dy / d) * f; b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
        });
        ns.forEach((n) => {
          n.vx += (w / 2 - n.x) * 0.0016; n.vy += (h / 2 - n.y) * 0.0024;
          if (n === S.drag) return;
          n.vx *= 0.82; n.vy *= 0.82;
          n.x += n.vx * S.alpha; n.y += n.vy * S.alpha;
          n.x = Math.max(20, Math.min(w - 20, n.x)); n.y = Math.max(20, Math.min(h - 20, n.y));
        });
        S.alpha *= reduced ? 0.9 : 0.994;
      }
      // draw
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const ink = cssVar('--ink'), mute = cssVar('--ink-3'), line = cssVar('--line-2'), acc = cssVar('--accent');
      const act = hover ?? focus;
      const nb = act ? S.adj.get(act) : null;
      graph.edges.forEach((e) => {
        const a = S.idx.get(e.a)!, b = S.idx.get(e.b)!;
        const hot = act && (e.a === act || e.b === act);
        g.strokeStyle = hot ? acc : line; g.globalAlpha = act && !hot ? 0.25 : 1; g.lineWidth = hot ? 1.4 : 0.8;
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      });
      g.globalAlpha = 1;
      g.font = '10px "JetBrains Mono", monospace';
      S.nodes.forEach((n) => {
        const dim = act && n.id !== act && !nb?.has(n.id);
        g.globalAlpha = dim ? 0.18 : 1;
        if (n.kind === 'project') { g.fillStyle = n.id === act ? acc : ink; g.fillRect(n.x - n.r / 2 - 1, n.y - n.r / 2 - 1, n.r + 2, n.r + 2); }
        else if (n.kind === 'discipline') { g.strokeStyle = n.id === act ? acc : ink; g.lineWidth = 1.5; g.beginPath(); g.arc(n.x, n.y, n.r, 0, 7); g.stroke(); }
        else { g.fillStyle = n.id === act ? acc : mute; g.beginPath(); g.arc(n.x, n.y, n.r * 0.6, 0, 7); g.fill(); }
        const showLabel = n.kind !== 'project' || n.id === act || nb?.has(n.id) || !act;
        if (showLabel && (n.kind === 'discipline' || n.kind === 'project' || n.id === act || nb?.has(n.id))) {
          g.fillStyle = n.kind === 'discipline' ? ink : mute;
          g.font = n.kind === 'discipline' ? '600 11px "Archivo", sans-serif' : n.kind === 'project' ? 'italic 13px "Instrument Serif", serif' : '10px "JetBrains Mono", monospace';
          g.fillText(n.kind === 'discipline' ? n.label.toUpperCase() : n.label, n.x + n.r + 4, n.y + 3);
        }
      });
      g.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [graph, hover, focus, theme, reduced]);

  const pick = (e: { clientX: number; clientY: number }) => {
    const r = canvas.current!.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    let best: SimNode | null = null, bd = 18 * 18;
    sim.current.nodes.forEach((n) => { const d = (n.x - x) ** 2 + (n.y - y) ** 2; if (d < bd) { bd = d; best = n; } });
    return { node: best as SimNode | null, x, y };
  };

  const focused = focus ? sim.current?.idx.get(focus) ?? graph.nodes.find((n) => n.id === focus) : null;
  const neighbours = focus ? [...(adj.get(focus) ?? [])].map((id) => graph.nodes.find((n) => n.id === id)!).filter(Boolean) : [];
  const disciplines = graph.nodes.filter((n) => n.kind === 'discipline');
  const down = useRef<{ x: number; y: number } | null>(null);

  return (
    <div className="rmap">
      <div className="rmap__legend mono" role="group" aria-label="Node types">
        {(Object.keys(KIND_LABEL) as NodeKind[]).filter((k) => kinds.includes(k) || k === 'tag').map((k) => (
          <button type="button" key={k} aria-pressed={on.has(k)} disabled={k === 'project'} onClick={() => { const n = new Set(on); n.has(k) ? n.delete(k) : n.add(k); setOn(n); setFocus(null); }}>
            <i className={`rmap__k rmap__k--${k}`} />{KIND_LABEL[k]}
          </button>
        ))}
        <span className="rmap__count">{graph.nodes.length} nodes · {graph.edges.length} links</span>
      </div>
      <div className="rmap__body">
        <canvas
          ref={canvas}
          className="rmap__canvas"
          style={{ height }}
          aria-label={`${title}: interactive graph. Use the panel to explore with a keyboard.`}
          onPointerMove={(e) => {
            const S = sim.current;
            if (S.drag) { const { x, y } = pick(e); S.drag.x = x; S.drag.y = y; S.alpha = Math.max(S.alpha, 0.3); return; }
            const { node } = pick(e); setHover(node?.id ?? null);
            canvas.current!.style.cursor = node ? 'pointer' : 'default';
          }}
          onPointerDown={(e) => { const { node, x, y } = pick(e); down.current = { x, y }; if (node) { sim.current.drag = node; (e.target as HTMLElement).setPointerCapture(e.pointerId); } }}
          onPointerUp={(e) => {
            const S = sim.current; const n = S.drag; S.drag = null;
            const { x, y } = pick(e);
            const moved = down.current ? Math.hypot(x - down.current.x, y - down.current.y) > 5 : true;
            if (!moved) { if (n) setFocus(n.id === focus ? null : n.id); else setFocus(null); }
          }}
          onPointerLeave={() => setHover(null)}
          onDoubleClick={(e) => { const { node } = pick(e); if (node?.href) navigate(node.href); }}
        />
        <aside className="rmap__panel">
          {focused ? (
            <>
              <span className="mono rmap__kind">{KIND_LABEL[focused.kind].replace(/s$/, '')}</span>
              <h3 className="serif">{focused.label}</h3>
              {focused.href && <a className="btn" href={focused.href}>Open project →</a>}
              <p className="mono rmap__sub">Connected to {neighbours.length}</p>
              <ul className="rmap__list">
                {neighbours.sort((a, b) => a.kind.localeCompare(b.kind)).map((n) => (
                  <li key={n.id}><button type="button" onClick={() => setFocus(n.id)} onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}><i className={`rmap__k rmap__k--${n.kind}`} />{n.label}</button></li>
                ))}
              </ul>
              <button type="button" className="mono rmap__clear" onClick={() => setFocus(null)}>Clear selection</button>
            </>
          ) : (
            <>
              <span className="mono rmap__kind">How to read</span>
              <p className="rmap__help">Squares are projects, rings are disciplines, dots are tools and techniques. Click any node to trace its connections; double-click a project to open it; drag to rearrange.</p>
              <p className="mono rmap__sub">Start from a discipline</p>
              <ul className="rmap__list">
                {disciplines.map((n) => <li key={n.id}><button type="button" onClick={() => setFocus(n.id)}><i className="rmap__k rmap__k--discipline" />{n.label}<span>{n.weight}</span></button></li>)}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
