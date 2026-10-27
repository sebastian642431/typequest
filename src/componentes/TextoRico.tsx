export function TextoRico({ texto }: { texto: string }) {
  const partes = texto.split(/(`[^`]+`)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") ? (
          <code key={i} className="rounded-md bg-[#e6edf7] px-1.5 py-0.5 font-mono text-[0.88em] text-ink">
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
