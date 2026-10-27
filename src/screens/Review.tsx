import { RotateCcw } from "lucide-react";
import { dueReviews, useProgress } from "../state/progress.ts";
import { useT } from "../i18n/index.ts";

export function Review({ start }: { start: () => void }) {
  const t = useT();
  const review = useProgress((s) => s.review);
  const due = dueReviews(review).length;
  const queued = Object.keys(review).length;
  const upcoming = Object.values(review)
    .map((r) => r.due)
    .filter((v) => v > Date.now())
    .sort((a, b) => a - b)[0];
  const days = upcoming ? Math.ceil((upcoming - Date.now()) / 86400000) : null;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-32 pt-6 sm:pb-36">
      <h1 className="text-3xl font-extrabold">{t.review.title}</h1>
      <p className="mt-2 text-ink-2">{t.review.subtitle}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-sm font-bold text-ink-2">{t.review.due}</p>
          <p className={`text-4xl font-extrabold ${due ? "text-danger" : "text-ink-3"}`}>{due}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm font-bold text-ink-2">{t.review.queued}</p>
          <p className="text-4xl font-extrabold text-ink">{queued}</p>
        </div>
      </div>
      {due > 0 ? (
        <button type="button" onClick={start} className="btn btn-primary mt-6 w-full text-lg">
          <RotateCcw className="size-5" aria-hidden="true" />
          {t.review.start(Math.min(due, 12))}
        </button>
      ) : (
        <div className="mt-6 rounded-[20px] border-2 border-dashed border-line p-6 text-center">
          <p className="font-bold">{queued ? t.review.nothing : t.review.empty}</p>
          {days !== null && <p className="mt-1 text-sm text-ink-2">{t.review.next(days)}</p>}
        </div>
      )}
    </main>
  );
}
