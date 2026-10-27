import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "constraints",
  title: "Genéricos con condiciones",
  summary: "Con `extends` le exigís cosas a `T`. Con `=` le das un valor por defecto.",
  idea: "`T extends algo` deja entrar solo los tipos que cumplen.",
  theory: [
    {
      title: "T pelado no sirve de mucho",
      text: "`T` puede ser cualquier cosa, así que no podés usar casi nada de él. `extends` es el patovica de la puerta.",
      code: "function largo<T extends { length: number }>(x: T) {\n  return x.length;\n}",
    },
    {
      title: "Quién entra y quién no",
      text: "Strings y arrays tienen `length`: pasan. Un `number` no tiene: rebota en la llamada.",
    },
    {
      title: "Claves que existen",
      text: "`K extends keyof T` obliga a pedir una clave real. El retorno `T[K]` es el tipo de esa clave.",
      code: "function leer<T, K extends keyof T>(obj: T, clave: K): T[K] {\n  return obj[clave];\n}",
    },
    {
      title: "Valor por defecto",
      text: "Como un parámetro común: `type Lista<T = string> = T[]`. Si no pasás nada, usa `string`.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "length-number",
      code: "function largo<T extends { length: number }>(x: T): number {\n  return x.length;\n}\nlargo(1234);",
      answer: "type error",
      explanation: "`number` no tiene `length`. No cumple la restricción y rebota.",
    },
    {
      type: "predict",
      id: "without-constraint",
      code: "function largo<T>(x: T): number {\n  return x.length;\n}\nlargo(\"hola\");",
      answer: "type error",
      explanation: "Sin `extends`, `T` puede ser cualquier cosa, y no todo tiene `length`. El error está adentro.",
    },
    {
      type: "predict",
      id: "read-key",
      code: "function leer<T, K extends keyof T>(obj: T, clave: K): T[K] {\n  return obj[clave];\n}\nconst perro = { nombre: \"Firulais\", edad: 4 };\nleer(perro, \"edad\") + 1;",
      answer: "5",
      explanation: "`K` es `\"edad\"`, así que `T[K]` es number. 4 + 1 = 5.",
    },
    {
      type: "predict",
      id: "read-missing-key",
      code: "function leer<T, K extends keyof T>(obj: T, clave: K): T[K] {\n  return obj[clave];\n}\nconst perro = { nombre: \"Firulais\", edad: 4 };\nleer(perro, \"raza\");",
      answer: "type error",
      explanation: "Las claves válidas son `\"nombre\"` y `\"edad\"`. `\"raza\"` no está.",
    },
    {
      type: "predict",
      id: "keeps-type",
      code: "function marcar<T extends { id: number }>(x: T): T {\n  return x;\n}\nconst m = marcar({ id: 1, color: \"azul\" });\nm.color;",
      answer: "\"azul\"",
      hint: "¿`T` es `{ id: number }` o el objeto entero?",
      explanation: "`extends` pone un mínimo, no recorta. `T` es el objeto entero, así que `color` sigue ahí.",
    },
    {
      type: "predict",
      id: "default",
      code: "type Lista<T = string> = T[];\nconst l: Lista = [\"a\", 2];\nl.length;",
      answer: "type error",
      explanation: "Sin argumento, `Lista` es `string[]`. El `2` no es string.",
    },
    {
      type: "complete",
      id: "complete-keyof",
      prompt: "Completá la restricción para que `K` solo acepte claves de `T`.",
      code: "function quitar<T, K extends ___>(obj: T, clave: K): T[K] {\n  return obj[clave];\n}",
      tests: "const n: number = quitar({ a: 1, b: \"x\" }, \"a\");",
      solution: "keyof T",
      explanation: "`keyof T` son las claves de `T`. Así `obj[clave]` es seguro.",
    },
    {
      type: "complete",
      id: "complete-default",
      prompt: "Completá el valor por defecto para que `Contador` solo use number.",
      code: "type Contador<T = ___> = { valor: T; paso: T };",
      tests: "const c: Contador = { valor: 0, paso: 1 };\nconst suma: number = c.valor + c.paso;",
      solution: "number",
      explanation: "Con `T = number`, `Contador` sin nada queda `{ valor: number; paso: number }`.",
    },
    {
      type: "fix",
      id: "fix-constraint",
      prompt: "Usa `.precio`, pero `T` no promete tenerlo. Agregá una restricción.",
      code: "function total<T>(items: T[]): number {\n  return items.reduce((acc, i) => acc + i.precio, 0);\n}",
      tests: "const t: number = total([{ precio: 10, nombre: \"alfajor\" }]);",
      solution: "function total<T extends { precio: number }>(items: T[]): number {\n  return items.reduce((acc, i) => acc + i.precio, 0);\n}",
      explanation: "Con `T extends { precio: number }`, todo item tiene precio y se puede sumar.",
    },
    {
      type: "choose",
      id: "choose-constraint",
      prompt: "Con `function f<T extends string | number>(x: T)`, ¿qué llamada no compila?",
      options: [
        "f(\"uno\")",
        "f(1)",
        "f(true)",
        "f<\"a\">(\"a\")",
      ],
      correct: 2,
      explanation: "`true` es boolean, y boolean no entra en `string | number`.",
    },
  ],
};

export default lesson;
