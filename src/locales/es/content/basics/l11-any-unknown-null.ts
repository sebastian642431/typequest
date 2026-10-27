import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "any-unknown-null",
  title: "any, unknown y los vacíos",
  summary: "Qué apaga el chequeo, qué te obliga a mirar, y cómo tratar `null`.",
  idea: "`any` no chequea nada. `unknown` te obliga a mirar antes de usar.",
  theory: [
    {
      title: "any apaga todo",
      text: "Con `any` podés hacer cualquier cosa y nadie protesta. Los errores aparecen recién al correr.",
    },
    {
      title: "unknown, el any seguro",
      text: "Acepta cualquier valor, pero no te deja usarlo hasta que lo chequees.",
      code: "function largo(x: unknown) {\n  if (typeof x === \"string\") return x.length;\n  return 0;\n}",
    },
    {
      title: "null no es un string",
      text: "Si algo puede faltar, el tipo lo dice: `string | undefined`. `apodo?: string` es eso mismo.",
    },
    {
      title: "?. y ??",
      text: "`a?.b` da `undefined` si `a` no está. `x ?? y` usa `y` solo si `x` es `null` o `undefined`.",
      code: "type Usuario = { nombre: string; apodo?: string };\nfunction mostrar(u: Usuario) {\n  return u.apodo?.toUpperCase() ?? u.nombre;\n}",
    },
    {
      title: "! es una promesa",
      text: "`x!` le jura al compilador que no es `null`. Si mentiste, explota al correr.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "any-leaks",
      code: "let x: any = 5;\nconst s: string = x;\ns;",
      answer: "5",
      explanation: "`any` entra en cualquier tipo. `s` dice ser `string` pero guarda un número, y nadie se entera.",
    },
    {
      type: "predict",
      id: "unknown-unchecked",
      code: "function gritar(x: unknown) {\n  return x.toUpperCase();\n}\ngritar(\"hola\");",
      answer: "type error",
      explanation: "Con `unknown` no podés usar nada sin chequear antes qué es.",
    },
    {
      type: "predict",
      id: "null-strict",
      code: "let nombre: string = null;\nnombre;",
      answer: "type error",
      explanation: "`null` no es un `string`. Si puede ser `null`, el tipo es `string | null`.",
    },
    {
      type: "predict",
      id: "optional",
      code: "type Usuario = { nombre: string; apodo?: string };\nfunction largo(u: Usuario) {\n  return u.apodo.length;\n}\nlargo({ nombre: \"Ana\", apodo: \"Anita\" });",
      answer: "type error",
      explanation: "`apodo` puede ser `undefined`. La función tiene que servir también sin apodo.",
    },
    {
      type: "predict",
      id: "chained",
      code: "type Usuario = { nombre: string; apodo?: string };\nfunction largo(u: Usuario) {\n  return u.apodo?.length ?? 0;\n}\nlargo({ nombre: \"Ana\" });",
      answer: "0",
      explanation: "Sin apodo, `?.` da `undefined`, y `??` lo cambia por 0.",
    },
    {
      type: "predict",
      id: "nullish-vs-or",
      code: "function ambos(x: number | null) {\n  return [x ?? 10, x || 10];\n}\nambos(0);",
      answer: "[0, 10]",
      explanation: "`??` solo reemplaza `null` y `undefined`: deja el 0. `||` reemplaza cualquier falsy, y 0 lo es.",
    },
    {
      type: "choose",
      id: "non-null",
      prompt: "¿Qué pasa si llamás a `largo({ nombre: \"Ana\" })`?",
      code: "type Usuario = { nombre: string; apodo?: string };\nfunction largo(u: Usuario) {\n  return u.apodo!.length;\n}",
      options: [
        "No compila",
        "Compila y devuelve 0",
        "Compila y devuelve undefined",
        "Compila, pero se rompe al correr",
      ],
      correct: 3,
      explanation: "El `!` hace que compile. Pero `apodo` es `undefined`, y leerle `.length` explota.",
    },
    {
      type: "complete",
      id: "complete-optional",
      prompt: "Completá el tipo real de la propiedad opcional `edad`.",
      code: "type Usuario = { nombre: string; edad?: number };\ntype Edad = ___;",
      tests: "type Chequeo = Expect<Equal<Edad, Usuario[\"edad\"]>>;\nfunction edadOCero(e: Edad): number {\n  return e ?? 0;\n}",
      solution: "number | undefined",
      explanation: "Una opcional puede no estar. Por eso leerla da `number | undefined`.",
    },
    {
      type: "fix",
      id: "fix-unknown",
      prompt: "Usa un `unknown` sin mirar. Chequealo para que compile y devuelva 0 si no es `number`.",
      code: "function doble(x: unknown) {\n  return x * 2;\n}",
      tests: "const a: number = doble(4);\nconst b: number = doble(\"4\");",
      solution: "function doble(x: unknown) {\n  if (typeof x === \"number\") return x * 2;\n  return 0;\n}",
      explanation: "Después del `typeof`, `x` es `number` y se puede multiplicar. Todo lo demás da 0.",
    },
  ],
};

export default lesson;
