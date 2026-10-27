import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Ejercicio } from "../contenido/tipos.ts";
import { esTypeError, evaluarLiteral, igualProfundo, normalizarRespuesta, type Diagnostico } from "../motor/corrector.ts";
import { correr } from "../motor/compilador.ts";
import { CodigoEstatico } from "./CodigoEstatico.tsx";
import { Editor } from "./Editor.tsx";
import { TextoRico } from "./TextoRico.tsx";
import { useT } from "../i18n/index.ts";

type Veredicto = { ok: boolean; detalle?: ReactNode };

type Props = {
  ejercicio: Ejercicio;
  jefe?: boolean;
  alResponder?: (ok: boolean) => void;
  alTerminar: (ok: boolean) => void;
};

function compararPrediccion(respuesta: string, esperada: string) {
  if (esTypeError(esperada)) return esTypeError(respuesta);
  if (esTypeError(respuesta)) return false;
  const a = evaluarLiteral(respuesta);
  const b = evaluarLiteral(esperada);
  if (a.ok && b.ok) return igualProfundo(a.valor, b.valor);
  return normalizarRespuesta(respuesta) === normalizarRespuesta(esperada);
}

function ListaErrores({ titulo, diags }: { titulo: string; diags: Diagnostico[] }) {
  const t = useT();
  if (!diags.length) return null;
  return (
    <div className="mt-2">
      <p className="text-sm font-semibold">{titulo}</p>
      <ul className="mt-1 space-y-1 font-mono text-[13px]">
        {diags.slice(0, 4).map((d, i) => (
          <li key={i}>
            <span className="opacity-60">{t.ejercicio.linea(d.linea + 1)}</span> {d.mensaje}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VistaEjercicio({ ejercicio, jefe = false, alResponder, alTerminar }: Props) {
  const t = useT();
  const [festejo] = useState(() => t.ejercicio.bien[Math.floor(Math.random() * t.ejercicio.bien.length)]);
  const [texto, setTexto] = useState("");
  const [codigo, setCodigo] = useState(ejercicio.tipo === "arreglar" ? ejercicio.codigo : "");
  const [elegida, setElegida] = useState<number | null>(null);
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [cargando, setCargando] = useState(false);
  const [verPista, setVerPista] = useState(false);

  const listo =
    ejercicio.tipo === "elegir" ? elegida !== null : ejercicio.tipo === "arreglar" ? codigo.trim().length > 0 : texto.trim().length > 0;

  const comprobar = useCallback(async () => {
    if (!listo || veredicto || cargando) return;
    if (ejercicio.tipo === "predecir") {
      const ok = compararPrediccion(texto, ejercicio.respuesta);
      alResponder?.(ok);
      setVeredicto({ ok });
      return;
    }
    if (ejercicio.tipo === "elegir") {
      const ok = elegida === ejercicio.correcta;
      alResponder?.(ok);
      setVeredicto({ ok });
      return;
    }
    setCargando(true);
    const fuente = ejercicio.tipo === "completar" ? ejercicio.codigo.replace("___", texto.trim()) : codigo;
    const r = await correr(fuente, ejercicio.pruebas);
    setCargando(false);
    alResponder?.(r.ok);
    setVeredicto({
      ok: r.ok,
      detalle: r.ok ? undefined : (
        <>
          <ListaErrores titulo={t.ejercicio.compiladorDice} diags={r.propios} />
          <ListaErrores titulo={t.ejercicio.noPasaPruebas} diags={r.pruebas} />
        </>
      ),
    });
  }, [listo, veredicto, cargando, ejercicio, texto, elegida, codigo, alResponder, t]);

  const seguir = useCallback(() => {
    if (veredicto) alTerminar(veredicto.ok);
  }, [veredicto, alTerminar]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      const enEditor = (e.target as HTMLElement | null)?.closest(".cm-editor");
      if (enEditor && !e.ctrlKey && !e.metaKey && !veredicto) return;
      e.preventDefault();
      if (veredicto) seguir();
      else void comprobar();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [veredicto, seguir, comprobar]);

  const revisar = useCallback(async (c: string) => {
    if (ejercicio.tipo !== "arreglar") return [];
    const r = await correr(c, ejercicio.pruebas);
    return r.propios;
  }, [ejercicio]);

  const bloqueado = veredicto !== null;
  const pista = "pista" in ejercicio ? ejercicio.pista : undefined;
  const respuestaCorrecta =
    ejercicio.tipo === "predecir"
      ? ejercicio.respuesta
      : ejercicio.tipo === "elegir"
        ? ejercicio.opciones[ejercicio.correcta]
        : ejercicio.solucion;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-48 pt-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-accent">
          {jefe && <span className="rounded-md bg-ink px-2 py-0.5 text-[#ffc53d]">{t.ejercicio.jefe}</span>}
          {t.ejercicio[ejercicio.tipo]}
        </p>
        {"enunciado" in ejercicio && ejercicio.enunciado && (
          <h2 className="mt-1 text-xl font-bold leading-snug sm:text-2xl">
            <TextoRico texto={jefe ? ejercicio.enunciado.replace(/^Jefe:\s*/, "") : ejercicio.enunciado} />
          </h2>
        )}
        {ejercicio.tipo === "predecir" && !ejercicio.enunciado && (
          <h2 className="mt-1 text-xl font-bold leading-snug sm:text-2xl">{t.ejercicio.consignaPredecir} <code className="font-mono">type error</code>.</h2>
        )}

        <div className={`mt-5 ${veredicto && !veredicto.ok ? "animar-temblar" : ""}`}>
          {ejercicio.tipo === "predecir" && (
            <>
              <CodigoEstatico codigo={ejercicio.codigo} />
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  autoFocus
                  value={texto}
                  disabled={bloqueado}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder={t.ejercicio.resultado}
                  aria-label={t.ejercicio.resultado}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  className="h-12 flex-1 rounded-xl border-2 border-line bg-surface px-4 font-mono text-[15px] outline-none focus:border-accent"
                />
                <button type="button" disabled={bloqueado} onClick={() => setTexto("type error")} className="boton boton-secundario font-mono text-sm">
                  type error
                </button>
              </div>
            </>
          )}

          {ejercicio.tipo === "completar" && (
            <>
              <CodigoEstatico codigo={ejercicio.codigo} hueco={{ texto }} />
              <input
                autoFocus
                value={texto}
                disabled={bloqueado}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={t.ejercicio.hueco}
                aria-label={t.ejercicio.hueco}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                className="mt-4 h-12 w-full rounded-xl border-2 border-line bg-surface px-4 font-mono text-[15px] outline-none focus:border-accent"
              />
              <details className="mt-3 text-sm text-ink-2">
                <summary className="cursor-pointer select-none">{t.ejercicio.verPruebas}</summary>
                <CodigoEstatico codigo={ejercicio.pruebas} className="mt-2 !text-[13px]" />
              </details>
            </>
          )}

          {ejercicio.tipo === "arreglar" && (
            <>
              <Editor valor={ejercicio.codigo} alCambiar={setCodigo} revisar={revisar} alEnviar={() => void comprobar()} />
              <p className="mt-2 text-xs text-ink-2">{t.ejercicio.ayudaEditor}</p>
              <details className="mt-3 text-sm text-ink-2">
                <summary className="cursor-pointer select-none">{t.ejercicio.verPruebas}</summary>
                <CodigoEstatico codigo={ejercicio.pruebas} className="mt-2 !text-[13px]" />
              </details>
            </>
          )}

          {ejercicio.tipo === "elegir" && (
            <>
              {ejercicio.codigo && <CodigoEstatico codigo={ejercicio.codigo} className="mb-4" />}
              <div className="grid gap-2">
                {ejercicio.opciones.map((op, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={bloqueado}
                    onClick={() => setElegida(i)}
                    aria-pressed={elegida === i}
                    className={`min-h-12 rounded-xl border-2 px-4 py-3 text-left font-medium transition-colors ${
                      elegida === i ? "border-accent bg-[#e8f0fb]" : "border-line bg-surface hover:bg-[#eef3fa]"
                    }`}
                  >
                    <TextoRico texto={op} />
                  </button>
                ))}
              </div>
            </>
          )}

          {pista && !bloqueado && (
            <div className="mt-4">
              {verPista ? (
                <p className="rounded-xl bg-[#fff6d6] px-4 py-3 text-sm"><TextoRico texto={pista} /></p>
              ) : (
                <button type="button" onClick={() => setVerPista(true)} className="text-sm font-semibold text-accent underline underline-offset-4">
                  {t.ejercicio.verPista}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 border-t-2 ${
          !veredicto ? "border-line bg-surface" : veredicto.ok ? "border-[#bfe5cf] bg-verde-suave animar-subir" : "border-[#f3c4c0] bg-rojo-suave animar-subir"
        }`}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end sm:justify-between" aria-live="polite">
          {veredicto ? (
            <div className={`min-w-0 flex-1 ${veredicto.ok ? "text-verde" : "text-rojo"}`}>
              <p className={`text-lg font-extrabold ${veredicto.ok ? "animar-rebote origin-left" : ""}`}>{veredicto.ok ? festejo : t.ejercicio.mal}</p>
              {!veredicto.ok && (
                <p className="mt-1 text-sm text-ink">
                  {t.ejercicio.respuesta} <code className="whitespace-pre-wrap break-words font-mono">{respuestaCorrecta}</code>
                </p>
              )}
              <p className="mt-1 text-sm text-ink"><TextoRico texto={ejercicio.explicacion} /></p>
              {veredicto.detalle && <div className="max-h-32 overflow-y-auto text-ink">{veredicto.detalle}</div>}
            </div>
          ) : (
            <div className="hidden flex-1 sm:block" />
          )}
          <button
            type="button"
            disabled={!veredicto && (!listo || cargando)}
            onClick={() => (veredicto ? seguir() : void comprobar())}
            className={`boton min-w-40 ${!veredicto ? "boton-primario" : veredicto.ok ? "boton-verde" : "boton-rojo"}`}
          >
            {veredicto ? t.ejercicio.continuar : cargando ? t.ejercicio.compilando : t.ejercicio.comprobar}
          </button>
        </div>
      </div>
    </div>
  );
}
