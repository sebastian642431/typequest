import { useMemo, type ReactNode } from "react";
import { highlightCode, classHighlighter } from "@lezer/highlight";
import { parser as jsParser } from "@lezer/javascript";
import type { Diagnostic } from "../engine/checker.ts";

const parser = jsParser.configure({ dialect: "ts" });

type Props = {
  code: string;
  blank?: { text: string };
  errors?: Diagnostic[];
  className?: string;
};

type Chunk = { from: number; text: string; classes: string };
type Mark = { from: number; to: number; className: string };

const NO_ERRORS: Diagnostic[] = [];

export function CodeBlock({ code, blank, errors = NO_ERRORS, className = "" }: Props) {
  const lines = useMemo(() => {
    const marker = code.indexOf("___");
    const fill = blank ? blank.text || "    " : "";
    const source = blank && marker >= 0 ? code.slice(0, marker) + fill + code.slice(marker + 3) : code;

    const starts = [0];
    for (let i = 0; i < source.length; i++) if (source[i] === "\n") starts.push(i + 1);

    const marks: Mark[] = [];
    if (blank && marker >= 0) marks.push({ from: marker, to: marker + fill.length, className: `blank ${blank.text ? "" : "blank-empty"}` });
    for (const e of errors) {
      const from = (starts[e.line] ?? 0) + e.column;
      marks.push({ from, to: from + Math.max(e.length, 1), className: "error-squiggle" });
    }

    const chunks: Chunk[] = [];
    let pos = 0;
    highlightCode(
      source,
      parser.parse(source),
      classHighlighter,
      (text, classes) => {
        chunks.push({ from: pos, text, classes });
        pos += text.length;
      },
      () => {
        chunks.push({ from: pos, text: "\n", classes: "" });
        pos += 1;
      },
    );

    const cuts = new Set<number>();
    for (const m of marks) {
      cuts.add(m.from);
      cuts.add(m.to);
    }

    const output: ReactNode[][] = [[]];
    let k = 0;
    for (const c of chunks) {
      if (c.text === "\n") {
        output.push([]);
        continue;
      }
      let a = 0;
      const points = [...cuts].filter((x) => x > c.from && x < c.from + c.text.length).sort((x, y) => x - y);
      for (const x of [...points, c.from + c.text.length]) {
        const piece = c.text.slice(a, x - c.from);
        const start = c.from + a;
        const extra = marks.filter((m) => start >= m.from && start < m.to).map((m) => m.className);
        output[output.length - 1].push(
          <span key={k++} className={[c.classes, ...extra].filter(Boolean).join(" ") || undefined}>
            {piece}
          </span>,
        );
        a = x - c.from;
      }
    }
    return output;
  }, [code, blank, errors]);

  const byLine = new Map<number, Diagnostic[]>();
  for (const e of errors) byLine.set(e.line, [...(byLine.get(e.line) ?? []), e]);

  return (
    <pre className={`code-block ${className}`}>
      {lines.map((nodes, i) => (
        <span key={i} className="block">
          {nodes.length ? nodes : "​"}
          {byLine.get(i)?.map((e, j) => (
            <span key={j} className="error-lens">
              {e.message}
            </span>
          ))}
        </span>
      ))}
    </pre>
  );
}
