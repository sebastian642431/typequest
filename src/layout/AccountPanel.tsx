import { Settings as SettingsIcon, Trophy, UserRound, type LucideIcon } from "lucide-react";
import { useT } from "../i18n/index.ts";
import { Sheet } from "../ui/Sheet.tsx";
import { Profile } from "../screens/Profile.tsx";
import { Achievements } from "../screens/Achievements.tsx";
import { Settings } from "../screens/Settings.tsx";

export type AccountTab = "profile" | "achievements" | "settings";

const TABS: { id: AccountTab; icon: LucideIcon }[] = [
  { id: "profile", icon: UserRound },
  { id: "achievements", icon: Trophy },
  { id: "settings", icon: SettingsIcon },
];

type Props = {
  tab: AccountTab | null;
  onChange: (tab: AccountTab) => void;
  onClose: () => void;
};

export function AccountPanel({ tab, onChange, onClose }: Props) {
  const t = useT();
  const tabs = (
    <div role="tablist" aria-label={t.nav.profile} className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1">
      {TABS.map(({ id, icon: Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition-colors ${
              active ? "bg-surface text-accent shadow-[0_2px_0_0_var(--c-line)]" : "text-ink-2 hover:text-ink"
            }`}
          >
            <Icon className="size-[18px]" aria-hidden="true" />
            {t.nav[id]}
          </button>
        );
      })}
    </div>
  );

  return (
    <Sheet open={tab !== null} onClose={onClose} title={t.nav.profile} closeLabel={t.sheet.close} header={tabs} tall>
      <div role="tabpanel">
        {tab === "profile" && <Profile />}
        {tab === "achievements" && <Achievements />}
        {tab === "settings" && <Settings />}
      </div>
    </Sheet>
  );
}
