import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  header?: ReactNode;
  tall?: boolean;
  children: ReactNode;
};

export function Sheet({ open, onClose, title, closeLabel, header, tall = false, children }: Props) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    box.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  const closeButton = (
    <button type="button" onClick={onClose} aria-label={closeLabel} className="grid size-10 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2">
      <X className="size-5" />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <button type="button" aria-label={closeLabel} tabIndex={-1} onClick={onClose} className="anim-fade absolute inset-0 cursor-default bg-[rgb(5_8_14/0.6)]" />
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`anim-sheet safe-bottom relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border-2 border-b-0 border-line bg-surface shadow-[0_-10px_40px_var(--c-shadow)] outline-none sm:rounded-[28px] sm:border-b-2 ${
          tall ? "h-[min(88svh,680px)]" : "max-h-[88svh]"
        }`}
      >
        {header ? (
          <div className="flex shrink-0 items-center gap-2 border-b-2 border-line px-4 py-3">
            <div className="min-w-0 flex-1">{header}</div>
            {closeButton}
          </div>
        ) : (
          <div className="absolute right-3 top-3 z-10">{closeButton}</div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5">{children}</div>
      </div>
    </div>
  );
}
