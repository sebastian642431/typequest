import { useMundos } from "../contenido/usar.ts";
import { pendientesRepaso, useProgreso } from "../estado/progreso.ts";
import { useT } from "../i18n/index.ts";
import { Candado, Corona, Repaso, Tilde } from "../componentes/Iconos.tsx";

type Props = {
  abrirLeccion: (mundoId: string, leccionId: string) => void;
  abrirRepaso: () => void;
};

const DESVIO = [0, 52, 76, 52, 0, -52, -76, -52];
const COLORES: Record<string, { fondo: string; borde: string }> = {
  basico: { fondo: "#2c6bc0", borde: "#1d4f95" },
  intermedio: { fondo: "#23885a", borde: "#176641" },
  avanzado: { fondo: "#7a4fd0", borde: "#5a35a3" },
  hacker: { fondo: "#13203b", borde: "#000814" },
};

export function Mapa({ abrirLeccion, abrirRepaso }: Props) {
  const t = useT();
  const mundos = useMundos();
  const lecciones = useProgreso((s) => s.lecciones);
  const repaso = useProgreso((s) => s.repaso);
  const pendientes = pendientesRepaso(repaso).length;
  const enCola = Object.keys(repaso).length;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <section className="mb-10 rounded-2xl border-2 border-line bg-surface p-5 shadow-[0_3px_0_0_var(--color-line)] sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-2xl font-extrabold">{t.mapa.titulo}</h1>
          <p className="mt-1 text-ink-2">{t.mapa.bajada}</p>
        </div>
        <button type="button" onClick={abrirRepaso} disabled={pendientes === 0} className="boton boton-secundario mt-4 w-full shrink-0 sm:mt-0 sm:w-auto">
          <Repaso className="size-5" />
          {pendientes > 0 ? t.mapa.repasar(pendientes) : enCola > 0 ? t.mapa.repasoAlDia(enCola) : t.mapa.sinRepasos}
        </button>
      </section>

      {mundos.map((mundo) => {
        const hechas = mundo.lecciones.filter((l) => lecciones[`${mundo.id}/${l.id}`]).length;
        const siguiente = mundo.lecciones.findIndex((l) => !lecciones[`${mundo.id}/${l.id}`]);
        const color = COLORES[mundo.id] ?? COLORES.basico;
        return (
          <section key={mundo.id} className="mb-14" aria-labelledby={`mundo-${mundo.id}`}>
            <div className="mb-6 rounded-2xl p-5 text-white" style={{ background: color.fondo, boxShadow: `0 4px 0 0 ${color.borde}` }}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-80">{t.mapa.mundo(mundo.numero)}</p>
                  <h2 id={`mundo-${mundo.id}`} className="text-3xl font-extrabold">{mundo.titulo}</h2>
                  <p className="mt-1 opacity-90">{mundo.resumen}</p>
                </div>
                <p className="shrink-0 font-mono text-sm font-bold opacity-90">
                  {hechas}/{mundo.lecciones.length}
                </p>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${(hechas / Math.max(1, mundo.lecciones.length)) * 100}%` }} />
              </div>
            </div>

            <ol className="flex flex-col items-center gap-3 overflow-x-clip pb-2">
              {mundo.lecciones.map((l, i) => {
                const clave = `${mundo.id}/${l.id}`;
                const dato = lecciones[clave];
                const hecha = !!dato;
                const perfecta = (dato?.mejor ?? 0) >= 1;
                const actual = i === siguiente;
                const abierta = hecha || actual;
                const desvio = DESVIO[i % DESVIO.length];
                return (
                  <li key={l.id} className="flex w-full flex-col items-center" style={{ transform: `translateX(${desvio}px)` }}>
                    <span className="relative">
                      {perfecta && <Corona className="absolute -top-4 left-1/2 z-10 size-7 -translate-x-1/2" />}
                      <button
                        type="button"
                        disabled={!abierta}
                        onClick={() => abrirLeccion(mundo.id, l.id)}
                        aria-label={`${t.mapa.leccion(i + 1, l.titulo)}${hecha ? t.mapa.hecha : !abierta ? t.mapa.bloqueada : ""}`}
                        className={`grid size-[68px] place-items-center rounded-full border-4 text-xl font-extrabold transition-transform hover:scale-105 disabled:hover:scale-100 ${
                          hecha ? "text-white" : actual ? "animar-pulso bg-surface" : "border-line bg-[#e9eef5] text-[#9aa8bf] shadow-[0_5px_0_0_var(--color-line)]"
                        }`}
                        style={
                          hecha
                            ? { background: perfecta ? "#ffc53d" : color.fondo, borderColor: perfecta ? "#e0a21a" : color.borde, boxShadow: `0 5px 0 0 ${perfecta ? "#e0a21a" : color.borde}` }
                            : actual
                              ? { borderColor: color.fondo, color: color.fondo, boxShadow: `0 5px 0 0 ${color.fondo}` }
                              : undefined
                        }
                      >
                        {hecha ? <Tilde className="size-8" /> : !abierta ? <Candado className="size-6" /> : i + 1}
                      </button>
                    </span>
                    <p className={`mt-2 max-w-48 text-center text-sm font-semibold leading-tight ${abierta ? "" : "text-[#9aa8bf]"}`}>{l.titulo}</p>
                    {hecha && <p className="font-mono text-xs text-ink-2">{perfecta ? t.mapa.perfecta : `${Math.round(dato.mejor * 100)}%`}</p>}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </main>
  );
}
