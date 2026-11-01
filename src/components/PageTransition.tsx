import { useImperativeHandle, useRef, type Ref } from "react";
import { gsap } from "@/lib/motion";

export type TransitionHandle = {
  /** IX2 "Move Transition In": columns slide in from the left (300ms delay, 500ms). */
  cover: () => Promise<void>;
  /** IX2 "Move transition out": columns slide out to the right (300ms delay, 500ms), then hide. */
  reveal: () => Promise<void>;
};

export function PageTransition({ handleRef }: { handleRef: Ref<TransitionHandle> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRefs = useRef<HTMLDivElement[]>([]);

  useImperativeHandle(handleRef, () => ({
    cover: () =>
      new Promise<void>((resolve) => {
        const root = rootRef.current;
        const bgs = bgRefs.current;
        if (!root) return resolve();
        root.classList.remove("is-hidden");
        gsap.killTweensOf(bgs);
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
    </div>
  );
}
