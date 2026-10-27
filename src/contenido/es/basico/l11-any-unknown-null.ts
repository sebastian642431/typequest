import type { Leccion } from "../../tipos.ts";

const leccion: Leccion = {
  id: "any-unknown-null",
  titulo: "any, unknown y los vacíos",
  resumen: "Qué apaga el chequeo, qué te obliga a mirar, y cómo tratar null y undefined.",
  teoria: [
    { texto: "`any` apaga el chequeo: con un `any` podés hacer cualquier cosa y el compilador no protesta. Los errores aparecen recién al correr." },
    { texto: "`unknown` también acepta cualquier valor, pero no te deja usarlo hasta que lo estreches con `typeof` u otro chequeo. Es el `any` seguro." },
    { codigo: "function largo(x: unknown) {\n  if (typeof x === \"string\") return x.length;\n  return 0;\n}" },
    { texto: "Con `strict`, `null` y `undefined` no entran en un `string`. Si algo puede faltar, el tipo lo dice: `string | undefined`. Una propiedad opcional `apodo?: string` es justamente eso." },
    { texto: "`a?.b` corta y da undefined si `a` es null o undefined. `x ?? y` usa `y` solo si `x` es null o undefined. `x!` le jura al compilador que no es null: si mentiste, se rompe al correr." },
    { codigo: "type Usuario = { nombre: string; apodo?: string };\nfunction mostrar(u: Usuario) {\n  return u.apodo?.toUpperCase() ?? u.nombre;\n}" },
  ],
  ejercicios: [
    {
      tipo: "predecir",
      id: "any-cuela",
      codigo: "let x: any = 5;\nconst s: string = x;\ns;",
      respuesta: "5",
      explicacion: "any se puede asignar a cualquier tipo. s dice ser string pero guarda un number, y el compilador no se entera.",
    },
    {
      tipo: "predecir",
      id: "unknown-sin-mirar",
      codigo: "function gritar(x: unknown) {\n  return x.toUpperCase();\n}\ngritar(\"hola\");",
      respuesta: "type error",
      explicacion: "Con unknown no podés usar nada del valor sin estrecharlo antes.",
    },
    {
      tipo: "predecir",
      id: "null-strict",
      codigo: "let nombre: string = null;\nnombre;",
      respuesta: "type error",
      explicacion: "Con strictNullChecks, null no es un string. Si puede ser null, el tipo tiene que ser string | null.",
    },
    {
      tipo: "predecir",
      id: "opcional",
      codigo: "type Usuario = { nombre: string; apodo?: string };\nfunction largo(u: Usuario) {\n  return u.apodo.length;\n}\nlargo({ nombre: \"Ana\", apodo: \"Anita\" });",
      respuesta: "type error",
      explicacion: "apodo es string | undefined. Aunque este objeto lo tenga, la función tiene que servir para los que no.",
    },
    {
      tipo: "predecir",
      id: "encadenado",
      codigo: "type Usuario = { nombre: string; apodo?: string };\nfunction largo(u: Usuario) {\n  return u.apodo?.length ?? 0;\n}\nlargo({ nombre: \"Ana\" });",
      respuesta: "0",
      explicacion: "Sin apodo, u.apodo?.length da undefined, y ?? lo cambia por 0.",
    },
    {
      tipo: "predecir",
      id: "nullish-vs-or",
      codigo: "function ambos(x: number | null) {\n  return [x ?? 10, x || 10];\n}\nambos(0);",
      respuesta: "[0, 10]",
      explicacion: "?? solo reemplaza null y undefined, así que deja el 0. || reemplaza cualquier falsy, y 0 lo es.",
    },
    {
      tipo: "elegir",
      id: "non-null",
      enunciado: "¿Qué pasa si llamás a largo({ nombre: \"Ana\" })?",
      codigo: "type Usuario = { nombre: string; apodo?: string };\nfunction largo(u: Usuario) {\n  return u.apodo!.length;\n}",
      opciones: [
        "No compila",
        "Compila y devuelve 0",
        "Compila y devuelve undefined",
        "Compila, pero se rompe al correr",
      ],
      correcta: 3,
      explicacion: "El ! hace que compile, pero apodo es undefined y leer .length de undefined tira un error en tiempo de ejecución.",
    },
    {
      tipo: "completar",
      id: "completar-opcional",
      enunciado: "Completá el tipo que tiene en realidad la propiedad opcional edad.",
      codigo: "type Usuario = { nombre: string; edad?: number };\ntype Edad = ___;",
      pruebas: "type Chequeo = Esperar<Igual<Edad, Usuario[\"edad\"]>>;\nfunction edadOCero(e: Edad): number {\n  return e ?? 0;\n}",
      solucion: "number | undefined",
      explicacion: "Una propiedad opcional puede no estar, así que leerla da number | undefined.",
    },
    {
      tipo: "arreglar",
      id: "arreglar-unknown",
      enunciado: "La función recibe unknown y lo usa sin mirar. Estrechalo para que compile y devuelva 0 si no es un number.",
      codigo: "function doble(x: unknown) {\n  return x * 2;\n}",
      pruebas: "const a: number = doble(4);\nconst b: number = doble(\"4\");",
      solucion: "function doble(x: unknown) {\n  if (typeof x === \"number\") return x * 2;\n  return 0;\n}",
      explicacion: "Después del typeof, x es number y se puede multiplicar. El resto de los casos devuelve 0.",
    },
  ],
};

export default leccion;
