import type * as TS from "ts-web";

export type Diagnostico = {
  codigo: number;
  mensaje: string;
  linea: number;
  columna: number;
  largo: number;
  sintaxis?: boolean;
};

export const PRELUDIO = `type Igual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Esperar<T extends true> = T;
`;

export const LIB_RAIZ = "lib.es2025.d.ts";
const ARCHIVO = "/ejercicio.ts";

export function crearCorrector(ts: typeof TS, libs: Record<string, string>) {
  const opciones: TS.CompilerOptions = {
    strict: true,
    target: ts.ScriptTarget.ES2025 ?? ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    types: [],
    lib: [LIB_RAIZ],
    noUncheckedSideEffectImports: true,
    stableTypeOrdering: true,
    skipLibCheck: true,
  } as TS.CompilerOptions;

  const cacheLibs = new Map<string, TS.SourceFile>();

  function libFuente(nombre: string) {
    const archivo = nombre.replace(/^\//, "");
    let sf = cacheLibs.get(archivo);
    if (!sf && libs[archivo] !== undefined) {
      sf = ts.createSourceFile("/" + archivo, libs[archivo], ts.ScriptTarget.ESNext, true);
      cacheLibs.set(archivo, sf);
    }
    return sf;
  }

  function diagnosticar(codigo: string): Diagnostico[] {
    const fuente = ts.createSourceFile(ARCHIVO, codigo, ts.ScriptTarget.ESNext, true);
    const host: TS.CompilerHost = {
      getSourceFile: (n) => (n === ARCHIVO ? fuente : libFuente(n)),
      getDefaultLibFileName: () => "/" + LIB_RAIZ,
      getDefaultLibLocation: () => "/",
      writeFile: () => {},
      getCurrentDirectory: () => "/",
      getDirectories: () => [],
      getCanonicalFileName: (n) => n,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => "\n",
      fileExists: (n) => n === ARCHIVO || libs[n.replace(/^\//, "")] !== undefined,
      readFile: (n) => (n === ARCHIVO ? codigo : libs[n.replace(/^\//, "")]),
    };
    const programa = ts.createProgram([ARCHIVO], opciones, host);
    const sintacticos = programa.getSyntacticDiagnostics(fuente);
    const diags = [...sintacticos, ...programa.getSemanticDiagnostics(fuente)];
    return diags.map((d) => {
      const pos = d.start !== undefined ? fuente.getLineAndCharacterOfPosition(d.start) : { line: 0, character: 0 };
      return {
        codigo: d.code,
        mensaje: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
        linea: pos.line,
        columna: pos.character,
        largo: d.length ?? 0,
        sintaxis: sintacticos.includes(d as TS.DiagnosticWithLocation),
      };
    });
  }

  function transpilar(codigo: string) {
    return ts.transpileModule(codigo, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText;
  }

  return { diagnosticar, transpilar };
}

export function ultimaExpresion(js: string): string {
  const lineas = js.replace(/\s+$/, "").split("\n");
  let i = lineas.length - 1;
  while (i >= 0 && lineas[i].trim() === "") i--;
  const ultima = lineas[i].trim().replace(/;$/, "");
  lineas[i] = `return (${ultima});`;
  return lineas.join("\n");
}

export function ejecutar(js: string): unknown {
  const cuerpo = ultimaExpresion(js.replace(/^export \{\};?\s*$/m, ""));
  return new Function(cuerpo)();
}

export function evaluarLiteral(texto: string): { ok: true; valor: unknown } | { ok: false } {
  try {
    return { ok: true, valor: new Function(`return (${texto});`)() };
  } catch {
    return { ok: false };
  }
}

export function igualProfundo(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => igualProfundo((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

export function normalizarRespuesta(texto: string) {
  return texto.trim().replace(/\s+/g, " ").toLowerCase();
}

export function esTypeError(texto: string) {
  const t = normalizarRespuesta(texto);
  return t === "type error" || t === "error de tipo" || t === "error";
}
