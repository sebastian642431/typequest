import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "../config/site";

export type CopyStatus = "idle" | "copied" | "error";

export const COPY_EVENT = `${siteConfig.slug}:copied`;

function legacyCopy(text: string): boolean {
  const active = document.activeElement as HTMLElement | null;
  const selection = document.getSelection();
  const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.cssText =
    "position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px;pointer-events:none;";
  document.body.appendChild(textarea);

  textarea.focus({ preventScroll: true });
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  document.body.removeChild(textarea);
  if (selection) {
    selection.removeAllRanges();
    if (previousRange) selection.addRange(previousRange);
  }
  active?.focus?.({ preventScroll: true });
  return ok;
}

export function useCopyToClipboard(resetAfter = 2600) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    setStatus("idle");
  }, []);

  const copy = useCallback(
    async (text: string) => {
      let ok = false;
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch {
          ok = false;
        }
      }
      if (!ok) ok = legacyCopy(text);

      setStatus(ok ? "copied" : "error");
      if (ok) {
        navigator.vibrate?.(12);
        window.dispatchEvent(new CustomEvent(COPY_EVENT));
      }
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setStatus("idle"), ok ? resetAfter : resetAfter * 2);
      return ok;
    },
    [resetAfter],
  );

  return { status, copied: status === "copied", failed: status === "error", copy, reset };
}

export type CopyController = ReturnType<typeof useCopyToClipboard>;
