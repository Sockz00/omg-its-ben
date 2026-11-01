import { useEffect, useRef } from "react";
import { aboutImages } from "@/data/about";
import { Flip } from "@/lib/motion";
import { VideoBox } from "./MediaTile";

type Layout = {
  colStart: number;
  colEnd: number;
  alignment: string;
  translateY: number;
  rect: { left: number; right: number; top: number; bottom: number } | null;
};

const ROTATION: Record<string, string> = {
  "about-img_1": "10deg",
  "about-img_2": "10deg",
  "about-img_3": "-13deg",
  "about-img_4": "0deg",
};
const Z: Record<string, number> = { "about-img_1": 1, "about-img_2": 2, "about-img_3": 3, "about-img_4": 4 };

function shuffle<T>(a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Port of the original `initRandomImageSpread()`: the images sit as a small rotated
 * stack in the corner; clicking one scatters them across a 24-column grid without
 * overlapping (Flip animated) – clicking again stacks them back up.
 */
export function AboutImageStack() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const images = Array.from(container.children) as HTMLElement[];
    if (!images.length) return;

    let isSpread = false;
    const isMobile = () => window.innerWidth < 768;
    const keyOf = (img: HTMLElement) => img.dataset.key ?? "";

    function stackImages() {
      const mobile = isMobile();
      images.forEach((img) => {
        img.style.gridColumn = "23 / 25";
        img.style.gridRow = "1";
        img.style.alignSelf = mobile ? "end" : "start";
        img.style.justifySelf = "end";
        img.style.maxWidth = mobile ? "80px" : "90px";
        img.style.minWidth = mobile ? "80px" : "90px";
        img.style.margin = "10px";
        img.style.transform = `rotate(${ROTATION[keyOf(img)] ?? "0deg"})`;
        img.style.zIndex = String(Z[keyOf(img)] ?? 1);
        img.style.cursor = "pointer";
        img.style.display = "block";
      });
    }

    stackImages();

    const overlap = (a: NonNullable<Layout["rect"]>, b: NonNullable<Layout["rect"]>, margin: number) =>
      !(a.right + margin < b.left || a.left - margin > b.right || a.bottom + margin < b.top || a.top - margin > b.bottom);

    const columnWidth = () => (container.offsetWidth - 23 * 10) / 24;
    const actualLeft = (colStart: number, cw: number) => (colStart - 1) * cw + (colStart - 1) * 10;
    const actualRight = (colEnd: number, cw: number) => colEnd * cw + (colEnd - 1) * 10;

    function generateRandomLayout(): Layout[] {
      const layouts: Layout[] = [];
      const cw = columnWidth();
      const containerHeight = container!.offsetHeight;
      const maxAttempts = 150;
      const mobile = isMobile();
      const overlapMargin = mobile ? 10 : 40;

      // desktop: 3-4 columns, mobile: 8-9 columns
      const sizes = mobile ? [9, 9, 8, 8] : [4, 4, 3, 3];
      const alignments = ["start", "start", "end", "end"];
      for (let i = sizes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sizes[i], sizes[j]] = [sizes[j], sizes[i]];
        [alignments[i], alignments[j]] = [alignments[j], alignments[i]];
      }

      // mobile: one image per quadrant
      const mobileQuadrants = mobile
        ? shuffle([
            { colStart: Math.floor(Math.random() * 4) + 1, alignment: "start" },
            { colStart: Math.floor(Math.random() * 4) + 13, alignment: "start" },
            { colStart: Math.floor(Math.random() * 4) + 1, alignment: "end" },
            { colStart: Math.floor(Math.random() * 4) + 13, alignment: "end" },
          ])
        : [];

      const leftImageIndex = !mobile && images.length >= 2 ? 0 : -1;
      const rightImageIndex = !mobile && images.length >= 2 ? images.length - 1 : -1;

      images.forEach((_, index) => {
        const colSpan = sizes[index % sizes.length];
        const alignment = alignments[index % alignments.length];
        const mustBeLeft = index === leftImageIndex;
        const mustBeRight = index === rightImageIndex;

        if (mobile && index < mobileQuadrants.length) {
          const quadrant = mobileQuadrants[index];
          let colStart = quadrant.colStart;
          if (colStart + colSpan > 25) colStart = 25 - colSpan;
          const colEnd = colStart + colSpan;
          const imgHeight = cw * colSpan + (colSpan - 1) * 10;
          const maxSafe = ((containerHeight - imgHeight) / containerHeight) * 100;
          let translateY: number;
          if (quadrant.alignment === "start") {
            const minT = 5;
            const maxT = Math.min(25, maxSafe);
            translateY = Math.round((minT + Math.random() * (maxT - minT)) / 5) * 5;
          } else {
            const maxT = Math.min(20, maxSafe);
            translateY = -(Math.round((Math.random() * (maxT + 5)) / 5) * 5);
            if (Math.random() < 0.3) translateY = 0;
          }
          const top =
            quadrant.alignment === "start"
              ? (translateY / 100) * containerHeight
              : containerHeight - imgHeight + (translateY / 100) * containerHeight;
          layouts.push({
            colStart,
            colEnd,
            alignment: quadrant.alignment,
            translateY,
            rect: { left: actualLeft(colStart, cw), right: actualRight(colEnd, cw), top, bottom: top + imgHeight },
          });
          return;
        }

        // desktop: random placement with overlap detection
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < maxAttempts) {
          attempts++;
          let colStart: number;
          if (mustBeLeft) {
            colStart = Math.floor(Math.random() * 3) + 1;
          } else if (mustBeRight) {
            const maxStart = 25 - colSpan;
            const minStart = Math.max(1, maxStart - 2);
            colStart = Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart;
          } else {
            const edgeBias = Math.random();
            if (edgeBias < 0.4) {
              colStart = Math.floor(Math.random() * Math.min(8, 25 - colSpan)) + 1;
            } else if (edgeBias < 0.6) {
              const maxStart = 25 - colSpan;
              const minStart = Math.max(8, maxStart - 7);
              colStart = Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart;
            } else {
              colStart = Math.floor(Math.random() * (25 - colSpan)) + 1;
            }
          }

          const colEnd = colStart + colSpan;
          const imgHeight = cw * colSpan + (colSpan - 1) * 10;
          const maxSafe = ((containerHeight - imgHeight) / containerHeight) * 100;
          let translateY: number;
          if (alignment === "start") {
            const minT = 5;
            const maxT = Math.min(30, maxSafe);
            translateY = Math.round((minT + Math.random() * (maxT - minT)) / 5) * 5;
          } else {
            const maxT = Math.min(30, maxSafe);
            translateY = -(Math.round((Math.random() * maxT) / 5) * 5);
            if (Math.random() < 0.15) translateY = 0;
          }

          const top =
            alignment === "start"
              ? (translateY / 100) * containerHeight
              : containerHeight - imgHeight + (translateY / 100) * containerHeight;
          if (top < 0 || top + imgHeight > containerHeight) continue;

          const rect = { left: actualLeft(colStart, cw), right: actualRight(colEnd, cw), top, bottom: top + imgHeight };
          const hit = layouts.some((l) => l.rect && overlap(rect, l.rect, overlapMargin));
          if (!hit) {
            layouts.push({ colStart, colEnd, alignment, translateY, rect });
            placed = true;
          }
        }

        if (!placed) {
          let colStart: number;
          if (mustBeLeft) colStart = 1;
          else if (mustBeRight) colStart = Math.max(1, 25 - colSpan);
          else colStart = Math.max(1, Math.min(25 - colSpan, 1 + index * 6));
          const fallbackY = alignment === "start" ? Math.round((index * 10) / 5) * 5 : -(Math.round((index * 10) / 5) * 5);
          layouts.push({ colStart, colEnd: colStart + colSpan, alignment, translateY: fallbackY, rect: null });
        }
      });

      return layouts;
    }

    function spreadImages(layouts: Layout[]) {
      images.forEach((img, index) => {
        const l = layouts[index];
        img.style.gridColumn = `${l.colStart} / ${l.colEnd}`;
        img.style.gridRow = "1";
        img.style.alignSelf = l.alignment;
        img.style.justifySelf = "stretch";
        img.style.maxWidth = "none";
        img.style.margin = "0";
        img.style.transform = `translateY(${l.translateY}vh) rotate(0deg)`;
        img.style.zIndex = String(Z[keyOf(img)] ?? 1);
      });
    }

    function toggleSpread() {
      const state = Flip.getState(images);
      if (!isSpread) {
        spreadImages(generateRandomLayout());
        isSpread = true;
      } else {
        stackImages();
        isSpread = false;
      }
      Flip.from(state, { duration: 0.8, ease: "power2.inOut", absolute: true, stagger: 0.05 });
    }

    images.forEach((img) => img.addEventListener("click", toggleSpread));
    return () => images.forEach((img) => img.removeEventListener("click", toggleSpread));
  }, []);

  return (
    <div className="about-img_container" ref={containerRef}>
      {aboutImages.map((img) => (
        <div key={img.key} className={img.key} data-key={img.key}>
          <div className="image-wrapper">
            {img.type === "video" ? (
              <VideoBox id={img.src || img.id || ""} shape="square" />
            ) : (
              <img className="thumbnail square" src={img.src} alt="" loading="eager" draggable={false} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
