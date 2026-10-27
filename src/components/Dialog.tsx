import { useEffect, useRef, type ReactNode } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DialogProps {
  label: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Dialog({ label, onClose, children, className = "", id }: DialogProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const items = () => [...(root.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
    (items()[0] ?? root.current)?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <div ref={root} id={id} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={className}>
      {children}
    </div>
  );
}
