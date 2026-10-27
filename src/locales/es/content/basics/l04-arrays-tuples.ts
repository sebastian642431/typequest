import type { Lesson } from "../../../../content/types.ts";

const lesson: Lesson = {
  id: "arrays-tuples",
  title: "Listas y tuplas",
  summary: "Arrays de un tipo o de varios, tuplas de largo fijo y arrays `readonly`.",
  idea: "Un array dice qué guarda cada elemento. Una tupla, qué va en cada lugar.",
  theory: [
    {
      title: "Array de un tipo",
      text: "Decís qué guarda cada elemento. Las dos formas significan lo mismo.",
      code: "const puntos: number[] = [10, 20];\nconst nombres: Array<string> = [\"Ana\", \"Leo\"];",
    },
    {
      title: "Array de varios tipos",
      text: "Usás una unión entre paréntesis: `(string | number)[]`.",
    },
    {
      title: "Tupla",
      text: "Largo fijo y un tipo por posición. `[string, number]` son dos: primero un `string`, después un `number`.",
      code: "const jugador: [string, number] = [\"Rys\", 7];",
    },
    {
      title: "readonly",
      text: "Un array `readonly` no se toca: nada de `push`, `pop` ni asignar por índice.",
    },
  ],
  exercises: [
    {
      type: "predict",
      id: "push-ok",
      code: "const notas: number[] = [7, 8];\nnotas.push(10);\nnotas;",
      answer: "[7, 8, 10]",
      explanation: "`10` es un `number`, así que `push` lo acepta.",
    },
    {
      type: "predict",
      id: "push-string",
      code: "const notas: Array<number> = [7, 8];\nnotas.push(\"10\");\nnotas;",
      answer: "type error",
      explanation: "`Array<number>` es lo mismo que `number[]`. Un `string` no entra.",
    },
    {
      type: "predict",
      id: "mixed-annotated",
      code: "const cosas: (string | number)[] = [1, \"dos\"];\ncosas.push(3);\ncosas;",
      answer: "[1, \"dos\", 3]",
      explanation: "El array acepta `string` y `number`. `3` entra sin drama.",
    },
    {
      type: "predict",
      id: "mixed-inferred",
      code: "const cosas = [1, \"dos\"];\ncosas.push(true);\ncosas;",
      answer: "type error",
      explanation: "Se infiere `(string | number)[]`. Un `boolean` no está en esa unión.",
    },
    {
      type: "predict",
      id: "tuple-ok",
      code: "const par: [string, number] = [\"vidas\", 3];\npar[1] + 1;",
      answer: "4",
      explanation: "La posición 1 es un `number`, así que se puede sumar.",
    },
    {
      type: "predict",
      id: "tuple-out-of-range",
      code: "const par: [string, number] = [\"vidas\", 3];\npar[2];",
      answer: "type error",
      explanation: "La tupla tiene 2 lugares: 0 y 1. El 2 no existe.",
    },
    {
      type: "predict",
      id: "readonly-push",
      code: "const dias: readonly string[] = [\"lun\", \"mar\"];\ndias.push(\"mie\");\ndias;",
      answer: "type error",
      explanation: "Un array `readonly` no tiene `push`.",
    },
    {
      type: "complete",
      id: "tuple-type",
      prompt: "Completá el tipo: un punto con exactamente dos números.",
      code: "const punto: ___ = [3, 4];",
      tests: "const x: number = punto[0];\nconst y: number = punto[1];\nconst largo: 2 = punto.length;",
      solution: "[number, number]",
      explanation: "La tupla sabe que su largo es 2. Con `number[]` el largo sería cualquier `number`.",
    },
    {
      type: "fix",
      id: "remove-readonly",
      prompt: "Esta lista tiene que poder crecer. Cambiá la anotación.",
      code: "const tareas: readonly string[] = [\"lavar\"];\ntareas.push(\"cocinar\");",
      tests: "const primera: string = tareas[0];",
      solution: "const tareas: string[] = [\"lavar\"];\ntareas.push(\"cocinar\");",
      explanation: "Sin `readonly`, el array vuelve a tener `push`.",
    },
  ],
};

export default lesson;
