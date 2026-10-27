import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { loadContent } from "../src/content/load-node.ts";
import { BASE_LOCALE, LIMITS } from "../src/content/types.ts";
import {
  PRELUDE,
  createChecker,
  run,
  isTypeError,
  evalLiteral,
  deepEqual,
} from "../src/engine/checker.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const content = await loadContent(join(root, "src/locales"));
const only = process.argv[2];
const require = createRequire(import.meta.url);
const ts6 = require("ts-web");
const libDir = join(dirname(require.resolve("ts-web")), "");
const libs = {};
for (const f of readdirSync(libDir)) if (/^lib\..*\.d\.ts$/.test(f)) libs[f] = readFileSync(join(libDir, f), "utf8");
const checker = createChecker(ts6, libs);

const cases = [];
const ids = new Set();
const failures = [];

function addCase(ex, name, code, expectsError) {
  cases.push({ ex, name, code, expectsError, file: `c${cases.length}.ts` });
}

const baseWorlds = new Set((content[BASE_LOCALE] ?? []).map((w) => w.id));
const baseIds = new Map();
for (const world of content[BASE_LOCALE] ?? []) for (const l of world.lessons) baseIds.set(`${world.id}/${l.id}`, new Set(l.exercises.map((e) => e.id)));

for (const [locale, worlds] of Object.entries(content)) {
  for (const world of worlds) {
    if (locale !== BASE_LOCALE && !baseWorlds.has(world.id)) failures.push(`${locale}/${world.id}: world does not exist in ${BASE_LOCALE}`);
    for (const lesson of world.lessons) {
      const lc = `${locale}/${world.id}/${lesson.id}`;
      const length = (field, text, max) => {
        if (typeof text !== "string" || !text.trim()) failures.push(`${lc}: missing ${field}`);
        else if (text.length > max) failures.push(`${lc}: ${field} too long (${text.length}/${max}): "${text.slice(0, 60)}…"`);
      };
      length("idea", lesson.idea, LIMITS.idea);
      length("summary", lesson.summary, LIMITS.summary);
      const [minCards, maxCards] = LIMITS.cards;
      if (!Array.isArray(lesson.theory) || lesson.theory.length < minCards || lesson.theory.length > maxCards) failures.push(`${lc}: theory must have between ${minCards} and ${maxCards} cards`);
      for (const [i, card] of (lesson.theory ?? []).entries()) {
        length(`card ${i + 1} title`, card.title, LIMITS.cardTitle);
        length(`card ${i + 1} text`, card.text, LIMITS.cardText);
        if (card.code && card.code.split(/\n/).length > LIMITS.cardCodeLines) failures.push(`${lc}: card ${i + 1} has more than ${LIMITS.cardCodeLines} lines of code`);
      }
      for (const ex of lesson.exercises) {
        const ec = `${lc}/${ex.id}`;
        if (ex.prompt && ex.prompt.length > LIMITS.prompt) failures.push(`${ec}: prompt too long (${ex.prompt.length}/${LIMITS.prompt})`);
        if (!ex.explanation || ex.explanation.length > LIMITS.explanation) failures.push(`${ec}: explanation too long or empty (${ex.explanation?.length ?? 0}/${LIMITS.explanation})`);
        if (ex.hint && ex.hint.length > LIMITS.hint) failures.push(`${ec}: hint too long (${ex.hint.length}/${LIMITS.hint})`);
        if (ex.type === "choose") for (const op of ex.options) if (op.length > LIMITS.option) failures.push(`${ec}: option too long (${op.length}/${LIMITS.option})`);
      }
      if (only && !lesson.id.includes(only) && !world.id.includes(only) && locale !== only) continue;
      const base = baseIds.get(`${world.id}/${lesson.id}`);
      if (locale !== BASE_LOCALE) {
        if (!base) failures.push(`${locale}/${world.id}/${lesson.id}: does not exist in ${BASE_LOCALE}`);
        else {
          const own = new Set(lesson.exercises.map((e) => e.id));
          for (const id of base) if (!own.has(id)) failures.push(`${locale}/${world.id}/${lesson.id}: missing exercise ${id}`);
          for (const id of own) if (!base.has(id)) failures.push(`${locale}/${world.id}/${lesson.id}: exercise ${id} does not exist in ${BASE_LOCALE}`);
        }
      }
      for (const ex of lesson.exercises) {
        const key = `${locale}/${world.id}/${lesson.id}/${ex.id}`;
        if (ids.has(key)) failures.push(`${key}: duplicate id`);
        ids.add(key);
        ex.key = key;
        if (ex.type === "predict") {
          addCase(ex, "code", ex.code, isTypeError(ex.answer));
        } else if (ex.type === "complete") {
          if (!ex.code.includes("___")) failures.push(`${key}: missing ___`);
          addCase(ex, "solution", `${ex.code.replace("___", ex.solution)}
${PRELUDE}${ex.tests}`, false);
          addCase(ex, "empty", `${ex.code.replace("___", "unknown")}
${PRELUDE}${ex.tests}`, true);
        } else if (ex.type === "fix") {
          addCase(ex, "original", `${ex.code}
${PRELUDE}${ex.tests}`, true);
          addCase(ex, "solution", `${ex.solution}
${PRELUDE}${ex.tests}`, false);
        } else if (ex.type === "choose") {
          if (ex.correct < 0 || ex.correct >= ex.options.length) failures.push(`${key}: correct out of range`);
          if (ex.code) addCase(ex, "code", ex.code, null);
        }
      }
    }
  }
}

const dir = mkdtempSync(join(tmpdir(), "typequest-"));
for (const c of cases) writeFileSync(join(dir, c.file), `${c.code}\nexport {};\n`);
writeFileSync(
  join(dir, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      strict: true,
      noEmit: true,
      types: [],
      lib: ["es2025"],
      target: "es2025",
      module: "esnext",
      moduleResolution: "bundler",
    },
    files: cases.map((c) => c.file),
  }),
);

let output = "";
try {
  output = execFileSync(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-p", ".", "--pretty", "false"], {
    cwd: dir,
    encoding: "utf8",
  });
} catch (e) {
  output = e.stdout ?? "";
}
const version = execFileSync(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-v"], { encoding: "utf8" }).trim();
rmSync(dir, { recursive: true, force: true });

const errors7 = new Map();
for (const line of output.split(/\r?\n/)) {
  const m = line.match(/^(c\d+\.ts)\((\d+),(\d+)\): error (TS\d+): (.*)$/);
  if (m) errors7.set(m[1], [...(errors7.get(m[1]) ?? []), `${m[2]}:${m[3]} ${m[4]} ${m[5]}`]);
}

for (const c of cases) {
  const e7 = errors7.get(c.file) ?? [];
  const e6 = checker.diagnose(`${c.code}\nexport {};\n`);
  const tag = `${c.ex.key} [${c.name}]`;
  const syntax = e6.filter((d) => d.syntax);
  if (syntax.length) {
    failures.push(`${tag}: syntax error (stops TS7 from checking the whole batch): ${syntax.map((d) => `${d.line + 1}:${d.column + 1} TS${d.code} ${d.message}`).join(" | ")}`);
    continue;
  }
  if (e7.length > 0 !== e6.length > 0) {
    failures.push(`${tag}: TS7 and the web checker disagree (7: ${e7.length}, web: ${e6.length})
    7: ${e7.join(" | ")}
    web: ${e6.map((d) => `${d.line + 1}:${d.column + 1} TS${d.code} ${d.message}`).join(" | ")}`);
    continue;
  }
  if (c.expectsError === true && e7.length === 0) failures.push(`${tag}: expected an error but it compiles`);
  if (c.expectsError === false && e7.length > 0) failures.push(`${tag}: should not have errors:\n    ${e7.join("\n    ")}`);
  if (c.expectsError === null && e7.length > 0) failures.push(`${tag}: the sample code has errors:\n    ${e7.join("\n    ")}`);
  if (c.ex.type === "predict" && !isTypeError(c.ex.answer) && e7.length === 0) {
    const expected = evalLiteral(c.ex.answer);
    if (!expected.ok) {
      failures.push(`${tag}: the answer "${c.ex.answer}" is not a valid JS literal`);
      continue;
    }
    let actual;
    try {
      actual = run(checker.transpile(c.code));
    } catch (err) {
      failures.push(`${tag}: throws when run: ${err.message}`);
      continue;
    }
    if (!deepEqual(actual, expected.value)) failures.push(`${tag}: evaluates to ${JSON.stringify(actual)}, the answer says ${c.ex.answer}`);
  }
}

const total = ids.size;
console.log(`${version} · ${total} exercises · ${cases.length} compilations`);
if (failures.length) {
  console.log(`\n${failures.length} failures:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("all ok");
