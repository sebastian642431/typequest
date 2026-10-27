import { useCallback, useEffect, useState } from "react";
import type { Exercise } from "../content/types.ts";
import type { Diagnostic } from "../engine/checker.ts";
import { useT } from "../i18n/index.ts";
import { RichText } from "../ui/RichText.tsx";
import { ListenButton } from "../ui/ListenButton.tsx";
import { definitionFor } from "./registry.ts";
import type { Verdict } from "./definition.ts";

type Props = {
  exercise: Exercise;
  boss?: boolean;
  onAnswer?: (ok: boolean) => void;
  onFinish: (ok: boolean) => void;
};

function ErrorList({ title, diags }: { title: string; diags?: Diagnostic[] }) {
  const t = useT();
  if (!diags?.length) return null;
  return (
    <div className="mt-2">
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-1 space-y-1 font-mono text-[13px]">
        {diags.slice(0, 4).map((d, i) => (
          <li key={i}>
            <span className="opacity-60">{t.exercise.line(d.line + 1)}</span> {d.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExerciseView({ exercise, boss = false, onAnswer, onFinish }: Props) {
  const t = useT();
  const def = definitionFor(exercise);
  const [praise] = useState(() => t.exercise.praise[Math.floor(Math.random() * t.exercise.praise.length)]);
  const [answer, setAnswer] = useState(() => def.initial(exercise));
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const ready = def.ready(answer);
  const locked = verdict !== null;

  const check = useCallback(async () => {
    if (!ready || verdict || loading) return;
    setLoading(true);
    const v = await def.check(exercise, answer);
    setLoading(false);
    onAnswer?.(v.ok);
    setVerdict(v);
  }, [ready, verdict, loading, def, exercise, answer, onAnswer]);

  const next = useCallback(() => {
    if (verdict) onFinish(verdict.ok);
  }, [verdict, onFinish]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      const inEditor = (e.target as HTMLElement | null)?.closest(".cm-editor");
      if (inEditor && !e.ctrlKey && !e.metaKey && !verdict) return;
      e.preventDefault();
      if (verdict) next();
      else void check();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [verdict, next, check]);

  const prompt = "prompt" in exercise && exercise.prompt ? exercise.prompt.replace(/^Jefe:\s*/, "") : null;
  const hint = "hint" in exercise ? exercise.hint : undefined;
  const Body = def.Body;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-48 pt-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-accent">
          {boss && <span className="rounded-md bg-danger px-2 py-0.5 text-on-accent">{t.exercise.boss}</span>}
          {t.exercise[exercise.type]}
        </p>
        {prompt ? (
          <div className="mt-1 flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold leading-snug sm:text-2xl">
              <RichText text={prompt} />
            </h2>
            <ListenButton text={prompt} />
          </div>
        ) : (
          exercise.type === "predict" && (
            <h2 className="mt-1 text-xl font-bold leading-snug sm:text-2xl">
              {t.exercise.predictPrompt} <code className="font-mono">type error</code>.
            </h2>
          )
        )}

        <div className={`mt-5 ${verdict && !verdict.ok ? "anim-shake" : ""}`}>
          <Body exercise={exercise} answer={answer} setAnswer={setAnswer} locked={locked} submit={() => void check()} />

          {hint && !locked && (
            <div className="mt-4">
              {showHint ? (
                <p className="rounded-xl bg-gold-soft px-4 py-3 text-sm">
                  <RichText text={hint} />
                </p>
              ) : (
                <button type="button" onClick={() => setShowHint(true)} className="text-sm font-semibold text-accent underline underline-offset-4">
                  {t.exercise.showHint}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={`safe-bottom fixed inset-x-0 bottom-0 border-t-2 ${
          !verdict ? "border-line bg-surface" : verdict.ok ? "anim-slide-up border-success/40 bg-success-soft" : "anim-slide-up border-danger/40 bg-danger-soft"
        }`}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end sm:justify-between" aria-live="polite">
          {verdict ? (
            <div className={`min-w-0 flex-1 ${verdict.ok ? "text-success" : "text-danger"}`}>
              <p className={`text-lg font-extrabold ${verdict.ok ? "anim-bounce origin-left" : ""}`}>{verdict.ok ? praise : t.exercise.wrong}</p>
              {!verdict.ok && (
                <p className="mt-1 text-sm text-ink">
                  {t.exercise.answer} <code className="whitespace-pre-wrap break-words font-mono">{def.solution(exercise)}</code>
                </p>
              )}
              <div className="mt-1 flex items-start gap-2">
                <p className="flex-1 text-[15px] text-ink">
                  <RichText text={exercise.explanation} />
                </p>
                <ListenButton text={exercise.explanation} />
              </div>
              {!verdict.ok && (verdict.own?.length || verdict.tests?.length) ? (
                <div className="max-h-32 overflow-y-auto text-ink">
                  <ErrorList title={t.exercise.compilerSays} diags={verdict.own} />
                  <ErrorList title={t.exercise.failsTests} diags={verdict.tests} />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hidden flex-1 sm:block" />
          )}
          <button
            type="button"
            disabled={!verdict && (!ready || loading)}
            onClick={() => (verdict ? next() : void check())}
            className={`btn min-w-40 ${!verdict ? "btn-primary" : verdict.ok ? "btn-success" : "btn-danger"}`}
          >
            {verdict ? t.exercise.continue : loading ? t.exercise.compiling : t.exercise.check}
          </button>
        </div>
      </div>
    </div>
  );
}
