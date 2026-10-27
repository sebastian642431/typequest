import type { Leccion } from "../../tipos.ts";

const TEXTO = `function asegurarTexto(x: unknown): asserts x is string {
  if (typeof x !== "string") throw new Error("no es texto");
}
`;

const AFIRMAR = `function afirmar(cond: unknown, msj: string): asserts cond {
  if (!cond) throw new Error(msj);
}
`;

const leccion: Leccion = {
  id: "asserts",
  titulo: "Assertion functions",
  resumen: "Funciones que tiran si algo no se cumple y, si vuelven, dejan el tipo estrechado.",
  teoria: [
    { texto: "Un type guard te deja elegir con un `if`. Una assertion function es más tajante: si la condición no se cumple, tira un error. Si vuelve, TypeScript da por hecho el tipo en todo lo que sigue." },
    { codigo: `${TEXTO}function largo(x: unknown) {
  asegurarTexto(x);
  return x.length;
}` },
    { texto: "Hay una segunda forma, `asserts cond`, sin `is`: afirma que el argumento es verdadero. Todo lo que se deduzca de esa condición queda estrechado." },
    { codigo: AFIRMAR },
    { texto: "Dos reglas: devuelven `void` (no hay valor que devolver, o pasa o explota), y para usarlas el nombre tiene que tener un tipo explícito. Una `function` común cumple; una flecha guardada en un `const` sin anotar, no." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "basico",
      codigo: `${TEXTO}function largo(x: unknown) {
  asegurarTexto(x);
  return x.length;
}
largo("mate");`,
      respuesta: "4",
      explicacion: "Después de asegurarTexto(x), x es string para el resto de la función.",
    },
    {
      tipo: "predecir",
      id: "void-pelado",
      codigo: `function asegurarTexto(x: unknown): void {
  if (typeof x !== "string") throw new Error("no es texto");
}
function largo(x: unknown) {
  asegurarTexto(x);
  return x.length;
}
largo("mate");`,
      respuesta: "type error",
      explicacion: "En runtime haría lo mismo, pero con `void` TypeScript no sabe que la función garantiza nada. x sigue unknown.",
    },
    {
      tipo: "predecir",
      id: "asserts-cond",
      codigo: `${AFIRMAR}function conB(xs: string[]) {
  const p = xs.find((x) => x.startsWith("b"));
  afirmar(p, "no hay ninguna con b");
  return p.toUpperCase();
}
conB(["alfajor", "bizcocho"]);`,
      respuesta: "\"BIZCOCHO\"",
      explicacion: "find devuelve string | undefined. afirmar(p) garantiza que p es truthy, así que queda string.",
    },
    {
      tipo: "predecir",
      id: "union-objetos",
      codigo: `type Borrador = { estado: "borrador" };
type Publicado = { estado: "publicado"; url: string };
type Post = Borrador | Publicado;
function asegurarPublicado(p: Post): asserts p is Publicado {
  if (p.estado !== "publicado") throw new Error("todavía no");
}
function link(p: Post) {
  asegurarPublicado(p);
  return p.url;
}
link({ estado: "publicado", url: "/hola" });`,
      respuesta: "\"/hola\"",
      explicacion: "Funciona igual con uniones de objetos: después del assert, p es Publicado y tiene url.",
    },
    {
      tipo: "predecir",
      id: "flecha-sin-tipo",
      codigo: `const afirmar = (cond: unknown): asserts cond => {
  if (!cond) throw new Error("falló");
};
function doble(x: number | undefined) {
  afirmar(x !== undefined);
  return x * 2;
}
doble(4);`,
      respuesta: "type error",
      explicacion: "Para usar una assertion, el nombre afirmar necesita un tipo explícito. El const sin anotar no lo tiene, aunque la flecha sí.",
      pista: "No alcanza con anotar la flecha: mirá la variable.",
    },
    {
      tipo: "predecir",
      id: "flecha-anotada",
      codigo: `type Afirmador = (cond: unknown) => asserts cond;
const afirmar: Afirmador = (cond) => {
  if (!cond) throw new Error("falló");
};
function doble(x: number | undefined) {
  afirmar(x !== undefined);
  return x * 2;
}
doble(4);`,
      respuesta: "8",
      explicacion: "Con el const anotado con un tipo que es assertion, la llamada ya estrecha.",
      pista: "Compará con el ejercicio anterior: ¿qué cambió en la variable afirmar?",
    },
    {
      tipo: "completar",
      id: "completar-is",
      enunciado: "Completá el tipo de retorno para que doble compile.",
      codigo: `function asegurarNumero(x: unknown): ___ {
  if (typeof x !== "number") throw new Error("no es número");
}`,
      pruebas: `function doble(x: unknown) {
  asegurarNumero(x);
  return x * 2;
}
const d: number = doble(4);`,
      solucion: "asserts x is number",
      explicacion: "`asserts x is number` dice: si vuelvo, x es number.",
    },
    {
      tipo: "completar",
      id: "completar-cond",
      enunciado: "Completá la assertion para que afirme su primer parámetro.",
      codigo: `function afirmar(cond: unknown, msj: string): asserts ___ {
  if (!cond) throw new Error(msj);
}`,
      pruebas: `function largo(x: string | undefined) {
  afirmar(x !== undefined, "falta x");
  return x.length;
}
const n: number = largo("hola");`,
      solucion: "cond",
      explicacion: "`asserts cond` afirma que el argumento es verdadero; con `x !== undefined`, x queda string.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-flecha",
      enunciado: "cuantos no compila por cómo está declarada asegurarLista. Arreglala sin cambiar lo que hace.",
      codigo: `const asegurarLista = (x: unknown): asserts x is unknown[] => {
  if (!Array.isArray(x)) throw new Error("no es lista");
};
function cuantos(x: unknown) {
  asegurarLista(x);
  return x.length;
}`,
      pruebas: "const n: number = cuantos([1, 2, 3]);",
      solucion: `function asegurarLista(x: unknown): asserts x is unknown[] {
  if (!Array.isArray(x)) throw new Error("no es lista");
}
function cuantos(x: unknown) {
  asegurarLista(x);
  return x.length;
}`,
      explicacion: "Una declaración `function` tiene tipo explícito por sí sola. También valía anotar el const con un tipo de assertion.",
    },
    {
      tipo: "elegir",
      id: "guard-o-assert",
      enunciado: "Querés validar la config al arrancar: si falta la URL, no tiene sentido seguir. ¿Qué te conviene?",
      opciones: [
        "Un type guard `c is ConfigOk`, para hacer if/else",
        "Una assertion `asserts c is ConfigOk`, que corta si está mal",
        "Un cast `c as ConfigOk`",
        "Anotar la variable como ConfigOk",
      ],
      correcta: 1,
      explicacion: "Si el caso malo termina siempre en error, la assertion lo dice en una línea y lo que sigue ya está estrechado. El cast no chequea nada.",
    },
  ],
};

export default leccion;
