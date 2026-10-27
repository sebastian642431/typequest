export function SkipLink({ target = "contenido", label = "Saltar al contenido" }: { target?: string; label?: string }) {
  return (
    <a
      href={`#${target}`}
      className="sr-only z-[110] bg-ink px-4 py-3 text-sm text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {label}
    </a>
  );
}
