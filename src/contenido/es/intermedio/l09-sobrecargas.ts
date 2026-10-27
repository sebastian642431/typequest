import type { Leccion } from "../../tipos.ts";

const CONVERTIR = `function convertir(x: string): number;
function convertir(x: number): string;
function convertir(x: string | number): string | number {
  return typeof x === "string" ? Number(x) : String(x);
}
`;

const leccion: Leccion = {
  id: "sobrecargas",
  titulo: "Sobrecargas",
  resumen: "Varias firmas para una misma función, y cuándo conviene una unión o un genérico.",
  teoria: [
    { texto: "A veces lo que devolvés depende de lo que te pasan: si entra texto sale número, y al revés. Con sobrecargas listás las firmas que ven los de afuera, y abajo va una sola implementación." },
    { codigo: CONVERTIR },
    { texto: "La última firma, la de la implementación, es invisible desde afuera: solo se puede llamar con las de arriba. Y tiene que ser compatible con todas, si no, no compila." },
    { texto: "TypeScript prueba las firmas en orden y se queda con la primera que encaja. Las más específicas van arriba." },
    { texto: "Antes de sobrecargar, pensalo dos veces. Si el retorno no cambia según la entrada, alcanza con una unión. Si lo que sale es del mismo tipo que lo que entra, un genérico lo dice en una línea." },
    { codigo: "function ultimo<T>(xs: T[]): T | undefined {\n  return xs[xs.length - 1];\n}" },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "elige-firma",
      codigo: `${CONVERTIR}convertir("42") + 1;`,
      respuesta: "43",
      explicacion: "Con un string entra por la primera firma y devuelve number, así que + 1 suma.",
    },
    {
      tipo: "predecir",
      id: "retorno-cruzado",
      codigo: `${CONVERTIR}const n: number = convertir(7);
n;`,
      respuesta: "type error",
      explicacion: "Con un number la firma que aplica devuelve string, y un string no entra en number.",
    },
    {
      tipo: "predecir",
      id: "impl-invisible",
      codigo: `${CONVERTIR}function cualquiera(x: string | number) {
  return convertir(x);
}
cualquiera("5");`,
      respuesta: "type error",
      explicacion: "Ninguna firma visible acepta string | number. La de la implementación sí, pero desde afuera no existe.",
      pista: "¿Cuántas firmas se pueden llamar desde afuera?",
    },
    {
      tipo: "predecir",
      id: "por-cantidad",
      codigo: `function fecha(timestamp: number): string;
function fecha(dia: number, mes: number, anio: number): string;
function fecha(a: number, b?: number, c?: number): string {
  return c === undefined ? "ts " + a : a + "/" + b + "/" + c;
}
fecha(25, 5, 1810);`,
      respuesta: "\"25/5/1810\"",
      explicacion: "Las sobrecargas también sirven para cantidades distintas de argumentos. Con tres, entra por la segunda.",
    },
    {
      tipo: "elegir",
      id: "que-conviene",
      enunciado: "primero recibe un array y devuelve su primer elemento, del mismo tipo que los del array. ¿Qué te conviene?",
      opciones: [
        "Una sobrecarga para string[], otra para number[], otra para boolean[]...",
        "Un genérico: function primero<T>(xs: T[]): T | undefined",
        "Una unión: function primero(xs: unknown[]): unknown",
        "Una sola firma con any",
      ],
      correcta: 1,
      explicacion: "El tipo de salida sale directo del de entrada. Las sobrecargas nunca cubren todos los casos, y unknown o any pierden la información.",
    },
    {
      tipo: "predecir",
      id: "orden",
      codigo: `function describir(x: unknown): "algo";
function describir(x: string): "texto";
function describir(x: unknown): string {
  return typeof x === "string" ? "texto" : "algo";
}
const r: "texto" = describir("hola");
r;`,
      respuesta: "type error",
      explicacion: "La primera firma acepta cualquier cosa, así que gana siempre y devuelve \"algo\". La de string nunca se usa.",
      pista: "Las firmas se prueban de arriba hacia abajo.",
    },
    {
      tipo: "predecir",
      id: "incompatible",
      codigo: `function largo(x: string): number;
function largo(x: string[]): number;
function largo(x: string): number {
  return x.length;
}
largo("hola");`,
      respuesta: "type error",
      explicacion: "La implementación solo acepta string, así que no es compatible con la firma de string[]. El error está en la declaración, no en la llamada.",
    },
    {
      tipo: "completar",
      id: "completar-firma",
      enunciado: "Agregá la segunda firma para que parsear acepte un array de strings y devuelva un array de números.",
      codigo: `function parsear(x: string): number;
___;
function parsear(x: string | string[]): number | number[] {
  return typeof x === "string" ? Number(x) : x.map(Number);
}`,
      pruebas: `const uno: number = parsear("1");
const varios: number[] = parsear(["1", "2"]);`,
      solucion: "function parsear(x: string[]): number[]",
      explicacion: "Cada firma es una declaración sin cuerpo con su propio par entrada/salida.",
    },
    {
      tipo: "completar",
      id: "completar-generico",
      enunciado: "En vez de una sobrecarga por tipo, completá el retorno del genérico.",
      codigo: `function envolver<T>(x: T): ___ {
  return [x];
}`,
      pruebas: `const a: string[] = envolver("hola");
const b: number[] = envolver(3);`,
      solucion: "T[]",
      explicacion: "Lo que sale depende de lo que entra de forma directa: un genérico lo cubre para cualquier T.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-union",
      enunciado: "todos no compila. Reemplazá las sobrecargas de formatear por una sola firma.",
      codigo: `function formatear(x: string): string;
function formatear(x: number): string;
function formatear(x: string | number): string {
  return String(x).padStart(3, "0");
}
function todos(xs: (string | number)[]) {
  return xs.map((x) => formatear(x));
}`,
      pruebas: `const r: string[] = todos([1, "2"]);`,
      solucion: `function formatear(x: string | number): string {
  return String(x).padStart(3, "0");
}
function todos(xs: (string | number)[]) {
  return xs.map((x) => formatear(x));
}`,
      explicacion: "Las dos firmas devolvían lo mismo, así que no aportaban nada y encima rechazaban string | number. Con una unión se arregla.",
    },
  ],
};

export default leccion;
