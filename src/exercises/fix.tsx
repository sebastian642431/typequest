import { lazy, Suspense, useCallback } from "react";
import type { Fix } from "../content/types.ts";
import { check } from "../engine/compiler.ts";
import { useT } from "../i18n/index.ts";
import { CodeBlock } from "../ui/CodeBlock.tsx";
import { ShowTests } from "./ShowTests.tsx";
import { define } from "./definition.ts";

const Editor = lazy(() => import("../ui/Editor.tsx"));

export const fix = define<Fix, string>({
  initial: (e) => e.code,
  ready: (a) => a.trim().length > 0,
  check: async (e, a) => {
    const res = await check(a, e.tests);
    return { ok: res.ok, own: res.own, tests: res.tests };
  },
  solution: (e) => e.solution,
  Body: function FixBody({ exercise, setAnswer, submit }) {
    const t = useT();
    const lint = useCallback(async (c: string) => (await check(c, exercise.tests)).own, [exercise.tests]);
    return (
      <>
        <Suspense fallback={<CodeBlock code={exercise.code} />}>
          <Editor value={exercise.code} onChange={setAnswer} lint={lint} onSubmit={submit} />
        </Suspense>
        <p className="mt-2 text-xs text-ink-2">{t.exercise.editorHelp}</p>
        <ShowTests tests={exercise.tests} />
      </>
    );
  },
});
