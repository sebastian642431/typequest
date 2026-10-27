import type * as TS from "ts-web";

export type Diagnostic = {
  code: number;
  message: string;
  line: number;
  column: number;
  length: number;
  syntax?: boolean;
};

export const PRELUDE = `type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
`;

export const LIB_ROOT = "lib.es2025.d.ts";
const FILE = "/exercise.ts";

export function createChecker(ts: typeof TS, libs: Record<string, string>) {
  const options: TS.CompilerOptions = {
    strict: true,
    target: ts.ScriptTarget.ES2025 ?? ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    types: [],
    lib: [LIB_ROOT],
    noUncheckedSideEffectImports: true,
    stableTypeOrdering: true,
    skipLibCheck: true,
  } as TS.CompilerOptions;

  const libCache = new Map<string, TS.SourceFile>();

  function libSource(name: string) {
    const file = name.replace(/^\//, "");
    let sf = libCache.get(file);
    if (!sf && libs[file] !== undefined) {
      sf = ts.createSourceFile("/" + file, libs[file], ts.ScriptTarget.ESNext, true);
      libCache.set(file, sf);
    }
    return sf;
  }

  function diagnose(code: string): Diagnostic[] {
    const source = ts.createSourceFile(FILE, code, ts.ScriptTarget.ESNext, true);
    const host: TS.CompilerHost = {
      getSourceFile: (n) => (n === FILE ? source : libSource(n)),
      getDefaultLibFileName: () => "/" + LIB_ROOT,
      getDefaultLibLocation: () => "/",
      writeFile: () => {},
      getCurrentDirectory: () => "/",
      getDirectories: () => [],
      getCanonicalFileName: (n) => n,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => "\n",
      fileExists: (n) => n === FILE || libs[n.replace(/^\//, "")] !== undefined,
      readFile: (n) => (n === FILE ? code : libs[n.replace(/^\//, "")]),
    };
    const program = ts.createProgram([FILE], options, host);
    const syntactic = program.getSyntacticDiagnostics(source);
    const diags = [...syntactic, ...program.getSemanticDiagnostics(source)];
    return diags.map((d) => {
      const pos = d.start !== undefined ? source.getLineAndCharacterOfPosition(d.start) : { line: 0, character: 0 };
      return {
        code: d.code,
        message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
        line: pos.line,
        column: pos.character,
        length: d.length ?? 0,
        syntax: syntactic.includes(d as TS.DiagnosticWithLocation),
      };
    });
  }

  function transpile(code: string) {
    return ts.transpileModule(code, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText;
  }

  return { diagnose, transpile };
}

export function lastExpression(js: string): string {
  const lines = js.replace(/\s+$/, "").split("\n");
  let i = lines.length - 1;
  while (i >= 0 && lines[i].trim() === "") i--;
  const last = lines[i].trim().replace(/;$/, "");
  lines[i] = `return (${last});`;
  return lines.join("\n");
}

export function run(js: string): unknown {
  const body = lastExpression(js.replace(/^export \{\};?\s*$/m, ""));
  return new Function(body)();
}

export function evalLiteral(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: new Function(`return (${text});`)() };
  } catch {
    return { ok: false };
  }
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

export function normalizeAnswer(text: string) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

export function isTypeError(text: string) {
  const t = normalizeAnswer(text);
  return t === "type error" || t === "error de tipo" || t === "error";
}

export function comparePrediction(answer: string, expected: string) {
  if (isTypeError(expected)) return isTypeError(answer);
  if (isTypeError(answer)) return false;
  const a = evalLiteral(answer);
  const b = evalLiteral(expected);
  if (a.ok && b.ok) return deepEqual(a.value, b.value);
  return normalizeAnswer(answer) === normalizeAnswer(expected);
}
