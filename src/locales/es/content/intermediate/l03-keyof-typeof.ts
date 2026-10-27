import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "keyof-typeof",
  title: "Sacarle tipos a los valores",
  summary: "`keyof` saca las claves de un tipo. `typeof` saca el tipo de un valor.",
  idea: "`keyof` da las claves; `typeof` da el tipo de un valor.",
  theory: [
    {
      title: "keyof: las claves",
      text: "Le das un tipo de objeto y te da sus claves como unión. Es el índice del libro.",
      code: "type Jugador = { nombre: string; goles: number };\ntype Clave = keyof Jugador;",
    },
    {
      title: "typeof: el tipo de un valor",
      text: "Le das un valor y te da su tipo. No es el `typeof` de JS que da `\"string\"`: este vive en los tipos.",
      code: "const config = { tema: \"oscuro\", volumen: 7 };\ntype Config = typeof config;",
    },
    {
      title: "Juntos",
      text: "`keyof typeof config` son las claves de un valor. Así no escribís el tipo dos veces.",
      code: "function ajustar(clave: keyof typeof config) {\n  return config[clave];\n}",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "keyof-wrong",
      code: "type Jugador = { nombre: string; goles: number };\nconst k: keyof Jugador = \"asistencias\";\nk;",
      answer: "type error",
      explanation: "Las claves de `Jugador` son `nombre` y `goles`. `\"asistencias\"` no está.",
    },
    {
      type: "predict",
      id: "keyof-value",
      code: "const config = { tema: \"oscuro\", volumen: 7 };\nconst k: keyof config = \"tema\";\nk;",
      answer: "type error",
      explanation: "`keyof` pide un tipo y `config` es un valor. Falta `typeof` en el medio.",
    },
    {
      type: "predict",
      id: "keyof-typeof",
      code: "const config = { tema: \"oscuro\", volumen: 7 };\nconst k: keyof typeof config = \"volumen\";\nconfig[k];",
      answer: "7",
      explanation: "Las claves son `\"tema\" | \"volumen\"`. `config[\"volumen\"]` vale 7.",
    },
    {
      type: "predict",
      id: "typeof-const",
      code: "const nivel = 3;\nlet otro: typeof nivel = 4;\notro;",
      answer: "type error",
      hint: "¿Qué tipo tiene una `const` con un número?",
      explanation: "Una `const` guarda el literal: `typeof nivel` es `3`. El `4` no entra.",
    },
    {
      type: "predict",
      id: "typeof-narrowed",
      code: "function medir(x: string | number) {\n  if (typeof x === \"string\") {\n    const copia: typeof x = x;\n    return copia.length;\n  }\n  return x;\n}\nmedir(\"chau\");",
      answer: "4",
      explanation: "Adentro del `if`, `x` ya es string. `typeof x` usa ese tipo. `\"chau\"` tiene 4 letras.",
    },
    {
      type: "predict",
      id: "key-union",
      code: "type A = { a: number; b: number };\ntype B = { b: number; c: number };\nconst k: keyof (A | B) = \"a\";\nk;",
      answer: "type error",
      hint: "Si puede ser A o B, ¿qué claves tenés seguro?",
      explanation: "De una unión solo quedan las claves comunes: `\"b\"`. `\"a\"` puede no estar.",
    },
    {
      type: "complete",
      id: "complete-keyof-typeof",
      prompt: "Completá el tipo para que acepte solo claves de `precios`.",
      code: "const precios = { cafe: 1500, medialuna: 800, tostado: 3200 };\nfunction precio(item: ___): number {\n  return precios[item];\n}",
      tests: "const p: number = precio(\"medialuna\");\ntype _t = Expect<Equal<Parameters<typeof precio>[0], \"cafe\" | \"medialuna\" | \"tostado\">>;",
      solution: "keyof typeof precios",
      explanation: "`typeof precios` da el tipo del objeto y `keyof` sus claves.",
    },
    {
      type: "complete",
      id: "complete-typeof",
      prompt: "Completá el tipo para que `copia` tenga la forma de `original`, sin escribirla.",
      code: "const original = { titulo: \"Nueve reinas\", anio: 2000 };\nconst copia: ___ = { titulo: \"El aura\", anio: 2005 };",
      tests: "const t: string = copia.titulo;\nconst a: number = copia.anio;",
      solution: "typeof original",
      explanation: "`typeof original` ya es `{ titulo: string; anio: number }`.",
    },
    {
      type: "fix",
      id: "fix-string-key",
      prompt: "No se puede indexar con cualquier string. Cambiá el tipo del parámetro.",
      code: "const colores = { rojo: \"#f00\", verde: \"#0f0\" };\nfunction color(nombre: string): string {\n  return colores[nombre];\n}",
      tests: "const c: string = color(\"verde\");",
      solution: "const colores = { rojo: \"#f00\", verde: \"#0f0\" };\nfunction color(nombre: keyof typeof colores): string {\n  return colores[nombre];\n}",
      explanation: "Con `keyof typeof colores`, `nombre` solo puede ser `\"rojo\"` o `\"verde\"`. Acceso seguro.",
    },
    {
      type: "choose",
      id: "choose-keyof",
      prompt: "¿Qué es `keyof { id: number; nombre: string }`?",
      options: [
        "\"id\" | \"nombre\"",
        "number | string",
        "[\"id\", \"nombre\"]",
        "string",
      ],
      correct: 0,
      explanation: "`keyof` da las claves como unión. No da los tipos de los valores ni un array.",
    },
  ],
};

export default lesson;
