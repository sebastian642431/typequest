import { Lock, Trophy } from "lucide-react";
import { ACHIEVEMENT_ORDER, useProgress } from "../state/progress.ts";
import { useT } from "../i18n/index.ts";

export function Achievements() {
  const t = useT();
  const achievements = useProgress((s) => s.achievements);
  const owned = ACHIEVEMENT_ORDER.filter((id) => achievements[id]).length;
  return (
    <div>
      <p className="text-right font-mono text-sm font-bold text-ink-2">
        {owned}/{ACHIEVEMENT_ORDER.length}
      </p>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${(owned / ACHIEVEMENT_ORDER.length) * 100}%` }} />
      </div>
      <ul className="mt-4 grid gap-3">
        {ACHIEVEMENT_ORDER.map((id) => {
          const [name, desc] = t.achievements.list[id] ?? [id, ""];
          const ok = !!achievements[id];
          return (
            <li key={id} className={`flex items-center gap-3 rounded-[18px] border-2 p-3 ${ok ? "border-gold/60 bg-gold-soft" : "border-line bg-surface"}`}>
              <span className={`grid size-12 shrink-0 place-items-center rounded-full ${ok ? "bg-gold text-[#3a2a00] shadow-[0_3px_0_0_var(--c-gold-2)]" : "bg-surface-2 text-ink-3"}`}>
                {ok ? <Trophy className="size-6" aria-hidden="true" /> : <Lock className="size-5" aria-hidden="true" />}
              </span>
              <span className="min-w-0">
                <span className={`block font-extrabold leading-tight ${ok ? "" : "text-ink-2"}`}>{name}</span>
                <span className="block text-sm text-ink-2">{desc}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
