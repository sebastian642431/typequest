export type Predict = {
  type: "predict";
  id: string;
  prompt?: string;
  code: string;
  answer: string;
  hint?: string;
  explanation: string;
};

export type Complete = {
  type: "complete";
  id: string;
  prompt: string;
  code: string;
  tests: string;
  solution: string;
  hint?: string;
  explanation: string;
};

export type Fix = {
  type: "fix";
  id: string;
  prompt: string;
  code: string;
  tests: string;
  solution: string;
  hint?: string;
  explanation: string;
};

export type Choose = {
  type: "choose";
  id: string;
  prompt: string;
  code?: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type Exercise = Predict | Complete | Fix | Choose;

export function isBoss(e: Exercise) {
  return "prompt" in e && typeof e.prompt === "string" && e.prompt.startsWith("Jefe:");
}

export type Card = { title: string; text: string; code?: string };

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  idea: string;
  theory: Card[];
  exercises: Exercise[];
};

export const LIMITS = {
  idea: 90,
  summary: 90,
  cardTitle: 40,
  cardText: 160,
  cardCodeLines: 8,
  cards: [2, 5],
  prompt: 120,
  explanation: 160,
  hint: 100,
  option: 90,
} as const;

export type World = {
  id: string;
  number: number;
  title: string;
  summary: string;
  lessons: Lesson[];
};

export type WorldMeta = Omit<World, "lessons">;

export const BASE_LOCALE = "es";

export type Content = Record<string, World[]>;

const CONTENT_PATH = /([^/]+)\/content\/([^/]+)\/[^/]+$/;

export function buildContent(worlds: Record<string, { default: WorldMeta }>, lessons: Record<string, { default: Lesson }>): Content {
  const content: Content = {};
  const lessonPaths = Object.keys(lessons).sort();
  for (const [path, w] of Object.entries(worlds)) {
    const match = path.match(CONTENT_PATH);
    if (!match) continue;
    const [, locale, folder] = match;
    const own = lessonPaths
      .filter((p) => {
        const m = p.match(CONTENT_PATH);
        return m?.[1] === locale && m[2] === folder;
      })
      .map((p) => lessons[p].default);
    (content[locale] ??= []).push({ ...w.default, lessons: own });
  }
  for (const list of Object.values(content)) list.sort((a, b) => a.number - b.number);
  return content;
}

export function worldsFor(content: Content, locale: string): World[] {
  const base = content[BASE_LOCALE] ?? [];
  const own = content[locale] ?? [];
  return base.map((wb) => {
    const wt = own.find((w) => w.id === wb.id);
    return {
      ...wb,
      title: wt?.title ?? wb.title,
      summary: wt?.summary ?? wb.summary,
      lessons: wb.lessons.map((lb) => wt?.lessons.find((l) => l.id === lb.id) ?? lb),
    };
  });
}
