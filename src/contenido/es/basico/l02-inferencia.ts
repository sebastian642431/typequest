import type { Leccion } from "../../tipos.ts";

const leccion: Leccion = {
  id: "inferencia",
  titulo: "Sin anotar",
  resumen: "TypeScript adivina el tipo solo, y const adivina más fino que let.",
  teoria: [
    { texto: "No hace falta anotar todo. Si la variable arranca con un valor, TypeScript deduce el tipo a partir de ese valor. A eso se le llama inferencia." },
    { codigo: "let vidas = 3;\nvidas = \"tres\";" },
    { texto: "Ese código no compila: `vidas` se infirió como `number` y queda así para siempre, igual que si lo hubieras anotado." },
    { texto: "Con `const` la cosa cambia. Como el valor nunca va a cambiar, TypeScript infiere el valor exacto: `const saludo = \"hola\"` tiene tipo `\"hola\"`, no `string`. Con `let` el tipo se ensancha a `string`, porque más adelante podrías guardar otro texto." },
    { codigo: "const saludo = \"hola\";\nlet copia = \"hola\";" },
    { texto: "Conviene anotar cuando la inferencia adivina algo más angosto o distinto de lo que querés, o cuando declarás sin valor inicial." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "infiere-number",
      codigo: "let monedas = 50;\nmonedas = monedas + 25;\nmonedas;",
      respuesta: "75",
      explicacion: "monedas se infiere como number y sumarle 25 sigue siendo number.",
    },
    {
      tipo: "predecir",
      id: "cambiar-tipo",
      codigo: "let nivel = 1;\nnivel = \"uno\";\nnivel;",
      respuesta: "type error",
      explicacion: "Sin anotación, nivel igual quedó como number por su valor inicial. Un string no entra.",
    },
    {
      tipo: "predecir",
      id: "const-literal",
      codigo: "const modo = \"oscuro\";\nlet elegido: \"oscuro\" = modo;\nelegido;",
      respuesta: "\"oscuro\"",
      explicacion: "Con const, modo tiene tipo \"oscuro\", que encaja justo con la anotación de elegido.",
    },
    {
      tipo: "predecir",
      id: "let-ensancha",
      codigo: "let modo = \"oscuro\";\nlet elegido: \"oscuro\" = modo;\nelegido;",
      respuesta: "type error",
      explicacion: "Con let, modo se ensancha a string. Un string cualquiera no garantiza ser \"oscuro\".",
    },
    {
      tipo: "predecir",
      id: "copia-de-const",
      codigo: "const base = 10;\nlet copia = base;\ncopia = 20;\ncopia;",
      respuesta: "20",
      explicacion: "base es del tipo 10, pero al copiarlo en un let el tipo se ensancha a number, así que 20 entra.",
    },
    {
      tipo: "predecir",
      id: "cadena-de-let",
      codigo: "let a = 1;\nconst b = a;\nlet c: 1 = b;\nc;",
      respuesta: "type error",
      explicacion: "a es number, y b copia el tipo de a: number. Aunque b sea const, su tipo no se achica a 1.",
    },
    {
      tipo: "elegir",
      id: "que-infiere",
      enunciado: "¿Qué tipo infiere TypeScript para `color`?",
      codigo: "const color = \"rojo\";",
      opciones: ["string", "\"rojo\"", "any", "unknown"],
      correcta: 1,
      explicacion: "Una const con un string literal toma el tipo exacto de ese literal.",
    },
    {
      tipo: "completar",
      id: "anotar-number",
      enunciado: "Completá la anotación para que la variable acepte cualquier número.",
      codigo: "let temperatura: ___ = 18;",
      pruebas: "temperatura = 25;\nconst doble: number = temperatura * 2;",
      solucion: "number",
      explicacion: "Si querés reasignarla con otros números, el tipo es number.",
    },
    {
      tipo: "arreglar",
      id: "valor-inicial",
      enunciado: "El valor inicial hace que se infiera el tipo equivocado. Arreglalo cambiando solo el valor inicial.",
      codigo: "let turnos = \"3\";\nturnos = turnos - 1;",
      pruebas: "const t: number = turnos;",
      solucion: "let turnos = 3;\nturnos = turnos - 1;",
      explicacion: "Con \"3\" se infiere string y no se puede restar. Con 3 se infiere number.",
    },
  ],
};

export default leccion;
