import type { Choose } from "../content/types.ts";
import { CodeBlock } from "../ui/CodeBlock.tsx";
import { RichText } from "../ui/RichText.tsx";
import { define } from "./definition.ts";

export const choose = define<Choose, number | null>({
  initial: () => null,
  ready: (a) => a !== null,
  check: (e, a) => ({ ok: a === e.correct }),
  solution: (e) => e.options[e.correct],
  Body: function ChooseBody({ exercise, answer, setAnswer, locked }) {
    return (
      <>
        {exercise.code && <CodeBlock code={exercise.code} className="mb-4" />}
        <div className="grid gap-2">
          {exercise.options.map((op, i) => (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => setAnswer(i)}
              aria-pressed={answer === i}
              className={`min-h-12 rounded-xl border-2 px-4 py-3 text-left font-medium transition-colors ${
                answer === i
                  ? "border-accent bg-accent-soft shadow-[0_3px_0_0_var(--c-accent)]"
                  : "border-line bg-surface shadow-[0_3px_0_0_var(--c-line)] hover:bg-surface-2"
              }`}
            >
              <RichText text={op} />
            </button>
          ))}
        </div>
      </>
    );
  },
});
