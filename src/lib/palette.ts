/* Cached theme colours.
   getComputedStyle() forces a style flush — calling it inside an animation loop is
   one of the main causes of jank, so canvases read from this cache instead and it
   is refreshed only when the theme actually changes. */

export interface Palette {
  bg: string; bg2: string; bg3: string;
  ink: string; ink2: string; ink3: string;
  line: string; line2: string; accent: string; hi: string;
}

let cache: Palette | null = null;
let cachedTheme = '';

const read = () => {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return {
    bg: v('--bg'), bg2: v('--bg-2'), bg3: v('--bg-3'),
    ink: v('--ink'), ink2: v('--ink-2'), ink3: v('--ink-3'),
    line: v('--line'), line2: v('--line-2'), accent: v('--accent'), hi: v('--hi'),
  };
};

export function palette(): Palette {
  const theme = document.documentElement.dataset.theme ?? '';
  if (!cache || theme !== cachedTheme) { cachedTheme = theme; cache = read(); }
  return cache;
}

/** Call after a theme change that happened outside setTheme (e.g. system preference). */
export const invalidatePalette = () => { cache = null; };
