import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "primitives",
  title: "Los tres de siempre",
  summary: "`number`, `string` y `boolean`, y qué pasa si no coinciden.",
  idea: "Con `:` le decís a TypeScript qué tipo guarda una variable.",
  theory: [
    {
      title: "Anotar un tipo",
      text: "Después del nombre ponés `:` y el tipo. Es una promesa: esa variable guarda ese tipo.",
      code: "let vidas: number = 3;\nlet jugador: string = \"Rys\";\nlet conectado: boolean = true;",
    },
    {
      title: "Si no coincide, no compila",
      text: "Si el valor no es del tipo prometido, es un error de tipo. Acá respondés `type error`.",
      code: "let vidas: number = \"tres\";",
    },
    {
      title: "Si compila, das el valor",
      text: "Respondés lo que vale la última línea, escrito como en JavaScript: `5`, `\"hola\"`, `true`.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "sum",
      code: "let puntos: number = 10 + 5;\npuntos;",
      answer: "15",
      explanation: "`10 + 5` da un `number`, justo lo que pide la anotación.",
    },
    {
      type: "predict",
      id: "string-to-number",
      code: "let puntos: number = \"10\";\npuntos;",
      answer: "type error",
      explanation: "`\"10\"` tiene comillas: es un `string`, aunque parezca número.",
    },
    {
      type: "predict",
      id: "concat",
      code: "let saludo: string = \"hola \" + \"mundo\";\nsaludo;",
      answer: "\"hola mundo\"",
      explanation: "String más string da string. Va entre comillas porque es texto.",
    },
    {
      type: "predict",
      id: "bool-number",
      code: "let listo: boolean = 1;\nlisto;",
      answer: "type error",
      explanation: "Para TypeScript, `1` es un `number`, no un `boolean`.",
    },
    {
      type: "predict",
      id: "comparison",
      code: "let mayor: boolean = 5 > 3;\nmayor;",
      answer: "true",
      explanation: "Una comparación da `boolean`, así que encaja.",
    },
    {
      type: "predict",
      id: "reassign",
      code: "let nivel: number = 1;\nnivel = \"dos\";\nnivel;",
      answer: "type error",
      explanation: "La anotación es para siempre. Una vez `number`, no acepta un `string`.",
    },
    {
      type: "complete",
      id: "annotate",
      prompt: "Completá el tipo para que compile.",
      code: "let nombre: ___ = \"Perugius\";",
      tests: "const largo: number = nombre.length;",
      solution: "string",
      explanation: "`\"Perugius\"` va entre comillas: es un `string`.",
    },
    {
      type: "fix",
      id: "fix-type",
      prompt: "El tipo está mal. Cambiá la anotación, no el valor.",
      code: "let activo: string = false;",
      tests: "activo = true;",
      solution: "let activo: boolean = false;",
      explanation: "`false` es un `boolean`, así que la anotación es `boolean`.",
    },
  ],
};

export default lesson;
