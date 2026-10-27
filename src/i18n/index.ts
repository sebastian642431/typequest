import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IDIOMA_BASE } from "../contenido/tipos.ts";
import type { Textos } from "./es.ts";

const archivos = import.meta.glob<{ default: Textos }>("./[a-z]*.ts", { eager: true });

export const idiomas: Record<string, Textos> = {};
for (const [ruta, m] of Object.entries(archivos)) {
  const codigo = ruta.replace("./", "").replace(".ts", "");
  if (codigo !== "index") idiomas[codigo] = m.default;
}

function detectar() {
  const pedidos = typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : [];
  for (const p of pedidos) {
    const corto = p.toLowerCase().split("-")[0];
    if (idiomas[p.toLowerCase()]) return p.toLowerCase();
    if (idiomas[corto]) return corto;
  }
  return IDIOMA_BASE;
}

export const useIdioma = create<{ idioma: string; cambiar: (i: string) => void }>()(
  persist((set) => ({ idioma: detectar(), cambiar: (idioma) => set({ idioma }) }), { name: "typequest-idioma" }),
);

export function useT(): Textos {
  const idioma = useIdioma((s) => s.idioma);
  return idiomas[idioma] ?? idiomas[IDIOMA_BASE];
}
