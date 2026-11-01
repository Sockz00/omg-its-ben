import { useLayoutEffect, useRef } from "react";
import { ScanWords } from "./ScanWords";

/**
 * Port of the original `resizeText()` script: the largest integer font-size at which the
 * headline stays narrower than the hero and shorter than 40% (37% on mobile) of its height.
 * Uses a binary search instead of the original +1px loop – same result, far fewer reflows.
 */
function fit(h: HTMLElement) {
  const container = h.parentElement;
  if (!container) return;
  const targetWidth = container.offsetWidth;
  const ratio = window.innerWidth < 768 ? 0.37 : 0.4;
  const targetHeight = container.offsetHeight * ratio;

  const fits = (size: number) => {
    h.style.fontSize = size + "px";
    return h.scrollWidth < targetWidth && h.scrollHeight < targetHeight;
  };

  let lo = 10;
  let hi = 500;
  if (!fits(lo)) {
    h.style.fontSize = lo - 1 + "px";
    return;
  }
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  h.style.fontSize = lo + "px";
}

export function FitHeadline({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const h = ref.current;
    if (!h) return;
    let raf = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => fit(h));
    };

    fit(h);
    // re-fit once the display face is available (metrics differ from the fallback)
    document.fonts?.load('400 100px "Bugrino"').then(run, run);
    document.fonts?.ready.then(run, run);

    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    const onResize = () => {
      if (window.innerWidth === lastWidth && Math.abs(window.innerHeight - lastHeight) < 1) return;
      lastWidth = window.innerWidth;
      lastHeight = window.innerHeight;
      run();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <h1 ref={ref} className="title-h1">
      <ScanWords text={text} />
    </h1>
  );
}
