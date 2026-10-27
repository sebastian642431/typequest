import { buildContent, type Lesson, type World, type WorldMeta } from "./types.ts";

const worldLoaders = import.meta.glob<{ default: WorldMeta }>("../locales/*/content/*/world.ts");
const lessonLoaders = import.meta.glob<{ default: Lesson }>("../locales/*/content/*/l[0-9]*.ts");

async function loadOf<T>(loaders: Record<string, () => Promise<T>>, locale: string) {
  const prefix = `../locales/${locale}/content/`;
  const entries = Object.entries(loaders).filter(([path]) => path.startsWith(prefix));
  return Object.fromEntries(await Promise.all(entries.map(async ([path, load]) => [path, await load()] as const)));
}

export async function loadWorlds(locale: string): Promise<World[]> {
  const [worlds, lessons] = await Promise.all([loadOf(worldLoaders, locale), loadOf(lessonLoaders, locale)]);
  return buildContent(worlds, lessons)[locale] ?? [];
}
