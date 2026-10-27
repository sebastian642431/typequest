import { useMemo } from "react";

export type DeviceTier = "high" | "mid" | "low";

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

export function detectTier(): DeviceTier {
  if (typeof window === "undefined") return "mid";
  const nav = navigator as NavigatorHints;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 768;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const saveData = nav.connection?.saveData === true;

  if (saveData || cores <= 2 || memory <= 2 || (cores <= 4 && memory <= 4 && coarse)) return "low";
  if (coarse || small) return "mid";
  return "high";
}

export function useDeviceTier(): DeviceTier {
  return useMemo(detectTier, []);
}

