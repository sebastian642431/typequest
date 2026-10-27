import type { Lesson } from "../../../../content/types.ts";

const SHARED_TYPES = "type Order = { order_id: number; precio: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } | { kind: \"REPO\"; data: Caucion };\n";

const lesson: Lesson = {
  id: "discriminated",
  title: "Uniones con etiqueta",
  summary: "Un campo `kind` que dice qué forma tiene cada objeto.",
  idea: "Un campo como `kind` funciona de etiqueta: mirándolo, sabés qué variante tenés.",
  theory: [
    {
      title: "La etiqueta",
      text: "Todos los objetos de la unión tienen `kind`, cada uno con un literal distinto.",
      code: SHARED_TYPES,
    },
    {
      title: "Sin mirar, solo lo común",
      text: "`order_id` está en los dos. `tasa` solo en `Caucion`, así que sin chequear no se puede usar.",
    },
    {
      title: "Mirás kind y listo",
      text: "Con un `if` o un `switch` sobre `kind`, TypeScript sabe la variante y te deja usar sus campos.",
      code: "function describir(d: DeskBlotterData) {\n  switch (d.kind) {\n    case \"ORDER\":\n      return d.data.precio;\n    case \"REPO\":\n      return d.data.tasa;\n  }\n}",
    },
    {
      title: "never te avisa",
      text: "Al final asignás lo que sobra a una variable `never`. Si olvidaste un caso, no compila.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "shared-field",
      code: `${SHARED_TYPES}const d: DeskBlotterData = { kind: "REPO", data: { order_id: 7, tasa: 35 } };\nd.data.order_id;`,
      answer: "7",
      explanation: "`order_id` está en las dos variantes. Se lee sin mirar `kind`.",
    },
    {
      type: "predict",
      id: "exclusive-field",
      code: `${SHARED_TYPES}function tasa(d: DeskBlotterData) {\n  return d.data.tasa;\n}\ntasa({ kind: "REPO", data: { order_id: 7, tasa: 35 } });`,
      answer: "type error",
      explanation: "Sin chequear `kind`, `d` puede ser una ORDER. Y `Order` no tiene `tasa`.",
    },
    {
      type: "predict",
      id: "if-kind",
      code: `${SHARED_TYPES}function valor(d: DeskBlotterData) {\n  if (d.kind === "REPO") {\n    return d.data.tasa;\n  }\n  return d.data.precio;\n}\nvalor({ kind: "ORDER", data: { order_id: 1, precio: 900 } });`,
      answer: "900",
      explanation: "El `if` ya devolvió para REPO. Después solo queda ORDER, que tiene `precio`.",
    },
    {
      type: "predict",
      id: "switch",
      code: `${SHARED_TYPES}function etiqueta(d: DeskBlotterData) {\n  switch (d.kind) {\n    case "ORDER":\n      return "orden " + d.data.order_id;\n    case "REPO":\n      return "caución al " + d.data.tasa;\n  }\n}\netiqueta({ kind: "REPO", data: { order_id: 2, tasa: 40 } });`,
      answer: "\"caución al 40\"",
      explanation: "Cada `case` achica `d` a su variante.",
    },
    {
      type: "predict",
      id: "invalid-kind",
      code: `${SHARED_TYPES}const d: DeskBlotterData = { kind: "FX", data: { order_id: 3, precio: 1 } };\nd.kind;`,
      answer: "type error",
      explanation: "`\"FX\"` no es ninguno de los `kind` permitidos.",
    },
    {
      type: "predict",
      id: "mixed-up",
      code: `${SHARED_TYPES}const d: DeskBlotterData = { kind: "ORDER", data: { order_id: 3, tasa: 40 } };\nd.kind;`,
      answer: "type error",
      explanation: "Con `kind` ORDER, `data` tiene que ser un `Order`. Trae `tasa` en vez de `precio`.",
    },
    {
      type: "predict",
      id: "exhaustive",
      code: `type Order = { order_id: number; precio: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData =\n  | { kind: "ORDER"; data: Order }\n  | { kind: "REPO"; data: Caucion }\n  | { kind: "FX"; data: { order_id: number; par: string } };\nfunction valor(d: DeskBlotterData) {\n  switch (d.kind) {\n    case "ORDER":\n      return d.data.precio;\n    case "REPO":\n      return d.data.tasa;\n    default:\n      const resto: never = d;\n      return resto;\n  }\n}\nvalor({ kind: "REPO", data: { order_id: 2, tasa: 40 } });`,
      answer: "type error",
      explanation: "Falta el `case` de FX. En el `default`, `d` todavía puede ser FX, y eso no entra en `never`.",
    },
    {
      type: "complete",
      id: "complete-variant",
      prompt: "Completá la segunda variante de la unión para que compile.",
      code: "type Order = { order_id: number; precio: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } | ___;",
      tests: "function valor(d: DeskBlotterData) {\n  if (d.kind === \"REPO\") return d.data.tasa;\n  return d.data.precio;\n}\nconst r: number = valor({ kind: \"REPO\", data: { order_id: 1, tasa: 30 } });",
      solution: "{ kind: \"REPO\"; data: Caucion }",
      explanation: "La variante REPO lleva su etiqueta y una `Caucion` como `data`.",
    },
    {
      type: "fix",
      id: "fix-case",
      prompt: "Se sumó la variante FX y `never` avisa. Agregá el caso que falta.",
      code: "type DeskBlotterData =\n  | { kind: \"ORDER\"; data: { order_id: number; precio: number } }\n  | { kind: \"REPO\"; data: { order_id: number; tasa: number } }\n  | { kind: \"FX\"; data: { order_id: number; par: string } };\nfunction nombre(d: DeskBlotterData): string {\n  switch (d.kind) {\n    case \"ORDER\":\n      return \"orden\";\n    case \"REPO\":\n      return \"caución\";\n    default:\n      const resto: never = d;\n      return resto;\n  }\n}",
      tests: "const n: string = nombre({ kind: \"FX\", data: { order_id: 1, par: \"USD/ARS\" } });",
      solution: "type DeskBlotterData =\n  | { kind: \"ORDER\"; data: { order_id: number; precio: number } }\n  | { kind: \"REPO\"; data: { order_id: number; tasa: number } }\n  | { kind: \"FX\"; data: { order_id: number; par: string } };\nfunction nombre(d: DeskBlotterData): string {\n  switch (d.kind) {\n    case \"ORDER\":\n      return \"orden\";\n    case \"REPO\":\n      return \"caución\";\n    case \"FX\":\n      return \"cambio \" + d.data.par;\n    default:\n      const resto: never = d;\n      return resto;\n  }\n}",
      explanation: "Con FX cubierto, al `default` no llega nada y `d` es `never`.",
    },
  ],
};

export default lesson;
