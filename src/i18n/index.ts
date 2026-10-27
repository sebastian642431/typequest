import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BASE_LOCALE, worldsFor, type World } from "../content/types.ts";
import { loadWorlds } from "../content/index.ts";
import type { LocaleMessages, LocaleMeta, Messages } from "./types.ts";

const metaModules = import.meta.glob<{ default: LocaleMeta }>("../locales/*/meta.ts", { eager: true });
const messageLoaders = import.meta.glob<{ default: LocaleMessages }>("../locales/*/messages.ts");

export const locales: Record<string, LocaleMeta> = {};
for (const [path, m] of Object.entries(metaModules)) locales[path.split("/")[2]] = m.default;

function detect() {
  const wanted = typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : [];
  for (const w of wanted) {
    const short = w.toLowerCase().split("-")[0];
    if (locales[w.toLowerCase()]) return w.toLowerCase();
    if (locales[short]) return short;
  }
  return BASE_LOCALE;
}

export const useLocale = create<{ locale: string; setLocale: (l: string) => void }>()(
  persist((set) => ({ locale: detect(), setLocale: (locale) => set({ locale }) }), { name: "typequest-locale" }),
);

type Bundle = { messages: Messages; worlds: World[] };

export const useLocaleData = create<{ active: string | null; bundle: Bundle | null }>()(() => ({ active: null, bundle: null }));

type Raw = { messages: LocaleMessages; worlds: World[] };

const loaded = new Map<string, Promise<Raw>>();

function load(locale: string) {
  let raw = loaded.get(locale);
  if (!raw) {
    const messages = messageLoaders[`../locales/${locale}/messages.ts`];
    raw = Promise.all([messages ? messages().then((m) => m.default) : {}, loadWorlds(locale)]).then(([messages, worlds]) => ({ messages, worlds }));
    loaded.set(locale, raw);
  }
  return raw;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function merge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return (override ?? base) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) out[key] = key in base ? merge(base[key], value) : value;
  return out as T;
}

let requested: string | null = null;

async function activate(wanted: string) {
  const locale = locales[wanted] ? wanted : BASE_LOCALE;
  if (requested === locale) return;
  requested = locale;
  const [base, own] = await Promise.all([load(BASE_LOCALE), load(locale)]);
  if (requested !== locale) return;
  useLocaleData.setState({
    active: locale,
    bundle: {
      messages: merge(base.messages as Messages, own.messages),
      worlds: worldsFor({ [BASE_LOCALE]: base.worlds, [locale]: own.worlds }, locale),
    },
  });
}

void activate(useLocale.getState().locale);
useLocale.subscribe((s) => void activate(s.locale));

export function useLocaleReady() {
  return useLocaleData((s) => s.bundle !== null);
}

export function useT(): Messages {
  return useLocaleData((s) => s.bundle!.messages);
}

export function useLocaleMeta(): LocaleMeta {
  return useLocaleData((s) => locales[s.active ?? BASE_LOCALE]);
}
