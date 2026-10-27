import type { Predict } from "../content/types.ts";
import { comparePrediction } from "../engine/checker.ts";
import { useCompilerErrors } from "../engine/compiler.ts";
import { useT } from "../i18n/index.ts";
import { CodeBlock } from "../ui/CodeBlock.tsx";
import { TextField } from "../ui/TextField.tsx";
import { define } from "./definition.ts";

export const predict = define<Predict, string>({
  initial: () => "",
  ready: (a) => a.trim().length > 0,
  check: (e, a) => ({ ok: comparePrediction(a, e.answer) }),
  solution: (e) => e.answer,
  Body: function PredictBody({ exercise, answer, setAnswer, locked }) {
    const t = useT();
    const errors = useCompilerErrors(exercise.code, locked);
    return (
      <>
        <CodeBlock code={exercise.code} errors={errors} />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <TextField value={answer} onChange={setAnswer} disabled={locked} label={t.exercise.result} className="sm:flex-1" />
          <button type="button" disabled={locked} onClick={() => setAnswer("type error")} className="btn btn-secondary font-mono text-sm">
            type error
          </button>
        </div>
      </>
    );
  },
});
