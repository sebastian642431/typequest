import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "migrating-js",
  title: "Migrar JS a TS",
  summary: "Pasar JS a TS sin romper nada: parámetros, `unknown`, callbacks y objetos que crecen.",
  idea: "Migrar es tipar las entradas: el compilador te marca dónde no sabe qué hay.",
  theory: [
    { title: "Migrar no es reescribir", text: "Renombrás `.js` a `.ts` y prendés `strict`. El compilador marca lo que no sabe: casi siempre, parámetros sin tipo." },
    { title: "Tipá las entradas", text: "El retorno se infiere solo. Para saber el tipo, mirá cómo se usa el parámetro.", code: "function precioFinal(precio: number, descuento: number) {\n  return precio - precio * descuento;\n}" },
    { title: "`unknown`, no `any`", text: "Si no sabés qué llega, usá `unknown`. `any` apaga el chequeo; `unknown` te obliga a preguntar.", code: "function cantidad(dato: unknown): number {\n  if (typeof dato === \"number\") return dato;\n  if (typeof dato === \"string\") return Number(dato);\n  return 0;\n}" },
    { title: "El objeto que crece", text: "`const o = {}` y después `o.algo = 1` no compila: `{}` no tiene claves. Declará la forma final de entrada." },
  ],
  exercises: [
    {
      type: "predict",
      id: "implicit-any",
      code: `function iva(monto) {
  return monto * 1.21;
}
iva(100);`,
      answer: "type error",
      explanation: "Con `strict`, un parámetro sin tipo es un `any` implícito y no compila. TS te pide decidir.",
    },
    {
      type: "complete",
      id: "complete-parameter",
      prompt: "Esta función venía de JS sin tipos. Mirá cómo usa su parámetro y completá el tipo.",
      code: `function formatearPrecio(p: ___) {
  return "$" + p.monto.toFixed(2) + " " + p.moneda;
}`,
      tests: `const s: string = formatearPrecio({ monto: 1500, moneda: "ARS" });
type _1 = Expect<Equal<Parameters<typeof formatearPrecio>[0], { monto: number; moneda: string }>>;`,
      solution: "{ monto: number; moneda: string }",
      explanation: "`toFixed` delata que `monto` es number, y `moneda` se concatena como texto. El uso te dice el tipo.",
    },
    {
      type: "predict",
      id: "unchecked-unknown",
      code: `function total(dato: unknown) {
  return dato.precio * dato.cantidad;
}
total({ precio: 10, cantidad: 2 });`,
      answer: "type error",
      explanation: "`unknown` no deja leer propiedades sin estrechar. Con `any` compilaba y explotaba con el primer null.",
    },
    {
      type: "predict",
      id: "empty-object",
      code: `const pedido = {};
pedido.id = 7;
pedido.id;`,
      answer: "type error",
      explanation: "TypeScript fija el tipo al declarar: `{}`. Sumarle `id` después no compila.",
    },
    {
      type: "complete",
      id: "complete-callback",
      prompt: "Esta función de JS recibía un callback. Tipalo: recibe un pedido y devuelve si pasa el filtro.",
      code: `type Pedido = { id: number; total: number };
function filtrar(pedidos: Pedido[], criterio: ___): Pedido[] {
  return pedidos.filter((p) => criterio(p));
}`,
      tests: `const grandes = filtrar([{ id: 1, total: 500 }, { id: 2, total: 9000 }], (p) => p.total > 1000);
type _1 = Expect<Equal<Parameters<Parameters<typeof filtrar>[1]>[0], Pedido>>;`,
      solution: "(p: Pedido) => boolean",
      explanation: "Con el callback tipado, `p` se infiere sola. Quien usa `filtrar` no anota nada.",
    },
    {
      type: "complete",
      id: "complete-dictionary",
      prompt: "El stock era un objeto vacío que sumaba productos. Tipalo: cualquier nombre de producto con su cantidad.",
      code: `const stock: ___ = {};
stock["yerba"] = 12;
stock["termo"] = 3;`,
      tests: `function reponer(nombre: string, n: number) {
  stock[nombre] = (stock[nombre] ?? 0) + n;
}
type _1 = Expect<Equal<typeof stock, Record<string, number>>>;`,
      solution: "Record<string, number>",
      explanation: "Si no conocés las claves, `Record<string, number>` describe el objeto que crece: cualquier clave, siempre un número.",
    },
    {
      type: "fix",
      id: "fix-object",
      prompt: "Este objeto se armaba de a poco, como en JS. Hacelo compilar declarando su forma de entrada.",
      code: `function resumen(ventas: number[]) {
  const r = {};
  r.cantidad = ventas.length;
  r.total = ventas.reduce((a, b) => a + b, 0);
  return r;
}`,
      tests: "const r: { cantidad: number; total: number } = resumen([100, 250]);",
      solution: `function resumen(ventas: number[]) {
  const r: { cantidad: number; total: number } = { cantidad: 0, total: 0 };
  r.cantidad = ventas.length;
  r.total = ventas.reduce((a, b) => a + b, 0);
  return r;
}`,
      explanation: "Con la forma declarada, cada asignación se chequea. También podés armarlo en un solo literal.",
    },
    {
      type: "fix",
      id: "fix-any",
      prompt: "Migraron con `any` y ahora un número pasa como pedido. Cambiá `any` por `unknown` y estrechá.",
      code: `type Pedido = { id: number; total: number };
function esPedido(x: unknown): x is Pedido {
  return typeof x === "object" && x !== null && "id" in x && "total" in x;
}
function totalDe(dato: any): number {
  return dato.total;
}`,
      tests: "const t: number = totalDe({ id: 1, total: 300 });\ntype _1 = Expect<Equal<Parameters<typeof totalDe>[0], unknown>>;",
      solution: `type Pedido = { id: number; total: number };
function esPedido(x: unknown): x is Pedido {
  return typeof x === "object" && x !== null && "id" in x && "total" in x;
}
function totalDe(dato: unknown): number {
  if (!esPedido(dato)) throw new Error("no es un pedido");
  return dato.total;
}`,
      hint: "Ya hay un type guard escrito. Usalo antes de leer `total`.",
      explanation: "Con el guard, adentro del `if` `dato` es `Pedido`. Lo que no es pedido corta con un error claro, no con undefined.",
    },
    {
      type: "choose",
      id: "choose-any-unknown",
      prompt: "Migrás un handler que recibe el body ya parseado. ¿Qué tipo le das mientras no lo validás?",
      options: [
        "unknown, y lo estrechás o validás antes de usarlo",
        "any, total después se arregla",
        "object, porque siempre es un objeto",
        "Record<string, string>, porque viene de JSON",
      ],
      correct: 0,
      explanation: "El body lo manda cualquiera. `unknown` no promete nada. `object` y `Record` suponen una forma, y `any` apaga todo.",
    },
    {
      type: "fix",
      id: "boss-migrate",
      prompt: "Jefe: migrá `agrupar` desde JS. Usá un genérico para que el resultado conserve el tipo de los elementos.",
      code: `function agrupar(lista, clave) {
  const grupos = new Map();
  for (const item of lista) {
    const k = clave(item);
    grupos.set(k, [...(grupos.get(k) ?? []), item]);
  }
  return grupos;
}`,
      tests: `type Pedido = { id: number; estado: "pendiente" | "enviado" };
const g = agrupar<Pedido>([{ id: 1, estado: "pendiente" }, { id: 2, estado: "enviado" }], (p) => p.estado);
type _1 = Expect<Equal<typeof g, Map<string, Pedido[]>>>;`,
      solution: `function agrupar<T>(lista: T[], clave: (item: T) => string): Map<string, T[]> {
  const grupos = new Map<string, T[]>();
  for (const item of lista) {
    const k = clave(item);
    grupos.set(k, [...(grupos.get(k) ?? []), item]);
  }
  return grupos;
}`,
      hint: "El `Map` vacío también necesita tipos: `new Map()` solo no sabe qué va a guardar.",
      explanation: "`T` ata la lista, el callback y el resultado. `new Map<string, T[]>()` declara de entrada qué va a guardar.",
    },
  ],
};

export default lesson;
