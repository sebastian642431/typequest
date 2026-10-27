import { useCallback, useState, type ReactNode } from "react";
import { ExternalLink, Monitor, Moon, Sun, Trash2 } from "lucide-react";
import { useProgress } from "../state/progress.ts";
import { useSettings, type Theme } from "../state/settings.ts";
import { locales, useLocale, useT } from "../i18n/index.ts";
import { ConfirmDialog } from "../ui/ConfirmDialog.tsx";

const REPO = "https://github.com/sebastian642431/typequest";

function Switch({ on, onChange, label, desc }: { on: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 p-4">
      <span>
        <span className="block font-bold">{label}</span>
        <span className="block text-sm text-ink-2">{desc}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`relative h-8 w-14 shrink-0 rounded-full border-2 transition-colors ${on ? "border-accent-2 bg-accent" : "border-line bg-surface-3"}`}
      >
        <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-[left] ${on ? "left-[26px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

export function Settings() {
  const t = useT();
  const s = useSettings();
  const locale = useLocale();
  const reset = useProgress((p) => p.reset);
  const [confirming, setConfirming] = useState(false);
  const closeConfirm = useCallback(() => setConfirming(false), []);
  const themes: { id: Theme; label: string; icon: ReactNode }[] = [
    { id: "system", label: t.settings.system, icon: <Monitor className="size-5" aria-hidden="true" /> },
    { id: "light", label: t.settings.light, icon: <Sun className="size-5" aria-hidden="true" /> },
    { id: "dark", label: t.settings.dark, icon: <Moon className="size-5" aria-hidden="true" /> },
  ];

  return (
    <div>
      <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-ink-2">{t.settings.appearance}</h2>
      <div className="card mt-2 p-4">
        <p className="font-bold">{t.settings.theme}</p>
        <div role="radiogroup" aria-label={t.settings.theme} className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-surface-2 p-1.5">
          {themes.map((op) => (
            <button
              key={op.id}
              type="button"
              role="radio"
              aria-checked={s.theme === op.id}
              onClick={() => s.setTheme(op.id)}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors ${
                s.theme === op.id ? "bg-surface text-accent shadow-[0_2px_0_0_var(--c-line)]" : "text-ink-2 hover:text-ink"
              }`}
            >
              {op.icon}
              {op.label}
            </button>
          ))}
        </div>
      </div>
      <div className="card mt-3 divide-y-2 divide-line">
        <Switch on={s.sound} onChange={s.setSound} label={t.settings.sound} desc={t.settings.soundDesc} />
        <Switch on={s.vibration} onChange={s.setVibration} label={t.settings.vibration} desc={t.settings.vibrationDesc} />
      </div>

      <h2 className="mt-8 text-sm font-extrabold uppercase tracking-[0.12em] text-ink-2">{t.settings.language}</h2>
      <div className="card mt-2 p-4">
        <select
          value={locale.locale}
          onChange={(e) => locale.setLocale(e.target.value)}
          aria-label={t.settings.language}
          className="h-12 w-full rounded-xl border-2 border-line bg-surface-2 px-3 font-bold text-ink"
        >
          {Object.entries(locales).map(([code, meta]) => (
            <option key={code} value={code}>
              {meta.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-ink-2">{t.settings.languageDesc}</p>
      </div>

      <h2 className="mt-8 text-sm font-extrabold uppercase tracking-[0.12em] text-ink-2">{t.settings.data}</h2>
      <div className="card mt-2 p-4">
        <p className="font-bold">{t.settings.reset}</p>
        <p className="text-sm text-ink-2">{t.settings.resetDesc}</p>
        <button type="button" onClick={() => setConfirming(true)} className="btn btn-secondary mt-3 text-danger">
          <Trash2 className="size-5" aria-hidden="true" />
          {t.settings.reset}
        </button>
        <ConfirmDialog
          open={confirming}
          title={t.settings.confirmTitle}
          text={t.settings.confirm}
          confirmLabel={t.settings.yesDelete}
          cancelLabel={t.settings.cancel}
          onCancel={closeConfirm}
          onConfirm={() => {
            reset();
            setConfirming(false);
          }}
        />
      </div>

      <h2 className="mt-8 text-sm font-extrabold uppercase tracking-[0.12em] text-ink-2">{t.settings.about}</h2>
      <div className="card mt-2 p-4">
        <a href={REPO} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold text-accent underline underline-offset-4">
          {t.settings.code} <ExternalLink className="size-4" aria-hidden="true" />
        </a>
        <p className="mt-2 text-sm text-ink-2">{t.settings.license}</p>
      </div>
    </div>
  );
}
