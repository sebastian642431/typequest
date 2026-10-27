import type { Leccion } from "../../tipos.ts";

const leccion: Leccion = {
  id: "interseccion",
  titulo: "Y contra O",
  resumen: "& junta exigencias, | ofrece opciones. Confundirlos puede dejarte en never.",
  teoria: [
    { texto: "`A | B` es una unión: el valor es A o es B. `A & B` es una intersección: el valor tiene que cumplir A y B a la vez." },
    { texto: "Con objetos, la intersección suma propiedades. El objeto tiene que tener todas." },
    { codigo: "type ConNombre = { nombre: string };\ntype ConEdad = { edad: number };\nconst p: ConNombre & ConEdad = { nombre: \"Ana\", edad: 30 };" },
    { texto: "Con literales que no pueden coincidir, la intersección queda vacía. Ningún valor es \"ORDER\" y \"REPO\" a la vez, así que `\"ORDER\" & \"REPO\"` es `never`." },
    { texto: "Lo mismo pasa con objetos cuyo `kind` choca: todo el objeto se vuelve `never`. Si un array de eso te aparece como `never[]`, probablemente quisiste escribir `|`." },
    { codigo: "type Mal = { kind: \"ORDER\" } & { kind: \"REPO\" };\ntype Bien = { kind: \"ORDER\" } | { kind: \"REPO\" };" },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "suma-props",
      codigo: "type ConNombre = { nombre: string };\ntype ConEdad = { edad: number };\nconst p: ConNombre & ConEdad = { nombre: \"Ana\", edad: 30 };\np.edad;",
      respuesta: "30",
      explicacion: "La intersección tiene las dos propiedades, y el objeto las trae.",
    },
    {
      tipo: "predecir",
      id: "falta-prop",
      codigo: "type ConNombre = { nombre: string };\ntype ConEdad = { edad: number };\nconst p: ConNombre & ConEdad = { nombre: \"Ana\" };\np.nombre;",
      respuesta: "type error",
      explicacion: "Con & hacen falta todas las propiedades. Falta edad.",
    },
    {
      tipo: "predecir",
      id: "union-no-suma",
      codigo: "type ConNombre = { nombre: string };\ntype ConEdad = { edad: number };\nfunction edad(p: ConNombre | ConEdad) {\n  return p.edad;\n}\nedad({ edad: 30 });",
      respuesta: "type error",
      explicacion: "Con |, p puede ser solo ConNombre, que no tiene edad. La unión no suma propiedades.",
    },
    {
      tipo: "predecir",
      id: "literales-never",
      codigo: "type Kind = \"ORDER\" & \"REPO\";\nconst k: Kind = \"ORDER\";\nk;",
      respuesta: "type error",
      explicacion: "Un string no puede ser \"ORDER\" y \"REPO\" al mismo tiempo. Kind es never y nada se le puede asignar.",
    },
    {
      tipo: "predecir",
      id: "objeto-never",
      codigo: "type Order = { order_id: number };\ntype Caucion = { order_id: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } & { kind: \"REPO\"; data: Caucion };\nconst d: DeskBlotterData = { kind: \"ORDER\", data: { order_id: 1 } };\nd.kind;",
      respuesta: "type error",
      explicacion: "Los dos kind chocan, así que DeskBlotterData entero es never. Ningún objeto encaja.",
    },
    {
      tipo: "predecir",
      id: "array-vacio",
      codigo: "type Order = { order_id: number };\ntype Caucion = { order_id: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } & { kind: \"REPO\"; data: Caucion };\nconst lista: DeskBlotterData[] = [];\nlista.length;",
      respuesta: "0",
      explicacion: "Compila: un array vacío entra en never[]. Por eso el error tarda en aparecer, recién salta cuando intentás meter un elemento.",
    },
    {
      tipo: "elegir",
      id: "que-queda",
      enunciado: "¿Qué tipo termina siendo DeskBlotterData?",
      codigo: "type Order = { order_id: number };\ntype Caucion = { order_id: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } & { kind: \"REPO\"; data: Caucion };",
      opciones: [
        "{ kind: \"ORDER\" | \"REPO\"; data: Order | Caucion }",
        "{ kind: string; data: Order & Caucion }",
        "never",
        "unknown",
      ],
      correcta: 2,
      explicacion: "kind tendría que ser \"ORDER\" & \"REPO\", que es never, y TypeScript reduce todo el objeto a never.",
    },
    {
      tipo: "completar",
      id: "completar-extra",
      enunciado: "Completá lo que se le suma a Order para que compile.",
      codigo: "type Order = { order_id: number };\ntype OrderConCliente = Order & ___;",
      pruebas: "const o: OrderConCliente = { order_id: 1, cliente: \"Rys\" };\nconst c: string = o.cliente;\nconst n: number = o.order_id;",
      solucion: "{ cliente: string }",
      explicacion: "La intersección agrega cliente a lo que ya tenía Order.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-union",
      enunciado: "DeskBlotterData quedó en never y no se le puede asignar nada. Arreglalo para que sea una orden o una caución.",
      codigo: "type Order = { order_id: number; precio: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } & { kind: \"REPO\"; data: Caucion };",
      pruebas: "const lista: DeskBlotterData[] = [\n  { kind: \"ORDER\", data: { order_id: 1, precio: 900 } },\n  { kind: \"REPO\", data: { order_id: 2, tasa: 40 } },\n];",
      solucion: "type Order = { order_id: number; precio: number };\ntype Caucion = { order_id: number; tasa: number };\ntype DeskBlotterData = { kind: \"ORDER\"; data: Order } | { kind: \"REPO\"; data: Caucion };",
      explicacion: "Cada elemento es una variante u otra: eso es una unión, con |.",
    },
  ],
};

export default leccion;
