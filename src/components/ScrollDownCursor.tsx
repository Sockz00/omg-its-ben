import { useEffect, useRef, useState } from "react";
import { NAVIGATE_START_EVENT } from "@/lib/router";

const TEXT = "scroll down";
const STEP = 30; // ms per letter

/**
 * The "scroll down" label that types itself next to the cursor, follows it with easing,
 * deletes itself while hovering the navbar and disappears for good after scrolling 2%.
 */
export function ScrollDownCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const letters = Array.from(el.querySelectorAll<HTMLSpanElement>("span"));
    const navbar = document.querySelector<HTMLElement>(".navbar");

    let hasScrolled = false;
    let hasInitialized = false;
    let initializing = false;
    let isAnimating = false;
    let isOverNavbar = false;
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    const place = () => {
      el.style.left = currentX + 15 + "px";
      el.style.top = currentY - 20 + "px";
    };
    const typeIn = () => letters.forEach((l, i) => later(() => (l.style.opacity = "1"), i * STEP));
    const typeOut = () =>
      letters.forEach((l, i) => later(() => (l.style.opacity = "0"), (letters.length - 1 - i) * STEP));

    const overNavbar = (x: number, y: number) => {
      if (!navbar) return false;
      const r = navbar.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (hasInitialized || hasScrolled) return;
      if (overNavbar(mouseX, mouseY)) return;
      // snap to the pointer while the label types itself in
      currentX = mouseX;
      currentY = mouseY;
      place();
      if (!initializing) {
        initializing = true;
        el.style.opacity = "0.5";
        typeIn();
        later(() => {
          hasInitialized = true;
          sync();
        }, letters.length * STEP);
      }
    };

    const tick = () => {
      if (hasScrolled) return;
      if (hasInitialized) {
        const ease = 0.05;
        currentX += (mouseX - currentX) * ease;
        currentY += (mouseY - currentY) * ease;
        place();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const animate = (fn: () => void, then: () => void) => {
      isAnimating = true;
      fn();
      later(() => {
        isAnimating = false;
        then();
      }, letters.length * STEP);
    };

    // keep the label in sync with the hover state, even if it changed mid-animation
    const sync = () => {
      if (hasScrolled || !hasInitialized || isAnimating) return;
      const visible = letters[0]?.style.opacity === "1";
      if (isOverNavbar && visible) animate(typeOut, sync);
      else if (!isOverNavbar && !visible) animate(typeIn, sync);
    };

    const onNavEnter = () => {
      isOverNavbar = true;
      sync();
    };
    const onNavLeave = () => {
      isOverNavbar = false;
      sync();
    };

    const hideInstant = () => {
      if (hasScrolled || !hasInitialized) return;
      letters.forEach((l) => (l.style.opacity = "0"));
      el.style.opacity = "0";
      hasScrolled = true; // a navigation is about to happen – stop following
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (pct > 2 && !hasScrolled) {
        hasScrolled = true;
        typeOut();
        later(() => setRemoved(true), letters.length * STEP + 200);
      }
    };

    document.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(NAVIGATE_START_EVENT, hideInstant);
    navbar?.addEventListener("mouseenter", onNavEnter);
    navbar?.addEventListener("mouseleave", onNavLeave);
    navbar?.addEventListener("pointerdown", hideInstant, { capture: true });
    navbar?.addEventListener("click", hideInstant, { capture: true });
    navbar?.addEventListener("focusin", hideInstant, { capture: true });

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(NAVIGATE_START_EVENT, hideInstant);
      navbar?.removeEventListener("mouseenter", onNavEnter);
      navbar?.removeEventListener("mouseleave", onNavLeave);
      navbar?.removeEventListener("pointerdown", hideInstant, { capture: true });
      navbar?.removeEventListener("click", hideInstant, { capture: true });
      navbar?.removeEventListener("focusin", hideInstant, { capture: true });
    };
  }, []);

  if (removed) return null;

  return (
    <div ref={ref} className="scroll-down-tag" aria-hidden="true">
      {TEXT.split("").map((char, i) => (
        <span key={i} style={{ display: "inline-block", opacity: 0 }}>
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </div>
  );
}
