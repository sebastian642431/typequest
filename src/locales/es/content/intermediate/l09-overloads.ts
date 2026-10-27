import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "overloads",
  title: "Sobrecargas",
  summary: "Varias firmas para una función, y cuándo alcanza con una unión o un genérico.",
  idea: "Las sobrecargas son varias firmas para una sola función.",
  theory: [
    {
      title: "Varias firmas",
      text: "Si entra texto sale número, y al revés. Listás las firmas arriba y abajo va una sola implementación.",
      code: "function convertir(x: string): number;\nfunction convertir(x: number): string;\nfunction convertir(x: string | number) {\n  return typeof x === \"string\" ? Number(x) : String(x);\n}",
    },
    {
      title: "La implementación no se ve",
      text: "Desde afuera solo se llaman las firmas de arriba. La de abajo tiene que ser compatible con todas.",
    },
    {
      title: "Gana la primera",
      text: "Se prueban en orden y gana la primera que encaja. Las más específicas van arriba.",
    },
    {
      title: "¿Hace falta?",
      text: "Si el retorno no cambia, alcanza con una unión. Si sale lo mismo que entra, un genérico.",
      code: "function ultimo<T>(xs: T[]): T | undefined {\n  return xs[xs.length - 1];\n}",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "picks-signature",
      code: "function convertir(x: string): number;\nfunction convertir(x: number): string;\nfunction convertir(x: string | number): string | number {\n  return typeof x === \"string\" ? Number(x) : String(x);\n}\nconvertir(\"42\") + 1;",
      answer: "43",
      explanation: "Un string entra por la primera firma y devuelve number. 42 + 1 = 43.",
    },
    {
      type: "predict",
      id: "crossed-return",
      code: "function convertir(x: string): number;\nfunction convertir(x: number): string;\nfunction convertir(x: string | number): string | number {\n  return typeof x === \"string\" ? Number(x) : String(x);\n}\nconst n: number = convertir(7);\nn;",
      answer: "type error",
      explanation: "Con un number, la firma devuelve string. Un string no entra en number.",
    },
    {
      type: "predict",
      id: "hidden-impl",
      code: "function convertir(x: string): number;\nfunction convertir(x: number): string;\nfunction convertir(x: string | number): string | number {\n  return typeof x === \"string\" ? Number(x) : String(x);\n}\nfunction cualquiera(x: string | number) {\n  return convertir(x);\n}\ncualquiera(\"5\");",
      answer: "type error",
      explanation: "Ninguna firma visible acepta `string | number`. La de la implementación no cuenta desde afuera.",
      hint: "¿Qué firmas se pueden llamar desde afuera?",
    },
    {
      type: "predict",
      id: "by-count",
      code: "function fecha(timestamp: number): string;\nfunction fecha(dia: number, mes: number, anio: number): string;\nfunction fecha(a: number, b?: number, c?: number): string {\n  return c === undefined ? \"ts \" + a : a + \"/\" + b + \"/\" + c;\n}\nfecha(25, 5, 1810);",
      answer: "\"25/5/1810\"",
      explanation: "Con tres argumentos entra por la segunda firma y arma la fecha.",
    },
    {
      type: "choose",
      id: "which-is-better",
      prompt: "`primero` recibe un array y devuelve su primer elemento, del mismo tipo. ¿Qué usás?",
      options: [
        "Una sobrecarga para string[], otra para number[], otra para boolean[]...",
        "Un genérico: function primero<T>(xs: T[]): T | undefined",
        "Una unión: function primero(xs: unknown[]): unknown",
        "Una sola firma con any",
      ],
      correct: 1,
      explanation: "Lo que sale depende de lo que entra: eso es un genérico. `unknown` o `any` pierden el tipo.",
    },
    {
      type: "predict",
      id: "order",
      code: "function describir(x: unknown): \"algo\";\nfunction describir(x: string): \"texto\";\nfunction describir(x: unknown): string {\n  return typeof x === \"string\" ? \"texto\" : \"algo\";\n}\nconst r: \"texto\" = describir(\"hola\");\nr;",
      answer: "type error",
      explanation: "La primera firma acepta todo, así que siempre gana y da `\"algo\"`. La de string nunca llega.",
      hint: "Las firmas se prueban de arriba hacia abajo.",
    },
    {
      type: "predict",
      id: "incompatible",
      code: "function largo(x: string): number;\nfunction largo(x: string[]): number;\nfunction largo(x: string): number {\n  return x.length;\n}\nlargo(\"hola\");",
      answer: "type error",
      explanation: "La implementación solo acepta string, no `string[]`. El error está en la declaración.",
    },
    {
      type: "complete",
      id: "complete-signature",
      prompt: "Agregá una firma: que acepte un array de strings y devuelva un array de números.",
      code: "function parsear(x: string): number;\n___;\nfunction parsear(x: string | string[]): number | number[] {\n  return typeof x === \"string\" ? Number(x) : x.map(Number);\n}",
      tests: "const uno: number = parsear(\"1\");\nconst varios: number[] = parsear([\"1\", \"2\"]);",
      solution: "function parsear(x: string[]): number[]",
      explanation: "Cada firma es una declaración sin cuerpo con su entrada y su salida.",
    },
    {
      type: "complete",
      id: "complete-generic",
      prompt: "En vez de una sobrecarga por tipo, completá el retorno del genérico.",
      code: "function envolver<T>(x: T): ___ {\n  return [x];\n}",
      tests: "const a: string[] = envolver(\"hola\");\nconst b: number[] = envolver(3);",
      solution: "T[]",
      explanation: "Sale un array de lo que entra: `T[]`. Sirve para cualquier `T`.",
    },
    {
      type: "fix",
      id: "fix-union",
      prompt: "`todos` no compila. Cambiá las sobrecargas de `formatear` por una sola firma.",
      code: "function formatear(x: string): string;\nfunction formatear(x: number): string;\nfunction formatear(x: string | number): string {\n  return String(x).padStart(3, \"0\");\n}\nfunction todos(xs: (string | number)[]) {\n  return xs.map((x) => formatear(x));\n}",
      tests: "const r: string[] = todos([1, \"2\"]);",
      solution: "function formatear(x: string | number): string {\n  return String(x).padStart(3, \"0\");\n}\nfunction todos(xs: (string | number)[]) {\n  return xs.map((x) => formatear(x));\n}",
      explanation: "Las dos firmas devolvían lo mismo y encima rechazaban `string | number`. Una unión lo arregla.",
    },
  ],
};

export default lesson;
