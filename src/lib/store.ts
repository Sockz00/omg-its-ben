import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

/* ── Theme (persisted) ── */
export type Theme = 'dark' | 'light';
const THEME_KEY = 'oib:theme';
const themeListeners = new Set<() => void>();

export const getTheme = (): Theme => (document.documentElement.dataset.theme as Theme) || 'dark';
export const setTheme = (t: Theme) => {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(THEME_KEY, t); } catch { /* private mode */ }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0e0e0c' : '#ece8de');
  themeListeners.forEach((l) => l());
};
export const toggleTheme = () => setTheme(getTheme() === 'dark' ? 'light' : 'dark');
export const useTheme = () =>
  useSyncExternalStore((cb) => { themeListeners.add(cb); return () => themeListeners.delete(cb); }, getTheme);

/* ── Recently viewed (persisted) ── */
const RECENT_KEY = 'oib:recent';
export const getRecent = (): string[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
};
export const pushRecent = (slug: string) => {
  const list = [slug, ...getRecent().filter((s) => s !== slug)].slice(0, 8);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch { /* ignore */ }
};

/* ── Generic persisted state ── */
export function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : initial; } catch { return initial; }
  });
  const set = useCallback((nv: T) => { setV(nv); try { localStorage.setItem(key, JSON.stringify(nv)); } catch { /* ignore */ } }, [key]);
  return [v, set] as const;
}

/* ── Reduced motion ── */
export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function useReducedMotion() {
  const [r, setR] = useState(prefersReducedMotion);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setR(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return r;
}

/* ── Seeded RNG + value noise (used by covers, hero and experiments) ── */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function makeNoise(seed = 1) {
  const r = mulberry32(seed);
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i).sort(() => r() - 0.5);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grad = (h: number, x: number, y: number) => ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x: number, y: number) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = fade(x), v = fade(y);
    const A = perm[X] + Y, B = perm[X + 1] + Y;
    const l1 = grad(perm[A], x, y) + u * (grad(perm[B], x - 1, y) - grad(perm[A], x, y));
    const l2 = grad(perm[A + 1], x, y - 1) + u * (grad(perm[B + 1], x - 1, y - 1) - grad(perm[A + 1], x, y - 1));
    return l1 + v * (l2 - l1); // ~ -1..1
  };
}

/* ── Page meta (title, description, canonical, OG) ── */
export function setMeta(title: string, description: string, path: string, image = '/images/og.jpg') {
  const full = title ? `${title} — OMG, IT'S BEN` : "OMG, IT'S BEN — a multidisciplinary archive";
  document.title = full;
  const set = (sel: string, attr: string, val: string) => document.querySelector(sel)?.setAttribute(attr, val);
  set('meta[name="description"]', 'content', description);
  set('meta[property="og:title"]', 'content', full);
  set('meta[property="og:description"]', 'content', description);
  set('meta[property="og:image"]', 'content', new URL(image, location.origin).href);
  set('meta[name="twitter:title"]', 'content', full);
  set('meta[name="twitter:description"]', 'content', description);
  const base = location.origin + location.pathname;
  set('link[rel="canonical"]', 'href', path === '/' ? base : `${base}#${path}`);
  set('meta[property="og:url"]', 'content', path === '/' ? base : `${base}#${path}`);
}
