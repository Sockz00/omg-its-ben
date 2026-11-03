import { useImperativeHandle, useRef, type Ref } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { waveRadius } from "@/lib/wave";

export type TransitionHandle = {
  /** IX2 "Move Transition In": columns slide in from the left (300ms delay, 500ms). */
  cover: (origin?: { x: number; y: number }) => Promise<void>;
  /** IX2 "Move transition out": columns slide out to the right (300ms delay, 500ms), then hide. */
  reveal: () => Promise<void>;
};

export function PageTransition({ handleRef }: { handleRef: Ref<TransitionHandle> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRefs = useRef<HTMLDivElement[]>([]);
  const waveRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(handleRef, () => ({
    cover: (origin) =>
      new Promise<void>((resolve) => {
        const root = rootRef.current;
        const bgs = bgRefs.current;
        if (!root) return resolve();
        root.classList.remove("is-hidden");
        gsap.killTweensOf(bgs);
        if (origin && waveRef.current) {
          const wave = waveRef.current;
          const radius = waveRadius(origin.x, origin.y, window.innerWidth, window.innerHeight) + 1;
          gsap.set(bgs, { xPercent: -100 });
          gsap.set(wave, { display: "block", clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` });
          gsap.to(wave, {
            clipPath: `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
            duration: prefersReducedMotion() ? 0 : 0.8,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.set(bgs, { xPercent: 0 });
              gsap.set(wave, { display: "none" });
              resolve();
            },
          });
          return;
        }
        gsap.set(bgs, { xPercent: -100 });
        gsap.to(bgs, {
          xPercent: 0,
          duration: 0.5,
          delay: 0.3,
          ease: "wfEaseInOut",
          onComplete: () => resolve(),
        });
      }),
    reveal: () =>
      new Promise<void>((resolve) => {
        const root = rootRef.current;
        const bgs = bgRefs.current;
        if (!root) return resolve();
        root.classList.remove("is-hidden");
        // the overlay is now painted black, so the static boot cover from index.html can go
        document.getElementById("boot-cover")?.remove();
        gsap.killTweensOf(bgs);
        gsap.to(bgs, {
          xPercent: 100,
          duration: 0.5,
          delay: 0.3,
          ease: "wfEaseInOut",
          onComplete: () => {
            root.classList.add("is-hidden");
            resolve();
          },
        });
      }),
  }));

  return (
    <div className="page-transition" ref={rootRef} aria-hidden="true">
      <div className="transition_column-container">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`transition_column column_${n}`}>
            <div
              className="transition_column-background"
              ref={(el) => {
                if (el) bgRefs.current[n - 1] = el;
              }}
            />
          </div>
        ))}
      </div>
      <div className="transition-wave" ref={waveRef} />
    </div>
  );
}
