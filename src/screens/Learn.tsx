import { useCallback, useMemo, useState } from "react";
import { Check, CheckCheck, ChevronRight, Crown, Play, RotateCcw, Swords, Target, Undo2 } from "lucide-react";
import { useWorlds } from "../content/useWorlds.ts";
import { isBoss, type Lesson, type World } from "../content/types.ts";
import { DAILY_GOAL, today, dueReviews, useProgress } from "../state/progress.ts";
import { useT } from "../i18n/index.ts";
import { worldColor } from "../config/worlds.ts";
import { Sheet } from "../ui/Sheet.tsx";
import { RichText } from "../ui/RichText.tsx";
import { ConfirmDialog } from "../ui/ConfirmDialog.tsx";

type Props = {
  openLesson: (worldId: string, lessonId: string) => void;
  goReview: () => void;
};


const OFFSET = [0, 48, 72, 48, 0, -48, -72, -48];

type Selected = { world: World; lesson: Lesson; index: number };

export function Learn({ openLesson, goReview }: Props) {
  const t = useT();
  const worlds = useWorlds();
  const lessons = useProgress((s) => s.lessons);
  const xpToday = useProgress((s) => (s.xpToday.day === today() ? s.xpToday.xp : 0));
  const due = useProgress((s) => dueReviews(s.review).length);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [markingWorld, setMarkingWorld] = useState<World | null>(null);
  const closeMarking = useCallback(() => setMarkingWorld(null), []);
  const markDone = useProgress((s) => s.markDone);

  const next = useMemo(() => {
    for (const world of worlds) {
      const i = world.lessons.findIndex((l) => !lessons[`${world.id}/${l.id}`]);
      if (i >= 0) return { world, lesson: world.lessons[i], index: i };
    }
    return null;
  }, [worlds, lessons]);

  const fresh = Object.keys(lessons).length === 0;
  const goal = Math.min(1, xpToday / DAILY_GOAL);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-32 pt-5 sm:pb-36">
      <section className="grid gap-3 sm:grid-cols-[1fr_1.3fr]">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-ink-2">
            <Target className="size-4 text-gold-2" aria-hidden="true" />
            {t.home.dailyGoal}
          </div>
          <p className="mt-1 text-lg font-extrabold">{t.home.xpOf(Math.min(xpToday, 9999), DAILY_GOAL)}</p>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-3">
            <div className={`h-full rounded-full transition-[width] duration-500 ${goal >= 1 ? "bg-success" : "bg-gold"}`} style={{ width: `${goal * 100}%` }} />
          </div>
          {goal >= 1 && <p className="mt-2 text-xs font-semibold text-success">{t.home.goalDone}</p>}
        </div>

        {next ? (
          <button
            type="button"
            onClick={() => openLesson(next.world.id, next.lesson.id)}
            className="group flex items-center gap-4 rounded-[20px] p-4 text-left text-white transition-transform active:translate-y-1"
            style={{ background: worldColor(next.world.id).background, boxShadow: `0 5px 0 0 ${worldColor(next.world.id).border}` }}
          >
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20">
              <Play className="size-7 fill-white" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold uppercase tracking-[0.12em] opacity-85">
                {fresh ? t.home.startHere : t.home.next} · {next.world.title}
              </span>
              <span className="block truncate text-lg font-extrabold">{next.lesson.title}</span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-sm font-bold opacity-95">
                {t.home.continue} <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </span>
          </button>
        ) : (
          <div className="card p-4 text-ink-2">{t.home.allDone}</div>
        )}
      </section>

      {due > 0 && (
        <button
          type="button"
          onClick={goReview}
          className="mt-3 flex w-full items-center gap-3 rounded-[20px] border-2 border-danger/40 bg-danger-soft p-3 text-left font-bold text-danger transition-transform active:translate-y-0.5"
        >
          <RotateCcw className="size-5 shrink-0" aria-hidden="true" />
          <span className="flex-1">{t.home.reviewPending(due)}</span>
          <span className="inline-flex items-center gap-1 text-sm">
            {t.home.goReview} <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        </button>
      )}

      {worlds.map((world) => {
        const done = world.lessons.filter((l) => lessons[`${world.id}/${l.id}`]).length;
        const upcoming = world.lessons.findIndex((l) => !lessons[`${world.id}/${l.id}`]);
        const color = worldColor(world.id);
        return (
          <section key={world.id} className="mt-10" aria-labelledby={`world-${world.id}`}>
            <div className="rounded-[20px] p-4 text-white" style={{ background: color.background, boxShadow: `0 5px 0 0 ${color.border}` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-85">{t.map.world(world.number)}</p>
                  <h2 id={`world-${world.id}`} className="text-2xl font-extrabold leading-tight">{world.title}</h2>
                  <p className="mt-0.5 text-sm opacity-90">{world.summary}</p>
                </div>
                <p className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 font-mono text-xs font-bold">
                  {done}/{world.lessons.length}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/25">
                  <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${(done / Math.max(1, world.lessons.length)) * 100}%` }} />
                </div>
                {done < world.lessons.length && (
                  <button
                    type="button"
                    onClick={() => setMarkingWorld(world)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-white/40 bg-white/15 px-3 py-1 text-xs font-extrabold transition-colors hover:bg-white/25"
                  >
                    <CheckCheck className="size-4" aria-hidden="true" />
                    {t.map.alreadyKnow}
                  </button>
                )}
              </div>
            </div>

            <ol className="mt-6 flex flex-col items-center gap-5 overflow-x-clip pb-2 pt-12">
              {world.lessons.map((l, i) => {
                const record = lessons[`${world.id}/${l.id}`];
                const finished = !!record;
                const marked = !!record?.marked;
                const perfect = !marked && (record?.best ?? 0) >= 1;
                const current = i === upcoming;
                const boss = l.exercises.some(isBoss);
                const style = finished
                  ? perfect
                    ? { background: "var(--c-gold)", borderColor: "var(--c-gold-2)", boxShadow: "0 6px 0 0 var(--c-gold-2)", color: "#3a2a00" }
                    : { background: "var(--c-success)", borderColor: "var(--c-success-2)", boxShadow: "0 6px 0 0 var(--c-success-2)", color: "var(--c-on-accent)" }
                  : current
                    ? { background: color.background, borderColor: color.border, color: "#fff", ["--node-shadow" as string]: color.border }
                    : { background: "var(--c-surface)", borderColor: color.background, color: color.background, boxShadow: `0 6px 0 0 ${color.background}` };
                return (
                  <li key={l.id} className={`flex w-full flex-col items-center ${current && i > 0 ? "mt-8" : ""}`} style={{ transform: `translateX(${OFFSET[i % OFFSET.length]}px)` }}>
                    <span className="relative">
                      {current && (
                        <span
                          className="anim-hop absolute -top-10 left-1/2 z-10 whitespace-nowrap rounded-xl border-2 border-line bg-surface px-3 py-1 text-xs font-extrabold uppercase tracking-wide shadow-[0_3px_0_0_var(--c-line)]"
                          style={{ color: color.background }}
                          aria-hidden="true"
                        >
                          {fresh ? t.sheet.start : t.home.continue}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelected({ world, lesson: l, index: i })}
                        aria-label={`${t.map.lesson(i + 1, l.title)}${finished ? t.map.done : ""}`}
                        className={`grid size-[72px] place-items-center rounded-full border-4 text-xl font-extrabold transition-transform active:translate-y-1 ${
                          current ? "anim-pulse" : ""
                        }`}
                        style={style}
                      >
                        {finished ? (
                          perfect ? <Crown className="size-8" aria-hidden="true" /> : <Check className="size-8" strokeWidth={3.2} aria-hidden="true" />
                        ) : boss && i === world.lessons.length - 1 ? (
                          <Swords className="size-7" aria-hidden="true" />
                        ) : (
                          i + 1
                        )}
                      </button>
                    </span>
                    <p className={`mt-3 max-w-44 text-center text-sm font-bold leading-tight ${finished ? "text-ink-2" : current ? "" : "text-ink-2"}`}>{l.title}</p>
                    {finished && (
                      <span
                        className={`mt-1 rounded-full px-2 py-0.5 text-xs font-extrabold ${
                          marked ? "bg-surface-2 text-ink-2" : perfect ? "bg-gold-soft text-gold-2" : "bg-success-soft text-success"
                        }`}
                      >
                        {marked ? t.map.marked : perfect ? t.map.perfect : `${Math.round(record.best * 100)}%`}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      <ConfirmDialog
        open={!!markingWorld}
        title={markingWorld ? t.map.markWorldTitle(markingWorld.title) : ""}
        text={markingWorld ? t.map.markWorldText(markingWorld.lessons.filter((l) => !lessons[`${markingWorld.id}/${l.id}`]).length) : ""}
        confirmLabel={t.map.markWorldConfirm}
        cancelLabel={t.settings.cancel}
        onCancel={closeMarking}
        onConfirm={() => {
          if (markingWorld) markDone(markingWorld.lessons.map((l) => `${markingWorld.id}/${l.id}`));
          closeMarking();
        }}
        tone="success"
      />

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected?.lesson.title ?? ""} closeLabel={t.sheet.close}>
        {selected && <LessonDetail selected={selected} start={() => {
          openLesson(selected.world.id, selected.lesson.id);
          setSelected(null);
        }} />}
      </Sheet>
    </main>
  );
}

function LessonDetail({ selected, start }: { selected: Selected; start: () => void }) {
  const t = useT();
  const key = `${selected.world.id}/${selected.lesson.id}`;
  const record = useProgress((s) => s.lessons[key]);
  const markDone = useProgress((s) => s.markDone);
  const unmark = useProgress((s) => s.unmark);
  const color = worldColor(selected.world.id);
  const bosses = selected.lesson.exercises.filter(isBoss).length;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: color.background }}>
        {selected.world.title} · {t.sheet.lesson(selected.index + 1)}
      </p>
      <h3 className="mt-1 pr-10 text-2xl font-extrabold leading-tight">{selected.lesson.title}</h3>
      <p className="mt-2 text-ink-2">
        <RichText text={selected.lesson.summary} />
      </p>
      <ul className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
        <li className="rounded-full bg-surface-2 px-3 py-1 text-ink-2">{t.sheet.exercises(selected.lesson.exercises.length)}</li>
        {bosses > 0 && (
          <li className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-3 py-1 text-danger">
            <Swords className="size-4" aria-hidden="true" /> {t.sheet.bosses(bosses)}
          </li>
        )}
        {record && !record.marked && <li className="rounded-full bg-gold-soft px-3 py-1 text-gold-2">{t.sheet.best(Math.round(record.best * 100))}</li>}
      </ul>
      {record?.marked && <p className="mt-4 rounded-2xl bg-surface-2 p-3 text-sm text-ink-2">{t.sheet.markedNote}</p>}
      <button type="button" onClick={start} className="btn btn-primary mt-6 w-full text-lg">
        <Play className="size-5 fill-current" aria-hidden="true" />
        {record && !record.marked ? t.sheet.repeat : t.sheet.start}
      </button>
      {!record && (
        <button type="button" onClick={() => markDone([key])} className="btn btn-secondary mt-3 w-full">
          <CheckCheck className="size-5" aria-hidden="true" />
          {t.sheet.markDone}
        </button>
      )}
      {record?.marked && (
        <button type="button" onClick={() => unmark(key)} className="btn btn-secondary mt-3 w-full">
          <Undo2 className="size-5" aria-hidden="true" />
          {t.sheet.unmark}
        </button>
      )}
    </div>
  );
}
