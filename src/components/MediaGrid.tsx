import { useLayoutEffect, useRef } from "react";
import type { Media } from "@/data/content";
import { Flip, getLenis, gsap, prefersReducedMotion } from "@/lib/motion";
import { MediaTile } from "./MediaTile";

type Props = {
  items: Media[];
  columns?: 4 | 6;
  sizes: string;
  className: string;
  imageGridClassName: string;
};

/**
 * Port of the original layout grid:
 *  - items slide up (y: 80 → 0) with a random delay once their top passes 115% of the viewport
 *  - clicking an item toggles `.is--active` (double width) and animates the reflow with GSAP Flip
 */
export function MediaGrid({ items, columns = 4, sizes, className, imageGridClassName }: Props) {
  const groupRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const group = groupRef.current;
    const collection = collectionRef.current;
    const list = listRef.current;
    if (!group || !collection || !list) return;
    const els = Array.from(list.querySelectorAll<HTMLElement>("[data-layout-grid-item]"));

    /* ---------- staggered reveal ---------- */
    let running = 0;
    let enableTimer = 0;
    const disableClicks = () => (list.style.pointerEvents = "none");
    const enableClicks = () => {
      window.clearTimeout(enableTimer);
      enableTimer = window.setTimeout(() => {
        if (running === 0) list.style.pointerEvents = "auto";
      }, 100);
    };

    gsap.set(els, { y: 80, opacity: 0 });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          if (el.hasAttribute("data-animated")) return;
          el.setAttribute("data-animated", "true");
          running++;
          disableClicks();
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.inOut",
            delay: Math.random() * 0.3,
            overwrite: "auto",
            onComplete: () => {
              running--;
              enableClicks();
            },
          });
        });
      },
      // equivalent of ScrollTrigger start: "top 115%"
      { rootMargin: "0px 0px 15% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));

    /* ---------- click to enlarge (Flip) ---------- */
    let activeTween: gsap.core.Timeline | null = null;

    const handlers = els.map((item) => {
      const onClick = () => {
        const isCurrentlyActive = item.classList.contains("is--active");
        if (activeTween) {
          activeTween.kill();
          activeTween = null;
        }

        if (prefersReducedMotion()) {
          item.classList.toggle("is--active");
          getLenis()?.resize();
          return;
        }

        const state = Flip.getState(els, { simple: true });
        const prevHeight = collection.offsetHeight;
        item.classList.toggle("is--active");
        const nextHeight = collection.offsetHeight;
        gsap.set(collection, { height: prevHeight });

        const tl = gsap.timeline({
          onStart: () => group.setAttribute("data-transitioning", "true"),
          onInterrupt: () => {
            group.removeAttribute("data-transitioning");
            gsap.set(collection, { clearProps: "height" });
          },
          onComplete: () => {
            group.removeAttribute("data-transitioning");
            gsap.set(collection, { clearProps: "height" });
            getLenis()?.resize();
            activeTween = null;
          },
        });

        tl.add(
          Flip.from(state, {
            duration: 0.65,
            ease: "power2.inOut",
            absolute: true,
            nested: true,
            prune: true,
          }),
          0,
        );

        if (isCurrentlyActive) {
          tl.to(collection, { height: nextHeight, duration: 0.4, ease: "power2.inOut" }, 0.45);
        } else {
          tl.to(collection, { height: nextHeight, duration: 0.65, ease: "power2.inOut" }, 0);
        }
        activeTween = tl;
      };
      const onDbl = (e: Event) => e.preventDefault();
      item.addEventListener("click", onClick);
      item.addEventListener("dblclick", onDbl);
      return () => {
        item.removeEventListener("click", onClick);
        item.removeEventListener("dblclick", onDbl);
      };
    });

    return () => {
      io.disconnect();
      window.clearTimeout(enableTimer);
      handlers.forEach((off) => off());
      activeTween?.kill();
      gsap.killTweensOf(els);
      gsap.set(els, { clearProps: "all" });
      gsap.set(collection, { clearProps: "height" });
      els.forEach((el) => {
        el.removeAttribute("data-animated");
        el.classList.remove("is--active");
      });
      list.style.pointerEvents = "";
    };
  }, [items]);

  return (
    <div className={className} data-layout-group="" data-layout-status="large" ref={groupRef}>
      <div className={imageGridClassName} data-layout-grid="" data-columns={columns}>
        <div className="layout-grid_collection" data-layout-grid-collection="" ref={collectionRef}>
          <div className="layout-grid_list" data-layout-grid-list="" data-gsap="stagger-container" ref={listRef}>
            {items.map((m) => (
              <MediaTile key={m.name + (m.type === "image" ? m.file : m.id)} media={m} sizes={sizes} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
