import type { Leccion } from "../../tipos.ts";

const leccion: Leccion = {
  id: "funciones",
  titulo: "Funciones con contrato",
  resumen: "Parámetros tipados, qué devuelven y cómo se las llama.",
  teoria: [
    { texto: "Los parámetros de una función se anotan igual que las variables. Después de los paréntesis podés anotar qué devuelve." },
    { codigo: "function doble(n: number): number {\n  return n * 2;\n}" },
    { texto: "Si no anotás el retorno, TypeScript lo infiere mirando los `return`. Los parámetros, en cambio, sí hay que anotarlos." },
    { texto: "Llamar con menos argumentos, con más o con uno del tipo equivocado es un error de tipo. Para que un parámetro se pueda omitir, se le pone `?` o un valor por defecto." },
    { codigo: "function saludar(nombre?: string, signo = \"!\") {\n  return \"hola \" + (nombre ?? \"vos\") + signo;\n}" },
    { texto: "Una función que no devuelve nada tiene retorno `void`. Si guardás lo que devuelve, en tiempo de ejecución vale `undefined`." },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "llamada-ok",
      codigo: "function triple(n: number): number {\n  return n * 3;\n}\ntriple(4);",
      respuesta: "12",
      explicacion: "4 es un number, como pide el parámetro, y la función devuelve 12.",
    },
    {
      tipo: "predecir",
      id: "argumento-string",
      codigo: "function triple(n: number): number {\n  return n * 3;\n}\ntriple(\"4\");",
      respuesta: "type error",
      explicacion: "El parámetro pide number y le pasaste un string.",
    },
    {
      tipo: "predecir",
      id: "falta-argumento",
      codigo: "function restar(a: number, b: number) {\n  return a - b;\n}\nrestar(10);",
      respuesta: "type error",
      explicacion: "restar pide dos argumentos obligatorios y recibió uno solo.",
    },
    {
      tipo: "predecir",
      id: "retorno-inferido",
      codigo: "function mitad(n: number) {\n  return n / 2;\n}\nconst texto: string = mitad(10);\ntexto;",
      respuesta: "type error",
      explicacion: "Sin anotar el retorno, TypeScript infiere number. No se puede guardar en un string.",
    },
    {
      tipo: "predecir",
      id: "por-defecto",
      codigo: "function potencia(base: number, exp = 2) {\n  return base ** exp;\n}\npotencia(3);",
      respuesta: "9",
      explicacion: "exp no se pasó, así que toma su valor por defecto: 3 ** 2 es 9.",
    },
    {
      tipo: "predecir",
      id: "opcional-sin-chequear",
      codigo: "function iniciales(nombre?: string) {\n  return nombre.slice(0, 2);\n}\niniciales(\"Rys\");",
      respuesta: "type error",
      explicacion: "Un parámetro opcional puede ser undefined. Usarlo directo sin chequear no compila, aunque en esta llamada sí venga.",
    },
    {
      tipo: "predecir",
      id: "void-vale",
      codigo: "function avisar(msj: string): void {\n  msj.length;\n}\nconst r = avisar(\"listo\");\nr;",
      respuesta: "undefined",
      explicacion: "Una función void no devuelve nada, así que lo que guardás es undefined.",
    },
    {
      tipo: "completar",
      id: "tipo-retorno",
      enunciado: "Completá el tipo de retorno.",
      codigo: "function esPar(n: number): ___ {\n  return n % 2 === 0;\n}",
      pruebas: "const r: boolean = esPar(4);",
      solucion: "boolean",
      explicacion: "Una comparación con === devuelve boolean.",
    },
    {
      tipo: "arreglar",
      id: "parametro-por-defecto",
      enunciado: "La llamada con un solo argumento falla. Hacé que `alto` valga 1 si no se pasa, sin tocar las llamadas.",
      codigo: "function area(ancho: number, alto: number) {\n  return ancho * alto;\n}\nconst fila = area(5);",
      pruebas: "const total: number = area(2, 5) + fila;",
      solucion: "function area(ancho: number, alto = 1) {\n  return ancho * alto;\n}\nconst fila = area(5);",
      explicacion: "Con un valor por defecto el parámetro pasa a ser opcional y su tipo se infiere de ese valor.",
    },
  ],
};

export default leccion;
