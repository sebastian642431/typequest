import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { PRELUDE, comparePrediction, createChecker, deepEqual, run } from "./checker.ts";

const require = createRequire(import.meta.url);

let checker: ReturnType<typeof createChecker>;

beforeAll(() => {
  const ts = require("ts-web");
  const dir = dirname(require.resolve("ts-web"));
  const libs: Record<string, string> = {};
  for (const f of readdirSync(dir)) {
    if (/^lib\.(es5|es20\d\d|decorators).*\.d\.ts$/.test(f) && !f.includes(".full.")) libs[f] = readFileSync(join(dir, f), "utf8");
  }
  checker = createChecker(ts, libs);
});

describe("checker", () => {
  it("accepts valid code", () => {
    expect(checker.diagnose("let a: number = 1;\nexport {};")).toEqual([]);
  });

  it("reports the error with line and column", () => {
    const [d] = checker.diagnose("let a = 1;\nlet b: number = 'x';\nexport {};");
    expect(d.code).toBe(2322);
    expect(d.line).toBe(1);
    expect(d.column).toBe(4);
    expect(d.syntax).toBe(false);
  });

  it("flags syntax errors separately", () => {
    const d = checker.diagnose("let = ;\nexport {};");
    expect(d.some((x) => x.syntax)).toBe(true);
  });

  it("runs in strict mode like TS 7", () => {
    expect(checker.diagnose("let s: string = null;\nexport {};")).toHaveLength(1);
  });

  it("the prelude enables type tests", () => {
    const ok = checker.diagnose(`type A = string;\n${PRELUDE}type _ = Expect<Equal<A, string>>;\nexport {};`);
    const bad = checker.diagnose(`type A = number;\n${PRELUDE}type _ = Expect<Equal<A, string>>;\nexport {};`);
    expect(ok).toEqual([]);
    expect(bad.length).toBeGreaterThan(0);
  });

  it("runs and returns the last expression", () => {
    expect(run(checker.transpile("const x: number = 2;\nx * 21;"))).toBe(42);
  });
});

describe("comparePrediction", () => {
  it("accepts single or double quotes", () => {
    expect(comparePrediction("'hola'", '"hola"')).toBe(true);
  });

  it("type error only when expected", () => {
    expect(comparePrediction("Type Error", "type error")).toBe(true);
    expect(comparePrediction("type error", "5")).toBe(false);
    expect(comparePrediction("5", "type error")).toBe(false);
  });

  it("compares arrays and objects by value", () => {
    expect(comparePrediction("[1,2]", "[1, 2]")).toBe(true);
    expect(comparePrediction("{ a: 1 }", "{a:1}")).toBe(true);
    expect(deepEqual({ a: [1] }, { a: [2] })).toBe(false);
  });
});
