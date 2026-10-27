import { create } from "zustand";
import { persist } from "zustand/middleware";

export const VIDAS_MAX = 5;
export const META_DIARIA = 50;
const MINUTOS_POR_VIDA = 20;
const DIA = 24 * 60 * 60 * 1000;
const INTERVALOS = [0, 1, 3, 7, 14, 30];

type Tarjeta = { nivel: number; vence: number };

export const ORDEN_LOGROS = [
  "primera-leccion",
  "perfecta",
  "combo-5",
  "combo-10",
  "combo-25",
  "racha-3",
  "racha-7",
  "racha-30",
  "aciertos-50",
  "aciertos-250",
  "aciertos-1000",
  "repaso-10",
  "meta-diaria",
  "nivel-10",
  "jefe",
  "mundo-basico",
  "mundo-intermedio",
  "mundo-avanzado",
  "mundo-hacker",
] as const;

export type LogroId = (typeof ORDEN_LOGROS)[number];

export function nivelDe(xp: number) {
  let n = 1;
  while (xp >= 25 * n * (n + 1)) n++;
  const desde = 25 * (n - 1) * n;
  const hasta = 25 * n * (n + 1);
  return { nivel: n, progreso: (xp - desde) / (hasta - desde), faltan: hasta - xp };
}

export function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function ayer() {
  const d = new Date(Date.now() - DIA);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

type Estado = {
  xp: number;
  xpHoy: { dia: string; xp: number };
  vidas: number;
  vidasDesde: number;
  racha: number;
  ultimoDia: string | null;
  lecciones: Record<string, { mejor: number; veces: number }>;
  repaso: Record<string, Tarjeta>;
  aciertos: number;
  aciertosRepaso: number;
  mejorCombo: number;
  logros: Partial<Record<LogroId, number>>;
  nuevos: LogroId[];
  sonido: boolean;
  recargarVidas: () => void;
  perderVida: () => void;
  ganarXp: (n: number) => void;
  fallo: (clave: string) => void;
  acierto: (clave: string, enRepaso: boolean, combo: number) => void;
  terminarLeccion: (clave: string, precision: number) => void;
  desbloquear: (id: LogroId) => void;
  verNuevos: () => void;
  alternarSonido: () => void;
};

export const useProgreso = create<Estado>()(
  persist(
    (set, get) => ({
      xp: 0,
      xpHoy: { dia: hoy(), xp: 0 },
      vidas: VIDAS_MAX,
      vidasDesde: Date.now(),
      racha: 0,
      ultimoDia: null,
      lecciones: {},
      repaso: {},
      aciertos: 0,
      aciertosRepaso: 0,
      mejorCombo: 0,
      logros: {},
      nuevos: [],
      sonido: true,
      recargarVidas: () => {
        const { vidas, vidasDesde } = get();
        if (vidas >= VIDAS_MAX) return set({ vidasDesde: Date.now() });
        const ganadas = Math.floor((Date.now() - vidasDesde) / (MINUTOS_POR_VIDA * 60000));
        if (ganadas <= 0) return;
        const nuevas = Math.min(VIDAS_MAX, vidas + ganadas);
        set({ vidas: nuevas, vidasDesde: nuevas >= VIDAS_MAX ? Date.now() : vidasDesde + ganadas * MINUTOS_POR_VIDA * 60000 });
      },
      perderVida: () => {
        const { vidas } = get();
        set({ vidas: Math.max(0, vidas - 1), vidasDesde: vidas >= VIDAS_MAX ? Date.now() : get().vidasDesde });
      },
      ganarXp: (n) => {
        const dia = hoy();
        const previo = get().xpHoy.dia === dia ? get().xpHoy.xp : 0;
        const xp = get().xp + n;
        set({ xp, xpHoy: { dia, xp: previo + n } });
        if (previo < META_DIARIA && previo + n >= META_DIARIA) get().desbloquear("meta-diaria");
        if (nivelDe(xp).nivel >= 10) get().desbloquear("nivel-10");
      },
      fallo: (clave) => set({ repaso: { ...get().repaso, [clave]: { nivel: 0, vence: Date.now() } } }),
      acierto: (clave, enRepaso, combo) => {
        const aciertos = get().aciertos + 1;
        const mejorCombo = Math.max(get().mejorCombo, combo);
        set({ aciertos, mejorCombo });
        if (aciertos >= 50) get().desbloquear("aciertos-50");
        if (aciertos >= 250) get().desbloquear("aciertos-250");
        if (aciertos >= 1000) get().desbloquear("aciertos-1000");
        if (combo >= 5) get().desbloquear("combo-5");
        if (combo >= 10) get().desbloquear("combo-10");
        if (combo >= 25) get().desbloquear("combo-25");
        const actual = get().repaso[clave];
        if (!actual || !enRepaso) return;
        const nivel = actual.nivel + 1;
        const repaso = { ...get().repaso };
        if (nivel >= INTERVALOS.length) delete repaso[clave];
        else repaso[clave] = { nivel, vence: Date.now() + INTERVALOS[nivel] * DIA };
        const aciertosRepaso = get().aciertosRepaso + 1;
        set({ repaso, vidas: Math.min(VIDAS_MAX, get().vidas + 1), aciertosRepaso });
        if (aciertosRepaso >= 10) get().desbloquear("repaso-10");
      },
      terminarLeccion: (clave, precision) => {
        const previa = get().lecciones[clave];
        const dia = hoy();
        const { ultimoDia, racha } = get();
        const nuevaRacha = ultimoDia === dia ? racha : ultimoDia === ayer() ? racha + 1 : 1;
        set({
          lecciones: { ...get().lecciones, [clave]: { mejor: Math.max(previa?.mejor ?? 0, precision), veces: (previa?.veces ?? 0) + 1 } },
          racha: nuevaRacha,
          ultimoDia: dia,
        });
        get().desbloquear("primera-leccion");
        if (precision >= 1) get().desbloquear("perfecta");
        if (nuevaRacha >= 3) get().desbloquear("racha-3");
        if (nuevaRacha >= 7) get().desbloquear("racha-7");
        if (nuevaRacha >= 30) get().desbloquear("racha-30");
      },
      desbloquear: (id) => {
        if (get().logros[id]) return;
        set({ logros: { ...get().logros, [id]: Date.now() }, nuevos: [...get().nuevos, id] });
      },
      verNuevos: () => set({ nuevos: [] }),
      alternarSonido: () => set({ sonido: !get().sonido }),
    }),
    {
      name: "typequest-progreso",
      version: 1,
      partialize: ({ nuevos: _nuevos, ...resto }) => resto,
    },
  ),
);

export function rachaVigente(racha: number, ultimoDia: string | null) {
  return ultimoDia === hoy() || ultimoDia === ayer() ? racha : 0;
}

export function pendientesRepaso(repaso: Record<string, Tarjeta>) {
  const ahora = Date.now();
  return Object.entries(repaso)
    .filter(([, t]) => t.vence <= ahora)
    .map(([clave]) => clave);
}
