import type { Leccion } from "../../tipos.ts";

const leccion: Leccion = {
  id: "primitivos",
  titulo: "Los tres de siempre",
  resumen: "number, string y boolean, y qué pasa cuando no coinciden.",
  teoria: [
    { texto: "Una anotación de tipo se escribe con dos puntos después del nombre. Le promete al compilador qué tipo de valor va a guardar esa variable." },
    { codigo: "let vidas: number = 3;\nlet jugador: string = \"Rys\";\nlet conectado: boolean = true;" },
    { texto: "Si asignás algo que no coincide, el compilador no deja pasar el programa. Eso es un error de tipo: en este juego, cuando el código no compila, respondés `type error`." },
    { codigo: "let vidas: number = \"tres\";" },
    { texto: "Si compila, respondés el valor que da la última línea, escrito como en JavaScript: `5`, `\"hola\"`, `true`." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "suma",
      codigo: "let puntos: number = 10 + 5;\npuntos;",
      respuesta: "15",
      explicacion: "10 + 5 es un number y la variable está anotada como number: compila y vale 15.",
    },
    {
      tipo: "predecir",
      id: "string-a-number",
      codigo: "let puntos: number = \"10\";\npuntos;",
      respuesta: "type error",
      explicacion: "\"10\" es un string aunque parezca un número. number y string no son compatibles.",
    },
    {
      tipo: "predecir",
      id: "concat",
      codigo: "let saludo: string = \"hola \" + \"mundo\";\nsaludo;",
      respuesta: "\"hola mundo\"",
      explicacion: "Sumar dos strings da otro string. La respuesta va entre comillas porque es un string.",
    },
    {
      tipo: "predecir",
      id: "bool-number",
      codigo: "let listo: boolean = 1;\nlisto;",
      respuesta: "type error",
      explicacion: "En JavaScript 1 se comporta como verdadero, pero para TypeScript es un number, no un boolean.",
    },
    {
      tipo: "predecir",
      id: "comparacion",
      codigo: "let mayor: boolean = 5 > 3;\nmayor;",
      respuesta: "true",
      explicacion: "Una comparación devuelve boolean, así que encaja con la anotación.",
    },
    {
      tipo: "predecir",
      id: "reasignar",
      codigo: "let nivel: number = 1;\nnivel = \"dos\";\nnivel;",
      respuesta: "type error",
      explicacion: "La anotación vale para siempre: después de declararla como number, la variable no acepta un string.",
    },
    {
      tipo: "completar",
      id: "anotar",
      enunciado: "Completá el tipo para que compile.",
      codigo: "let nombre: ___ = \"Perugius\";",
      pruebas: "const largo: number = nombre.length;",
      solucion: "string",
      explicacion: "\"Perugius\" es un string.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-tipo",
      enunciado: "El tipo de la variable está mal. Cambiá la anotación, no el valor.",
      codigo: "let activo: string = false;",
      pruebas: "activo = true;",
      solucion: "let activo: boolean = false;",
      explicacion: "false es un boolean, así que la anotación tiene que ser boolean.",
    },
  ],
};

export default leccion;
