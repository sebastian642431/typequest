import * as Comlink from "comlink";
import type { ApiCompilador } from "./worker.ts";
import { PRELUDIO, type Diagnostico } from "./corrector.ts";

let remoto: Comlink.Remote<ApiCompilador> | null = null;

export function compilador() {
  if (!remoto) {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    remoto = Comlink.wrap<ApiCompilador>(worker);
  }
  return remoto;
}

export function precalentar(tsLocale: string) {
  void compilador().idioma(tsLocale);
}

export type Resultado = {
  ok: boolean;
  propios: Diagnostico[];
  pruebas: Diagnostico[];
};

export async function correr(codigo: string, pruebas: string): Promise<Resultado> {
  const lineasCodigo = codigo.split("\n").length;
  const completo = `${codigo}\n${PRELUDIO}${pruebas}\nexport {};\n`;
  const diags = await compilador().diagnosticar(completo);
  const desplazamiento = lineasCodigo + PRELUDIO.split("\n").length - 1;
  return {
    ok: diags.length === 0,
    propios: diags.filter((d) => d.linea < lineasCodigo),
    pruebas: diags.filter((d) => d.linea >= lineasCodigo).map((d) => ({ ...d, linea: d.linea - desplazamiento })),
  };
}
