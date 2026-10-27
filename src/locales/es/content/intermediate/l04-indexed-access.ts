import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "indexed-access",
  title: "Corchetes en los tipos",
  summary: "`T[\"clave\"]` saca el tipo de una propiedad. `T[number]`, el de un elemento.",
  idea: "`T[\"clave\"]` te da el tipo de esa propiedad, como `obj.clave` da su valor.",
  theory: [
    {
      title: "Corchetes en los tipos",
      text: "`obj.sabor` da un valor. `Pedido[\"sabor\"]` da su tipo. En tipos va con corchetes, nunca con punto.",
      code: "type Pedido = { id: number; sabor: string };\ntype Sabor = Pedido[\"sabor\"];",
    },
    {
      title: "Varias claves a la vez",
      text: "`Pedido[\"id\" | \"sabor\"]` es la unión de los dos tipos. Si una clave no existe, error.",
    },
    {
      title: "T[number]: un elemento",
      text: "En arrays y tuplas, `[number]` da el tipo de cualquier elemento. En una tupla, la unión de todos.",
    },
    {
      title: "Unión desde un array",
      text: "Con `as const`, el array arma la unión. Agregás un talle y el tipo se actualiza solo.",
      code: "const talles = [\"S\", \"M\", \"L\"] as const;\ntype Talle = (typeof talles)[number];",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "missing-prop",
      code: "type Pedido = { id: number; sabor: string };\nconst p: Pedido[\"precio\"] = 100;\np;",
      answer: "type error",
      explanation: "`Pedido` no tiene `precio`. No hay tipo que sacar.",
    },
    {
      type: "predict",
      id: "dot-prop",
      code: "type Pedido = { id: number; sabor: string };\nconst i: Pedido.id = 1;\ni;",
      answer: "type error",
      explanation: "En los tipos no va punto. Se escribe `Pedido[\"id\"]`.",
    },
    {
      type: "predict",
      id: "key-union",
      code: "type Ficha = { nombre: string; edad: number; activo: boolean };\nconst v: Ficha[\"nombre\" | \"edad\"] = true;\nv;",
      answer: "type error",
      explanation: "Da `string | number`. Un boolean no entra.",
    },
    {
      type: "predict",
      id: "tuple-number",
      code: "type Fila = [string, number, boolean];\nconst x: Fila[number] = null;\nx;",
      answer: "type error",
      explanation: "Da `string | number | boolean`. `null` no está en la lista.",
    },
    {
      type: "predict",
      id: "without-as-const",
      code: "const dias = [\"lunes\", \"martes\"];\nconst d: (typeof dias)[number] = \"domingo\";\nd;",
      answer: "\"domingo\"",
      hint: "Sin `as const`, ¿qué tipo tiene el array?",
      explanation: "Sin `as const`, `dias` es `string[]`. Cualquier string entra, `\"domingo\"` también.",
    },
    {
      type: "predict",
      id: "with-as-const",
      code: "const dias = [\"lunes\", \"martes\"] as const;\nconst d: (typeof dias)[number] = \"domingo\";\nd;",
      answer: "type error",
      explanation: "Con `as const`, el tipo es `\"lunes\" | \"martes\"`. `\"domingo\"` no está.",
    },
    {
      type: "complete",
      id: "complete-element",
      prompt: "Completá `Moneda` para que salga del array, sin repetir los valores.",
      code: "const monedas = [\"ARS\", \"USD\", \"EUR\"] as const;\ntype Moneda = ___;",
      tests: "const m: Moneda = \"USD\";\ntype _t = Expect<Equal<Moneda, \"ARS\" | \"USD\" | \"EUR\">>;",
      solution: "(typeof monedas)[number]",
      explanation: "`typeof monedas` es la tupla y `[number]` saca la unión de sus elementos.",
    },
    {
      type: "complete",
      id: "complete-prop",
      prompt: "Completá el parámetro con el mismo tipo que `estado` de `Envio`.",
      code: "type Envio = { codigo: string; estado: \"armando\" | \"en camino\" | \"entregado\" };\nfunction avanzar(e: ___) {\n  return e;\n}",
      tests: "avanzar(\"en camino\");\ntype _t = Expect<Equal<Parameters<typeof avanzar>[0], \"armando\" | \"en camino\" | \"entregado\">>;",
      solution: "Envio[\"estado\"]",
      explanation: "`Envio[\"estado\"]` trae la unión sin copiarla a mano.",
    },
    {
      type: "fix",
      id: "fix-widened",
      prompt: "`Rol` quedó como `string`. Arreglá la declaración del array.",
      code: "const roles = [\"admin\", \"editor\", \"lector\"];\ntype Rol = (typeof roles)[number];",
      tests: "type _t = Expect<Equal<Rol, \"admin\" | \"editor\" | \"lector\">>;",
      solution: "const roles = [\"admin\", \"editor\", \"lector\"] as const;\ntype Rol = (typeof roles)[number];",
      explanation: "Con `as const` cada elemento queda como literal, y `[number]` da su unión.",
    },
    {
      type: "choose",
      id: "choose-tuple",
      prompt: "¿Qué tipo queda en `X`?",
      code: "type Fila = [\"a\", 1];\ntype X = Fila[0];",
      options: [
        "\"a\"",
        "\"a\" | 1",
        "string",
        "1",
      ],
      correct: 0,
      explanation: "Con un índice fijo, la tupla da el tipo de esa posición: `\"a\"`.",
    },
  ],
};

export default lesson;
