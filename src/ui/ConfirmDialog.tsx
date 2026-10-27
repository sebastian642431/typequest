import { useEffect, useRef, type ReactNode } from "react";
import { CheckCheck, TriangleAlert } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: ReactNode;
  tone?: "danger" | "success";
};

export function ConfirmDialog({ open, title, text, confirmLabel, cancelLabel, onConfirm, onCancel, icon, tone = "danger" }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener("keydown", key, true);
    cancelRef.current?.focus({ preventScroll: true });
    return () => window.removeEventListener("keydown", key, true);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="presentation">
      <button type="button" aria-label={cancelLabel} tabIndex={-1} onClick={onCancel} className="anim-fade absolute inset-0 cursor-default bg-[rgb(5_8_14/0.7)]" />
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text" className="anim-sheet relative w-full max-w-sm rounded-[24px] border-2 border-line bg-surface p-6 text-center shadow-[0_20px_60px_var(--c-shadow)]">
        <span className={`mx-auto grid size-14 place-items-center rounded-full ${tone === "danger" ? "bg-danger-soft text-danger" : "bg-success-soft text-success"}`}>
          {icon ?? (tone === "danger" ? <TriangleAlert className="size-7" aria-hidden="true" /> : <CheckCheck className="size-7" aria-hidden="true" />)}
        </span>
        <h2 id="confirm-title" className="mt-4 text-xl font-extrabold">
          {title}
        </h2>
        <p id="confirm-text" className="mt-2 text-ink-2">
          {text}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button ref={cancelRef} type="button" onClick={onCancel} className="btn btn-secondary">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={`btn ${tone === "danger" ? "btn-danger" : "btn-success"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
