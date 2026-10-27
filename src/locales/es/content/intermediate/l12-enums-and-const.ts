import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "enums-and-const",
  title: "Enums y objetos as const",
  summary: "Enums de número y de string, y por qué hoy se prefiere un objeto `as const`.",
  idea: "Un objeto `as const` con su unión hace lo mismo que un enum, pero es JS común.",
  theory: [
    {
      title: "Enums numéricos",
      text: "Un `enum` genera un objeto real. Arranca en 0, sigue de a uno y va del número al nombre.",
      code: "enum Talle {\n  S,\n  M,\n  L,\n}\nconst nombre = Talle[1];",
    },
    {
      title: "Enums de string",
      text: "Son celosos: solo aceptan sus miembros. `\"rojo\"` a mano no entra en `Color`, aunque `Color.Rojo` valga eso.",
    },
    {
      title: "Mejor: as const",
      text: "Un objeto `as const` es JavaScript común. De ahí sacás la unión de sus valores.",
      code: "const Estado = { Activo: \"activo\", Pausado: \"pausado\" } as const;\ntype Estado = (typeof Estado)[keyof typeof Estado];",
    },
    {
      title: "Claves y valores",
      text: "`keyof typeof Estado` son las claves. Indexar con eso da los valores. Y `\"pausado\"` a mano entra.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "numeric",
      code: "enum Talle {\n  S,\n  M,\n  L,\n}\n[Talle.L, Talle[1]];",
      answer: "[2, \"M\"]",
      explanation: "Los valores van 0, 1, 2. El mapeo inverso convierte el 1 en `\"M\"`.",
    },
    {
      type: "predict",
      id: "auto-increment",
      code: "enum Codigo {\n  Ok = 200,\n  Creado,\n  Aceptado,\n}\nCodigo.Aceptado;",
      answer: "202",
      explanation: "Después de 200 sigue contando de a uno: 201, 202.",
    },
    {
      type: "predict",
      id: "strict-string",
      code: "enum Color {\n  Rojo = \"rojo\",\n  Verde = \"verde\",\n}\nconst c: Color = \"rojo\";\nc;",
      answer: "type error",
      explanation: "Un enum de string solo acepta sus miembros. Va `Color.Rojo`.",
    },
    {
      type: "predict",
      id: "as-const-union",
      code: "const Estado = { Activo: \"activo\", Pausado: \"pausado\" } as const;\ntype Estado = (typeof Estado)[keyof typeof Estado];\nconst e: Estado = \"pausado\";\ne;",
      answer: "\"pausado\"",
      explanation: "`Estado` es `\"activo\" | \"pausado\"`. Un literal a mano entra directo.",
    },
    {
      type: "predict",
      id: "without-as-const",
      code: "const Estado = { Activo: \"activo\", Pausado: \"pausado\" };\ntype Estado = (typeof Estado)[keyof typeof Estado];\nconst e: Estado = \"cualquiera\";\ne;",
      answer: "\"cualquiera\"",
      explanation: "Sin `as const`, los valores quedan como string. Entonces entra cualquier string.",
      hint: "¿Qué tipo tiene `Estado.Activo` sin `as const`?",
    },
    {
      type: "predict",
      id: "keys-not-values",
      code: "const Estado = { Activo: \"activo\", Pausado: \"pausado\" } as const;\ntype Estado = (typeof Estado)[keyof typeof Estado];\ntype Clave = keyof typeof Estado;\nconst k: Clave = \"activo\";\nk;",
      answer: "type error",
      explanation: "Las claves son `\"Activo\" | \"Pausado\"`, con mayúscula. `\"activo\"` es un valor.",
    },
    {
      type: "complete",
      id: "complete-union",
      prompt: "Completá `Moneda` para que sea la unión de los valores del objeto.",
      code: "const Moneda = { Peso: \"ARS\", Dolar: \"USD\" } as const;\ntype Moneda = ___;",
      tests: "type _t = Expect<Equal<Moneda, \"ARS\" | \"USD\">>;\nconst m: Moneda = Moneda.Dolar;",
      solution: "(typeof Moneda)[keyof typeof Moneda]",
      explanation: "`typeof` da el tipo del objeto e indexarlo con `keyof` da todos sus valores.",
    },
    {
      type: "complete",
      id: "complete-as-const",
      prompt: "Completá para que los valores no se vuelvan `number`.",
      code: "const Dia = { Lunes: 1, Martes: 2 } as ___;",
      tests: "type D = (typeof Dia)[keyof typeof Dia];\ntype _t = Expect<Equal<D, 1 | 2>>;",
      solution: "const",
      explanation: "`as const` deja cada valor como su literal: 1 y 2.",
    },
    {
      type: "fix",
      id: "fix-enum",
      prompt: "A `precio` le pasan strings sueltos. Cambiá el enum por un objeto `as const` y una unión `Plan`.",
      code: "enum Plan {\n  Free = \"free\",\n  Pro = \"pro\",\n}\nfunction precio(p: Plan) {\n  return p === Plan.Pro ? 10 : 0;\n}",
      tests: "const a: number = precio(\"pro\");\nconst b: number = precio(Plan.Free);",
      solution: "const Plan = { Free: \"free\", Pro: \"pro\" } as const;\ntype Plan = (typeof Plan)[keyof typeof Plan];\nfunction precio(p: Plan) {\n  return p === Plan.Pro ? 10 : 0;\n}",
      explanation: "Con la unión, `\"pro\"` y `Plan.Pro` valen lo mismo. Y `Plan.Free` anda porque el objeto existe.",
    },
    {
      type: "choose",
      id: "why-as-const",
      prompt: "¿Por qué hoy se prefiere un objeto `as const` antes que un enum?",
      options: [
        "Porque los enums no existen en runtime",
        "Porque es JS común y la unión acepta literales a mano",
        "Porque los enums no se pueden usar en un switch",
        "Porque as const hace el código más rápido",
      ],
      correct: 1,
      explanation: "El enum genera código propio de TS y, si es de string, rechaza literales. `as const` no tiene esas vueltas.",
    },
  ],
};

export default lesson;
