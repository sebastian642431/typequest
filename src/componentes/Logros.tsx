import { useEffect, useRef, useState } from "react";
import { ORDEN_LOGROS, useProgreso, type LogroId } from "../estado/progreso.ts";
import { useT } from "../i18n/index.ts";
import { sonidoLogro } from "../motor/efectos.ts";
import { Candado, Cruz, Medalla } from "./Iconos.tsx";

export function PanelLogros({ cerrar }: { cerrar: () => void }) {
  const t = useT();
  const logros = useProgreso((s) => s.logros);
  const caja = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    caja.current?.showModal();
  }, []);

  const total = ORDEN_LOGROS.length;
  const tengo = ORDEN_LOGROS.filter((id) => logros[id]).length;

  return (
    <dialog
      ref={caja}
      onClose={cerrar}
      onClick={(e) => e.target === caja.current && caja.current?.close()}
      className="m-auto w-[min(560px,calc(100vw-32px))] rounded-2xl border-2 border-line bg-surface p-0 text-ink backdrop:bg-[rgb(19_32_59/0.45)]"
      aria-labelledby="titulo-logros"
    >
      <div className="flex items-center justify-between border-b-2 border-line px-5 py-4">
        <h2 id="titulo-logros" className="text-xl font-extrabold">
          {t.logros.titulo} <span className="font-mono text-base text-ink-2">{tengo}/{total}</span>
        </h2>
        <button type="button" onClick={() => caja.current?.close()} aria-label={t.logros.cerrar} className="grid size-10 place-items-center rounded-lg hover:bg-[#eef3fa]">
          <Cruz className="size-5" />
        </button>
      </div>
      <ul className="grid max-h-[70vh] gap-2 overflow-y-auto p-4 sm:grid-cols-2">
        {ORDEN_LOGROS.map((id) => {
          const [nombre, desc] = t.logros.lista[id] ?? [id, ""];
          const ok = !!logros[id];
          return (
            <li key={id} className={`flex items-center gap-3 rounded-xl border-2 p-3 ${ok ? "border-[#f1d68a] bg-[#fff8e1]" : "border-line bg-[#f3f6fb]"}`}>
              <span className={`grid size-11 shrink-0 place-items-center rounded-full ${ok ? "bg-white" : "bg-[#e3eaf4] text-[#9aa8bf]"}`}>
                {ok ? <Medalla className="size-7" /> : <Candado className="size-5" />}
              </span>
              <span>
                <span className={`block font-bold leading-tight ${ok ? "" : "text-ink-2"}`}>{nombre}</span>
                <span className="block text-sm text-ink-2">{desc}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}

export function AvisoLogros() {
  const t = useT();
  const nuevos = useProgreso((s) => s.nuevos);
  const verNuevos = useProgreso((s) => s.verNuevos);
  const [actual, setActual] = useState<LogroId | null>(null);

  useEffect(() => {
    if (actual || !nuevos.length) return;
    setActual(nuevos[0]);
    sonidoLogro();
  }, [nuevos, actual]);

  useEffect(() => {
    if (!actual) return;
    const id = setTimeout(() => {
      useProgreso.setState({ nuevos: useProgreso.getState().nuevos.slice(1) });
      setActual(null);
    }, 3200);
    return () => clearTimeout(id);
  }, [actual]);

  useEffect(() => () => verNuevos(), [verNuevos]);

  if (!actual) return null;
  const [nombre, desc] = t.logros.lista[actual] ?? [actual, ""];
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <div className="animar-caer flex items-center gap-3 rounded-2xl border-2 border-[#f1d68a] bg-[#fff8e1] px-4 py-3 shadow-[0_6px_0_0_#f1d68a]">
        <Medalla className="size-10 shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#b07d06]">{t.logros.desbloqueado}</p>
          <p className="font-extrabold leading-tight">{nombre}</p>
          <p className="text-sm text-ink-2">{desc}</p>
        </div>
      </div>
    </div>
  );
}
