import { BookOpen, RotateCcw, UserRound, type LucideIcon } from "lucide-react";
import { dueReviews, useProgress } from "../state/progress.ts";
import { useT } from "../i18n/index.ts";

export type Section = "learn" | "review";

type Props = {
  current: Section;
  go: (s: Section) => void;
  openProfile: () => void;
  profileOpen: boolean;
};

export function NavBar({ current, go, openProfile, profileOpen }: Props) {
  const t = useT();
  const due = useProgress((s) => dueReviews(s.review).length);

  const items: { id: string; icon: LucideIcon; label: string; active: boolean; action: () => void; badge?: number }[] = [
    { id: "learn", icon: BookOpen, label: t.nav.learn, active: current === "learn" && !profileOpen, action: () => go("learn") },
    { id: "review", icon: RotateCcw, label: t.nav.review, active: current === "review" && !profileOpen, action: () => go("review"), badge: due },
    { id: "profile", icon: UserRound, label: t.nav.profile, active: profileOpen, action: openProfile },
  ];

  return (
    <nav
      aria-label={t.a11y.sections}
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-surface/95 backdrop-blur-md sm:inset-x-auto sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:rounded-[22px] sm:border-2 sm:pb-0 sm:shadow-[0_8px_30px_var(--c-shadow)]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3 sm:flex sm:max-w-none sm:gap-1 sm:p-1.5">
        {items.map(({ id, icon: Icon, label, active, action, badge }) => (
          <li key={id}>
            <button
              type="button"
              onClick={action}
              aria-current={active && id !== "profile" ? "page" : undefined}
              aria-haspopup={id === "profile" ? "dialog" : undefined}
              className={`relative flex h-16 w-full flex-col items-center justify-center gap-0.5 text-xs font-bold transition-colors sm:h-12 sm:flex-row sm:gap-2 sm:rounded-2xl sm:px-5 sm:text-sm ${
                active ? "text-accent sm:bg-accent-soft" : "text-ink-2 hover:text-ink sm:hover:bg-surface-2"
              }`}
            >
              <span className={`grid h-8 w-14 place-items-center rounded-full transition-colors sm:h-auto sm:w-auto ${active ? "bg-accent-soft sm:bg-transparent" : ""}`}>
                <Icon className="size-[22px] sm:size-5" strokeWidth={active ? 2.6 : 2.1} aria-hidden="true" />
              </span>
              {label}
              {!!badge && (
                <span className="absolute right-[calc(50%-26px)] top-2 grid min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-extrabold leading-5 text-on-accent sm:static sm:ml-0.5">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
