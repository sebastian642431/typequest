import { useEffect, useRef } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { syntaxHighlighting, bracketMatching, indentUnit } from "@codemirror/language";
import { classHighlighter } from "@lezer/highlight";
import { linter, lintGutter, forceLinting, type Diagnostic as LintDiagnostic } from "@codemirror/lint";
import type { Diagnostic } from "../engine/checker.ts";
import { useT } from "../i18n/index.ts";

type Props = {
  value: string;
  onChange: (v: string) => void;
  lint: (code: string) => Promise<Diagnostic[]>;
  onSubmit?: () => void;
};

const theme = EditorView.theme(
  {
    "&": { backgroundColor: "var(--color-code)", color: "#dbe5f5", borderRadius: "14px", fontSize: "15px" },
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

export default function Editor({ value, onChange, lint, onSubmit }: Props) {
  const label = useT().a11y.codeEditor;
  const box = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const refs = useRef({ onChange, lint, onSubmit });
  refs.current = { onChange, lint, onSubmit };

  useEffect(() => {
    const linting = linter(
      async (v): Promise<LintDiagnostic[]> => {
        const diags = await refs.current.lint(v.state.doc.toString());
        const doc = v.state.doc;
        return diags.map((d) => {
          const line = doc.line(Math.min(d.line + 1, doc.lines));
          const from = Math.min(line.from + d.column, doc.length);
          return { from, to: Math.min(from + Math.max(d.length, 1), doc.length), severity: "error", message: d.message };
        });
      },
      { delay: 450 },
    );
    const v = new EditorView({
      parent: box.current!,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          history(),
          highlightActiveLine(),
          bracketMatching(),
          indentUnit.of("  "),
          keymap.of([{ key: "Mod-Enter", run: () => (refs.current.onSubmit?.(), true) }, indentWithTab, ...defaultKeymap, ...historyKeymap]),
          javascript({ typescript: true }),
          syntaxHighlighting(classHighlighter),
          linting,
          lintGutter(),
          theme,
          EditorView.contentAttributes.of({ "aria-label": label, spellcheck: "false", autocapitalize: "off", autocorrect: "off" }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) refs.current.onChange(u.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = v;
    forceLinting(v);
    return () => v.destroy();
  }, []);

  return <div ref={box} className="overflow-hidden rounded-[14px]" />;
}
