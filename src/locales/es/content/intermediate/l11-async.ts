import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "async",
  title: "Promesas y async",
  summary: "`Promise<T>`, funciones `async`, qué hace `await` con el tipo y `Promise.all`.",
  idea: "Una `Promise<T>` es una caja que más tarde trae un `T`; `await` la abre.",
  theory: [
    {
      title: "async devuelve una caja",
      text: "Una función `async` siempre devuelve una promesa, aunque hagas `return 1450`.",
      code: "async function cotizacion(): Promise<number> {\n  return 1450;\n}",
    },
    {
      title: "await abre la caja",
      text: "`await cotizacion()` es un number. Sin `await` tenés la promesa, y una promesa no se suma.",
    },
    {
      title: "Promise.all",
      text: "Con un array devuelve una tupla. Cada posición conserva su tipo.",
      code: "const [usd, nombre] = await Promise.all([\n  cotizacion(),\n  Promise.resolve(\"Ana\"),\n]);",
    },
    {
      title: "Awaited",
      text: "`Awaited<T>` es lo que queda después de esperar, aunque haya promesas adentro de promesas.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "async-number",
      code: "async function uno(): number {\n  return 1;\n}\nuno();",
      answer: "type error",
      explanation: "Una `async` siempre devuelve promesa. El retorno tiene que ser `Promise<number>`.",
    },
    {
      type: "predict",
      id: "typeof-promise",
      code: "async function saludo() {\n  return \"hola\";\n}\nconst p: Promise<string> = saludo();\ntypeof p;",
      answer: "\"object\"",
      explanation: "Sin `await` tenés la promesa, y en runtime una promesa es un objeto.",
    },
    {
      type: "predict",
      id: "without-await-assign",
      code: "async function edad() {\n  return 30;\n}\nconst n: number = edad();\nn;",
      answer: "type error",
      explanation: "`edad()` es `Promise<number>`, no number. Falta el `await`.",
    },
    {
      type: "predict",
      id: "without-await-sum",
      code: "async function precio() {\n  return 100;\n}\nasync function conIva() {\n  const p = precio();\n  return p * 1.21;\n}\nconIva();",
      answer: "type error",
      explanation: "`p` es una promesa. Una promesa no se multiplica.",
    },
    {
      type: "predict",
      id: "awaited",
      code: "type Adentro = Awaited<Promise<Promise<string>>>;\nconst a: Adentro = \"listo\";\na.length;",
      answer: "5",
      explanation: "`Awaited` abre todas las capas y deja string. `\"listo\"` tiene 5 letras.",
    },
    {
      type: "predict",
      id: "then-changes",
      code: "const p: Promise<number> = Promise.resolve(2).then((n) => n.toFixed(1));\ntypeof p;",
      answer: "type error",
      explanation: "`then` devuelve promesa de lo que da el callback, y `toFixed` da string. No entra en `Promise<number>`.",
      hint: "¿Qué tipo devuelve `toFixed`?",
    },
    {
      type: "complete",
      id: "complete-return",
      prompt: "Completá el retorno de `cargar`.",
      code: "async function cargar(): ___ {\n  return [\"yerba\", \"azúcar\"];\n}",
      tests: "async function usar() {\n  const xs = await cargar();\n  const n: number = xs.length;\n  const s: string = xs[0];\n  return n + s;\n}",
      solution: "Promise<string[]>",
      explanation: "Devuelve `string[]`, y `async` lo mete en una promesa.",
    },
    {
      type: "complete",
      id: "complete-tuple",
      prompt: "Completá el tipo del primer elemento de la tupla de `Promise.all`.",
      code: "async function usuario() {\n  return { nombre: \"Ana\" };\n}\nasync function saldo() {\n  return 1500;\n}\nasync function resumen() {\n  const [u, s]: [___, number] = await Promise.all([usuario(), saldo()]);\n  return u.nombre + \": \" + s.toFixed(2);\n}",
      tests: "const r: Promise<string> = resumen();",
      solution: "{ nombre: string }",
      explanation: "`Promise.all` espera todo y arma una tupla. La primera posición es lo que da `usuario`, ya abierto.",
    },
    {
      type: "fix",
      id: "fix-all",
      prompt: "`total` no compila. Arreglalo sin tocar `precio` ni `envio`.",
      code: "async function precio() {\n  return 100;\n}\nasync function envio() {\n  return 20;\n}\nasync function total() {\n  const [p, e] = Promise.all([precio(), envio()]);\n  return p + e;\n}",
      tests: "const t: Promise<number> = total();",
      solution: "async function precio() {\n  return 100;\n}\nasync function envio() {\n  return 20;\n}\nasync function total() {\n  const [p, e] = await Promise.all([precio(), envio()]);\n  return p + e;\n}",
      explanation: "`Promise.all` devuelve una promesa. Sin `await` no hay tupla para desarmar.",
    },
    {
      type: "choose",
      id: "awaited-return",
      prompt: "¿Qué tipo es `Resultado`?",
      code: "async function cargar() {\n  return { ok: true, items: [1, 2, 3] };\n}\ntype Resultado = Awaited<ReturnType<typeof cargar>>;",
      options: [
        "Promise<{ ok: boolean; items: number[] }>",
        "{ ok: boolean; items: number[] }",
        "() => Promise<{ ok: boolean; items: number[] }>",
        "unknown",
      ],
      correct: 1,
      explanation: "`ReturnType` da la promesa y `Awaited` la abre. El combo para ver qué trae una `async`.",
    },
  ],
};

export default lesson;
