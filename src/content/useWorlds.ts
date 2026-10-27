import { useLocaleData } from "../i18n/index.ts";

export function useWorlds() {
  return useLocaleData((s) => s.bundle!.worlds);
}
