import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildContent, type Lesson, type WorldMeta } from "./types.ts";

export async function loadContent(root: string) {
  const worlds: Record<string, { default: WorldMeta }> = {};
  const lessons: Record<string, { default: Lesson }> = {};
  for (const locale of readdirSync(root, { withFileTypes: true })) {
    if (!locale.isDirectory()) continue;
    const contentDir = join(root, locale.name, "content");
    let folders;
    try {
      folders = readdirSync(contentDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const world of folders) {
      if (!world.isDirectory()) continue;
      for (const file of readdirSync(join(contentDir, world.name))) {
        const path = `./${locale.name}/content/${world.name}/${file}`;
        const url = pathToFileURL(join(contentDir, world.name, file)).href;
        if (file === "world.ts") worlds[path] = await import(url);
        else if (/^l\d.*\.ts$/.test(file)) lessons[path] = await import(url);
      }
    }
  }
  return buildContent(worlds, lessons);
}
