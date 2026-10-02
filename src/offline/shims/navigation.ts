import { useEffect, useState } from "react";

function hashBody() {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  return raw || "/";
}

function routePart() {
  const body = hashBody();
  const queryAt = body.indexOf("?");
  return queryAt === -1 ? body : body.slice(0, queryAt);
}

export function currentPath() {
  const route = routePart().split("#")[0] || "/";
  const path = route.startsWith("/") ? route : `/${route}`;
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

export function currentAnchor() {
  const route = routePart();
  const index = route.indexOf("#");
  return index === -1 ? "" : route.slice(index + 1);
}

function currentQuery() {
  const body = hashBody();
  const index = body.indexOf("?");
  return index === -1 ? "" : body.slice(index + 1);
}

export function usePathname() {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const apply = () => setPath(currentPath());
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);
  return path;
}

export function useSearchParams() {
  const [params, setParams] = useState(() => new URLSearchParams(currentQuery()));
  useEffect(() => {
    const apply = () => setParams(new URLSearchParams(currentQuery()));
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);
  return params;
}

export function useRouter() {
  return {
    push(href: string) {
      window.location.hash = href.startsWith("/") ? href : `/${href}`;
    },
    replace(href: string) {
      const next = href.startsWith("/") ? href : `/${href}`;
      window.location.replace(`${window.location.pathname}${window.location.search}#${next}`);
    },
    refresh() {},
    back() {
      window.history.back();
    },
  };
}
