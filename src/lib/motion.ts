import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import Lenis from "lenis";

gsap.registerPlugin(Flip, CustomEase);

/* Exact equivalents of the Webflow IX2 easing curves used on the original site */
CustomEase.create("wfEase", "0.25,0.1,0.25,1"); // css "ease" (IX2 default)
CustomEase.create("wfEaseInOut", "0.42,0,0.58,1"); // IX2 "easeInOut"
// IX2 "outQuart" === gsap "power3.out"

export { gsap, Flip };

let lenis: Lenis | null = null;

export function initLenis() {
  if (!lenis) lenis = new Lenis({ autoRaf: true });
  return lenis;
}

export function destroyLenis() {
  lenis?.destroy();
  lenis = null;
}

export function getLenis() {
  return lenis;
}

export function lockScroll() {
  document.body.classList.add("no-scroll-transition");
  lenis?.stop();
}

export function unlockScroll() {
  document.body.classList.remove("no-scroll-transition");
  lenis?.start();
}

export function scrollToTopInstant() {
  lenis?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
