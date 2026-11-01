import { useEffect, useRef, useState } from "react";

// NOTE: this is the only remaining reference to the original owner's name – it is the
// live asset hosting the background ASCII renderer. Point it at your own host (or an
// /assets/ascii-animation folder) to remove it completely.
const ASCII_URL = "https://maximiliankaspar.github.io/ascii-animation/";

/** 12-column helper grid, toggled with shift + g (easter egg from the original). */
export function GridOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        ref.current?.classList.toggle("is-visible");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="gridlayout-invisible" ref={ref} aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="gridlayout-column" />
      ))}
    </div>
  );
}

/** 10px pixel grid at 4% opacity – line count is generated from the viewport like the original script. */
function PixelGrid() {
  const [counts, setCounts] = useState({ h: 4, v: 4 });

  useEffect(() => {
    const gap = 10;
    const lineWidth = 0.1;
    const compute = () =>
      setCounts({
        h: Math.floor((window.innerWidth + gap) / (lineWidth + gap)),
        v: Math.floor((window.innerHeight + gap) / (lineWidth + gap)),
      });
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div className="background_pixelgrid" aria-hidden="true">
      <div className="bg-flex_vertical">
        {Array.from({ length: counts.v }, (_, i) => (
          <div key={i} className="line_vertical" />
        ))}
      </div>
      <div className="bg-flex_horizontal">
        {Array.from({ length: counts.h }, (_, i) => (
          <div key={i} className="line_horizontal" />
        ))}
      </div>
    </div>
  );
}

/** three.js ascii renderer, lazily injected after 1s like the original embed. */
function AsciiAnimation() {
  const [src, setSrc] = useState("about:blank");

  useEffect(() => {
    const t = window.setTimeout(() => setSrc(ASCII_URL), 1000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="ascii-animation" aria-hidden="true">
      <iframe src={src} title="ascii animation" loading="lazy" tabIndex={-1} />
    </div>
  );
}

export function Background() {
  return (
    <>
      <div className="background-gridlines" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="grid-line" />
        ))}
      </div>
      <PixelGrid />
      <AsciiAnimation />
    </>
  );
}
