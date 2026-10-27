import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { cargarContenido } from "../src/contenido/cargar-node.ts";
import { IDIOMA_BASE } from "../src/contenido/tipos.ts";
import {
  PRELUDIO,
  crearCorrector,
  ejecutar,
  esTypeError,
  evaluarLiteral,
  igualProfundo,
} from "../src/motor/corrector.ts";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const contenido = await cargarContenido(join(raiz, "src/contenido"));
const solo = process.argv[2];
const require = createRequire(import.meta.url);
const ts6 = require("ts-web");
const libDir = join(dirname(require.resolve("ts-web")), "");
const libs = {};
for (const f of readdirSync(libDir)) if (/^lib\..*\.d\.ts$/.test(f)) libs[f] = readFileSync(join(libDir, f), "utf8");
const corrector = crearCorrector(ts6, libs);

const casos = [];
const ids = new Set();
const fallos = [];

function caso(ej, nombre, codigo, esperaError) {
  casos.push({ ej, nombre, codigo, esperaError, archivo: `c${casos.length}.ts` });
}

const idsBase = new Map();
for (const mundo of contenido[IDIOMA_BASE] ?? []) for (const l of mundo.lecciones) idsBase.set(`${mundo.id}/${l.id}`, new Set(l.ejercicios.map((e) => e.id)));

for (const [idioma, mundos] of Object.entries(contenido)) {
  for (const mundo of mundos) {
    for (const leccion of mundo.lecciones) {
      if (solo && !leccion.id.includes(solo) && !mundo.id.includes(solo) && idioma !== solo) continue;
      const base = idsBase.get(`${mundo.id}/${leccion.id}`);
      if (idioma !== IDIOMA_BASE) {
        if (!base) fallos.push(`${idioma}/${mundo.id}/${leccion.id}: no existe en ${IDIOMA_BASE}`);
        else {
          const propios = new Set(leccion.ejercicios.map((e) => e.id));
          for (const id of base) if (!propios.has(id)) fallos.push(`${idioma}/${mundo.id}/${leccion.id}: falta el ejercicio ${id}`);
          for (const id of propios) if (!base.has(id)) fallos.push(`${idioma}/${mundo.id}/${leccion.id}: el ejercicio ${id} no existe en ${IDIOMA_BASE}`);
        }
      }
      for (const ej of leccion.ejercicios) {
        const clave = `${idioma}/${mundo.id}/${leccion.id}/${ej.id}`;
        if (ids.has(clave)) fallos.push(`${clave}: id repetido`);
        ids.add(clave);
        ej.clave = clave;
        if (ej.tipo === "predecir") {
          caso(ej, "codigo", ej.codigo, esTypeError(ej.respuesta));
        } else if (ej.tipo === "completar") {
          if (!ej.codigo.includes("___")) fallos.push(`${clave}: falta ___`);
          caso(ej, "solucion", `${ej.codigo.replace("___", ej.solucion)}
${PRELUDIO}${ej.pruebas}`, false);
          caso(ej, "vacio", `${ej.codigo.replace("___", "unknown")}
${PRELUDIO}${ej.pruebas}`, true);
        } else if (ej.tipo === "arreglar") {
          caso(ej, "original", `${ej.codigo}
${PRELUDIO}${ej.pruebas}`, true);
          caso(ej, "solucion", `${ej.solucion}
${PRELUDIO}${ej.pruebas}`, false);
        } else if (ej.tipo === "elegir") {
          if (ej.correcta < 0 || ej.correcta >= ej.opciones.length) fallos.push(`${clave}: correcta fuera de rango`);
          if (ej.codigo) caso(ej, "codigo", ej.codigo, null);
        }
      }
    }
  }
}

const dir = mkdtempSync(join(tmpdir(), "typequest-"));
for (const c of casos) writeFileSync(join(dir, c.archivo), `${c.codigo}\nexport {};\n`);
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
    files: casos.map((c) => c.archivo),
  }),
);

let salida = "";
try {
  salida = execFileSync(process.execPath, [join(raiz, "node_modules/typescript/bin/tsc"), "-p", ".", "--pretty", "false"], {
    cwd: dir,
    encoding: "utf8",
  });
} catch (e) {
  salida = e.stdout ?? "";
}
const version = execFileSync(process.execPath, [join(raiz, "node_modules/typescript/bin/tsc"), "-v"], { encoding: "utf8" }).trim();
rmSync(dir, { recursive: true, force: true });

const errores7 = new Map();
for (const linea of salida.split(/\r?\n/)) {
  const m = linea.match(/^(c\d+\.ts)\((\d+),(\d+)\): error (TS\d+): (.*)$/);
  if (m) errores7.set(m[1], [...(errores7.get(m[1]) ?? []), `${m[2]}:${m[3]} ${m[4]} ${m[5]}`]);
}

for (const c of casos) {
  const e7 = errores7.get(c.archivo) ?? [];
  const e6 = corrector.diagnosticar(`${c.codigo}\nexport {};\n`);
  const tag = `${c.ej.clave} [${c.nombre}]`;
  const sintaxis = e6.filter((d) => d.sintaxis);
  if (sintaxis.length) {
    fallos.push(`${tag}: error de sintaxis (frena el chequeo de todo el lote en TS7): ${sintaxis.map((d) => `${d.linea + 1}:${d.columna + 1} TS${d.codigo} ${d.mensaje}`).join(" | ")}`);
    continue;
  }
  if (e7.length > 0 !== e6.length > 0) {
    fallos.push(`${tag}: TS7 y el corrector no coinciden (7: ${e7.length}, web: ${e6.length})
    7: ${e7.join(" | ")}
    web: ${e6.map((d) => `${d.linea + 1}:${d.columna + 1} TS${d.codigo} ${d.mensaje}`).join(" | ")}`);
    continue;
  }
  if (c.esperaError === true && e7.length === 0) fallos.push(`${tag}: esperaba error y compila`);
  if (c.esperaError === false && e7.length > 0) fallos.push(`${tag}: no debería tener error:\n    ${e7.join("\n    ")}`);
  if (c.esperaError === null && e7.length > 0) fallos.push(`${tag}: el código de muestra tiene error:\n    ${e7.join("\n    ")}`);
  if (c.ej.tipo === "predecir" && !esTypeError(c.ej.respuesta) && e7.length === 0) {
    const esperado = evaluarLiteral(c.ej.respuesta);
    if (!esperado.ok) {
      fallos.push(`${tag}: la respuesta "${c.ej.respuesta}" no es un literal JS válido`);
      continue;
    }
    let real;
    try {
      real = ejecutar(corrector.transpilar(c.codigo));
    } catch (err) {
      fallos.push(`${tag}: tira al ejecutar: ${err.message}`);
      continue;
    }
    if (!igualProfundo(real, esperado.valor)) fallos.push(`${tag}: da ${JSON.stringify(real)}, la respuesta dice ${c.ej.respuesta}`);
  }
}

const total = ids.size;
console.log(`${version} · ${total} ejercicios · ${casos.length} compilaciones`);
if (fallos.length) {
  console.log(`\n${fallos.length} fallos:\n- ${fallos.join("\n- ")}`);
  process.exit(1);
}
console.log("todo ok");
