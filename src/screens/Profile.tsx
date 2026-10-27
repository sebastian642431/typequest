import type { ReactNode } from "react";
import { Award, Crown, Flame, Star, Target, Zap } from "lucide-react";
import { useWorlds } from "../content/useWorlds.ts";
import { ACHIEVEMENT_ORDER, levelFor, currentStreak, useProgress } from "../state/progress.ts";
import { useT } from "../i18n/index.ts";
import { worldColor } from "../config/worlds.ts";

function Stat({ icon, label, value, color }: { icon: ReactNode; label: string; value: ReactNode; color: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${color}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-xl font-extrabold leading-tight">{value}</span>
        <span className="block text-sm font-semibold text-ink-2">{label}</span>
      </span>
    </div>
  );
}

export function Profile() {
  const t = useT();
  const worlds = useWorlds();
  const s = useProgress();
  const n = levelFor(s.xp);
  const streak = currentStreak(s.streak, s.lastDay);
  const done = Object.keys(s.lessons).length;
  const crowns = Object.values(s.lessons).filter((l) => l.best >= 1).length;
  const achievements = ACHIEVEMENT_ORDER.filter((id) => s.achievements[id]).length;

  return (
    <div>
      <section className="card p-5">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-accent text-2xl font-extrabold text-on-accent shadow-[0_4px_0_0_var(--c-accent-2)]">{n.level}</span>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-extrabold">{t.header.level(n.level)}</p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${n.progress * 100}%` }} />
            </div>
            <p className="mt-1 text-xs font-semibold text-ink-2">{t.profile.remaining(n.remaining)}</p>
          </div>
        </div>
      </section>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat icon={<Star className="size-6 fill-current" />} label={t.profile.totalXp} value={s.xp} color="bg-gold-soft text-gold-2" />
        <Stat icon={<Flame className="size-6 fill-current" />} label={t.profile.streak} value={t.profile.days(streak)} color="bg-[color-mix(in_srgb,var(--c-fire)_15%,transparent)] text-fire" />
        <Stat icon={<Target className="size-6" />} label={t.profile.correct} value={s.correctCount} color="bg-success-soft text-success" />
        <Stat icon={<Zap className="size-6 fill-current" />} label={t.profile.bestCombo} value={s.bestCombo} color="bg-[color-mix(in_srgb,var(--c-fire)_15%,transparent)] text-fire" />
        <Stat icon={<Award className="size-6" />} label={t.profile.lessons} value={done} color="bg-accent-soft text-accent" />
        <Stat icon={<Crown className="size-6" />} label={t.profile.crowns} value={crowns} color="bg-gold-soft text-gold-2" />
      </div>
      <p className="mt-3 text-sm font-semibold text-ink-2">
        {t.profile.achievements}: {achievements}/{ACHIEVEMENT_ORDER.length}
      </p>

      <h2 className="mt-8 text-xl font-extrabold">{t.profile.worldProgress}</h2>
      <ul className="mt-3 space-y-3">
        {worlds.map((w) => {
          const h = w.lessons.filter((l) => s.lessons[`${w.id}/${l.id}`]).length;
          const c = worldColor(w.id);
          return (
            <li key={w.id} className="card p-4">
              <div className="flex items-center justify-between gap-3 font-bold">
                <span>{w.title}</span>
                <span className="font-mono text-sm text-ink-2">
                  {h}/{w.lessons.length}
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(h / Math.max(1, w.lessons.length)) * 100}%`, background: c.background }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
