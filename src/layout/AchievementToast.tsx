import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { useProgress, type AchievementId } from "../state/progress.ts";
import { useT } from "../i18n/index.ts";
import { playAchievement } from "../engine/effects.ts";

export function AchievementToast() {
  const t = useT();
  const unseen = useProgress((s) => s.unseen);
  const [current, setCurrent] = useState<AchievementId | null>(null);

  useEffect(() => {
    if (current || !unseen.length) return;
    setCurrent(unseen[0]);
    playAchievement();
  }, [unseen, current]);

  useEffect(() => {
    if (!current) return;
    const id = setTimeout(() => {
      useProgress.setState({ unseen: useProgress.getState().unseen.slice(1) });
      setCurrent(null);
    }, 3200);
    return () => clearTimeout(id);
  }, [current]);

  if (!current) return null;
  const [name, desc] = t.achievements.list[current] ?? [current, ""];
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-3 sm:inset-x-auto sm:right-5 sm:top-5" role="status" aria-live="polite">
      <div className="anim-drop relative w-full max-w-sm overflow-hidden rounded-[20px] border-[3px] border-gold bg-surface shadow-[0_16px_48px_rgb(0_0_0/0.45)]">
        <div className="flex items-center gap-3 p-3 pr-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold text-[#3a2a00] shadow-[0_3px_0_0_var(--c-gold-2)]">
            <Trophy className="size-7" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-gold-2">{t.achievements.unlocked}</p>
            <p className="text-lg font-extrabold leading-tight">{name}</p>
            <p className="text-sm text-ink-2">{desc}</p>
          </div>
        </div>
        <span key={current} className="timer-bar absolute bottom-0 left-0 h-1 w-full origin-left bg-gold" aria-hidden="true" />
      </div>
    </div>
  );
}
