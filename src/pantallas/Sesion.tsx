import { useMemo, useRef, useState } from "react";
import type { Ejercicio, Leccion, Mundo } from "../contenido/tipos.ts";
import { META_DIARIA, ORDEN_LOGROS, hoy, nivelDe, useProgreso, type LogroId } from "../estado/progreso.ts";
import { useT } from "../i18n/index.ts";
import { confeti, sonidoAcierto, sonidoError, sonidoFin, vibrar } from "../motor/efectos.ts";
import { VistaEjercicio } from "../componentes/VistaEjercicio.tsx";
import { CodigoEstatico } from "../componentes/CodigoEstatico.tsx";
import { TextoRico } from "../componentes/TextoRico.tsx";
import { Corazon, Cruz, Estrella, Rayo } from "../componentes/Iconos.tsx";

export type Item = { clave: string; ejercicio: Ejercicio };

type Props = {
  titulo: string;
  leccion?: Leccion;
  mundo?: Mundo;
  items: Item[];
  modo: "leccion" | "repaso";
  salir: () => void;
};

const XP_ACIERTO = 10;
const XP_REPASO = 5;
const XP_FINAL = 20;
const XP_PERFECTA = 15;

export function esJefe(e: Ejercicio) {
  return "enunciado" in e && typeof e.enunciado === "string" && e.enunciado.startsWith("Jefe:");
}

export function Sesion({ titulo, leccion, mundo, items, modo, salir }: Props) {
  const t = useT();
  const [fase, setFase] = useState<"teoria" | "jugando" | "fin" | "sin-vidas">(leccion ? "teoria" : "jugando");
  const [cola, setCola] = useState<Item[]>(items);
  const [turno, setTurno] = useState(0);
  const [fallados, setFallados] = useState<Set<string>>(new Set());
  const [xpGanada, setXpGanada] = useState(0);
  const [combo, setCombo] = useState(0);
  const [mejorCombo, setMejorCombo] = useState(0);
  const [flotante, setFlotante] = useState<{ id: number; xp: number } | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const inicio = useRef({ nivel: nivelDe(useProgreso.getState().xp).nivel, hoy: useProgreso.getState().xpHoy.dia === hoy() ? useProgreso.getState().xpHoy.xp : 0 });
  const vidas = useProgreso((s) => s.vidas);
  const p = useProgreso.getState;

  const total = items.length;
  const resueltos = total - cola.length;
  const actual = cola[0];
  const precision = useMemo(() => (total ? (total - fallados.size) / total : 1), [total, fallados]);

  function cerrarSesion(precisionFinal: number) {
    const avisos: string[] = [];
    if (modo === "leccion" && leccion && mundo) {
      p().terminarLeccion(`${mundo.id}/${leccion.id}`, precisionFinal);
      let bonus = XP_FINAL;
      if (precisionFinal >= 1) bonus += XP_PERFECTA;
      p().ganarXp(bonus);
      setXpGanada((x) => x + bonus);
      const hechas = p().lecciones;
      const id = `mundo-${mundo.id}` as LogroId;
      if (ORDEN_LOGROS.includes(id) && mundo.lecciones.every((l) => hechas[`${mundo.id}/${l.id}`])) p().desbloquear(id);
    }
    const ahora = useProgreso.getState();
    const nivelNuevo = nivelDe(ahora.xp).nivel;
    if (nivelNuevo > inicio.current.nivel) avisos.push(t.sesion.subisteNivel(nivelNuevo));
    const hoyXp = ahora.xpHoy.dia === hoy() ? ahora.xpHoy.xp : 0;
    if (inicio.current.hoy < META_DIARIA && hoyXp >= META_DIARIA) avisos.push(t.sesion.metaCumplida);
    setExtras(avisos);
    sonidoFin();
    confeti(precisionFinal >= 1 || avisos.length > 0);
    setFase("fin");
  }

  function terminar(ok: boolean) {
    const item = cola[0];
    const resto = cola.slice(1);
    if (ok) {
      const nuevoCombo = combo + 1;
      const yaFallado = fallados.has(item.clave);
      const base = modo === "repaso" ? XP_REPASO : yaFallado ? 2 : XP_ACIERTO;
      const xp = base + (nuevoCombo >= 3 ? Math.min(nuevoCombo - 2, 5) : 0);
      setCombo(nuevoCombo);
      setMejorCombo((m) => Math.max(m, nuevoCombo));
      p().ganarXp(xp);
      p().acierto(item.clave, modo === "repaso", nuevoCombo);
      if (esJefe(item.ejercicio)) p().desbloquear("jefe");
      setXpGanada((x) => x + xp);
      setFlotante({ id: Date.now(), xp });
      setCola(resto);
      if (!resto.length) cerrarSesion(total ? (total - fallados.size) / total : 1);
    } else {
      setCombo(0);
      p().fallo(item.clave);
      p().perderVida();
      setFallados((f) => new Set(f).add(item.clave));
      setCola([...resto, item]);
      if (useProgreso.getState().vidas <= 0) setFase("sin-vidas");
    }
    setTurno((n) => n + 1);
  }

  function alResponder(ok: boolean) {
    if (ok) {
      sonidoAcierto(combo + 1);
      vibrar(15);
    } else {
      sonidoError();
      vibrar(80);
    }
  }

  const perfecta = fallados.size === 0 && modo === "leccion";

  return (
    <div className="flex min-h-svh flex-col bg-bg">
      <div className="sticky top-0 z-20 border-b-2 border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-4">
          <button type="button" onClick={salir} aria-label={t.sesion.salir} className="grid size-10 shrink-0 place-items-center rounded-lg text-ink-2 hover:bg-[#eef3fa]">
            <Cruz className="size-6" />
          </button>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-[#e3eaf4]" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={resueltos} aria-label={titulo}>
            <div
              className={`h-full rounded-full transition-[width] duration-300 ${combo >= 3 ? "bg-[#ff8a3d]" : "bg-accent"}`}
              style={{ width: `${(resueltos / Math.max(total, 1)) * 100}%` }}
            />
          </div>
          {combo >= 3 && (
            <span key={combo} className="animar-rebote flex shrink-0 items-center gap-0.5 font-extrabold text-[#e2701f]" aria-label={t.sesion.combo(combo)}>
              <Rayo className="size-5" />
              {combo}
            </span>
          )}
          <span className="relative flex shrink-0 items-center gap-1 font-bold text-rojo">
            <Corazon className="size-6" lleno={vidas > 0} />
            {vidas}
            {flotante && (
              <span key={flotante.id} className="animar-flotar pointer-events-none absolute -left-10 top-0 font-extrabold text-[#e0a21a]" aria-hidden="true">
                +{flotante.xp}
              </span>
            )}
          </span>
        </div>
      </div>

      {fase === "teoria" && leccion && (
        <main className="mx-auto w-full max-w-2xl px-4 pb-32 pt-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">{t.sesion.antes}</p>
          <h1 className="mt-1 text-3xl font-extrabold">{leccion.titulo}</h1>
          <p className="mt-1 text-ink-2">{leccion.resumen}</p>
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed">
            {leccion.teoria.map((b, i) => ("codigo" in b ? <CodigoEstatico key={i} codigo={b.codigo} /> : <p key={i}><TextoRico texto={b.texto} /></p>))}
          </div>
          <div className="fixed inset-x-0 bottom-0 border-t-2 border-line bg-surface">
            <div className="mx-auto flex max-w-2xl justify-end px-4 py-4">
              <button type="button" autoFocus onClick={() => setFase("jugando")} className="boton boton-primario w-full sm:w-auto sm:min-w-40">
                {t.sesion.empezar}
              </button>
            </div>
          </div>
        </main>
      )}

      {fase === "jugando" && actual && (
        <VistaEjercicio key={`${turno}-${actual.clave}`} ejercicio={actual.ejercicio} jefe={esJefe(actual.ejercicio)} alResponder={alResponder} alTerminar={terminar} />
      )}

      {fase === "fin" && (
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <Estrella className="animar-rebote size-24" />
          <h1 className="mt-4 text-3xl font-extrabold">{modo === "repaso" ? t.sesion.finRepaso : perfecta ? t.sesion.finPerfecta : t.sesion.fin}</h1>
          {extras.map((e) => (
            <p key={e} className="animar-caer mt-3 rounded-xl bg-[#fff8e1] px-4 py-2 font-bold text-[#b07d06]">
              {e}
            </p>
          ))}
          <div className="mt-6 grid w-full grid-cols-3 gap-2">
            <div className="rounded-2xl border-2 border-line bg-surface p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-2">{t.sesion.xp}</p>
              <p className="text-3xl font-extrabold text-[#e0a21a]">+{xpGanada}</p>
            </div>
            <div className="rounded-2xl border-2 border-line bg-surface p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-2">{t.sesion.primerIntento}</p>
              <p className="text-3xl font-extrabold text-verde">{Math.round(precision * 100)}%</p>
            </div>
            <div className="rounded-2xl border-2 border-line bg-surface p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-2">{t.sesion.mejorCombo}</p>
              <p className="text-3xl font-extrabold text-[#e2701f]">{mejorCombo}</p>
            </div>
          </div>
          {fallados.size > 0 && modo === "leccion" && (
            <p className="mt-4 text-sm text-ink-2">{fallados.size === 1 ? t.sesion.unoAlRepaso : t.sesion.variosAlRepaso(fallados.size)}</p>
          )}
          <button type="button" autoFocus onClick={salir} className="boton boton-primario mt-8 w-full">
            {t.sesion.seguir}
          </button>
        </main>
      )}

      {fase === "sin-vidas" && (
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <Corazon className="size-20" lleno={false} />
          <h1 className="mt-4 text-3xl font-extrabold">{t.sesion.sinVidas}</h1>
          <p className="mt-2 text-ink-2">{t.sesion.sinVidasTexto}</p>
          <button type="button" autoFocus onClick={salir} className="boton boton-primario mt-8 w-full">
            {t.sesion.volverMapa}
          </button>
        </main>
      )}
    </div>
  );
}
