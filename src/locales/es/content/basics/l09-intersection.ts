import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "intersection",
  title: "Y contra O",
  summary: "`&` junta exigencias, `|` da opciones. Confundirlos te deja en `never`.",
  idea: "`A | B` es A o B. `A & B` es A y B a la vez.",
  theory: [
    {
      title: "| contra &",
      text: "`A | B`: el valor es uno u otro. `A & B`: el valor cumple los dos a la vez.",
    },
    {
      title: "& suma propiedades",
      text: "Con objetos, el resultado tiene que traer todas las propiedades.",
      code: "type ConNombre = { nombre: string };\ntype ConEdad = { edad: number };\nconst p: ConNombre & ConEdad = { nombre: \"Ana\", edad: 30 };",
    },
    {
      title: "Imposible = never",
      text: "Nada es `\"ORDER\"` y `\"REPO\"` a la vez. Por eso `\"ORDER\" & \"REPO\"` es `never`.",
    },
    {
      title: "Si ves never[], querías |",
      text: "Si dos objetos chocan en `kind`, todo queda `never`. Casi siempre querías `|`.",
      code: "type Mal = { kind: \"ORDER\" } & { kind: \"REPO\" };\ntype Bien = { kind: \"ORDER\" } | { kind: \"REPO\" };",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "combines-props",
      code: "type ConNombre = { nombre: string };\ntype ConEdad = { edad: number };\nconst p: ConNombre & ConEdad = { nombre: \"Ana\", edad: 30 };\np.edad;",
      answer: "30",
      explanation: "La intersección pide las dos propiedades, y el objeto las trae.",
    },
    {
      type: "predict",
      id: "missing-prop",
      code: "type ConNombre = { nombre: string };\ntype ConEdad = { edad: number };\nconst p: ConNombre & ConEdad = { nombre: \"Ana\" };\np.nombre;",
      answer: "type error",
      explanation: "Con `&` hacen falta todas. Falta `edad`.",
    },
    {
      type: "predict",
      id: "union-does-not-combine",
      code: "type ConNombre = { nombre: string };\ntype ConEdad = { edad: number };\nfunction edad(p: ConNombre | ConEdad) {\n  return p.edad;\n}\nedad({ edad: 30 });",
      answer: "type error",
      explanation: "Con `|`, `p` puede ser solo `ConNombre`, que no tiene `edad`.",
    },
    {
      type: "predict",
      id: "literals-never",
      code: "type Kind = \"ORDER\" & \"REPO\";\nconst k: Kind = \"ORDER\";\nk;",
      answer: "type error",
      explanation: "Ningún texto es `\"ORDER\"` y `\"REPO\"` a la vez. `Kind` es `never`: no entra nada.",
    },
    {
      type: "predict",
      id: "object-never",
      code: "type Order = { order_id: number };\ntype Caucion = { order_id: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } & { kind: \"REPO\"; data: Caucion };\nconst d: DeskBlotterData = { kind: \"ORDER\", data: { order_id: 1 } };\nd.kind;",
      answer: "type error",
      explanation: "Los dos `kind` chocan, así que todo el tipo es `never`. Ningún objeto encaja.",
    },
    {
      type: "predict",
      id: "empty-array",
      code: "type Order = { order_id: number };\ntype Caucion = { order_id: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } & { kind: \"REPO\"; data: Caucion };\nconst lista: DeskBlotterData[] = [];\nlista.length;",
      answer: "0",
      explanation: "Un array vacío entra en `never[]`. El error recién salta al meter un elemento.",
    },
    {
      type: "choose",
      id: "what-remains",
      prompt: "¿Qué tipo termina siendo `DeskBlotterData`?",
      code: "type Order = { order_id: number };\ntype Caucion = { order_id: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } & { kind: \"REPO\"; data: Caucion };",
      options: [
        "{ kind: \"ORDER\" | \"REPO\"; data: Order | Caucion }",
        "{ kind: string; data: Order & Caucion }",
        "never",
        "unknown",
      ],
      correct: 2,
      explanation: "`kind` sería `\"ORDER\" & \"REPO\"`, que es `never`. Entonces todo el objeto es `never`.",
    },
    {
      type: "complete",
      id: "complete-extra",
      prompt: "Completá lo que se le suma a `Order` para que compile.",
      code: "type Order = { order_id: number };\ntype OrderConCliente = Order & ___;",
      tests: "const o: OrderConCliente = { order_id: 1, cliente: \"Rys\" };\nconst c: string = o.cliente;\nconst n: number = o.order_id;",
      solution: "{ cliente: string }",
      explanation: "La intersección le agrega `cliente` a lo que ya tenía `Order`.",
    },
    {
      type: "fix",
      id: "fix-union",
      prompt: "`DeskBlotterData` quedó en `never`. Arreglalo para que sea una orden o una caución.",
      code: "type Order = { order_id: number; precio: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } & { kind: \"REPO\"; data: Caucion };",
      tests: "const lista: DeskBlotterData[] = [\n  { kind: \"ORDER\", data: { order_id: 1, precio: 900 } },\n  { kind: \"REPO\", data: { order_id: 2, tasa: 40 } },\n];",
      solution: "type Order = { order_id: number; precio: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } | { kind: \"REPO\"; data: Caucion };",
      explanation: "Cada elemento es una cosa o la otra. Eso es una unión: `|`.",
    },
  ],
};

export default lesson;
