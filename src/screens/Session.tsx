import { useMemo, useRef, useState } from "react";
import { isBoss, type Exercise, type Lesson, type World } from "../content/types.ts";
import { DAILY_GOAL, ACHIEVEMENT_ORDER, today, levelFor, useProgress, type AchievementId } from "../state/progress.ts";
import { useT } from "../i18n/index.ts";
import { confetti, playCorrect, playWrong, playFinish, vibrate } from "../engine/effects.ts";
import { ExerciseView } from "../exercises/ExerciseView.tsx";
import { Theory } from "./Theory.tsx";
import { Heart, Star, X, Zap } from "lucide-react";

export type Item = { key: string; exercise: Exercise };

type Props = {
  title: string;
  lesson?: Lesson;
  world?: World;
  items: Item[];
  mode: "lesson" | "review";
  exit: () => void;
};

const XP_CORRECT = 10;
const XP_REVIEW = 5;
const XP_FINISH = 20;
const XP_PERFECT = 15;


export function Session({ title, lesson, world, items, mode, exit }: Props) {
  const t = useT();
  const [phase, setPhase] = useState<"theory" | "playing" | "done" | "no-lives">(lesson ? "theory" : "playing");
  const [queue, setQueue] = useState<Item[]>(items);
  const [turn, setTurn] = useState(0);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [xpEarned, setXpEarned] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [floating, setFloating] = useState<{ id: number; xp: number } | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const start = useRef({ level: levelFor(useProgress.getState().xp).level, today: useProgress.getState().xpToday.day === today() ? useProgress.getState().xpToday.xp : 0 });
  const lives = useProgress((s) => s.lives);
  const p = useProgress.getState;

  const total = items.length;
  const solved = total - queue.length;
  const current = queue[0];
  const accuracy = useMemo(() => (total ? (total - missed.size) / total : 1), [total, missed]);

  function closeSession(finalAccuracy: number) {
    const notices: string[] = [];
    if (mode === "lesson" && lesson && world) {
      p().finishLesson(`${world.id}/${lesson.id}`, finalAccuracy);
      let bonus = XP_FINISH;
      if (finalAccuracy >= 1) bonus += XP_PERFECT;
      p().addXp(bonus);
      setXpEarned((x) => x + bonus);
      const finished = p().lessons;
      const id = `world-${world.id}` as AchievementId;
      if (ACHIEVEMENT_ORDER.includes(id) && world.lessons.every((l) => finished[`${world.id}/${l.id}`])) p().unlock(id);
    }
    const now = useProgress.getState();
    const newLevel = levelFor(now.xp).level;
    if (newLevel > start.current.level) notices.push(t.session.levelUp(newLevel));
    const todayXp = now.xpToday.day === today() ? now.xpToday.xp : 0;
    if (start.current.today < DAILY_GOAL && todayXp >= DAILY_GOAL) notices.push(t.session.goalReached);
    setExtras(notices);
    playFinish();
    confetti(finalAccuracy >= 1 || notices.length > 0);
    setPhase("done");
  }

  function finish(ok: boolean) {
    const item = queue[0];
    const rest = queue.slice(1);
    if (ok) {
      const newCombo = combo + 1;
      const alreadyMissed = missed.has(item.key);
      const base = mode === "review" ? XP_REVIEW : alreadyMissed ? 2 : XP_CORRECT;
      const xp = base + (newCombo >= 3 ? Math.min(newCombo - 2, 5) : 0);
      setCombo(newCombo);
      setBestCombo((m) => Math.max(m, newCombo));
      p().addXp(xp);
      p().markCorrect(item.key, mode === "review", newCombo);
      if (isBoss(item.exercise)) p().unlock("boss");
      setXpEarned((x) => x + xp);
      setFloating({ id: Date.now(), xp });
      setQueue(rest);
      if (!rest.length) closeSession(total ? (total - missed.size) / total : 1);
    } else {
      setCombo(0);
      p().markWrong(item.key);
      p().loseLife();
      setMissed((f) => new Set(f).add(item.key));
      setQueue([...rest, item]);
      if (useProgress.getState().lives <= 0) setPhase("no-lives");
    }
    setTurn((n) => n + 1);
  }

  function onAnswer(ok: boolean) {
    if (ok) {
      playCorrect(combo + 1);
      vibrate(15);
    } else {
      playWrong();
      vibrate(80);
    }
  }

  const perfect = missed.size === 0 && mode === "lesson";

  return (
    <div className="flex min-h-svh flex-col">
      <div className="sticky top-0 z-20 border-b-2 border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-4">
          <button type="button" onClick={exit} aria-label={t.session.exit} className="grid size-10 shrink-0 place-items-center rounded-lg text-ink-2 hover:bg-surface-2">
            <X className="size-6" />
          </button>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={solved} aria-label={title}>
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${combo >= 3 ? "bg-fire" : "bg-accent"}`}
              style={{ width: `${(solved / Math.max(total, 1)) * 100}%` }}
            />
          </div>
          {combo >= 3 && (
            <span key={combo} className="anim-bounce flex shrink-0 items-center gap-0.5 font-extrabold text-fire" aria-label={t.session.combo(combo)}>
              <Zap className="size-5 fill-fire text-fire" aria-hidden="true" />
              {combo}
            </span>
          )}
          <span className="relative flex shrink-0 items-center gap-1 font-bold text-danger">
            <Heart className={`size-6 ${lives > 0 ? "fill-danger text-danger" : "text-ink-3"}`} aria-hidden="true" />
            {lives}
            {floating && (
              <span key={floating.id} className="anim-float pointer-events-none absolute -left-10 top-0 font-extrabold text-gold-2" aria-hidden="true">
                +{floating.xp}
              </span>
            )}
          </span>
        </div>
      </div>

      {phase === "theory" && lesson && <Theory lesson={lesson} start={() => setPhase("playing")} />}

      {phase === "playing" && current && (
        <ExerciseView key={`${turn}-${current.key}`} exercise={current.exercise} boss={isBoss(current.exercise)} onAnswer={onAnswer} onFinish={finish} />
      )}

      {phase === "done" && (
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <Star className="anim-bounce size-24 fill-gold text-gold-2" aria-hidden="true" />
          <h1 className="mt-4 text-3xl font-extrabold">{mode === "review" ? t.session.finishReview : perfect ? t.session.finishPerfect : t.session.finish}</h1>
          {extras.map((e) => (
            <p key={e} className="anim-drop mt-3 rounded-xl bg-gold-soft px-4 py-2 font-bold text-gold-2">
              {e}
            </p>
          ))}
          <div className="mt-6 grid w-full grid-cols-3 gap-2">
            <div className="card p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-2">{t.session.xp}</p>
              <p className="text-3xl font-extrabold text-gold-2">+{xpEarned}</p>
            </div>
            <div className="card p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-2">{t.session.firstTry}</p>
              <p className="text-3xl font-extrabold text-success">{Math.round(accuracy * 100)}%</p>
            </div>
            <div className="card p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-2">{t.session.bestCombo}</p>
              <p className="text-3xl font-extrabold text-fire">{bestCombo}</p>
            </div>
          </div>
          {missed.size > 0 && mode === "lesson" && (
            <p className="mt-4 text-sm text-ink-2">{missed.size === 1 ? t.session.oneToReview : t.session.manyToReview(missed.size)}</p>
          )}
          <button type="button" autoFocus onClick={exit} className="btn btn-primary mt-8 w-full">
            {t.session.keepGoing}
          </button>
        </main>
      )}

      {phase === "no-lives" && (
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <Heart className="size-20 text-ink-3" aria-hidden="true" />
          <h1 className="mt-4 text-3xl font-extrabold">{t.session.noLives}</h1>
          <p className="mt-2 text-ink-2">{t.session.noLivesText}</p>
          <button type="button" autoFocus onClick={exit} className="btn btn-primary mt-8 w-full">
            {t.session.backToMap}
          </button>
        </main>
      )}
    </div>
  );
}
