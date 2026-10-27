import { useT } from "../i18n/index.ts";
import { CodeBlock } from "../ui/CodeBlock.tsx";

export function ShowTests({ tests }: { tests: string }) {
  const t = useT();
  return (
    <details className="mt-3 text-sm text-ink-2">
      <summary>{t.exercise.showTests}</summary>
      <CodeBlock code={tests} className="mt-2 !text-[13px]" />
    </details>
  );
}
