import type { Complete } from "../content/types.ts";
import { check } from "../engine/compiler.ts";
import { useT } from "../i18n/index.ts";
import { CodeBlock } from "../ui/CodeBlock.tsx";
import { TextField } from "../ui/TextField.tsx";
import { ShowTests } from "./ShowTests.tsx";
import { define } from "./definition.ts";

export const complete = define<Complete, string>({
  initial: () => "",
  ready: (a) => a.trim().length > 0,
  check: async (e, a) => {
    const res = await check(e.code.replace("___", a.trim()), e.tests);
    return { ok: res.ok, own: res.own, tests: res.tests };
  },
  solution: (e) => e.solution,
  Body: function CompleteBody({ exercise, answer, setAnswer, locked }) {
    const t = useT();
    return (
      <>
        <CodeBlock code={exercise.code} blank={{ text: answer }} />
        <TextField value={answer} onChange={setAnswer} disabled={locked} label={t.exercise.blank} className="mt-4" />
        <ShowTests tests={exercise.tests} />
      </>
    );
  },
});
