import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "system" | "light" | "dark";

type Settings = {
  theme: Theme;
  sound: boolean;
  vibration: boolean;
  setTheme: (t: Theme) => void;
  setSound: (v: boolean) => void;
  setVibration: (v: boolean) => void;
};

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      theme: "system",
      sound: true,
      vibration: true,
      setTheme: (theme) => set({ theme }),
      setSound: (sound) => set({ sound }),
      setVibration: (vibration) => set({ vibration }),
    }),
    { name: "typequest-settings", version: 1 },
  ),
);

const query = "(prefers-color-scheme: dark)";

function apply(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia(query).matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0e1015" : "#f4f7fb");
}

export function useApplyTheme() {
  const theme = useSettings((s) => s.theme);
  useEffect(() => {
    apply(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia(query);
    const change = () => apply("system");
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, [theme]);
}
