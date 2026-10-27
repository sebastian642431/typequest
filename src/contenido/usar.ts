import { useMemo } from "react";
import { contenido } from "./index.ts";
import { mundosPara } from "./tipos.ts";
import { useIdioma } from "../i18n/index.ts";

export function useMundos() {
  const idioma = useIdioma((s) => s.idioma);
  return useMemo(() => mundosPara(contenido, idioma), [idioma]);
}
