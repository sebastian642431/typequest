import * as Comlink from "comlink";
import ts from "ts-web";
import { crearCorrector } from "./corrector.ts";

const crudas = import.meta.glob<string>("/node_modules/ts-web/lib/lib.*.d.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

const mensajes = import.meta.glob<Record<string, string>>("/node_modules/ts-web/lib/*/diagnosticMessages.generated.json", {
  import: "default",
});

const libs: Record<string, string> = {};
for (const [ruta, texto] of Object.entries(crudas)) {
  const nombre = ruta.split("/").pop()!;
  if (/dom|webworker|scripthost|esnext/.test(nombre)) continue;
  libs[nombre] = texto;
}

const localizar = (ts as unknown as { setLocalizedDiagnosticMessages: (m: unknown) => void }).setLocalizedDiagnosticMessages;
const corrector = crearCorrector(ts, libs);

const api = {
  diagnosticar: (codigo: string) => corrector.diagnosticar(codigo),
  idioma: async (locale: string) => {
    const carga = mensajes[`/node_modules/ts-web/lib/${locale}/diagnosticMessages.generated.json`];
    localizar(carga ? await carga() : undefined);
  },
  listo: () => true,
};

export type ApiCompilador = typeof api;

Comlink.expose(api);
