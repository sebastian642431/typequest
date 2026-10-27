import { useEffect } from "react";
import { Flame, Heart } from "lucide-react";
import { MAX_LIVES, levelFor, currentStreak, useProgress } from "../state/progress.ts";
import { useT } from "../i18n/index.ts";

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className={`font-extrabold tracking-tight ${small ? "text-xl" : "text-2xl"}`}>
      <span className="squiggle">Typequest</span>
    </span>
  );
}

export function Header({ onHome }: { onHome: () => void }) {
  const t = useT();
  const xp = useProgress((s) => s.xp);
  const lives = useProgress((s) => s.lives);
  const streak = useProgress((s) => currentStreak(s.streak, s.lastDay));
  const refill = useProgress((s) => s.refillLives);
  const n = levelFor(xp);

  useEffect(() => {
    refill();
    const id = setInterval(refill, 30000);
    return () => clearInterval(id);
  }, [refill]);

  return (
    <header className="sticky top-0 z-30 border-b-2 border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4 sm:h-16">
        <button type="button" onClick={onHome} aria-label={t.header.goToMap} className="rounded-lg">
          <Logo small />
        </button>
        <ul className="flex items-center gap-4 text-[15px] font-extrabold sm:gap-5" aria-label={t.a11y.status}>
          <li className="flex items-center gap-1" aria-label={t.header.streak(streak)} title={t.header.streak(streak)}>
            <Flame className={`size-5 ${streak > 0 ? "fill-fire text-fire" : "text-ink-3"}`} strokeWidth={2.2} aria-hidden="true" />
            <span className={streak > 0 ? "text-fire" : "text-ink-3"}>{streak}</span>
          </li>
          <li className="flex items-center gap-1.5" aria-label={t.header.level(n.level)} title={t.header.level(n.level)}>
            <span className="relative grid size-6 place-items-center">
              <svg viewBox="0 0 24 24" className="absolute inset-0 -rotate-90" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="var(--c-surface-3)" strokeWidth="3" />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="var(--c-accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={62.8}
                  strokeDashoffset={62.8 * (1 - n.progress)}
                />
              </svg>
              <span className="text-[11px] text-accent">{n.level}</span>
            </span>
            <span className="hidden text-ink-2 sm:inline">{t.header.level(n.level)}</span>
          </li>
          <li className="flex items-center gap-1" aria-label={t.header.lives(lives, MAX_LIVES)} title={t.header.lives(lives, MAX_LIVES)}>
            <Heart className={`size-5 ${lives > 0 ? "fill-danger text-danger" : "text-ink-3"}`} strokeWidth={2.2} aria-hidden="true" />
            <span className={lives > 0 ? "text-danger" : "text-ink-3"}>{lives}</span>
          </li>
        </ul>
      </div>
    </header>
  );
}
