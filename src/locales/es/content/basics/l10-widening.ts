import type { Lesson } from "../../../../content/types.ts";

const BASE_CODE = "type Order = { order_id: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } | { kind: \"REPO\"; data: Caucion };\nconst orders: Order[] = [{ order_id: 1 }, { order_id: 2 }];\n";

const lesson: Lesson = {
  id: "widening",
  title: "Cuando \"ORDER\" se vuelve string",
  summary: "Por qué un literal se ensancha en objetos y callbacks, y cómo evitarlo.",
  idea: "Dentro de un objeto, `\"ORDER\"` se vuelve `string`. `as const` lo frena.",
  theory: [
    {
      title: "En objetos se ensancha",
      text: "Una propiedad se puede reasignar. Por eso `{ kind: \"ORDER\" }` queda `{ kind: string }`.",
    },
    {
      title: "En callbacks también",
      text: "Acá `kind` queda `string`, y `string` no entra en `\"ORDER\" | \"REPO\"`.",
      code: "const lista: DeskBlotterData[] = [\n  ...orders.map((o) => ({ kind: \"ORDER\", data: o })),\n];",
    },
    {
      title: "Tres arreglos",
      text: "`as const` en el literal, anotar el retorno del callback o una función que ya devuelva el tipo.",
      code: "orders.map((o) => ({ kind: \"ORDER\" as const, data: o }));\norders.map((o): DeskBlotterData => ({ kind: \"ORDER\", data: o }));\nconst asOrder = (data: Order): DeskBlotterData => ({ kind: \"ORDER\", data });",
    },
    {
      title: "satisfies",
      text: "Chequea el valor contra un tipo, pero se queda con lo que infirió.",
    },
    {
      title: "as const en todo",
      text: "Sobre un objeto o array entero, deja literales y lo vuelve `readonly`.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "prop-string",
      code: "const o = { kind: \"ORDER\" };\nconst k: \"ORDER\" = o.kind;\nk;",
      answer: "type error",
      explanation: "En el objeto, `kind` se ensanchó a `string`. Y un `string` cualquiera no es `\"ORDER\"`.",
    },
    {
      type: "predict",
      id: "readonly",
      code: "const plazos = [1, 7, 30] as const;\nplazos.push(60);\nplazos.length;",
      answer: "type error",
      explanation: "Con `as const` el array es `readonly`. No tiene `push`.",
    },
    {
      type: "predict",
      id: "map-widens",
      code: `${BASE_CODE}const lista: DeskBlotterData[] = [...orders.map((o) => ({ kind: "ORDER", data: o }))];\nlista.length;`,
      answer: "type error",
      explanation: "El callback devuelve `kind: string`. Ya no encaja con ninguna variante.",
    },
    {
      type: "predict",
      id: "map-annotated",
      code: `${BASE_CODE}const lista: DeskBlotterData[] = [...orders.map((o): DeskBlotterData => ({ kind: "ORDER", data: o }))];\nlista[1].data.order_id;`,
      answer: "2",
      explanation: "Con el retorno anotado, TypeScript sabe qué esperar y `kind` queda `\"ORDER\"`.",
    },
    {
      type: "predict",
      id: "constructor-function",
      code: `${BASE_CODE}const asOrder = (data: Order): DeskBlotterData => ({ kind: "ORDER", data });\nconst asRepo = (data: Caucion): DeskBlotterData => ({ kind: "REPO", data });\nconst lista: DeskBlotterData[] = [...orders.map(asOrder), asRepo({ order_id: 3, tasa: 40 })];\nlista.map((d) => d.kind);`,
      answer: "[\"ORDER\", \"ORDER\", \"REPO\"]",
      explanation: "Las constructoras ya devuelven `DeskBlotterData`. Se pasan directo a `map`.",
    },
    {
      type: "predict",
      id: "satisfies",
      code: "type Config = { modo: \"ORDER\" | \"REPO\"; plazo: number };\nconst conf = { modo: \"REPO\", plazo: 7 } satisfies Config;\nconst m: \"REPO\" = conf.modo;\nm;",
      answer: "\"REPO\"",
      explanation: "`satisfies` chequea pero no pisa lo inferido. `modo` sigue siendo `\"REPO\"`.",
    },
    {
      type: "predict",
      id: "annotated-vs-satisfies",
      code: "type Config = { modo: \"ORDER\" | \"REPO\"; plazo: number };\nconst conf: Config = { modo: \"REPO\", plazo: 7 };\nconst m: \"REPO\" = conf.modo;\nm;",
      answer: "type error",
      explanation: "La anotación manda: `conf.modo` es `\"ORDER\" | \"REPO\"`. Que valga `\"REPO\"` se pierde.",
    },
    {
      type: "complete",
      id: "complete-constructor",
      prompt: "Completá el tipo de retorno de la constructora.",
      code: `${BASE_CODE}const asOrder = (data: Order): ___ => ({ kind: "ORDER", data });`,
      tests: "const lista: DeskBlotterData[] = orders.map(asOrder);",
      solution: "DeskBlotterData",
      explanation: "Con el retorno anotado, `\"ORDER\"` se chequea contra la unión y no se ensancha.",
    },
    {
      type: "fix",
      id: "fix-as-const",
      prompt: "El error del blotter. Arreglalo con `as const` en el lugar justo.",
      code: `${BASE_CODE}const lista: DeskBlotterData[] = [...orders.map((o) => ({ kind: "ORDER", data: o }))];`,
      tests: "const n: number = lista.length;",
      solution: `${BASE_CODE}const lista: DeskBlotterData[] = [...orders.map((o) => ({ kind: "ORDER" as const, data: o }))];`,
      explanation: "`as const` mantiene `\"ORDER\"` como literal, y el objeto ya encaja en la unión.",
    },
  ],
};

export default lesson;
