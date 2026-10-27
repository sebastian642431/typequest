import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "functions",
  title: "Funciones con contrato",
  summary: "Parámetros tipados, qué devuelven y cómo se las llama.",
  idea: "Anotás qué recibe una función y qué devuelve. Llamarla mal no compila.",
  theory: [
    {
      title: "Parámetros y retorno",
      text: "Los parámetros se anotan como variables. El tipo de retorno va después de los paréntesis.",
      code: "function doble(n: number): number {\n  return n * 2;\n}",
    },
    {
      title: "El retorno se adivina",
      text: "Si no anotás el retorno, TypeScript lo saca de los `return`. Los parámetros sí hay que anotarlos.",
    },
    {
      title: "Llamar bien",
      text: "Faltan argumentos, sobran o son de otro tipo: error. Para que uno sea opcional, usá `?` o un valor por defecto.",
      code: "function saludar(nombre?: string, signo = \"!\") {\n  return \"hola \" + (nombre ?? \"vos\") + signo;\n}",
    },
    {
      title: "void",
      text: "Si no devuelve nada, el retorno es `void`. Si guardás el resultado, vale `undefined`.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "call-ok",
      code: "function triple(n: number): number {\n  return n * 3;\n}\ntriple(4);",
      answer: "12",
      explanation: "Pide un `number` y le pasaste `4`. Todo en orden: da 12.",
    },
    {
      type: "predict",
      id: "string-argument",
      code: "function triple(n: number): number {\n  return n * 3;\n}\ntriple(\"4\");",
      answer: "type error",
      explanation: "Pide un `number` y le pasaste un `string`.",
    },
    {
      type: "predict",
      id: "missing-argument",
      code: "function restar(a: number, b: number) {\n  return a - b;\n}\nrestar(10);",
      answer: "type error",
      explanation: "`restar` pide dos argumentos y recibió uno.",
    },
    {
      type: "predict",
      id: "inferred-return",
      code: "function mitad(n: number) {\n  return n / 2;\n}\nconst texto: string = mitad(10);\ntexto;",
      answer: "type error",
      explanation: "El retorno se infiere `number`. Un `number` no entra en un `string`.",
    },
    {
      type: "predict",
      id: "default-value",
      code: "function potencia(base: number, exp = 2) {\n  return base ** exp;\n}\npotencia(3);",
      answer: "9",
      explanation: "No pasaste `exp`, así que vale 2. Y 3 al cuadrado es 9.",
    },
    {
      type: "predict",
      id: "unchecked-optional",
      code: "function iniciales(nombre?: string) {\n  return nombre.slice(0, 2);\n}\niniciales(\"Rys\");",
      answer: "type error",
      explanation: "`nombre` es opcional: puede ser `undefined`. Usarlo sin chequear no compila, aunque acá venga.",
    },
    {
      type: "predict",
      id: "void-allowed",
      code: "function avisar(msj: string): void {\n  msj.length;\n}\nconst r = avisar(\"listo\");\nr;",
      answer: "undefined",
      explanation: "Una función `void` no devuelve nada. Lo que guardás es `undefined`.",
    },
    {
      type: "complete",
      id: "return-type",
      prompt: "Completá el tipo de retorno.",
      code: "function esPar(n: number): ___ {\n  return n % 2 === 0;\n}",
      tests: "const r: boolean = esPar(4);",
      solution: "boolean",
      explanation: "Una comparación con `===` da `boolean`.",
    },
    {
      type: "fix",
      id: "default-parameter",
      prompt: "Falla la llamada con un argumento. Hacé que `alto` valga 1 si no se pasa. No toques las llamadas.",
      code: "function area(ancho: number, alto: number) {\n  return ancho * alto;\n}\nconst fila = area(5);",
      tests: "const total: number = area(2, 5) + fila;",
      solution: "function area(ancho: number, alto = 1) {\n  return ancho * alto;\n}\nconst fila = area(5);",
      explanation: "Con un valor por defecto, el parámetro pasa a ser opcional.",
    },
  ],
};

export default lesson;
