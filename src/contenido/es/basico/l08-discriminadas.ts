import type { Leccion } from "../../tipos.ts";

const TIPOS = "type Order = { order_id: number; precio: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } | { kind: \"REPO\"; data: Caucion };\n";

const leccion: Leccion = {
  id: "discriminadas",
  titulo: "Uniones con etiqueta",
  resumen: "Un campo kind que dice qué forma tiene cada objeto de la unión.",
  teoria: [
    { texto: "Una unión discriminada es una unión de objetos donde todos tienen un mismo campo con un literal distinto. Ese campo, acá `kind`, funciona como etiqueta." },
    { codigo: TIPOS },
    { texto: "Sin mirar `kind`, solo podés usar lo que tienen todos. `order_id` está en Order y en Caucion, pero `tasa` solo en Caucion." },
    { texto: "Cuando preguntás por `kind` con un `if` o un `switch`, TypeScript sabe qué variante tenés y te deja usar sus campos." },
    { codigo: "function describir(d: DeskBlotterData) {\n  switch (d.kind) {\n    case \"ORDER\":\n      return d.data.precio;\n    case \"REPO\":\n      return d.data.tasa;\n  }\n}" },
    { texto: "Para que el compilador te avise si te olvidás un caso, al final asignás lo que queda a una variable `never`. Si quedó algo sin cubrir, no compila." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "campo-comun",
      codigo: `${TIPOS}const d: DeskBlotterData = { kind: "REPO", data: { order_id: 7, tasa: 35 } };\nd.data.order_id;`,
      respuesta: "7",
      explicacion: "order_id está en las dos variantes, así que se puede leer sin mirar kind.",
    },
    {
      tipo: "predecir",
      id: "campo-exclusivo",
      codigo: `${TIPOS}function tasa(d: DeskBlotterData) {\n  return d.data.tasa;\n}\ntasa({ kind: "REPO", data: { order_id: 7, tasa: 35 } });`,
      respuesta: "type error",
      explicacion: "Sin chequear kind, d puede ser una ORDER, y Order no tiene tasa.",
    },
    {
      tipo: "predecir",
      id: "if-kind",
      codigo: `${TIPOS}function valor(d: DeskBlotterData) {\n  if (d.kind === "REPO") {\n    return d.data.tasa;\n  }\n  return d.data.precio;\n}\nvalor({ kind: "ORDER", data: { order_id: 1, precio: 900 } });`,
      respuesta: "900",
      explicacion: "Después del if que devuelve para REPO, solo queda ORDER, así que d.data.precio compila.",
    },
    {
      tipo: "predecir",
      id: "switch",
      codigo: `${TIPOS}function etiqueta(d: DeskBlotterData) {\n  switch (d.kind) {\n    case "ORDER":\n      return "orden " + d.data.order_id;\n    case "REPO":\n      return "caución al " + d.data.tasa;\n  }\n}\netiqueta({ kind: "REPO", data: { order_id: 2, tasa: 40 } });`,
      respuesta: "\"caución al 40\"",
      explicacion: "Cada case estrecha d a su variante.",
    },
    {
      tipo: "predecir",
      id: "kind-invalido",
      codigo: `${TIPOS}const d: DeskBlotterData = { kind: "FX", data: { order_id: 3, precio: 1 } };\nd.kind;`,
      respuesta: "type error",
      explicacion: "\"FX\" no es ninguno de los kind permitidos.",
    },
    {
      tipo: "predecir",
      id: "mezcla",
      codigo: `${TIPOS}const d: DeskBlotterData = { kind: "ORDER", data: { order_id: 3, tasa: 40 } };\nd.kind;`,
      respuesta: "type error",
      explicacion: "Con kind ORDER, data tiene que ser un Order. Un objeto con tasa en vez de precio no encaja.",
    },
    {
      tipo: "predecir",
      id: "exhaustivo",
      codigo: `type Order = { order_id: number; precio: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData =\n  | { kind: "ORDER"; data: Order }\n  | { kind: "REPO"; data: Caucion }\n  | { kind: "FX"; data: { order_id: number; par: string } };\nfunction valor(d: DeskBlotterData) {\n  switch (d.kind) {\n    case "ORDER":\n      return d.data.precio;\n    case "REPO":\n      return d.data.tasa;\n    default:\n      const resto: never = d;\n      return resto;\n  }\n}\nvalor({ kind: "REPO", data: { order_id: 2, tasa: 40 } });`,
      respuesta: "type error",
      explicacion: "Falta el case de FX. En el default, d todavía puede ser FX, y eso no se puede asignar a never.",
    },
    {
      tipo: "completar",
      id: "completar-variante",
      enunciado: "Completá la segunda variante de la unión para que compile.",
      codigo: "type Order = { order_id: number; precio: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } | ___;",
      pruebas: "function valor(d: DeskBlotterData) {\n  if (d.kind === \"REPO\") return d.data.tasa;\n  return d.data.precio;\n}\nconst r: number = valor({ kind: \"REPO\", data: { order_id: 1, tasa: 30 } });",
      solucion: "{ kind: \"REPO\"; data: Caucion }",
      explicacion: "La variante REPO lleva su etiqueta y una Caucion como data.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-caso",
      enunciado: "Se agregó la variante FX y el chequeo con never avisa. Agregá el caso que falta.",
      codigo: "type DeskBlotterData =\n  | { kind: \"ORDER\"; data: { order_id: number; precio: number } }\n  | { kind: \"REPO\"; data: { order_id: number; tasa: number } }\n  | { kind: \"FX\"; data: { order_id: number; par: string } };\nfunction nombre(d: DeskBlotterData): string {\n  switch (d.kind) {\n    case \"ORDER\":\n      return \"orden\";\n    case \"REPO\":\n      return \"caución\";\n    default:\n      const resto: never = d;\n      return resto;\n  }\n}",
      pruebas: "const n: string = nombre({ kind: \"FX\", data: { order_id: 1, par: \"USD/ARS\" } });",
      solucion: "type DeskBlotterData =\n  | { kind: \"ORDER\"; data: { order_id: number; precio: number } }\n  | { kind: \"REPO\"; data: { order_id: number; tasa: number } }\n  | { kind: \"FX\"; data: { order_id: number; par: string } };\nfunction nombre(d: DeskBlotterData): string {\n  switch (d.kind) {\n    case \"ORDER\":\n      return \"orden\";\n    case \"REPO\":\n      return \"caución\";\n    case \"FX\":\n      return \"cambio \" + d.data.par;\n    default:\n      const resto: never = d;\n      return resto;\n  }\n}",
      explicacion: "Con el case FX cubierto, en el default no queda nada y d es never.",
    },
  ],
};

export default leccion;
