import { useCallback, useEffect, useState } from "react";

export type Route = {
  view: "learn" | "review";
  lesson: string | null;
  review: boolean;
  account: "profile" | "achievements" | "settings" | null;
};

const ACCOUNT = ["profile", "achievements", "settings"] as const;

export function parseRoute(search: string): Route {
  const q = new URLSearchParams(search);
  const account = q.get("account");
  return {
    view: q.get("view") === "review" ? "review" : "learn",
    lesson: q.get("lesson"),
    review: q.get("review") === "1",
    account: ACCOUNT.includes(account as (typeof ACCOUNT)[number]) ? (account as Route["account"]) : null,
  };
}

export function buildSearch(r: Route) {
  const q = new URLSearchParams();
  if (r.lesson) q.set("lesson", r.lesson);
  else if (r.review) q.set("review", "1");
  else {
    if (r.view !== "learn") q.set("view", r.view);
    if (r.account) q.set("account", r.account);
  }
  const text = q.toString().replace(/%2F/g, "/");
  return text ? `?${text}` : "";
}

const read = () => parseRoute(window.location.search);

export function useRoute() {
  const [route, setRoute] = useState<Route>(read);

  useEffect(() => {
    const back = () => setRoute(read());
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);

  const go = useCallback((changes: Partial<Route>, replace = false) => {
    setRoute((current) => {
      const next = { ...current, ...changes };
      const url = `${window.location.pathname}${buildSearch(next)}`;
      if (url !== `${window.location.pathname}${window.location.search}`) {
        if (replace) history.replaceState(null, "", url);
        else history.pushState(null, "", url);
      }
      return next;
    });
  }, []);

  return [route, go] as const;
}
