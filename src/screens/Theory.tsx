import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Lightbulb, Play } from "lucide-react";
import type { Lesson } from "../content/types.ts";
import { useT } from "../i18n/index.ts";
import { CodeBlock } from "../ui/CodeBlock.tsx";
import { RichText } from "../ui/RichText.tsx";
import { ListenButton } from "../ui/ListenButton.tsx";
import { useCompilerErrors } from "../engine/compiler.ts";

export function Theory({ lesson, start }: { lesson: Lesson; start: () => void }) {
  const t = useT();
  const [i, setI] = useState(0);
  const total = lesson.theory.length;
  const card = lesson.theory[i];
  const last = i === total - 1;
  const errors = useCompilerErrors(card.code);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (last) start();
        else setI((n) => n + 1);
      }
      if (e.key === "ArrowLeft" && i > 0) setI((n) => n - 1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [i, last, start]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-36 pt-6">
      <div className="flex items-start gap-3 rounded-[20px] border-2 border-gold/50 bg-gold-soft p-4">
        <Lightbulb className="mt-0.5 size-6 shrink-0 text-gold-2" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-gold-2">{t.theory.theIdea}</p>
          <p className="text-lg font-extrabold leading-snug">
            <RichText text={lesson.idea} />
          </p>
        </div>
        <ListenButton text={lesson.idea} />
      </div>

      <div className="mt-5 flex items-center justify-center gap-2" aria-hidden="true">
        {lesson.theory.map((_, n) => (
          <span key={n} className={`h-2 rounded-full transition-all ${n === i ? "w-8 bg-accent" : n < i ? "w-2 bg-accent/50" : "w-2 bg-surface-3"}`} />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {t.theory.step(i + 1, total)}
      </p>

      <section key={i} className="card anim-enter mt-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-extrabold leading-tight">{card.title}</h2>
          <ListenButton text={`${card.title}. ${card.text}`} />
        </div>
        <p className="mt-2 text-lg leading-relaxed">
          <RichText text={card.text} />
        </p>
        {card.code && <CodeBlock code={card.code} errors={errors} className="mt-4" />}
      </section>

      <div className="safe-bottom fixed inset-x-0 bottom-0 border-t-2 border-line bg-surface">
        <div className="mx-auto flex max-w-2xl gap-3 px-4 py-4">
          {i > 0 && (
            <button type="button" onClick={() => setI(i - 1)} aria-label={t.theory.previous} className="btn btn-secondary w-14 shrink-0 px-0">
              <ArrowLeft className="size-5" aria-hidden="true" />
            </button>
          )}
          <button type="button" autoFocus onClick={() => (last ? start() : setI(i + 1))} className="btn btn-primary flex-1 text-lg">
            {last ? (
              <>
                <Play className="size-5 fill-current" aria-hidden="true" /> {t.session.start}
              </>
            ) : (
              <>
                {t.theory.next} <ArrowRight className="size-5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
