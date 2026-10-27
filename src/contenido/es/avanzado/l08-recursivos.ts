import type { Leccion } from "../../tipos.ts";

const JSON_T = "type Json = string | number | boolean | null | Json[] | { [clave: string]: Json };\n";
const NODO = "type Nodo = { valor: number; hijos: Nodo[] };\n";

const leccion: Leccion = {
  id: "recursivos",
  titulo: "Tipos que se llaman a sí mismos",
  resumen: "JSON, árboles, versiones profundas de Readonly y Partial, y recursión sobre tuplas.",
  teoria: [
    { texto: "Un tipo puede nombrarse adentro de su propia definición. Así se describe algo que no tiene profundidad fija, como un JSON: cada valor puede ser otro JSON." },
    { codigo: JSON_T },
    { texto: "Los árboles son el clásico: un nodo tiene hijos, que son nodos, que tienen hijos... hasta que alguno tiene la lista vacía y la fiesta termina." },
    { texto: "`Readonly` y `Partial` solo tocan el primer nivel. Para bajar a todos, el mapped type se llama a sí mismo con cada propiedad." },
    { codigo: "type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };" },
    { texto: "Con tuplas, la receta es sacar el primer elemento con `infer`, hacer algo y llamar de nuevo con el resto. Siempre con un caso base, que el compilador tiene paciencia pero no infinita." },
    { codigo: "type Duplicar<T extends unknown[]> = T extends [infer A, ...infer R] ? [A, A, ...Duplicar<R>] : [];" },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "json-array",
      codigo: `${JSON_T}const datos: Json = [1, "dos", { tres: [true, null] }];\nArray.isArray(datos);`,
      respuesta: "true",
      explicacion: "Arrays y objetos pueden anidarse todo lo que quieran mientras adentro haya Json. Compila y es un array.",
    },
    {
      tipo: "predecir",
      id: "json-undefined",
      codigo: `${JSON_T}const datos: Json = { nombre: "Rys", apodo: undefined };\ndatos;`,
      respuesta: "type error",
      explicacion: "undefined no es parte de Json, igual que JSON.stringify lo ignora. El objeto no encaja.",
    },
    {
      tipo: "predecir",
      id: "sumar-arbol",
      codigo: `${NODO}function sumar(n: Nodo): number {\n  return n.valor + n.hijos.reduce((total, h) => total + sumar(h), 0);\n}\nsumar({ valor: 1, hijos: [{ valor: 2, hijos: [] }, { valor: 3, hijos: [{ valor: 4, hijos: [] }] }] });`,
      respuesta: "10",
      explicacion: "El tipo recursivo acompaña a la función recursiva: 1 + 2 + 3 + 4.",
    },
    {
      tipo: "predecir",
      id: "deep-readonly",
      codigo: "type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };\nconst conf: DeepReadonly<{ audio: { volumen: number } }> = { audio: { volumen: 7 } };\nconf.audio.volumen = 10;\nconf.audio.volumen;",
      respuesta: "type error",
      explicacion: "DeepReadonly baja hasta volumen y lo marca readonly. No se puede reasignar.",
    },
    {
      tipo: "elegir",
      id: "readonly-plano",
      enunciado: "¿Qué pasa con la última línea?",
      codigo: "const conf: Readonly<{ audio: { volumen: number } }> = { audio: { volumen: 7 } };\nconf.audio.volumen = 10;",
      opciones: [
        "Compila: Readonly solo protege audio, no lo que hay adentro",
        "Error: Readonly protege todos los niveles",
        "Error: no se puede anidar un objeto en un Readonly",
        "Compila, pero volumen queda en 7",
      ],
      correcta: 0,
      explicacion: "Readonly es superficial: conf.audio = ... falla, pero conf.audio.volumen se puede cambiar.",
    },
    {
      tipo: "completar",
      id: "deep-partial",
      enunciado: "Completá DeepPartial para que todo sea opcional en cualquier nivel.",
      codigo: "type DeepPartial<T> = { [K in keyof T]?: ___ };",
      pruebas: "type Ajustes = { red: { puerto: number; host: string }; debug: boolean };\ntype _1 = Esperar<Igual<DeepPartial<Ajustes>[\"red\"], { puerto?: number; host?: string } | undefined>>;\nconst a: DeepPartial<Ajustes> = { red: { puerto: 80 } };",
      solucion: "DeepPartial<T[K]>",
      explicacion: "Cada propiedad vuelve a pasar por DeepPartial. Con primitivos como number, el mapped type los deja como están.",
    },
    {
      tipo: "completar",
      id: "invertir",
      enunciado: "Completá Invertir para que dé vuelta una tupla.",
      codigo: "type Invertir<T extends unknown[]> = T extends [infer A, ...infer R] ? [...___, A] : [];",
      pruebas: "type _1 = Esperar<Igual<Invertir<[1, 2, 3]>, [3, 2, 1]>>;\ntype _2 = Esperar<Igual<Invertir<[]>, []>>;",
      solucion: "Invertir<R>",
      explicacion: "El primero va al final, y adelante va el resto ya invertido.",
    },
    {
      tipo: "completar",
      id: "contar",
      enunciado: "Contar recorre la tupla y va juntando un elemento por paso en Acc. Completá lo que se le pasa como acumulador.",
      codigo: "type Contar<T extends unknown[], Acc extends unknown[] = []> = T extends [unknown, ...infer R] ? Contar<R, ___> : Acc[\"length\"];",
      pruebas: "type _1 = Esperar<Igual<Contar<[\"a\", \"b\", \"c\"]>, 3>>;\ntype _2 = Esperar<Igual<Contar<[]>, 0>>;",
      solucion: "[...Acc, 0]",
      pista: "El acumulador es una tupla. Para sumar uno, agregale un elemento cualquiera.",
      explicacion: "Los tipos no saben sumar, pero las tuplas saben su largo. Cada paso agrega un elemento a Acc y al final se lee Acc[\"length\"].",
    },
    {
      tipo: "arreglar",
      id: "json-sin-arrays",
      enunciado: "A este Json le falta una de sus formas. Arreglalo para que acepte listas.",
      codigo: "type Json = string | number | boolean | null | { [clave: string]: Json };",
      pruebas: "const perfil: Json = { nombre: \"Rys\", logros: [\"primer-duelo\", 3] };",
      solucion: JSON_T.trim(),
      explicacion: "Sin Json[] en la unión, cualquier array queda afuera.",
    },
    {
      tipo: "arreglar",
      id: "solo-numeros",
      enunciado: "SoloNumeros debería filtrar una tupla, pero siempre da never. Arreglalo.",
      codigo: "type SoloNumeros<T extends unknown[]> = T extends [infer A, ...infer R]\n  ? A extends number\n    ? [A, ...SoloNumeros<R>]\n    : SoloNumeros<R>\n  : never;",
      pruebas: "type _1 = Esperar<Igual<SoloNumeros<[1, \"a\", 2, true]>, [1, 2]>>;",
      solucion: "type SoloNumeros<T extends unknown[]> = T extends [infer A, ...infer R]\n  ? A extends number\n    ? [A, ...SoloNumeros<R>]\n    : SoloNumeros<R>\n  : [];",
      pista: "Mirá qué devuelve cuando la tupla ya está vacía.",
      explicacion: "El caso base devolvía never, y esparcir never contagia todo el resultado. Con la tupla vacía, la recursión termina en algo útil.",
    },
  ],
};

export default leccion;
