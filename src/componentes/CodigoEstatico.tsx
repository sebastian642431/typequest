import { useMemo, type ReactNode } from "react";
import { highlightCode, classHighlighter } from "@lezer/highlight";
import { javascriptLanguage } from "@codemirror/lang-javascript";

const parser = javascriptLanguage.configure({ dialect: "ts" }).parser;

type Props = {
  codigo: string;
  hueco?: { texto: string };
  className?: string;
};

export function CodigoEstatico({ codigo, hueco, className = "" }: Props) {
  const nodos = useMemo(() => {
    const marca = codigo.indexOf("___");
    const relleno = hueco ? hueco.texto || "    " : "";
    const fuente = hueco && marca >= 0 ? codigo.slice(0, marca) + relleno + codigo.slice(marca + 3) : codigo;
    const inicio = hueco && marca >= 0 ? marca : -1;
    const fin = inicio >= 0 ? inicio + relleno.length : -1;
    const salida: ReactNode[] = [];
    const enHueco: ReactNode[] = [];
    let pos = 0;
    let k = 0;
    const emitir = (texto: string, clases: string) => {
      let resto = texto;
      while (resto.length) {
        const dentro = inicio >= 0 && pos >= inicio && pos < fin;
        const limite = inicio < 0 ? resto.length : dentro ? fin - pos : pos < inicio ? inicio - pos : resto.length;
        const trozo = resto.slice(0, Math.max(1, Math.min(limite, resto.length)));
        const nodo = clases ? <span key={k++} className={clases}>{trozo}</span> : <span key={k++}>{trozo}</span>;
        if (dentro) enHueco.push(nodo);
        else {
          if (enHueco.length && pos >= fin) {
            salida.push(<span key={k++} className={`hueco ${hueco?.texto ? "" : "hueco-vacio"}`}>{enHueco.splice(0)}</span>);
          }
          salida.push(nodo);
        }
        pos += trozo.length;
        resto = resto.slice(trozo.length);
      }
    };
    highlightCode(fuente, parser.parse(fuente), classHighlighter, emitir, () => emitir("\n", ""));
    if (enHueco.length) salida.push(<span key={k++} className={`hueco ${hueco?.texto ? "" : "hueco-vacio"}`}>{enHueco.splice(0)}</span>);
    return salida;
  }, [codigo, hueco]);

  return <pre className={`codigo ${className}`}>{nodos}</pre>;
}
