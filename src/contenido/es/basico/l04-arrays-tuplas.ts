import type { Leccion } from "../../tipos.ts";

const leccion: Leccion = {
  id: "arrays-tuplas",
  titulo: "Listas y tuplas",
  resumen: "Arrays de un tipo, de varios, tuplas de largo fijo y arrays que no se tocan.",
  teoria: [
    { texto: "Un array se tipa diciendo qué guarda cada elemento. Hay dos formas de escribirlo y significan lo mismo." },
    { codigo: "const puntos: number[] = [10, 20];\nconst nombres: Array<string> = [\"Ana\", \"Leo\"];" },
    { texto: "Si los elementos pueden ser de más de un tipo, se usa una unión entre paréntesis: `(string | number)[]`." },
    { texto: "Una tupla es un array de largo fijo donde cada posición tiene su propio tipo. `[string, number]` son exactamente dos elementos: primero un string, después un number." },
    { codigo: "const jugador: [string, number] = [\"Rys\", 7];" },
    { texto: "Con `readonly` delante, el array no se puede modificar: no hay `push`, ni `pop`, ni asignar por índice." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "push-ok",
      codigo: "const notas: number[] = [7, 8];\nnotas.push(10);\nnotas;",
      respuesta: "[7, 8, 10]",
      explicacion: "10 es un number, así que push lo acepta.",
    },
    {
      tipo: "predecir",
      id: "push-string",
      codigo: "const notas: Array<number> = [7, 8];\nnotas.push(\"10\");\nnotas;",
      respuesta: "type error",
      explicacion: "Array<number> es lo mismo que number[]: un string no entra.",
    },
    {
      tipo: "predecir",
      id: "mixto-anotado",
      codigo: "const cosas: (string | number)[] = [1, \"dos\"];\ncosas.push(3);\ncosas;",
      respuesta: "[1, \"dos\", 3]",
      explicacion: "El array acepta strings y numbers, así que 3 entra sin problema.",
    },
    {
      tipo: "predecir",
      id: "mixto-inferido",
      codigo: "const cosas = [1, \"dos\"];\ncosas.push(true);\ncosas;",
      respuesta: "type error",
      explicacion: "TypeScript infiere (string | number)[] a partir de los elementos. Un boolean no está en esa unión.",
    },
    {
      tipo: "predecir",
      id: "tupla-ok",
      codigo: "const par: [string, number] = [\"vidas\", 3];\npar[1] + 1;",
      respuesta: "4",
      explicacion: "La posición 1 de la tupla es un number, así que se puede sumar.",
    },
    {
      tipo: "predecir",
      id: "tupla-fuera",
      codigo: "const par: [string, number] = [\"vidas\", 3];\npar[2];",
      respuesta: "type error",
      explicacion: "La tupla tiene largo 2. Pedir la posición 2 es salirse, y TypeScript lo sabe.",
    },
    {
      tipo: "predecir",
      id: "readonly-push",
      codigo: "const dias: readonly string[] = [\"lun\", \"mar\"];\ndias.push(\"mie\");\ndias;",
      respuesta: "type error",
      explicacion: "Un readonly string[] no tiene push: no se puede modificar.",
    },
    {
      tipo: "completar",
      id: "tipo-tupla",
      enunciado: "Completá el tipo: un punto con exactamente dos coordenadas numéricas.",
      codigo: "const punto: ___ = [3, 4];",
      pruebas: "const x: number = punto[0];\nconst y: number = punto[1];\nconst largo: 2 = punto.length;",
      solucion: "[number, number]",
      explicacion: "Una tupla [number, number] sabe que su largo es exactamente 2. Con number[] el largo sería un number cualquiera.",
    },
    {
      tipo: "arreglar",
      id: "sacar-readonly",
      enunciado: "Esta lista tiene que poder crecer. Cambiá la anotación.",
      codigo: "const tareas: readonly string[] = [\"lavar\"];\ntareas.push(\"cocinar\");",
      pruebas: "const primera: string = tareas[0];",
      solucion: "const tareas: string[] = [\"lavar\"];\ntareas.push(\"cocinar\");",
      explicacion: "Sacando readonly el array vuelve a tener push.",
    },
  ],
};

export default leccion;
