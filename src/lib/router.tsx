import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

/* Tiny hash router — works on any static host (Cloudflare assets, file://, previews). */

export const parseHash = () => {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  return { path: path || '/', params: new URLSearchParams(query) };
};

export function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const navigate = (to: string) => {
  const target = to.startsWith('#') ? to : `#${to}`;
  if (window.location.hash === target) return;
  window.location.hash = target;
};

/** Replace query string without adding history entries (used by archive filters). */
export const setQuery = (params: URLSearchParams) => {
  const { path } = parseHash();
  const q = params.toString();
  history.replaceState(null, '', `#${path}${q ? '?' + q : ''}`);
};

export function Link({ to, children, ...rest }: { to: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={to.startsWith('#') || to.startsWith('http') ? to : `#${to}`} {...rest}>
      {children}
    </a>
  );
}
