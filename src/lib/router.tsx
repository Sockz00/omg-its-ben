import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { PageTransition, type TransitionHandle } from "@/components/PageTransition";
import { lockScroll, scrollToTopInstant, unlockScroll } from "@/lib/motion";

export type Path = "/" | "/photos" | "/about";
const ROUTES: Path[] = ["/", "/photos", "/about"];

export function parseHash(): Path {
  const raw = window.location.hash.replace(/^#/, "");
  const clean = ("/" + raw.replace(/^\/+/, "")).replace(/\/+$/, "") || "/";
  return (ROUTES as string[]).includes(clean) ? (clean as Path) : "/";
}

const hrefFor = (to: Path) => (to === "/" ? "#/" : `#${to}`);

type RouterValue = {
  path: Path;
  /** increments on every navigation, used to remount the page (= original full page load) */
  visit: number;
  navigate: (to: Path) => void;
};

const RouterContext = createContext<RouterValue>({ path: "/", visit: 0, navigate: () => {} });

export const useRouter = () => useContext(RouterContext);

export const NAVIGATE_START_EVENT = "mk:navigate-start";

export function RouterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => ({ path: parseHash(), visit: 0 }));
  const overlay = useRef<TransitionHandle | null>(null);
  const busy = useRef(true);
  const pathRef = useRef<Path>(state.path);

  const go = useCallback(async (to: Path, push: boolean) => {
    if (busy.current) return;
    busy.current = true;
    lockScroll();
    window.dispatchEvent(new Event(NAVIGATE_START_EVENT));

    await overlay.current?.cover();

    if (push && parseHash() !== to) window.history.pushState(null, "", hrefFor(to));
    pathRef.current = to;
    flushSync(() => setState((s) => ({ path: to, visit: s.visit + 1 })));
    scrollToTopInstant();

    await overlay.current?.reveal();
    busy.current = false;
    unlockScroll();

    // the url may have changed (back / forward) while we were busy
    const latest = parseHash();
    if (latest !== pathRef.current) go(latest, false);
  }, []);

  // intro: black columns slide out once the page is ready (IX2 page start)
  useEffect(() => {
    lockScroll();
    if (!window.location.hash) window.history.replaceState(null, "", hrefFor(pathRef.current));
    let cancelled = false;
    overlay.current?.reveal().then(() => {
      if (cancelled) return;
      busy.current = false;
      unlockScroll();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // browser back / forward or manual hash edits
  useEffect(() => {
    const onHistory = () => {
      const p = parseHash();
      if (p !== pathRef.current) go(p, false);
    };
    window.addEventListener("popstate", onHistory);
    window.addEventListener("hashchange", onHistory);
    return () => {
      window.removeEventListener("popstate", onHistory);
      window.removeEventListener("hashchange", onHistory);
    };
  }, [go]);

  const navigate = useCallback((to: Path) => go(to, true), [go]);

  return (
    <RouterContext.Provider value={{ path: state.path, visit: state.visit, navigate }}>
      {children}
      <PageTransition handleRef={overlay} />
    </RouterContext.Provider>
  );
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: Path };

export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const { navigate, path } = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={hrefFor(to)} aria-current={path === to ? "page" : undefined} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
