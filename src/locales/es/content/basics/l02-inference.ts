import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "inference",
  title: "Sin anotar",
  summary: "TypeScript adivina el tipo solo. Con `const` adivina más fino.",
  idea: "Si no anotás, TypeScript deduce el tipo del valor inicial.",
  theory: [
    {
      title: "TypeScript adivina",
      text: "Si la variable arranca con un valor, el tipo sale de ese valor. Se llama inferencia.",
      code: "let vidas = 3;",
    },
    {
      title: "Y queda fijo",
      text: "`vidas` se infirió como `number`. Es igual que si lo hubieras anotado.",
      code: "let vidas = 3;\nvidas = \"tres\";",
    },
    {
      title: "const es más fino",
      text: "Un `const` nunca cambia, así que su tipo es el valor exacto. Con `let` se ensancha a `string`.",
      code: "const saludo = \"hola\";\nlet copia = \"hola\";",
    },
    {
      title: "Cuándo anotar",
      text: "Cuando la inferencia adivina otra cosa de la que querés, o cuando no hay valor inicial.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "infers-number",
      code: "let monedas = 50;\nmonedas = monedas + 25;\nmonedas;",
      answer: "75",
      explanation: "`monedas` arrancó con un número, así que es `number`. Sumarle 25 no cambia eso.",
    },
    {
      type: "predict",
      id: "change-type",
      code: "let nivel = 1;\nnivel = \"uno\";\nnivel;",
      answer: "type error",
      explanation: "Sin anotar, `nivel` igual quedó `number` por su valor inicial.",
    },
    {
      type: "predict",
      id: "const-literal",
      code: "const modo = \"oscuro\";\nlet elegido: \"oscuro\" = modo;\nelegido;",
      answer: "\"oscuro\"",
      explanation: "Por ser `const`, `modo` tiene tipo `\"oscuro\"`. Encaja justo.",
    },
    {
      type: "predict",
      id: "let-widens",
      code: "let modo = \"oscuro\";\nlet elegido: \"oscuro\" = modo;\nelegido;",
      answer: "type error",
      explanation: "Por ser `let`, `modo` es `string`. Y un `string` cualquiera no garantiza ser `\"oscuro\"`.",
    },
    {
      type: "predict",
      id: "copy-of-const",
      code: "const base = 10;\nlet copia = base;\ncopia = 20;\ncopia;",
      answer: "20",
      explanation: "Al copiarlo en un `let`, el tipo `10` se ensancha a `number`. Entonces 20 entra.",
    },
    {
      type: "predict",
      id: "let-chain",
      code: "let a = 1;\nconst b = a;\nlet c: 1 = b;\nc;",
      answer: "type error",
      explanation: "`b` copia el tipo de `a`, que es `number`. Ser `const` no lo achica a `1`.",
    },
    {
      type: "choose",
      id: "what-is-inferred",
      prompt: "¿Qué tipo infiere TypeScript para `color`?",
      code: "const color = \"rojo\";",
      options: ["string", "\"rojo\"", "any", "unknown"],
      correct: 1,
      explanation: "Un `const` nunca cambia, así que toma el valor exacto como tipo.",
    },
    {
      type: "complete",
      id: "annotate-number",
      prompt: "Completá la anotación para que acepte cualquier número.",
      code: "let temperatura: ___ = 18;",
      tests: "temperatura = 25;\nconst doble: number = temperatura * 2;",
      solution: "number",
      explanation: "Para guardar después otros números, el tipo tiene que ser `number`.",
    },
    {
      type: "fix",
      id: "initial-value",
      prompt: "El valor inicial da el tipo equivocado. Cambiá solo el valor inicial.",
      code: "let turnos = \"3\";\nturnos = turnos - 1;",
      tests: "const t: number = turnos;",
      solution: "let turnos = 3;\nturnos = turnos - 1;",
      explanation: "Con `\"3\"` sale `string`, y a un texto no se le resta. Con `3` sale `number`.",
    },
  ],
};

export default lesson;
