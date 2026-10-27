import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "type-guards",
  title: "Type guards propios",
  summary: "Funciones que devuelven `x is T` para que TypeScript recuerde lo que chequeaste.",
  idea: "Con `x is T` en el retorno, tu función le avisa a TypeScript qué tipo es.",
  theory: [
    {
      title: "El problema",
      text: "Si movés un chequeo a una función que devuelve `boolean`, TypeScript pierde el hilo. Para él es solo sí o no.",
    },
    {
      title: "La solución: x is T",
      text: "Con `m is Gato` como retorno, `true` quiere decir \"es un Gato\". Eso es un type guard.",
      code: "function esGato(m: Gato | Perro): m is Gato {\n  return \"maulla\" in m;\n}",
    },
    {
      title: "Las dos ramas",
      text: "Si da `true`, tenés un Gato. Si da `false`, lo que sobra: un Perro.",
      code: "if (esGato(m)) return m.nombre + \" maulla\";\nreturn m.nombre + \" ladra\";",
    },
    {
      title: "Te cree a ciegas",
      text: "TypeScript no revisa el cuerpo del guard. Si la función miente, el tipo miente con ella.",
    },
    {
      title: "Con filter",
      text: "Un `filter` con guard saca los `null` y deja `number[]`. Desde TS 5.5 se infiere solo si no anotás.",
      code: "const precios = [100, null, 250].filter((p): p is number => p !== null);",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "bare-boolean",
      code: "function esTexto(x: unknown): boolean {\n  return typeof x === \"string\";\n}\nfunction gritar(x: unknown) {\n  if (esTexto(x)) return x.toUpperCase();\n  return \"\";\n}\ngritar(\"che\");",
      answer: "type error",
      explanation: "Anotaste `boolean` y nada más. Adentro del `if`, `x` sigue siendo `unknown`.",
    },
    {
      type: "predict",
      id: "inferred",
      code: "function esTexto(x: unknown) {\n  return typeof x === \"string\";\n}\nfunction gritar(x: unknown) {\n  if (esTexto(x)) return x.toUpperCase();\n  return \"\";\n}\ngritar(\"che\");",
      answer: "\"CHE\"",
      explanation: "Sin anotar, TypeScript infiere `x is string`. Era el `boolean` a mano lo que lo rompía.",
    },
    {
      type: "predict",
      id: "else-branch",
      code: "type Gato = { nombre: string; maulla: true };\ntype Perro = { nombre: string; ladra: true };\nfunction esGato(m: Gato | Perro): m is Gato {\n  return \"maulla\" in m;\n}\nfunction sonido(m: Gato | Perro) {\n  if (esGato(m)) return m.nombre + \" dice miau\";\n  return m.ladra ? m.nombre + \" dice guau\" : \"\";\n}\nsonido({ nombre: \"Firulais\", ladra: true });",
      answer: "\"Firulais dice guau\"",
      explanation: "Si el guard da `false`, Gato sale de la unión. En esa rama `m` es Perro y tiene `ladra`.",
    },
    {
      type: "predict",
      id: "filter-guard",
      code: "const ventas = [120, null, 80, null, 300];\nconst total = ventas.filter((v): v is number => v !== null).reduce((a, b) => a + b, 0);\ntotal;",
      answer: "500",
      explanation: "El `filter` con guard deja `number[]`. El `reduce` suma tranquilo: 500.",
    },
    {
      type: "predict",
      id: "filter-boolean",
      code: "const ventas = [120, null, 80];\nconst total = ventas.filter(Boolean).reduce((a, b) => a + b, 0);\ntotal;",
      answer: "type error",
      explanation: "`Boolean` no es un guard. El array sigue con `null` adentro y `b` puede ser `null`.",
      hint: "¿Qué tipo tiene el array que sale del `filter`?",
    },
    {
      type: "predict",
      id: "lying-guard",
      code: "function esNumero(x: unknown): x is number {\n  return typeof x === \"string\";\n}\nfunction sumarUno(v: unknown) {\n  return esNumero(v) ? v + 1 : 0;\n}\nsumarUno(\"7\");",
      answer: "\"71\"",
      explanation: "El guard deja pasar strings como number. Compila, y `\"7\" + 1` da `\"71\"`.",
      hint: "TypeScript no revisa que el guard diga la verdad.",
    },
    {
      type: "complete",
      id: "complete-predicate",
      prompt: "Completá el retorno para que `esPerro` sea un type guard.",
      code: "type Gato = { nombre: string; maulla: true };\ntype Perro = { nombre: string; ladra: true };\nfunction esPerro(m: Gato | Perro): ___ {\n  return \"ladra\" in m;\n}",
      tests: "function ladrido(m: Gato | Perro) {\n  if (esPerro(m)) {\n    const l: true = m.ladra;\n    return l;\n  }\n  return false;\n}",
      solution: "m is Perro",
      explanation: "`m is Perro` dice: si devuelvo `true`, `m` es un Perro.",
    },
    {
      type: "complete",
      id: "complete-list",
      prompt: "Completá el guard para que adentro del `if` se pueda usar `.length`.",
      code: "function esLista(x: unknown): x is ___ {\n  return Array.isArray(x);\n}",
      tests: "function largo(x: unknown) {\n  return esLista(x) ? x.length : 0;\n}\nconst n: number = largo([1, 2]);",
      solution: "unknown[]",
      explanation: "`Array.isArray` asegura que es un array, no de qué. `unknown[]` dice justo eso.",
    },
    {
      type: "fix",
      id: "fix-filter",
      prompt: "`valores` no compila: el `filter` no estrecha. Arreglá `esOk`.",
      code: "type Ok = { estado: \"ok\"; valor: number };\ntype Falla = { estado: \"falla\"; motivo: string };\ntype Resultado = Ok | Falla;\nfunction esOk(r: Resultado): boolean {\n  return r.estado === \"ok\";\n}\nfunction valores(rs: Resultado[]): number[] {\n  return rs.filter(esOk).map((r) => r.valor);\n}",
      tests: "const v: number[] = valores([{ estado: \"ok\", valor: 3 }, { estado: \"falla\", motivo: \"timeout\" }]);",
      solution: "type Ok = { estado: \"ok\"; valor: number };\ntype Falla = { estado: \"falla\"; motivo: string };\ntype Resultado = Ok | Falla;\nfunction esOk(r: Resultado): r is Ok {\n  return r.estado === \"ok\";\n}\nfunction valores(rs: Resultado[]): number[] {\n  return rs.filter(esOk).map((r) => r.valor);\n}",
      explanation: "Con `r is Ok`, el `filter` deja solo Ok y el `map` puede leer `valor`.",
    },
    {
      type: "choose",
      id: "runtime",
      prompt: "En runtime, ¿qué devuelve una función con retorno `x is string`?",
      options: [
        "Un boolean común y corriente",
        "El mismo x, ya convertido a string",
        "Nada: la función se borra al compilar",
        "Un objeto con el tipo adentro",
      ],
      correct: 0,
      explanation: "`x is string` existe solo para el compilador. En JS devuelve `true` o `false`.",
    },
  ],
};

export default lesson;
