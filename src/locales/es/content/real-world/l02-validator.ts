import type { Lesson } from "../../../../content/types.ts";

const BASE = `type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };
type Esquema<T> = { parse: (x: unknown) => Resultado<T> };
`;

const INFER = "type Infer<E> = E extends Esquema<infer T> ? T : never;\n";

const PRIMITIVES = `function string(): Esquema<string> {
  return { parse: (x) => (typeof x === "string" ? { ok: true, valor: x } : { ok: false, error: "se esperaba string" }) };
}
function number(): Esquema<number> {
  return { parse: (x) => (typeof x === "number" ? { ok: true, valor: x } : { ok: false, error: "se esperaba number" }) };
}
`;

const SHAPE = "type Forma<S> = { [K in keyof S]: Infer<S[K]> };\n";

const OBJECT = `function object<S extends Record<string, Esquema<unknown>>>(forma: S): Esquema<Forma<S>> {
  return {
    parse: (x) => {
      if (typeof x !== "object" || x === null) return { ok: false, error: "se esperaba objeto" };
      const salida: Record<string, unknown> = {};
      for (const k in forma) {
        const r = forma[k].parse((x as Record<string, unknown>)[k]);
        if (!r.ok) return { ok: false, error: k + ": " + r.error };
        salida[k] = r.valor;
      }
      return { ok: true, valor: salida as Forma<S> };
    },
  };
}
`;

const ALL = `${BASE}${INFER}${PRIMITIVES}${SHAPE}${OBJECT}`;

const lesson: Lesson = {
  id: "validator",
  title: "Tu propio validador",
  summary: "Un mini validador con `string()`, `number()` y `object()` que te regala el tipo.",
  idea: "Describís la forma una vez con un esquema, y el validador y el tipo salen solos.",
  theory: [
    { title: "Un guard por tipo cansa", text: "Escribir guards a mano cansa, y el tipo y el guard se desincronizan. Mejor: describir la forma una sola vez." },
    { title: "Un esquema tiene `parse`", text: "`parse` recibe `unknown` y devuelve el valor tipado o un error. No tira excepciones.", code: "type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };\ntype Esquema<T> = { parse: (x: unknown) => Resultado<T> };\nfunction string(): Esquema<string> {\n  return { parse: (x) => (typeof x === \"string\" ? { ok: true, valor: x } : { ok: false, error: \"se esperaba string\" }) };\n}" },
    { title: "`Infer` saca el tipo", text: "`Infer` usa `infer` para sacar el `T` de un `Esquema<T>`. El tipo sale del esquema, no al revés.", code: "type Infer<E> = E extends Esquema<infer T> ? T : never;\ntype Forma<S> = { [K in keyof S]: Infer<S[K]> };\ntype Usuario = Forma<{ nombre: Esquema<string>; edad: Esquema<number> }>;" },
    { title: "`object` junta todo", text: "`object` valida cada campo con su esquema. Tiene un solo `as`, escondido adentro. Afuera todo queda tipado." },
  ],
  exercises: [
    {
      type: "predict",
      id: "string-fails",
      code: `${BASE}${PRIMITIVES}string().parse(42).ok;`,
      answer: "false",
      explanation: "42 no es string, así que `parse` devuelve la variante `ok: false`.",
    },
    {
      type: "predict",
      id: "unchecked-value",
      code: `${BASE}${PRIMITIVES}const r = number().parse(7);\nr.valor;`,
      answer: "type error",
      explanation: "`r` puede ser el error, que no tiene `valor`. Mirá `ok` primero.",
    },
    {
      type: "predict",
      id: "checked-value",
      code: `${BASE}${PRIMITIVES}const r = number().parse(7);\nr.ok ? r.valor * 2 : r.error;`,
      answer: "14",
      explanation: "El ternario sobre `ok` estrecha cada rama: en una hay `valor`, en la otra `error`.",
    },
    {
      type: "complete",
      id: "infer",
      prompt: "Escribí `Infer` para sacar el tipo que valida un esquema.",
      code: `${BASE}type Infer<E> = ___;`,
      tests: "type _1 = Expect<Equal<Infer<Esquema<string>>, string>>;\ntype _2 = Expect<Equal<Infer<Esquema<{ id: number }>>, { id: number }>>;\ntype _3 = Expect<Equal<Infer<number>, never>>;",
      solution: "E extends Esquema<infer T> ? T : never",
      explanation: "`infer T` captura lo que hay dentro de `Esquema<...>`. Si `E` no es un esquema, da `never`.",
    },
    {
      type: "predict",
      id: "field-error",
      code: `${ALL}const usuario = object({ nombre: string(), edad: number() });\nconst r = usuario.parse({ nombre: "Ana", edad: "30" });\nr.ok ? "ok" : r.error;`,
      answer: "\"edad: se esperaba number\"",
      explanation: "`nombre` pasa. `edad` viene como string y corta todo, con el nombre del campo en el error.",
    },
    {
      type: "choose",
      id: "derived-type",
      prompt: "¿Qué es `Usuario`?",
      code: `${ALL}const usuario = object({ nombre: string(), edad: number() });\ntype Usuario = Infer<typeof usuario>;`,
      options: ["`{ nombre: string; edad: number }`", "`{ nombre: Esquema<string>; edad: Esquema<number> }`", "`Esquema<unknown>`", "`unknown`"],
      correct: 0,
      explanation: "`Forma` pasa cada campo por `Infer`: de esquemas a valores. Queda un objeto común.",
    },
    {
      type: "complete",
      id: "shape",
      prompt: "`Forma<S>` convierte un objeto de esquemas en un objeto de valores. Completalo.",
      code: `${BASE}${INFER}type Forma<S> = ___;`,
      tests: "type _1 = Expect<Equal<Forma<{ nombre: Esquema<string>; edad: Esquema<number> }>, { nombre: string; edad: number }>>;\ntype _2 = Expect<Equal<Forma<{}>, {}>>;",
      solution: "{ [K in keyof S]: Infer<S[K]> }",
      hint: "Un mapped type sobre las claves de `S` que pase cada valor por `Infer`.",
      explanation: "Por cada clave de `S`, el valor pasa de `Esquema<T>` a `T`.",
    },
    {
      type: "fix",
      id: "boolean",
      prompt: "Alguien sumó `boolean()` y no compila. Arreglalo sin cambiar la idea.",
      code: `${BASE}${INFER}function boolean(): Esquema<boolean> {\n  return { parse: (x) => (typeof x === "boolean" ? { ok: true, valor: x } : { ok: false, mensaje: "se esperaba boolean" }) };\n}`,
      tests: "type _1 = Expect<Equal<Infer<ReturnType<typeof boolean>>, boolean>>;\nconst r = boolean().parse(true);",
      solution: `${BASE}${INFER}function boolean(): Esquema<boolean> {\n  return { parse: (x) => (typeof x === "boolean" ? { ok: true, valor: x } : { ok: false, error: "se esperaba boolean" }) };\n}`,
      explanation: "En `Resultado`, el error se llama `error`, no `mensaje`.",
    },
    {
      type: "fix",
      id: "optional",
      prompt: "`opcional` acepta `undefined` además de lo del esquema. El tipo de retorno está mal: arreglalo.",
      code: `${BASE}${INFER}${PRIMITIVES}function opcional<T>(e: Esquema<T>): Esquema<T> {\n  return { parse: (x) => (x === undefined ? { ok: true, valor: undefined } : e.parse(x)) };\n}`,
      tests: "const apodo = opcional(string());\ntype _1 = Expect<Equal<Infer<typeof apodo>, string | undefined>>;",
      solution: `${BASE}${INFER}${PRIMITIVES}function opcional<T>(e: Esquema<T>): Esquema<T | undefined> {\n  return { parse: (x) => (x === undefined ? { ok: true, valor: undefined } : e.parse(x)) };\n}`,
      explanation: "Si puede devolver `undefined`, el tipo tiene que decirlo: `Esquema<T | undefined>`.",
    },
    {
      type: "complete",
      id: "array",
      prompt: "Jefe: `array(item)` valida un array donde cada elemento pasa `item`. ¿Qué valida el esquema que devuelve?",
      code: `${ALL}function array<T>(item: Esquema<T>): Esquema<___> {\n  return {\n    parse: (x) => {\n      if (!Array.isArray(x)) return { ok: false, error: "se esperaba array" };\n      const salida: T[] = [];\n      for (const v of x) {\n        const r = item.parse(v);\n        if (!r.ok) return { ok: false, error: "[" + salida.length + "] " + r.error };\n        salida.push(r.valor);\n      }\n      return { ok: true, valor: salida };\n    },\n  };\n}`,
      tests: "const pedido = object({ cliente: string(), items: array(object({ sku: string(), cantidad: number() })) });\ntype _1 = Expect<Equal<Infer<typeof pedido>, { cliente: string; items: { sku: string; cantidad: number }[] }>>;\nconst r = pedido.parse({ cliente: \"Ana\", items: [{ sku: \"A1\", cantidad: 2 }] });\nconst total: number = r.ok ? r.valor.items.length : 0;",
      solution: "T[]",
      hint: "Si cada elemento es un `T`, ¿qué es el array? Tiene que poder ir adentro de `object`.",
      explanation: "Con `Esquema<T[]>`, `Infer` da un array. Y como `object` usa `Infer`, los esquemas se anidan solos.",
    },
  ],
};

export default lesson;
