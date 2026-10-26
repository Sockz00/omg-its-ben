/* Motion helpers — everything pointer/scroll driven is batched to one write per frame. */

export function rafThrottle<A extends unknown[]>(fn: (...args: A) => void) {
  let queued = false;
  let last: A;
  return (...args: A) => {
    last = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(...last); });
  };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/** Eases `current` toward `target` each frame; calls `onSettle` when close enough. */
export function easeTo(current: number, target: number, step = 0.14, epsilon = 0.4) {
  const next = lerp(current, target, step);
  return { value: next, settled: Math.abs(target - next) < epsilon };
}

/** Scroll progress 0→1 of an element travelling through the viewport. */
export function scrollProgress(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const total = r.height - window.innerHeight;
  if (total <= 0) return r.top < 0 ? 1 : 0;
  return clamp(-r.top / total, 0, 1);
}
