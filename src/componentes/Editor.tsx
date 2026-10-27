import { useEffect, useRef } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { syntaxHighlighting, bracketMatching, indentUnit } from "@codemirror/language";
import { classHighlighter } from "@lezer/highlight";
import { linter, lintGutter, forceLinting, type Diagnostic } from "@codemirror/lint";
import type { Diagnostico } from "../motor/corrector.ts";

type Props = {
  valor: string;
  alCambiar: (v: string) => void;
  revisar: (codigo: string) => Promise<Diagnostico[]>;
  alEnviar?: () => void;
};

const tema = EditorView.theme(
  {
    "&": { backgroundColor: "var(--color-codigo)", color: "#dbe5f5", borderRadius: "14px", fontSize: "15px" },
    ".cm-content": { fontFamily: "var(--font-mono)", padding: "14px 0", caretColor: "#fff" },
    ".cm-gutters": { backgroundColor: "transparent", border: "none", color: "#53627f" },
    ".cm-activeLine": { backgroundColor: "rgb(255 255 255 / 0.04)" },
    ".cm-cursor": { borderLeftColor: "#fff" },
    "&.cm-focused": { outline: "2px solid var(--color-accent)", outlineOffset: "3px" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "rgb(127 212 255 / 0.25) !important" },
    ".cm-lintRange-error": {
      backgroundImage: "none",
      textDecoration: "underline wavy #ff6b61",
      textDecorationThickness: "1.5px",
      textUnderlineOffset: "4px",
    },
    ".cm-tooltip": { backgroundColor: "#fff", color: "var(--color-ink)", border: "1px solid var(--color-line)", borderRadius: "10px" },
    ".cm-diagnostic": { fontFamily: "var(--font-sans)", fontSize: "14px" },
  },
  { dark: true },
);

export function Editor({ valor, alCambiar, revisar, alEnviar }: Props) {
  const caja = useRef<HTMLDivElement>(null);
  const vista = useRef<EditorView | null>(null);
  const refs = useRef({ alCambiar, revisar, alEnviar });
  refs.current = { alCambiar, revisar, alEnviar };

  useEffect(() => {
    const lint = linter(
      async (v): Promise<Diagnostic[]> => {
        const diags = await refs.current.revisar(v.state.doc.toString());
        const doc = v.state.doc;
        return diags.map((d) => {
          const linea = doc.line(Math.min(d.linea + 1, doc.lines));
          const desde = Math.min(linea.from + d.columna, doc.length);
          return { from: desde, to: Math.min(desde + Math.max(d.largo, 1), doc.length), severity: "error", message: d.mensaje };
        });
      },
      { delay: 450 },
    );
    const v = new EditorView({
      parent: caja.current!,
      state: EditorState.create({
        doc: valor,
        extensions: [
          lineNumbers(),
          history(),
          highlightActiveLine(),
          bracketMatching(),
          indentUnit.of("  "),
          keymap.of([{ key: "Mod-Enter", run: () => (refs.current.alEnviar?.(), true) }, indentWithTab, ...defaultKeymap, ...historyKeymap]),
          javascript({ typescript: true }),
          syntaxHighlighting(classHighlighter),
          lint,
          lintGutter(),
          tema,
          EditorView.contentAttributes.of({ "aria-label": "Editor de código", spellcheck: "false", autocapitalize: "off", autocorrect: "off" }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) refs.current.alCambiar(u.state.doc.toString());
          }),
        ],
      }),
    });
    vista.current = v;
    forceLinting(v);
    return () => v.destroy();
  }, []);

  return <div ref={caja} className="overflow-hidden rounded-[14px]" />;
}
