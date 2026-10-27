import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "generics",
  title: "Funciones con hueco",
  summary: "Escribís la función una vez y sirve para cualquier tipo.",
  idea: "Un genérico es un hueco para un tipo: lo que entra, sale.",
  theory: [
    {
      title: "Un hueco para el tipo",
      text: "Declarás el hueco entre `<` y `>`. Después usás `T` como cualquier otro tipo.",
      code: "function primero<T>(lista: T[]): T | undefined {\n  return lista[0];\n}",
    },
    {
      title: "T se adivina solo",
      text: "TypeScript saca `T` de los argumentos. Acá `p` queda `string | undefined`.",
      code: "const p = primero([\"mate\", \"bizcocho\"]);",
    },
    {
      title: "O lo pasás vos",
      text: "Con `primero<number>([1, 2])` mandás vos. Si el argumento no coincide, error: te toma la palabra.",
    },
    {
      title: "Tipos con hueco",
      text: "Alias e interfaces también llevan `<T>`. Ahí no se adivina: `Caja` solo no vale, va `Caja<algo>`.",
      code: "type Caja<T> = { valor: T };\nconst c: Caja<number> = { valor: 3 };",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "identity",
      code: "function eco<T>(x: T): T {\n  return x;\n}\nconst r = eco(\"hola\");\nr.toUpperCase();",
      answer: "\"HOLA\"",
      explanation: "`T` sale de `\"hola\"`, que es un string. Los strings tienen `toUpperCase`.",
    },
    {
      type: "predict",
      id: "inferred-number",
      code: "function eco<T>(x: T): T {\n  return x;\n}\nconst r = eco(42);\nr.toUpperCase();",
      answer: "type error",
      explanation: "`T` sale de `42`, que es un number. Los números no tienen `toUpperCase`.",
    },
    {
      type: "predict",
      id: "explicit-wrong",
      code: "function eco<T>(x: T): T {\n  return x;\n}\neco<string>(7);",
      answer: "type error",
      explanation: "Dijiste que `T` es `string`. Entonces el argumento tiene que ser string, y `7` no lo es.",
    },
    {
      type: "predict",
      id: "pair",
      code: "function par<A, B>(a: A, b: B): [A, B] {\n  return [a, b];\n}\nconst [x, y] = par(\"truco\", 30);\nx.length + y;",
      answer: "35",
      explanation: "Cada hueco sale de su argumento: `A` es string y `B` es number. 5 + 30 = 35.",
    },
    {
      type: "predict",
      id: "box-without-param",
      code: "type Caja<T> = { valor: T };\nconst c: Caja = { valor: 1 };\nc.valor;",
      answer: "type error",
      explanation: "En un alias no se adivina el hueco. Hay que escribir `Caja<number>`.",
    },
    {
      type: "predict",
      id: "generic-interface",
      code: "interface Respuesta<T> {\n  ok: boolean;\n  datos: T;\n}\nconst r: Respuesta<string[]> = { ok: true, datos: [\"a\", \"b\"] };\nr.datos.map((s) => s + s);",
      answer: "[\"aa\", \"bb\"]",
      explanation: "`T` es `string[]`, así que `datos` es un array de strings y `map` los duplica.",
    },
    {
      type: "complete",
      id: "complete-return",
      prompt: "Completá el retorno para no perder qué hay adentro del array.",
      code: "function envolver<T>(x: T): ___ {\n  return [x];\n}",
      tests: "const e = envolver(5);\nconst n: number = e[0];\ntype _t = Expect<Equal<typeof e, number[]>>;",
      solution: "T[]",
      explanation: "Devuelve `[x]`, o sea un array de `T`: `T[]`.",
    },
    {
      type: "complete",
      id: "complete-alias",
      prompt: "Completá el alias para que `Par<X>` sea una tupla de dos `X`.",
      code: "type Par<X> = ___;",
      tests: "const p: Par<string> = [\"dulce\", \"leche\"];\ntype _t = Expect<Equal<Par<number>, [number, number]>>;",
      solution: "[X, X]",
      explanation: "Una tupla de dos posiciones, las dos del tipo `X`.",
    },
    {
      type: "fix",
      id: "fix-unknown",
      prompt: "Devuelve `unknown[]` y se olvida de lo que le pasaste. Hacela genérica.",
      code: "function repetir(x: unknown, veces: number): unknown[] {\n  return Array(veces).fill(x);\n}",
      tests: "const r = repetir(\"ja\", 3);\nconst s: string = r[0];",
      solution: "function repetir<T>(x: T, veces: number): T[] {\n  return Array(veces).fill(x);\n}",
      hint: "Agregá `<T>` y usalo en el parámetro y en el retorno.",
      explanation: "Con `T`, `repetir(\"ja\", 3)` devuelve `string[]` y `r[0]` es string.",
    },
    {
      type: "choose",
      id: "choose-inference",
      prompt: "Llamás `primero([true, false])` sin `<...>`. ¿De dónde sale `T`?",
      options: [
        "De los argumentos que le pasás",
        "Del nombre de la variable donde guardás el resultado",
        "Siempre usa unknown si no lo escribís",
        "De la primera llamada a la función en el archivo",
      ],
      correct: 0,
      explanation: "Sale de los argumentos: `[true, false]` es `boolean[]`, así que `T` es boolean.",
    },
  ],
};

export default lesson;
