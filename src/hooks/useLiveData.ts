import { useSyncExternalStore } from "react";

export interface LiveState<T> {
  data: T;
  reachable: boolean | null;
}

export function createLiveStore<T>(opts: {
  url: string;
  initial: T;
  parse: (raw: unknown) => T | null;
  pollMs?: number;
  timeoutMs?: number;
}) {
  const { url, initial, parse, pollMs = 0, timeoutMs = 8000 } = opts;
  let state: LiveState<T> = { data: initial, reachable: null };
  let lastBody = "";
  let timer: number | undefined;
  let started = false;
  const listeners = new Set<() => void>();

  const publish = (next: LiveState<T>) => {
    state = next;
    for (const notify of listeners) notify();
  };

  async function load() {
    if (document.hidden && state.reachable !== null) return;
    try {
      const abort = new AbortController();
      const bail = window.setTimeout(() => abort.abort(), timeoutMs);
      const res = await fetch(url, { cache: "no-store", signal: abort.signal });
      window.clearTimeout(bail);
      if (!res.ok) throw new Error(String(res.status));
      const body = await res.text();
      if (body === lastBody && state.reachable === true) return;
      lastBody = body;
      const next = parse(JSON.parse(body));
      if (next === null) throw new Error("shape");
      publish({ data: next, reachable: true });
    } catch {
      lastBody = "";
      if (state.reachable === false) return;
      publish({ data: state.data, reachable: false });
    }
  }

  const onVisible = () => {
    if (!document.hidden) void load();
  };

  function subscribe(notify: () => void) {
    listeners.add(notify);
    if (!started) {
      started = true;
      void load();
      if (pollMs > 0) {
        timer = window.setInterval(() => void load(), pollMs);
        document.addEventListener("visibilitychange", onVisible);
      }
    }
    return () => {
      listeners.delete(notify);
      if (listeners.size === 0 && pollMs > 0) {
        started = false;
        window.clearInterval(timer);
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
  }

  const snapshot = () => state;

  return function useLive(): LiveState<T> {
    return useSyncExternalStore(subscribe, snapshot, snapshot);
  };
}
