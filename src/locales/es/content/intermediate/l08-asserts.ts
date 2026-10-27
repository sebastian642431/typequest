import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "asserts",
  title: "Assertion functions",
  summary: "Funciones que tiran error si algo falla. Si vuelven, el tipo queda estrechado.",
  idea: "Una assertion tira error si algo falla; si vuelve, el tipo queda asegurado.",
  theory: [
    {
      title: "Pasa o explota",
      text: "Si la condición falla, tira error. Si vuelve, TypeScript da el tipo por hecho en todo lo que sigue.",
      code: "function asegurarTexto(x: unknown): asserts x is string {\n  if (typeof x !== \"string\") throw new Error(\"no es texto\");\n}",
    },
    {
      title: "Después del assert",
      text: "Después de la llamada, `x` ya es string.",
      code: "function largo(x: unknown) {\n  asegurarTexto(x);\n  return x.length;\n}",
    },
    {
      title: "asserts cond",
      text: "Sin `is`, afirma que el argumento es verdadero. Lo que se deduzca de eso queda estrechado.",
      code: "function afirmar(cond: unknown, msj: string): asserts cond {\n  if (!cond) throw new Error(msj);\n}",
    },
    {
      title: "Dos reglas",
      text: "No devuelven nada. Y el nombre necesita un tipo explícito: `function` sirve, un `const` sin anotar no.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "basic",
      code: "function asegurarTexto(x: unknown): asserts x is string {\n  if (typeof x !== \"string\") throw new Error(\"no es texto\");\n}\nfunction largo(x: unknown) {\n  asegurarTexto(x);\n  return x.length;\n}\nlargo(\"mate\");",
      answer: "4",
      explanation: "Después de `asegurarTexto(x)`, `x` es string. `\"mate\"` tiene 4 letras.",
    },
    {
      type: "predict",
      id: "bare-void",
      code: "function asegurarTexto(x: unknown): void {\n  if (typeof x !== \"string\") throw new Error(\"no es texto\");\n}\nfunction largo(x: unknown) {\n  asegurarTexto(x);\n  return x.length;\n}\nlargo(\"mate\");",
      answer: "type error",
      explanation: "Con `void`, TypeScript no sabe que la función asegura algo. `x` sigue `unknown`.",
    },
    {
      type: "predict",
      id: "asserts-cond",
      code: "function afirmar(cond: unknown, msj: string): asserts cond {\n  if (!cond) throw new Error(msj);\n}\nfunction conB(xs: string[]) {\n  const p = xs.find((x) => x.startsWith(\"b\"));\n  afirmar(p, \"no hay ninguna con b\");\n  return p.toUpperCase();\n}\nconB([\"alfajor\", \"bizcocho\"]);",
      answer: "\"BIZCOCHO\"",
      explanation: "`find` da `string | undefined`. Después de `afirmar(p)`, `p` es string.",
    },
    {
      type: "predict",
      id: "object-union",
      code: "type Borrador = { estado: \"borrador\" };\ntype Publicado = { estado: \"publicado\"; url: string };\ntype Post = Borrador | Publicado;\nfunction asegurarPublicado(p: Post): asserts p is Publicado {\n  if (p.estado !== \"publicado\") throw new Error(\"todavía no\");\n}\nfunction link(p: Post) {\n  asegurarPublicado(p);\n  return p.url;\n}\nlink({ estado: \"publicado\", url: \"/hola\" });",
      answer: "\"/hola\"",
      explanation: "Después del assert, `p` es Publicado y tiene `url`.",
    },
    {
      type: "predict",
      id: "untyped-arrow",
      code: "const afirmar = (cond: unknown): asserts cond => {\n  if (!cond) throw new Error(\"falló\");\n};\nfunction doble(x: number | undefined) {\n  afirmar(x !== undefined);\n  return x * 2;\n}\ndoble(4);",
      answer: "type error",
      explanation: "El nombre `afirmar` necesita un tipo explícito. El `const` no lo tiene, aunque la flecha sí.",
      hint: "No alcanza con anotar la flecha: mirá la variable.",
    },
    {
      type: "predict",
      id: "annotated-arrow",
      code: "type Afirmador = (cond: unknown) => asserts cond;\nconst afirmar: Afirmador = (cond) => {\n  if (!cond) throw new Error(\"falló\");\n};\nfunction doble(x: number | undefined) {\n  afirmar(x !== undefined);\n  return x * 2;\n}\ndoble(4);",
      answer: "8",
      explanation: "Ahora el `const` tiene un tipo de assertion. La llamada estrecha y `x * 2` da 8.",
      hint: "Compará con el anterior: ¿qué cambió en la variable `afirmar`?",
    },
    {
      type: "complete",
      id: "complete-is",
      prompt: "Completá el retorno para que `doble` compile.",
      code: "function asegurarNumero(x: unknown): ___ {\n  if (typeof x !== \"number\") throw new Error(\"no es número\");\n}",
      tests: "function doble(x: unknown) {\n  asegurarNumero(x);\n  return x * 2;\n}\nconst d: number = doble(4);",
      solution: "asserts x is number",
      explanation: "`asserts x is number` dice: si vuelvo, `x` es number.",
    },
    {
      type: "complete",
      id: "complete-cond",
      prompt: "Completá la assertion para que afirme su primer parámetro.",
      code: "function afirmar(cond: unknown, msj: string): asserts ___ {\n  if (!cond) throw new Error(msj);\n}",
      tests: "function largo(x: string | undefined) {\n  afirmar(x !== undefined, \"falta x\");\n  return x.length;\n}\nconst n: number = largo(\"hola\");",
      solution: "cond",
      explanation: "`asserts cond` afirma que el argumento es verdadero. Con `x !== undefined`, `x` queda string.",
    },
    {
      type: "fix",
      id: "fix-arrow",
      prompt: "`cuantos` no compila por cómo se declaró `asegurarLista`. Arreglala sin cambiar lo que hace.",
      code: "const asegurarLista = (x: unknown): asserts x is unknown[] => {\n  if (!Array.isArray(x)) throw new Error(\"no es lista\");\n};\nfunction cuantos(x: unknown) {\n  asegurarLista(x);\n  return x.length;\n}",
      tests: "const n: number = cuantos([1, 2, 3]);",
      solution: "function asegurarLista(x: unknown): asserts x is unknown[] {\n  if (!Array.isArray(x)) throw new Error(\"no es lista\");\n}\nfunction cuantos(x: unknown) {\n  asegurarLista(x);\n  return x.length;\n}",
      explanation: "Una `function` ya tiene tipo explícito. Anotar el `const` también servía.",
    },
    {
      type: "choose",
      id: "guard-or-assert",
      prompt: "Validás la config al arrancar. Si falta la URL, no tiene sentido seguir. ¿Qué usás?",
      options: [
        "Un type guard `c is ConfigOk`, para hacer if/else",
        "Una assertion `asserts c is ConfigOk`, que corta si está mal",
        "Un cast `c as ConfigOk`",
        "Anotar la variable como ConfigOk",
      ],
      correct: 1,
      explanation: "Si el caso malo siempre termina en error, la assertion corta ahí y lo demás queda estrechado.",
    },
  ],
};

export default lesson;
