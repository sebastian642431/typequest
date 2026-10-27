import { describe, expect, it } from "vitest";
import { buildContent, worldsFor, type Lesson, type WorldMeta } from "./types.ts";

const lesson = (id: string, title: string): { default: Lesson } => ({
  default: { id, title, summary: "", idea: "", theory: [], exercises: [] },
});
const world = (id: string, number: number, title: string): { default: WorldMeta } => ({ default: { id, number, title, summary: "" } });

describe("content", () => {
  const content = buildContent(
    {
      "../locales/es/content/b/world.ts": world("b", 2, "Dos"),
      "../locales/es/content/a/world.ts": world("a", 1, "Uno"),
      "../locales/en/content/a/world.ts": world("a", 1, "One"),
    },
    {
      "../locales/es/content/a/l02-y.ts": lesson("y", "Ye"),
      "../locales/es/content/a/l01-x.ts": lesson("x", "Equis"),
      "../locales/es/content/b/l01-z.ts": lesson("z", "Zeta"),
      "../locales/en/content/a/l01-x.ts": lesson("x", "Ex"),
    },
  );

  it("sorts worlds by number and lessons by file name", () => {
    expect(content.es.map((w) => w.id)).toEqual(["a", "b"]);
    expect(content.es[0].lessons.map((l) => l.id)).toEqual(["x", "y"]);
  });

  it("falls back to the base locale for anything untranslated", () => {
    const en = worldsFor(content, "en");
    expect(en[0].title).toBe("One");
    expect(en[0].lessons.map((l) => l.title)).toEqual(["Ex", "Ye"]);
    expect(en[1].title).toBe("Dos");
  });
});
