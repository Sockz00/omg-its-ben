import { useEffect } from "react";
import { useRouter } from "@/lib/router";

const RECT_COUNT = 4;
const MIN_INTERVAL = 800;
const MAX_INTERVAL = 1400;
const HEIGHT_REDUCTION = 30;

type Corner = { x: number; y: number };
type RectObj = {
  box: HTMLDivElement;
  label: HTMLDivElement;
  corners: { tl: Corner; tr: Corner; bl: Corner; br: Corner } | null;
};

/**
 * Easter egg from the original site: press "a" to scan random words of the
 * headline with labelled boxes connected by thin lines. Press "a" again to stop.
 */
export function WordScan() {
  const { visit } = useRouter();

  useEffect(() => {
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;display:none;";
    document.body.appendChild(overlay);

    const lineCanvas = document.createElement("canvas");
    lineCanvas.style.cssText = "position:fixed;top:0;left:0;pointer-events:none;";
    overlay.appendChild(lineCanvas);

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      lineCanvas.width = window.innerWidth * dpr;
      lineCanvas.height = window.innerHeight * dpr;
      lineCanvas.style.width = window.innerWidth + "px";
      lineCanvas.style.height = window.innerHeight + "px";
      lineCanvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const getSpans = () => {
      const h1 = document.querySelector("h1");
      return h1 ? Array.from(h1.querySelectorAll<HTMLElement>(".mk-scan-word")) : [];
    };

    const makeRectEl = (): RectObj => {
      const box = document.createElement("div");
      box.style.cssText =
        "position:fixed;background:rgba(0,0,0,0.3);border:1px solid #000;pointer-events:none;display:none;box-sizing:border-box;";
      const label = document.createElement("div");
      label.style.cssText = [
        "position:fixed",
        "font-size:11px",
        'font-family:"Neue Montreal",Arial,sans-serif',
        "color:#000",
        "white-space:nowrap",
        "pointer-events:none",
        "display:none",
        "line-height:1",
      ].join(";");
      overlay.appendChild(box);
      overlay.appendChild(label);
      return { box, label, corners: null };
    };

    const assignRect = (ro: RectObj, span: HTMLElement) => {
      const r = span.getBoundingClientRect();
      const half = HEIGHT_REDUCTION / 2;
      const top = r.top + half;
      const left = r.left;
      const width = r.width;
      const height = Math.max(4, r.height - HEIGHT_REDUCTION);

      ro.box.style.left = left + "px";
      ro.box.style.top = top + "px";
      ro.box.style.width = width + "px";
      ro.box.style.height = height + "px";
      ro.box.style.display = "block";

      ro.label.textContent = span.dataset.word || span.textContent?.replace(/[.,!?]/g, "").trim() || "";
      ro.label.style.left = left + "px";
      ro.label.style.top = top - 13 + "px";
      ro.label.style.display = "block";

      ro.corners = {
        tl: { x: left, y: top },
        tr: { x: left + width, y: top },
        bl: { x: left, y: top + height },
        br: { x: left + width, y: top + height },
      };
    };

    const hideRect = (ro: RectObj) => {
      ro.box.style.display = "none";
      ro.label.style.display = "none";
      ro.corners = null;
    };

    const drawLines = (rects: RectObj[]) => {
      resizeCanvas();
      const ctx = lineCanvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 1;
      ctx.lineCap = "butt";
      ctx.lineJoin = "miter";

      const visible = rects.filter((ro) => ro.corners !== null);
      for (let i = 0; i < visible.length; i++) {
        const a = visible[i].corners!;
        const b = visible[(i + 1) % visible.length].corners!;
        let minDist = Infinity;
        let best: { ca: Corner; cb: Corner } | null = null;
        Object.values(a).forEach((ca) =>
          Object.values(b).forEach((cb) => {
            const d = Math.hypot(ca.x - cb.x, ca.y - cb.y);
            if (d < minDist) {
              minDist = d;
              best = { ca, cb };
            }
          }),
        );
        if (best) {
          const { ca, cb } = best as { ca: Corner; cb: Corner };
          ctx.beginPath();
          ctx.moveTo(ca.x, ca.y);
          ctx.lineTo(cb.x, cb.y);
          ctx.stroke();
        }
      }
    };

    let active = false;
    let rectObjs: RectObj[] = [];
    let timers: number[] = [];

    const startScan = () => {
      const spans = getSpans();
      if (!spans.length) return;
      active = true;
      overlay.style.display = "block";
      resizeCanvas();

      rectObjs = Array.from({ length: RECT_COUNT }, makeRectEl);
      const pool = spans.slice().sort(() => Math.random() - 0.5);
      rectObjs.forEach((ro, idx) => assignRect(ro, pool[idx % pool.length]));
      drawLines(rectObjs);

      rectObjs.forEach((ro) => {
        const cycle = () => {
          const s = spans[Math.floor(Math.random() * spans.length)];
          hideRect(ro);
          assignRect(ro, s);
          drawLines(rectObjs);
          timers.push(window.setTimeout(cycle, MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL)));
        };
        timers.push(window.setTimeout(cycle, MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL)));
      });
    };

    const stopScan = () => {
      active = false;
      timers.forEach(clearTimeout);
      timers = [];
      rectObjs.forEach((ro) => {
        ro.box.remove();
        ro.label.remove();
      });
      rectObjs = [];
      lineCanvas.getContext("2d")?.clearRect(0, 0, window.innerWidth, window.innerHeight);
      overlay.style.display = "none";
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "a" || e.key === "A") {
        if (active) stopScan();
        else startScan();
      }
    };

    const onResize = () => {
      if (!active) return;
      const spans = getSpans();
      if (!spans.length) return;
      rectObjs.forEach((ro) => {
        if (ro.corners) assignRect(ro, spans[Math.floor(Math.random() * spans.length)]);
      });
      drawLines(rectObjs);
    };

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      stopScan();
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      overlay.remove();
    };
  }, [visit]);

  return null;
}
