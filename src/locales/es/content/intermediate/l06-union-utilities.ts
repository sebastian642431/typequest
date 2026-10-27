import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "union-utilities",
  title: "Filtrar uniones y espiar funciones",
  summary: "Filtrar uniones con `Exclude` y `Extract`, y espiar funciones con `ReturnType`.",
  idea: "Hay tipos ya hechos para filtrar uniones y sacarle tipos a funciones.",
  theory: [
    {
      title: "Exclude y Extract",
      text: "`Exclude` saca de la unión lo que encaja. `Extract` se queda solo con eso. Un colador y su negativo.",
      code: "type Palo = \"espada\" | \"basto\" | \"oro\";\ntype SinOro = Exclude<Palo, \"oro\">;",
    },
    {
      title: "NonNullable",
      text: "Le saca `null` y `undefined` a un tipo.",
    },
    {
      title: "ReturnType y Parameters",
      text: "`ReturnType` da lo que devuelve una función. `Parameters`, sus parámetros. Con una función real, usás `typeof`.",
      code: "function sumar(a: number, b: number) {\n  return a + b;\n}\ntype R = ReturnType<typeof sumar>;",
    },
    {
      title: "Awaited",
      text: "Abre promesas, aunque haya una adentro de otra. Es lo que tenés después de un `await`.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "exclude",
      code: "type Palo = \"espada\" | \"basto\" | \"oro\" | \"copa\";\nconst p: Exclude<Palo, \"oro\" | \"copa\"> = \"copa\";\np;",
      answer: "type error",
      explanation: "`Exclude` sacó `oro` y `copa`. Solo quedan `espada` y `basto`.",
    },
    {
      type: "predict",
      id: "extract-objects",
      code: "type Evento = { tipo: \"click\"; x: number } | { tipo: \"tecla\"; codigo: string };\ntype Click = Extract<Evento, { tipo: \"click\" }>;\nconst c: Click = { tipo: \"click\", x: 40 };\nc.x;",
      answer: "40",
      hint: "`Extract` no pide igualdad exacta: alcanza con encajar.",
      explanation: "`Extract` se queda con las variantes que encajan en `{ tipo: \"click\" }`. Esa tiene `x`.",
    },
    {
      type: "predict",
      id: "nonnullable",
      code: "type Talvez = string | null | undefined;\nconst s: NonNullable<Talvez> = undefined;\ns;",
      answer: "type error",
      explanation: "`NonNullable` saca `null` y `undefined`. Solo queda string.",
    },
    {
      type: "predict",
      id: "returntype-without-typeof",
      code: "function crear() {\n  return 1;\n}\nconst r: ReturnType<crear> = 2;\nr;",
      answer: "type error",
      explanation: "`crear` es un valor, no un tipo. Va `ReturnType<typeof crear>`.",
    },
    {
      type: "predict",
      id: "parameters",
      code: "function mover(x: number, y: number, rapido: boolean) {\n  return rapido ? x * 2 + y : x + y;\n}\nconst args: Parameters<typeof mover> = [1, 2, true];\nmover(...args);",
      answer: "4",
      explanation: "`Parameters` da la tupla `[number, number, boolean]`. Con `true`: 1 * 2 + 2 = 4.",
    },
    {
      type: "predict",
      id: "awaited",
      code: "type Doble = Promise<Promise<number>>;\nconst n: Awaited<Doble> = 7;\nn + 1;",
      answer: "8",
      explanation: "`Awaited` abre las dos promesas y deja number. 7 + 1 = 8.",
    },
    {
      type: "complete",
      id: "complete-exclude",
      prompt: "Completá para que `Activo` sea cualquier estado menos `\"borrado\"`.",
      code: "type Estado = \"nuevo\" | \"pagado\" | \"enviado\" | \"borrado\";\ntype Activo = ___;",
      tests: "const a: Activo = \"pagado\";\ntype _t = Expect<Equal<Activo, \"nuevo\" | \"pagado\" | \"enviado\">>;",
      solution: "Exclude<Estado, \"borrado\">",
      explanation: "`Exclude` saca `\"borrado\"` de la unión.",
    },
    {
      type: "complete",
      id: "complete-awaited",
      prompt: "Completá para que `Lista` sea lo que da `traer` después del `await`.",
      code: "async function traer() {\n  return [\"pan\", \"queso\"];\n}\ntype Lista = ___;",
      tests: "const l: Lista = [\"salame\"];\ntype _t = Expect<Equal<Lista, string[]>>;",
      solution: "Awaited<ReturnType<typeof traer>>",
      hint: "`ReturnType` te da la promesa. Falta abrirla.",
      explanation: "`ReturnType` da `Promise<string[]>` y `Awaited` saca el `string[]` de adentro.",
    },
    {
      type: "fix",
      id: "fix-nonnullable",
      prompt: "`Nombre` tendría que ser solo string. Arreglalo sin escribir `string` a mano.",
      code: "type Fila = { nombre: string | null };\ntype Nombre = Fila[\"nombre\"];",
      tests: "type _t = Expect<Equal<Nombre, string>>;",
      solution: "type Fila = { nombre: string | null };\ntype Nombre = NonNullable<Fila[\"nombre\"]>;",
      explanation: "`NonNullable` le saca el `null` a `string | null`.",
    },
    {
      type: "choose",
      id: "choose-parameters",
      prompt: "¿Qué es `Parameters<(a: string, b?: number) => void>`?",
      options: [
        "[a: string, b?: number]",
        "string | number",
        "{ a: string; b?: number }",
        "void",
      ],
      correct: 0,
      explanation: "`Parameters` da una tupla con los parámetros, y respeta cuáles son opcionales.",
    },
  ],
};

export default lesson;
