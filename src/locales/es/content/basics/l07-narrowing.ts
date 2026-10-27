import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "narrowing",
  title: "Achicar el tipo",
  summary: "`typeof`, `===`, truthiness, `in` y `Array.isArray`.",
  idea: "Un `if` que chequea el tipo le dice a TypeScript qué tenés adentro.",
  theory: [
    {
      title: "El problema",
      text: "Con `string | number` solo podés usar lo que sirve para los dos. Un método de `string` no compila.",
      code: "function gritar(x: string | number) {\n  return x.toUpperCase();\n}",
    },
    {
      title: "La solución: un if",
      text: "Chequeás el tipo y, dentro de esa rama, TypeScript ya sabe cuál es. Eso es narrowing.",
      code: "function gritar(x: string | number) {\n  if (typeof x === \"string\") {\n    return x.toUpperCase();\n  }\n  return x.toFixed(1);\n}",
    },
    {
      title: "Formas de chequear",
      text: "`typeof`, `===`, ver si es truthy, `in` para propiedades y `Array.isArray` para arrays.",
      code: "function largo(x: string | string[]) {\n  if (Array.isArray(x)) return x.length;\n  return x.length;\n}",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "not-narrowed",
      code: "function gritar(x: string | number) {\n  return x.toUpperCase();\n}\ngritar(\"hola\");",
      answer: "type error",
      explanation: "La función tiene que servir también para `number`, y `number` no tiene `toUpperCase`.",
    },
    {
      type: "predict",
      id: "typeof-string",
      code: "function gritar(x: string | number) {\n  if (typeof x === \"string\") {\n    return x.toUpperCase();\n  }\n  return x * 2;\n}\ngritar(\"hola\");",
      answer: "\"HOLA\"",
      explanation: "Dentro del `if`, `x` es `string`. Después del `return` solo queda `number`.",
    },
    {
      type: "predict",
      id: "truthy",
      code: "function saludar(nombre: string | undefined) {\n  if (nombre) {\n    return \"hola \" + nombre.toUpperCase();\n  }\n  return \"hola anónimo\";\n}\nsaludar(\"\");",
      answer: "\"hola anónimo\"",
      explanation: "Compila. Pero `\"\"` es falsy, así que no entra al `if`. Ojo: el truthy también descarta el string vacío.",
    },
    {
      type: "predict",
      id: "in",
      code: "type Gato = { maullar: () => string };\ntype Perro = { ladrar: () => string };\nfunction hablar(a: Gato | Perro) {\n  if (\"maullar\" in a) {\n    return a.maullar();\n  }\n  return a.ladrar();\n}\nhablar({ ladrar: () => \"guau\" });",
      answer: "\"guau\"",
      explanation: "`in` separa los dos tipos. Sin `maullar`, es `Perro` y ladra.",
    },
    {
      type: "predict",
      id: "in-wrong",
      code: "type Gato = { maullar: () => string };\ntype Perro = { ladrar: () => string };\nfunction hablar(a: Gato | Perro) {\n  if (\"maullar\" in a) {\n    return a.ladrar();\n  }\n  return \"nada\";\n}\nhablar({ ladrar: () => \"guau\" });",
      answer: "type error",
      explanation: "Dentro del `if`, `a` es `Gato`. Y los gatos no ladran.",
    },
    {
      type: "predict",
      id: "is-array",
      code: "function total(x: number | number[]) {\n  if (Array.isArray(x)) {\n    return x.reduce((a, b) => a + b, 0);\n  }\n  return x;\n}\ntotal([1, 2, 3]) + total(4);",
      answer: "10",
      explanation: "Adentro del `if` es `number[]`, afuera `number`. 6 + 4 = 10.",
    },
    {
      type: "predict",
      id: "equality",
      code: "function medir(a: string | number, b: string | boolean) {\n  if (a === b) {\n    return a.length;\n  }\n  return -1;\n}\nmedir(\"hola\", \"hola\");",
      answer: "4",
      explanation: "Si son iguales, son del único tipo que comparten: `string`. Por eso `a.length` compila.",
    },
    {
      type: "complete",
      id: "complete-typeof",
      prompt: "Completá el tipo que compara `typeof` para que compile.",
      code: "function formatear(x: string | number) {\n  if (typeof x === \"___\") {\n    return x.toFixed(2);\n  }\n  return x.trim();\n}",
      tests: "const r: string = formatear(3);",
      solution: "number",
      explanation: "`toFixed` es de `number` y `trim` de `string`. El `if` tiene que quedarse con `number`.",
    },
    {
      type: "fix",
      id: "fix-narrowing",
      prompt: "No compila. Agregá un chequeo para que sirva con los dos tipos.",
      code: "function iniciales(x: string | string[]) {\n  return x.map((s) => s[0]);\n}",
      tests: "const a: string[] = iniciales([\"Ana\", \"Beto\"]);\nconst b: string[] = iniciales(\"Ana\");",
      solution: "function iniciales(x: string | string[]) {\n  if (Array.isArray(x)) {\n    return x.map((s) => s[0]);\n  }\n  return [x[0]];\n}",
      explanation: "Un `string` no tiene `map`. `Array.isArray` separa el array y al `string` lo tratás aparte.",
    },
  ],
};

export default lesson;
