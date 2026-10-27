import type { Leccion } from "../../tipos.ts";

const BASE = "type Order = { order_id: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } | { kind: \"REPO\"; data: Caucion };\nconst orders: Order[] = [{ order_id: 1 }, { order_id: 2 }];\n";

const leccion: Leccion = {
  id: "ensanchamiento",
  titulo: "Cuando \"ORDER\" se vuelve string",
  resumen: "Por qué un literal se ensancha adentro de objetos y callbacks, y cuatro maneras de evitarlo.",
  teoria: [
    { texto: "`const k = \"ORDER\"` tiene tipo `\"ORDER\"`, porque nunca va a cambiar. Pero en un objeto nuevo, las propiedades se pueden reasignar, así que TypeScript ensancha: `{ kind: \"ORDER\" }` queda como `{ kind: string }`." },
    { texto: "Lo mismo pasa con lo que devuelve un callback. Acá cada elemento queda `{ kind: string; data: Order }`, y `string` no entra en `\"ORDER\" | \"REPO\"`." },
    { codigo: "const lista: DeskBlotterData[] = [...orders.map((o) => ({ kind: \"ORDER\", data: o }))];" },
    { texto: "Arreglos: `as const` en el literal, anotar el retorno del callback, o una función constructora que ya devuelva el tipo correcto." },
    { codigo: "orders.map((o) => ({ kind: \"ORDER\" as const, data: o }));\norders.map((o): DeskBlotterData => ({ kind: \"ORDER\", data: o }));\nconst asOrder = (data: Order): DeskBlotterData => ({ kind: \"ORDER\", data });" },
    { texto: "`satisfies` chequea un valor contra un tipo sin cambiar el tipo que se infiere. Y `as const` sobre un objeto o array entero lo deja con literales y `readonly`: no se puede modificar." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "prop-string",
      codigo: "const o = { kind: \"ORDER\" };\nconst k: \"ORDER\" = o.kind;\nk;",
      respuesta: "type error",
      explicacion: "En el objeto, kind se ensanchó a string. Un string cualquiera no entra en \"ORDER\".",
    },
    {
      tipo: "predecir",
      id: "readonly",
      codigo: "const plazos = [1, 7, 30] as const;\nplazos.push(60);\nplazos.length;",
      respuesta: "type error",
      explicacion: "Con as const el array es readonly [1, 7, 30]. No tiene push.",
    },
    {
      tipo: "predecir",
      id: "map-ensancha",
      codigo: `${BASE}const lista: DeskBlotterData[] = [...orders.map((o) => ({ kind: "ORDER", data: o }))];\nlista.length;`,
      respuesta: "type error",
      explicacion: "El callback devuelve { kind: string; data: Order }. kind se ensanchó y ya no encaja con ninguna variante.",
    },
    {
      tipo: "predecir",
      id: "map-anotado",
      codigo: `${BASE}const lista: DeskBlotterData[] = [...orders.map((o): DeskBlotterData => ({ kind: "ORDER", data: o }))];\nlista[1].data.order_id;`,
      respuesta: "2",
      explicacion: "Anotar el retorno del callback le da contexto al literal: kind se queda como \"ORDER\".",
    },
    {
      tipo: "predecir",
      id: "constructora",
      codigo: `${BASE}const asOrder = (data: Order): DeskBlotterData => ({ kind: "ORDER", data });\nconst asRepo = (data: Caucion): DeskBlotterData => ({ kind: "REPO", data });\nconst lista: DeskBlotterData[] = [...orders.map(asOrder), asRepo({ order_id: 3, tasa: 40 })];\nlista.map((d) => d.kind);`,
      respuesta: "[\"ORDER\", \"ORDER\", \"REPO\"]",
      explicacion: "Las constructoras ya devuelven DeskBlotterData, así que se pueden pasar directo a map.",
    },
    {
      tipo: "predecir",
      id: "satisfies",
      codigo: "type Config = { modo: \"ORDER\" | \"REPO\"; plazo: number };\nconst conf = { modo: \"REPO\", plazo: 7 } satisfies Config;\nconst m: \"REPO\" = conf.modo;\nm;",
      respuesta: "\"REPO\"",
      explicacion: "satisfies chequea contra Config pero conserva lo inferido: modo queda como \"REPO\", no como la unión entera.",
    },
    {
      tipo: "predecir",
      id: "anotado-vs-satisfies",
      codigo: "type Config = { modo: \"ORDER\" | \"REPO\"; plazo: number };\nconst conf: Config = { modo: \"REPO\", plazo: 7 };\nconst m: \"REPO\" = conf.modo;\nm;",
      respuesta: "type error",
      explicacion: "Con la anotación, conf.modo es \"ORDER\" | \"REPO\". Que el valor sea \"REPO\" se pierde.",
    },
    {
      tipo: "completar",
      id: "completar-constructora",
      enunciado: "Completá el tipo de retorno de la constructora.",
      codigo: `${BASE}const asOrder = (data: Order): ___ => ({ kind: "ORDER", data });`,
      pruebas: "const lista: DeskBlotterData[] = orders.map(asOrder);",
      solucion: "DeskBlotterData",
      explicacion: "Con el retorno anotado, el literal \"ORDER\" se chequea contra la unión y no se ensancha.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-as-const",
      enunciado: "Este es el error del blotter. Arreglalo agregando as const en el lugar justo.",
      codigo: `${BASE}const lista: DeskBlotterData[] = [...orders.map((o) => ({ kind: "ORDER", data: o }))];`,
      pruebas: "const n: number = lista.length;",
      solucion: `${BASE}const lista: DeskBlotterData[] = [...orders.map((o) => ({ kind: "ORDER" as const, data: o }))];`,
      explicacion: "\"ORDER\" as const mantiene el literal, y el objeto { kind: \"ORDER\"; data: Order } ya encaja en la unión.",
    },
  ],
};

export default leccion;
