import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { armarContenido, type Leccion, type MundoMeta } from "./tipos.ts";

export async function cargarContenido(raiz: string) {
  const metas: Record<string, { default: MundoMeta }> = {};
  const lecciones: Record<string, { default: Leccion }> = {};
  for (const idioma of readdirSync(raiz, { withFileTypes: true })) {
    if (!idioma.isDirectory()) continue;
    for (const mundo of readdirSync(join(raiz, idioma.name), { withFileTypes: true })) {
      if (!mundo.isDirectory()) continue;
      for (const archivo of readdirSync(join(raiz, idioma.name, mundo.name))) {
        const ruta = `./${idioma.name}/${mundo.name}/${archivo}`;
        const url = pathToFileURL(join(raiz, idioma.name, mundo.name, archivo)).href;
        if (archivo === "mundo.ts") metas[ruta] = await import(url);
        else if (/^l\d.*\.ts$/.test(archivo)) lecciones[ruta] = await import(url);
      }
    }
  }
  return armarContenido(metas, lecciones);
}
