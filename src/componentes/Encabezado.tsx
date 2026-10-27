import { useEffect } from "react";
import { META_DIARIA, VIDAS_MAX, hoy, nivelDe, rachaVigente, useProgreso } from "../estado/progreso.ts";
import { useT } from "../i18n/index.ts";
import { Corazon, Llama, Medalla, Parlante } from "./Iconos.tsx";

export function Logo() {
  return (
    <span className="text-2xl font-extrabold tracking-tight">
      <span className="onda">Typequest</span>
    </span>
  );
}

function AnilloMeta({ valor }: { valor: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const lleno = Math.min(1, valor);
  return (
    <svg viewBox="0 0 36 36" className="size-9 -rotate-90" aria-hidden="true">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#e3eaf4" strokeWidth="4" />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke={lleno >= 1 ? "var(--color-verde)" : "#ffc53d"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - lleno)}
        className="transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
}

export function Encabezado({ alInicio, abrirLogros }: { alInicio: () => void; abrirLogros: () => void }) {
  const t = useT();
  const xp = useProgreso((s) => s.xp);
  const xpHoy = useProgreso((s) => (s.xpHoy.dia === hoy() ? s.xpHoy.xp : 0));
  const vidas = useProgreso((s) => s.vidas);
  const racha = useProgreso((s) => rachaVigente(s.racha, s.ultimoDia));
  const sonido = useProgreso((s) => s.sonido);
  const alternarSonido = useProgreso((s) => s.alternarSonido);
  const recargar = useProgreso((s) => s.recargarVidas);
  const n = nivelDe(xp);

  useEffect(() => {
    recargar();
    const id = setInterval(recargar, 30000);
    return () => clearInterval(id);
  }, [recargar]);

  return (
    <header className="sticky top-0 z-20 border-b-2 border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-2 px-4">
        <button type="button" onClick={alInicio} className="rounded-lg" aria-label={t.encabezado.irAlMapa}>
          <Logo />
        </button>
        <div className="flex items-center gap-2 text-[15px] font-bold sm:gap-4">
          <span className="flex items-center gap-1" title={t.encabezado.racha}>
            <Llama className="size-6" activa={racha > 0} />
            <span className={racha > 0 ? "text-[#e2701f]" : "text-ink-2"}>{racha}</span>
            <span className="sr-only">{t.encabezado.racha}</span>
          </span>
          <span className="relative grid place-items-center" title={t.encabezado.metaDiaria(xpHoy, META_DIARIA)}>
            <AnilloMeta valor={xpHoy / META_DIARIA} />
            <span className="absolute text-[10px] font-extrabold">{Math.min(xpHoy, 999)}</span>
            <span className="sr-only">{t.encabezado.metaDiaria(xpHoy, META_DIARIA)}</span>
          </span>
          <span className="hidden items-center gap-2 sm:flex" title={`${t.encabezado.xp}: ${xp}`}>
            <span className="rounded-lg bg-accent px-2 py-0.5 text-sm text-white">{t.encabezado.nivel(n.nivel)}</span>
            <span className="h-2 w-16 overflow-hidden rounded-full bg-[#e3eaf4]">
              <span className="block h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${n.progreso * 100}%` }} />
            </span>
          </span>
          <span className="rounded-lg bg-accent px-2 py-0.5 text-sm text-white sm:hidden">{n.nivel}</span>
          <span className="flex items-center gap-1" title={t.encabezado.vidas}>
            <Corazon className="size-6" lleno={vidas > 0} />
            <span className="text-rojo">{vidas}</span>
            <span className="sr-only">/ {VIDAS_MAX}</span>
          </span>
          <button type="button" onClick={abrirLogros} className="grid size-9 place-items-center rounded-lg hover:bg-[#eef3fa]" aria-label={t.encabezado.logros}>
            <Medalla className="size-6" />
          </button>
          <button
            type="button"
            onClick={alternarSonido}
            className="hidden size-9 place-items-center rounded-lg text-ink-2 hover:bg-[#eef3fa] sm:grid"
            aria-label={sonido ? t.encabezado.sonidoOn : t.encabezado.sonidoOff}
            aria-pressed={sonido}
          >
            <Parlante className="size-5" activo={sonido} />
          </button>
        </div>
      </div>
    </header>
  );
}
