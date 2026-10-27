export type Predecir = {
  tipo: "predecir";
  id: string;
  enunciado?: string;
  codigo: string;
  respuesta: string;
  pista?: string;
  explicacion: string;
};

export type Completar = {
  tipo: "completar";
  id: string;
  enunciado: string;
  codigo: string;
  pruebas: string;
  solucion: string;
  pista?: string;
  explicacion: string;
};

export type Arreglar = {
  tipo: "arreglar";
  id: string;
  enunciado: string;
  codigo: string;
  pruebas: string;
  solucion: string;
  pista?: string;
  explicacion: string;
};

export type Elegir = {
  tipo: "elegir";
  id: string;
  enunciado: string;
  codigo?: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
};

export type Ejercicio = Predecir | Completar | Arreglar | Elegir;

export type Bloque = { texto: string } | { codigo: string };

export type Leccion = {
  id: string;
  titulo: string;
  resumen: string;
  teoria: Bloque[];
  ejercicios: Ejercicio[];
};

export type Mundo = {
  id: string;
  numero: number;
  titulo: string;
  resumen: string;
  lecciones: Leccion[];
};

export type MundoMeta = Omit<Mundo, "lecciones">;

export const IDIOMA_BASE = "es";

export type Contenido = Record<string, Mundo[]>;

export function armarContenido(metas: Record<string, { default: MundoMeta }>, lecciones: Record<string, { default: Leccion }>): Contenido {
  const contenido: Contenido = {};
  for (const [ruta, m] of Object.entries(metas)) {
    const [, idioma] = ruta.split("/");
    const carpeta = ruta.replace(/mundo\.ts$/, "");
    const propias = Object.keys(lecciones)
      .filter((r) => r.startsWith(carpeta))
      .sort()
      .map((r) => lecciones[r].default);
    (contenido[idioma] ??= []).push({ ...m.default, lecciones: propias });
  }
  for (const lista of Object.values(contenido)) lista.sort((a, b) => a.numero - b.numero);
  return contenido;
}

export function mundosPara(contenido: Contenido, idioma: string): Mundo[] {
  const base = contenido[IDIOMA_BASE] ?? [];
  const propio = contenido[idioma] ?? [];
  return base.map((mb) => {
    const mt = propio.find((m) => m.id === mb.id);
    return {
      ...mb,
      titulo: mt?.titulo ?? mb.titulo,
      resumen: mt?.resumen ?? mb.resumen,
      lecciones: mb.lecciones.map((lb) => mt?.lecciones.find((l) => l.id === lb.id) ?? lb),
    };
  });
}
