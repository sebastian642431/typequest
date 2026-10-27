import type { Leccion } from "../../tipos.ts";

const leccion: Leccion = {
  id: "narrowing",
  titulo: "Achicar el tipo",
  resumen: "typeof, ===, truthiness, in y Array.isArray para saber qué tenés en la mano.",
  teoria: [
    { texto: "Con una unión como `string | number`, TypeScript solo te deja usar lo que sirve para los dos. Un método de string sobre esa unión es un error de tipo." },
    { codigo: "function gritar(x: string | number) {\n  return x.toUpperCase();\n}" },
    { texto: "Si chequeás el tipo con un `if`, adentro de esa rama el compilador ya sabe cuál es. A eso se le dice estrechar (narrowing)." },
    { codigo: "function gritar(x: string | number) {\n  if (typeof x === \"string\") {\n    return x.toUpperCase();\n  }\n  return x.toFixed(1);\n}" },
    { texto: "Sirven varias formas: `typeof`, comparar con `===`, chequear si algo es truthy, preguntar con `in` si un objeto tiene una propiedad, y `Array.isArray` para arrays." },
    { codigo: "function largo(x: string | string[]) {\n  if (Array.isArray(x)) return x.length;\n  return x.length;\n}" },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "sin-estrechar",
      codigo: "function gritar(x: string | number) {\n  return x.toUpperCase();\n}\ngritar(\"hola\");",
      respuesta: "type error",
      explicacion: "x puede ser un number, y number no tiene toUpperCase. Aunque le pases un string, la función tiene que servir para los dos.",
    },
    {
      tipo: "predecir",
      id: "typeof-string",
      codigo: "function gritar(x: string | number) {\n  if (typeof x === \"string\") {\n    return x.toUpperCase();\n  }\n  return x * 2;\n}\ngritar(\"hola\");",
      respuesta: "\"HOLA\"",
      explicacion: "Dentro del if, x es string. Afuera, después del return, solo queda number, así que x * 2 también compila.",
    },
    {
      tipo: "predecir",
      id: "truthy",
      codigo: "function saludar(nombre: string | undefined) {\n  if (nombre) {\n    return \"hola \" + nombre.toUpperCase();\n  }\n  return \"hola anónimo\";\n}\nsaludar(\"\");",
      respuesta: "\"hola anónimo\"",
      explicacion: "Compila porque dentro del if nombre ya no es undefined. Pero \"\" es falsy, así que entra al otro camino. Ojo: chequear truthiness también descarta el string vacío.",
    },
    {
      tipo: "predecir",
      id: "in",
      codigo: "type Gato = { maullar: () => string };\ntype Perro = { ladrar: () => string };\nfunction hablar(a: Gato | Perro) {\n  if (\"maullar\" in a) {\n    return a.maullar();\n  }\n  return a.ladrar();\n}\nhablar({ ladrar: () => \"guau\" });",
      respuesta: "\"guau\"",
      explicacion: "`\"maullar\" in a` separa los dos tipos. El objeto no tiene maullar, así que va por ladrar.",
    },
    {
      tipo: "predecir",
      id: "in-mal",
      codigo: "type Gato = { maullar: () => string };\ntype Perro = { ladrar: () => string };\nfunction hablar(a: Gato | Perro) {\n  if (\"maullar\" in a) {\n    return a.ladrar();\n  }\n  return \"nada\";\n}\nhablar({ ladrar: () => \"guau\" });",
      respuesta: "type error",
      explicacion: "Dentro del if, a es Gato. Gato no tiene ladrar.",
    },
    {
      tipo: "predecir",
      id: "is-array",
      codigo: "function total(x: number | number[]) {\n  if (Array.isArray(x)) {\n    return x.reduce((a, b) => a + b, 0);\n  }\n  return x;\n}\ntotal([1, 2, 3]) + total(4);",
      respuesta: "10",
      explicacion: "Array.isArray estrecha a number[] adentro y a number afuera. 6 + 4 = 10.",
    },
    {
      tipo: "predecir",
      id: "igualdad",
      codigo: "function medir(a: string | number, b: string | boolean) {\n  if (a === b) {\n    return a.length;\n  }\n  return -1;\n}\nmedir(\"hola\", \"hola\");",
      respuesta: "4",
      explicacion: "Si a y b son iguales, los dos tienen que ser del único tipo que comparten: string. Por eso a.length compila.",
    },
    {
      tipo: "completar",
      id: "completar-typeof",
      enunciado: "Completá el tipo que tiene que comparar typeof para que compile.",
      codigo: "function formatear(x: string | number) {\n  if (typeof x === \"___\") {\n    return x.toFixed(2);\n  }\n  return x.trim();\n}",
      pruebas: "const r: string = formatear(3);",
      solucion: "number",
      explicacion: "toFixed es de number y trim de string. El if tiene que quedarse con number.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-estrechar",
      enunciado: "La función no compila. Agregá un chequeo para que funcione con los dos tipos.",
      codigo: "function iniciales(x: string | string[]) {\n  return x.map((s) => s[0]);\n}",
      pruebas: "const a: string[] = iniciales([\"Ana\", \"Beto\"]);\nconst b: string[] = iniciales(\"Ana\");",
      solucion: "function iniciales(x: string | string[]) {\n  if (Array.isArray(x)) {\n    return x.map((s) => s[0]);\n  }\n  return [x[0]];\n}",
      explicacion: "Un string no tiene map. Con Array.isArray separás el caso del array y al string lo tratás aparte.",
    },
  ],
};

export default leccion;
